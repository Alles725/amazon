import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { CART_ROUTES, CATALOG_ROUTES } from '@amazon-mvp/api-contract';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';

describe('persistent cart (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let owner: string;
  let other: string;
  const userIds: string[] = [];
  const productIds: string[] = [];
  let productId: string;
  let secondId: string;

  beforeAll(async () => {
    const created = await createApp();
    app = created.app;
    await app.init();
    prisma = app.get(PrismaService);
    for (const priceMinor of [12345, 999]) {
      const id = randomUUID();
      const product = await prisma.product.create({
        data: {
          sku: `cart-test-${id}`,
          slug: `cart-test-${id}`,
          name: 'Cart integration product',
          priceMinor,
          inventory: { create: { quantity: 12 } },
        },
      });
      productIds.push(product.id);
    }
    [productId, secondId] = productIds;
    const register = async () => {
      const result = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `cart-${randomUUID()}@example.com`,
          password: 'cart testing long password',
          displayName: 'Cart tester',
        })
        .expect(201);
      userIds.push(result.body.user.id);
      return (result.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
    };
    owner = await register();
    other = await register();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    }
    await app?.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete(CART_ROUTES.items).set('Cookie', owner).expect(200);
  });

  const get = (cookie = owner) =>
    request(app.getHttpServer()).get(CART_ROUTES.current).set('Cookie', cookie);
  const add = (quantity = 1, id = productId) =>
    request(app.getHttpServer())
      .post(CART_ROUTES.items)
      .set('Cookie', owner)
      .send({ productId: id, quantity });

  it('requires authentication on every cart endpoint', async () => {
    const server = app.getHttpServer();
    await request(server).get(CART_ROUTES.current).expect(401);
    await request(server).post(CART_ROUTES.items).send({ productId, quantity: 1 }).expect(401);
    await request(server)
      .patch(`${CART_ROUTES.items}/${productId}`)
      .send({ quantity: 2 })
      .expect(401);
    await request(server).delete(`${CART_ROUTES.items}/${productId}`).expect(401);
    await request(server).delete(CART_ROUTES.items).expect(401);
  });

  it('reads real public products with integer prices and validates pagination', async () => {
    const list = await request(app.getHttpServer())
      .get(`${CATALOG_ROUTES.products}?pageSize=48`)
      .expect(200);
    expect(list.body.items.find((item: { id: string }) => item.id === productId).priceMinor).toBe(
      12345,
    );
    await request(app.getHttpServer()).get(`${CATALOG_ROUTES.products}?pageSize=99999`).expect(400);
  });

  it('adds, reprices, changes quantity, persists, removes and clears', async () => {
    expect((await get().expect(200)).body.lines).toEqual([]);
    const added = await add(2).expect(200);
    expect(added.body.subtotalMinor).toBe(24690);
    expect(added.body.itemCount).toBe(2);
    expect((await get().expect(200)).body).toEqual(added.body);
    await request(app.getHttpServer())
      .patch(`${CART_ROUTES.items}/${productId}`)
      .set('Cookie', owner)
      .send({ quantity: 3 })
      .expect(200);
    await add(1, secondId).expect(200);
    expect((await get().expect(200)).body.subtotalMinor).toBe(38034);
    await prisma.product.update({ where: { id: productId }, data: { priceMinor: 12000 } });
    expect((await get().expect(200)).body.subtotalMinor).toBe(36999);
    await request(app.getHttpServer())
      .delete(`${CART_ROUTES.items}/${secondId}`)
      .set('Cookie', owner)
      .expect(200);
    expect((await get().expect(200)).body.itemCount).toBe(3);
    await request(app.getHttpServer()).delete(CART_ROUTES.items).set('Cookie', owner).expect(200);
    expect((await get().expect(200)).body.subtotalMinor).toBe(0);
    await prisma.product.update({ where: { id: productId }, data: { priceMinor: 12345 } });
  });

  it('never reads or changes another account cart', async () => {
    await add(2).expect(200);
    expect((await get(other).expect(200)).body.lines).toEqual([]);
    await request(app.getHttpServer())
      .delete(`${CART_ROUTES.items}/${productId}`)
      .set('Cookie', other)
      .expect(200);
    expect((await get().expect(200)).body.itemCount).toBe(2);
    await request(app.getHttpServer())
      .post(CART_ROUTES.items)
      .set('Cookie', other)
      .send({ productId, quantity: 1, userId: userIds[0] })
      .expect(400);
  });

  it('rejects forged prices, invalid quantities, unknown IDs and unavailable inventory', async () => {
    await request(app.getHttpServer())
      .post(CART_ROUTES.items)
      .set('Cookie', owner)
      .send({ productId, quantity: 1, unitPriceMinor: 1 })
      .expect(400);
    for (const quantity of [0, -1, 1.5, 100, '2']) await add(quantity as number).expect(400);
    await add(1, randomUUID()).expect(404);
    await add(13).expect(409);
    await prisma.product.update({ where: { id: productId }, data: { active: false } });
    await add().expect(409);
    await prisma.product.update({ where: { id: productId }, data: { active: true } });
    expect((await get().expect(200)).body.lines).toEqual([]);
  });

  it('keeps an unavailable existing line visible and removable', async () => {
    await add().expect(200);
    await prisma.inventory.update({ where: { productId }, data: { quantity: 0 } });
    const cart = (await get().expect(200)).body;
    expect(cart.lines[0].product.inStock).toBe(false);
    await request(app.getHttpServer())
      .delete(`${CART_ROUTES.items}/${productId}`)
      .set('Cookie', owner)
      .expect(200);
    expect((await get().expect(200)).body.lines).toEqual([]);
    await prisma.inventory.update({ where: { productId }, data: { quantity: 12 } });
  });

  it('serializes concurrent additions without creating duplicate active carts or losing quantities', async () => {
    // Start from a genuinely new cart, including the first-insert race.
    await prisma.cart.deleteMany({ where: { userId: userIds[0] } });
    await Promise.all(Array.from({ length: 6 }, () => add().expect(200)));
    const cart = (await get().expect(200)).body;
    expect(cart.lines).toHaveLength(1);
    expect(cart.itemCount).toBe(6);
    expect(cart.subtotalMinor).toBe(74070);
    expect(await prisma.cart.count({ where: { userId: userIds[0], status: 'ACTIVE' } })).toBe(1);
  });
});
