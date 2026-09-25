import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';
import { seedDemoProducts } from '../../../database/seeds/demo-products';
import demos from '../../../config/demo-products.json';

describe('one catalog for database and demo products (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookie: string;
  let userId: string;
  const createdIds: string[] = [];
  const missingId = randomUUID();
  const temporaryId = randomUUID();
  const base = '/api/v1/catalog/products';
  beforeAll(async () => {
    app = (await createApp()).app;
    await app.init();
    prisma = app.get(PrismaService);
    const existing = await prisma.product.findMany({
      where: { slug: { in: demos.map((p) => p.id) } },
      select: { id: true },
    });
    await seedDemoProducts(prisma);
    const seeded = await prisma.product.findMany({
      where: { slug: { in: demos.map((p) => p.id) } },
      select: { id: true },
    });
    createdIds.push(...seeded.filter((p) => !existing.some((e) => e.id === p.id)).map((p) => p.id));
    for (const id of [missingId, temporaryId]) {
      await prisma.product.create({
        data: {
          id,
          slug: `temporary-${id}`,
          sku: id,
          name: 'Temporary product',
          priceMinor: 1234,
          ...(id === temporaryId ? { inventory: { create: { quantity: 3 } } } : {}),
        },
      });
      createdIds.push(id);
    }
    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `catalog-${randomUUID()}@example.com`,
        password: 'catalog integration password',
        displayName: 'Catalog tester',
      })
      .expect(201);
    userId = registered.body.user.id;
    cookie = (registered.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
  });
  afterAll(async () => {
    if (prisma) {
      if (userId) await prisma.user.deleteMany({ where: { id: userId } });
      await prisma.product.deleteMany({ where: { id: { in: createdIds } } });
    }
    await app?.close();
  });
  it('opens every homepage product by slug/UUID and adds each to the persisted cart', async () => {
    for (const demo of demos) {
      const response = await request(app.getHttpServer()).get(`${base}/${demo.id}`).expect(200);
      const product = response.body;
      expect(product).toMatchObject({ slug: demo.id, sku: demo.sku, priceMinor: demo.priceMinor });
      expect(
        (await request(app.getHttpServer()).get(`${base}/${product.id}`).expect(200)).body,
      ).toEqual(product);
      const cart = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', cookie)
        .send({ productId: product.id, quantity: 1 })
        .expect(200);
      expect(
        cart.body.lines.some((line: { productId: string }) => line.productId === product.id),
      ).toBe(true);
    }
    const persisted = await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('Cookie', cookie)
      .expect(200);
    expect(persisted.body.itemCount).toBe(demos.length);
    expect(persisted.body.subtotalMinor).toBe(demos.reduce((sum, p) => sum + p.priceMinor, 0));
  });
  it('does not require a fixture, description, category or inventory record to open details', async () => {
    const missing = await request(app.getHttpServer()).get(`${base}/${missingId}`).expect(200);
    expect(missing.body).toMatchObject({
      description: null,
      categories: [],
      availableQuantity: 0,
      inStock: false,
    });
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Cookie', cookie)
      .send({ productId: missingId, quantity: 1 })
      .expect(409);
    const temporary = await request(app.getHttpServer())
      .get(`${base}/temporary-${temporaryId}`)
      .expect(200);
    expect(temporary.body).toMatchObject({
      id: temporaryId,
      description: null,
      categories: [],
      inStock: true,
    });
    const added = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Cookie', cookie)
      .send({ productId: temporaryId, quantity: 2 })
      .expect(200);
    expect(
      added.body.lines.find((line: { productId: string }) => line.productId === temporaryId),
    ).toMatchObject({ quantity: 2, lineTotalMinor: 2468 });
  });
  it('is idempotent and never overwrites existing name, price, active status or stock', async () => {
    // This suite is run against a disposable database. Only mutate a row it created.
    const id = createdIds.find((value) => value !== missingId && value !== temporaryId);
    if (!id) throw new Error('Use a fresh isolated test database for demo seed checks');
    const original = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: { inventory: true },
    });
    await prisma.product.update({
      where: { id },
      data: { name: 'Edited name', priceMinor: 4321, active: false },
    });
    await prisma.inventory.update({ where: { productId: id }, data: { quantity: 2, reserved: 1 } });
    try {
      await seedDemoProducts(prisma);
      expect(await prisma.product.count({ where: { slug: { in: demos.map((p) => p.id) } } })).toBe(
        demos.length,
      );
      expect(
        await prisma.product.findUniqueOrThrow({ where: { id }, include: { inventory: true } }),
      ).toMatchObject({
        name: 'Edited name',
        priceMinor: 4321,
        active: false,
        inventory: { quantity: 2, reserved: 1 },
      });
    } finally {
      await prisma.product.update({
        where: { id },
        data: { name: original.name, priceMinor: original.priceMinor, active: original.active },
      });
      await prisma.inventory.update({
        where: { productId: id },
        data: { quantity: original.inventory!.quantity, reserved: original.inventory!.reserved },
      });
    }
  });
});
