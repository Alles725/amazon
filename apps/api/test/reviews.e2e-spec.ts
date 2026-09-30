import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';

describe('reviews (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const cookies: string[] = [];
  const users: string[] = [];
  // [0] reviewed by customers, [1] and [2] share a demo listing, [3] untouched.
  const products: string[] = [];
  const base = '/api/v1/reviews';
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = (await createApp()).app;
    await app.init();
    prisma = app.get(PrismaService);
    for (const name of ['Camila Souza Lima', 'Rafael Martins', 'Diego Alves']) {
      const registered = await http()
        .post('/api/v1/auth/register')
        .send({
          email: `reviews-${randomUUID()}@example.com`,
          password: 'reviews integration password',
          displayName: name,
        })
        .expect(201);
      users.push(registered.body.user.id);
      cookies.push((registered.headers['set-cookie'] as unknown as string[])[0].split(';')[0]);
    }
    for (let i = 0; i < 4; i++) {
      const id = randomUUID();
      await prisma.product.create({
        data: { id, slug: id, sku: id, name: `Review product ${i}`, priceMinor: 1000 },
      });
      products.push(id);
    }
    const listing = `listing-${randomUUID()}`;
    for (const productId of [products[1], products[2]])
      await prisma.reviewRatingBaseline.create({
        data: {
          productId,
          listingKey: listing,
          ratingCount: 100,
          ratingSum: 450,
          distribution: [70, 15, 10, 5, 0],
        },
      });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.review.deleteMany({ where: { productId: { in: products } } });
      await prisma.reviewRatingBaseline.deleteMany({ where: { productId: { in: products } } });
      await prisma.order.deleteMany({ where: { userId: { in: users } } });
      await prisma.user.deleteMany({ where: { id: { in: users } } });
      await prisma.product.deleteMany({ where: { id: { in: products } } });
    }
    await app?.close();
  });

  const save = (index: number, body: Record<string, unknown>) =>
    http().put(`${base}/mine`).set('Cookie', cookies[index]).send(body);
  const review = (productId: string, rating: number, title = 'Muito bom mesmo') => ({
    productId,
    rating,
    title,
    body: 'Produto chegou certinho e funciona como descrito.',
  });

  it('keeps reads public and writes behind the session', async () => {
    await http().get(`${base}?productIds=${products[0]}`).expect(200);
    await http().get(`${base}/summary?productIds=${products[0]}`).expect(200);
    await http().get(`${base}/summaries?productIds=${products[0]}`).expect(200);
    await http().get(`${base}/viewer?productIds=${products[0]}`).expect(401);
    await http().get(`${base}/mine?productId=${products[0]}`).expect(401);
    await http().put(`${base}/mine`).send(review(products[0], 5)).expect(401);
    const unauthorized = await http().put(`${base}/${randomUUID()}/helpful`).expect(401);
    expect(unauthorized.body.error.code).toBe('AUTH_SESSION_REQUIRED');
  });

  it('shows an honest empty state for a product without ratings', async () => {
    const summary = await http().get(`${base}/summary?productIds=${products[3]}`).expect(200);
    expect(summary.body).toMatchObject({ average: null, count: 0 });
    const list = await http().get(`${base}?productIds=${products[3]}`).expect(200);
    expect(list.body).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it('validates reviews and query parameters', async () => {
    for (const invalid of [
      review(products[0], 0),
      review(products[0], 6),
      { ...review(products[0], 5), rating: 4.5 },
      review(products[0], 5, '  a  '),
      { ...review(products[0], 5), body: '   curto   ' },
      { ...review(products[0], 5), body: 'x'.repeat(5001) },
      { ...review(products[0], 5), title: 'x'.repeat(121) },
      { ...review(products[0], 5), verifiedPurchase: true },
      { ...review(products[0], 5), productId: 'p6' },
    ]) {
      const response = await save(0, invalid).expect(400);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    }
    await save(0, review(randomUUID(), 5)).expect(404);
    await http().get(`${base}?productIds=p6`).expect(400);
    await http().get(`${base}?productIds=${products[0]}&stars=6`).expect(400);
    await http().get(`${base}?productIds=${products[0]}&sort=best`).expect(400);
    await http().get(`${base}?productIds=${products[0]}&pageSize=21`).expect(400);
    await http()
      .get(`${base}/summaries?productIds=${Array.from({ length: 49 }, randomUUID).join(',')}`)
      .expect(400);
  });

  it('creates, then updates, one review per user per product', async () => {
    const created = await save(0, review(products[0], 4, '  Bom produto  ')).expect(200);
    expect(created.body).toMatchObject({
      productId: products[0],
      authorName: 'Camila L.',
      rating: 4,
      title: 'Bom produto',
      verifiedPurchase: false,
      helpfulCount: 0,
    });
    const updated = await save(0, review(products[0], 2, 'Mudei de ideia')).expect(200);
    expect(updated.body.id).toBe(created.body.id);
    expect(updated.body.createdAt).toBe(created.body.createdAt);
    const mine = await http()
      .get(`${base}/mine?productId=${products[0]}`)
      .set('Cookie', cookies[0])
      .expect(200);
    expect(mine.body).toMatchObject({
      review: { id: created.body.id, rating: 2, title: 'Mudei de ideia' },
      verifiedPurchase: false,
    });
    const other = await http()
      .get(`${base}/mine?productId=${products[3]}`)
      .set('Cookie', cookies[0])
      .expect(200);
    expect(other.body).toEqual({ review: null, verifiedPurchase: false });
    await http()
      .get(`${base}/mine?productId=${randomUUID()}`)
      .set('Cookie', cookies[0])
      .expect(404);
    expect(await prisma.review.count({ where: { productId: products[0] } })).toBe(1);
  });

  it('marks "Compra verificada" only after an order containing the product', async () => {
    await save(1, review(products[0], 5)).expect(200);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: products[0] } });
    const order = (status: 'CANCELLED' | 'PAID') =>
      prisma.order.create({
        data: {
          userId: users[1],
          orderNumber: `PED-${randomUUID()}`,
          status,
          totalMinor: 1000,
          subtotalMinor: 1000,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                unitPriceMinor: 1000,
                lineTotalMinor: 1000,
              },
            ],
          },
        },
      });
    await order('CANCELLED');
    expect((await save(1, review(products[0], 5)).expect(200)).body.verifiedPurchase).toBe(false);
    await order('PAID');
    const mine = await http()
      .get(`${base}/mine?productId=${products[0]}`)
      .set('Cookie', cookies[1])
      .expect(200);
    expect(mine.body.verifiedPurchase).toBe(true);
    expect(mine.body.review.verifiedPurchase).toBe(false); // saved before the order
    expect((await save(1, review(products[0], 5)).expect(200)).body.verifiedPurchase).toBe(true);
  });

  it('counts one helpful vote per user and never on the own review', async () => {
    const target = await prisma.review.findFirstOrThrow({
      where: { productId: products[0], userId: users[0] },
    });
    const self = await http()
      .put(`${base}/${target.id}/helpful`)
      .set('Cookie', cookies[0])
      .expect(403);
    expect(self.body.error).toMatchObject({ code: 'REVIEW_SELF_VOTE' });
    for (const _ of [1, 2]) {
      const vote = await http()
        .put(`${base}/${target.id}/helpful`)
        .set('Cookie', cookies[1])
        .expect(200);
      expect(vote.body).toEqual({ reviewId: target.id, helpfulCount: 1, voted: true });
    }
    const second = await http()
      .put(`${base}/${target.id}/helpful`)
      .set('Cookie', cookies[2])
      .expect(200);
    expect(second.body.helpfulCount).toBe(2);
    await http()
      .put(`${base}/${randomUUID()}/helpful`)
      .set('Cookie', cookies[1])
      .expect(404);
    const viewer = await http()
      .get(`${base}/viewer?productIds=${products[0]},${products[1]}`)
      .set('Cookie', cookies[1])
      .expect(200);
    expect(viewer.body.helpfulReviewIds).toEqual([target.id]);
    expect(viewer.body.ownReviews).toEqual([
      { id: expect.any(String), productId: products[0] },
    ]);
  });

  it('lists by most helpful or most recent, filters by stars and paginates', async () => {
    await save(2, review(products[0], 5, 'Recente e útil?')).expect(200);
    const helpful = await http().get(`${base}?productIds=${products[0]}`).expect(200);
    expect(helpful.body.total).toBe(3);
    expect(helpful.body.items[0]).toMatchObject({ authorName: 'Camila L.', helpfulCount: 2 });
    const recent = await http().get(`${base}?productIds=${products[0]}&sort=recent`).expect(200);
    expect(recent.body.items[0].authorName).toBe('Diego A.');
    const fives = await http().get(`${base}?productIds=${products[0]}&stars=5`).expect(200);
    expect(fives.body.items.map((r: { rating: number }) => r.rating)).toEqual([5, 5]);
    const paged = await http()
      .get(`${base}?productIds=${products[0]}&sort=recent&pageSize=2&page=2`)
      .expect(200);
    expect(paged.body).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    expect(paged.body.items).toHaveLength(1);
    expect(paged.body.items[0].id).toBe(recent.body.items[2].id);
  });

  it('summarises exact distributions and merges demo listings once per family', async () => {
    const summary = await http().get(`${base}/summary?productIds=${products[0]}`).expect(200);
    expect(summary.body).toEqual({
      average: 4, // 2 + 5 + 5
      count: 3,
      distribution: [
        { stars: 5, percent: 67 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 33 },
        { stars: 1, percent: 0 },
      ],
    });
    await save(0, review(products[2], 1)).expect(200);
    const family = await http()
      .get(`${base}/summary?productIds=${products[1]},${products[2]}`)
      .expect(200);
    expect(family.body.count).toBe(101); // one shared listing (100) + one written review
    expect(family.body.average).toBe(4.5); // (450 + 1) / 101
    expect(family.body.distribution[4]).toEqual({ stars: 1, percent: 1 });
    const cards = await http()
      .get(`${base}/summaries?productIds=${products.join(',')}`)
      .expect(200);
    expect(cards.body.items).toEqual([
      { productId: products[0], average: 4, count: 3 },
      { productId: products[1], average: 4.5, count: 100 },
      { productId: products[2], average: 4.5, count: 101 },
      { productId: products[3], average: null, count: 0 },
    ]);
  });
});
