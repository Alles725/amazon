import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';
import { CartService } from '../src/modules/cart/cart.service';

const address = {
  recipient: 'Pessoa de Teste',
  postalCode: '90020060',
  street: 'Rua de Teste',
  number: '123',
  complement: 'Apto 2',
  neighborhood: 'Centro',
  city: 'Porto Alegre',
  state: 'RS',
};
describe('checkout (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookies: string[];
  const users: string[] = [];
  const products: string[] = [];
  let addressIds: string[] = [];
  beforeAll(async () => {
    app = (await createApp()).app;
    await app.init();
    prisma = app.get(PrismaService);
    cookies = [];
    for (let i = 0; i < 2; i++) {
      const registered = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `checkout-${randomUUID()}@example.com`,
          password: 'checkout integration password',
          displayName: 'Checkout Test',
        })
        .expect(201);
      users.push(registered.body.user.id);
      cookies.push((registered.headers['set-cookie'] as unknown as string[])[0].split(';')[0]);
      const saved = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set('Cookie', cookies[i])
        .send(address)
        .expect(201);
      addressIds.push(saved.body.id);
    }
    for (let i = 0; i < 2; i++) {
      const id = randomUUID();
      await prisma.product.create({
        data: {
          id,
          slug: id,
          sku: id,
          name: `Checkout product ${i}`,
          priceMinor: 1234 + i,
          inventory: { create: { quantity: 10 } },
        },
      });
      products.push(id);
    }
  });
  afterAll(async () => {
    if (prisma) {
      await prisma.order.deleteMany({ where: { userId: { in: users } } });
      await prisma.user.deleteMany({ where: { id: { in: users } } });
      await prisma.product.deleteMany({ where: { id: { in: products } } });
    }
    await app?.close();
  });
  beforeEach(async () => {
    jest.restoreAllMocks();
    await prisma.order.deleteMany({ where: { userId: { in: users } } });
    await prisma.cart.deleteMany({ where: { userId: { in: users } } });
    for (const id of products) {
      await prisma.product.update({
        where: { id },
        data: { priceMinor: id === products[0] ? 1234 : 1235, active: true },
      });
      await prisma.inventory.update({
        where: { productId: id },
        data: { quantity: 10, reserved: 0 },
      });
    }
  });
  const add = (quantity = 2, index = 0, productId = products[0]) =>
    request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Cookie', cookies[index])
      .send({ productId, quantity });
  const quote = (index = 0) =>
    request(app.getHttpServer()).get('/api/v1/orders/quote').set('Cookie', cookies[index]);
  const getCart = () => request(app.getHttpServer()).get('/api/v1/cart').set('Cookie', cookies[0]);
  const data = (q: { cart: { id: string }; revision: string }, index = 0) => ({
    cartId: q.cart.id,
    revision: q.revision,
    addressId: addressIds[index],
    paymentMethod: 'SIMULATED_CARD',
  });
  const place = (body: unknown, index = 0) =>
    request(app.getHttpServer()).post('/api/v1/orders').set('Cookie', cookies[index]).send(body);
  it('requires session for quote, place, address and order reads', async () => {
    for (const path of [
      '/api/v1/addresses',
      '/api/v1/orders/quote',
      '/api/v1/orders',
      `/api/v1/orders/${randomUUID()}`,
    ])
      await request(app.getHttpServer()).get(path).expect(401);
    await request(app.getHttpServer()).post('/api/v1/orders').send({}).expect(401);
    await request(app.getHttpServer()).post('/api/v1/addresses').send(address).expect(401);
    await request(app.getHttpServer())
      .put(`/api/v1/addresses/${addressIds[0]}`)
      .send(address)
      .expect(401);
  });
  it('validates address fields and scopes edits/selection to the owner', async () => {
    for (const invalid of [
      { ...address, recipient: ' ' },
      { ...address, postalCode: '123' },
      { ...address, state: 'XX' },
      { ...address, userId: users[1] },
    ])
      await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set('Cookie', cookies[0])
        .send(invalid)
        .expect(400);
    await request(app.getHttpServer())
      .put(`/api/v1/addresses/${addressIds[0]}`)
      .set('Cookie', cookies[1])
      .send(address)
      .expect(404);
    const own = await request(app.getHttpServer())
      .get('/api/v1/addresses')
      .set('Cookie', cookies[1])
      .expect(200);
    expect(own.body.map((a: { id: string }) => a.id)).toEqual([addressIds[1]]);
    await add().expect(200);
    const q = (await quote().expect(200)).body;
    await place({ ...data(q), addressId: addressIds[1] }).expect(404);
    expect((await getCart()).body.itemCount).toBe(2);
  });
  it('rejects empty cart, missing fields, payment/card details and forged totals', async () => {
    await quote().expect(409);
    await place({
      cartId: randomUUID(),
      revision: 'a'.repeat(64),
      addressId: addressIds[0],
      paymentMethod: 'SIMULATED_PIX',
    }).expect(409);
    await add().expect(200);
    const q = (await quote()).body;
    for (const body of [
      { ...data(q), addressId: undefined },
      { ...data(q), paymentMethod: undefined },
      { ...data(q), paymentMethod: 'REAL_CARD' },
      { ...data(q), totalMinor: 1 },
      { ...data(q), cardNumber: '4111111111111111' },
      { ...data(q), userId: users[1] },
    ])
      await place(body).expect(400);
    expect(await prisma.order.count({ where: { userId: users[0] } })).toBe(0);
    expect((await getCart()).body.itemCount).toBe(2);
  });
  it('creates an immutable snapshot and clears only the converted cart', async () => {
    await add(3).expect(200);
    const q = (await quote().expect(200)).body;
    expect(q.totalMinor).toBe(3702);
    expect(q.shippingMinor).toBe(0);
    const created = (await place(data(q)).expect(201)).body;
    expect(created).toMatchObject({
      status: 'PENDING',
      totalMinor: 3702,
      subtotalMinor: 3702,
      paymentMethod: 'SIMULATED_CARD',
      shippingAddress: address,
      deliveredAt: null,
      deliveryNote: null,
    });
    expect(created.lines[0]).toMatchObject({
      productId: products[0],
      quantity: 3,
      unitPriceMinor: 1234,
      lineTotalMinor: 3702,
    });
    expect((await getCart()).body.itemCount).toBe(0);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(7);
    expect((await prisma.cart.findUniqueOrThrow({ where: { id: q.cart.id } })).status).toBe(
      'CONVERTED',
    );
    expect(await prisma.cartItem.count({ where: { cartId: q.cart.id } })).toBe(0);
    await prisma.product.update({
      where: { id: products[0] },
      data: { name: 'Renamed', priceMinor: 99 },
    });
    await request(app.getHttpServer())
      .put(`/api/v1/addresses/${addressIds[0]}`)
      .set('Cookie', cookies[0])
      .send({ ...address, street: 'Another street' })
      .expect(200);
    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/orders/${created.id}`)
      .set('Cookie', cookies[0])
      .expect(200);
    expect(fetched.body).toEqual(created);
    await request(app.getHttpServer())
      .get(`/api/v1/orders/${created.id}`)
      .set('Cookie', cookies[1])
      .expect(404);
    expect(
      (
        await request(app.getHttpServer())
          .get('/api/v1/orders')
          .set('Cookie', cookies[1])
          .expect(200)
      ).body,
    ).toEqual([]);
    await request(app.getHttpServer())
      .put(`/api/v1/addresses/${addressIds[0]}`)
      .set('Cookie', cookies[0])
      .send(address)
      .expect(200);
  });
  it('returns one order for concurrent/repeated confirmations, without clearing a later cart', async () => {
    await add().expect(200);
    const body = data((await quote()).body);
    const responses = await Promise.all([place(body).expect(201), place(body).expect(201)]);
    expect(responses[0].body.id).toBe(responses[1].body.id);
    expect(await prisma.order.count({ where: { userId: users[0] } })).toBe(1);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(8);
    await add(1).expect(200);
    await place(body).expect(201);
    expect((await getCart()).body.itemCount).toBe(1);
  });
  it('rejects a stale price/quantity quote and rolls back all inventory writes', async () => {
    await add().expect(200);
    const body = data((await quote()).body);
    await prisma.product.update({ where: { id: products[0] }, data: { priceMinor: 2345 } });
    await place(body).expect(409);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(10);
    expect((await getCart()).body.itemCount).toBe(2);
    const updated = data((await quote()).body);
    await add(1).expect(200);
    await place(updated).expect(409);
    expect(await prisma.order.count({ where: { userId: users[0] } })).toBe(0);
  });
  it('rolls back order, cart and inventory if the last conversion step fails', async () => {
    await add().expect(200);
    const body = data((await quote()).body);
    jest
      .spyOn(app.get(CartService), 'convertForCheckout')
      .mockRejectedValueOnce(new Error('Injected conversion failure'));
    await place(body).expect(500);
    expect(await prisma.order.count({ where: { userId: users[0] } })).toBe(0);
    expect((await getCart()).body.itemCount).toBe(2);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(10);
    await place(body).expect(201);
  });
  it('allows only one account to buy the final unit', async () => {
    await prisma.inventory.update({ where: { productId: products[0] }, data: { quantity: 1 } });
    await add(1, 0).expect(200);
    await add(1, 1).expect(200);
    const first = data((await quote(0)).body, 0),
      second = data((await quote(1)).body, 1);
    const results = await Promise.all([place(first, 0), place(second, 1)]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(0);
    expect(await prisma.order.count({ where: { userId: { in: users } } })).toBe(1);
  });
  it('rolls back earlier line deductions when another product is unavailable', async () => {
    await add().expect(200);
    await add(1, 0, products[1]).expect(200);
    const body = data((await quote()).body);
    await prisma.product.update({ where: { id: products[1] }, data: { active: false } });
    await place(body).expect(409);
    expect(
      (await prisma.inventory.findUniqueOrThrow({ where: { productId: products[0] } })).quantity,
    ).toBe(10);
    expect((await getCart()).body.itemCount).toBe(3);
  });
});
