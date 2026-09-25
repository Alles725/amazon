import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { CATALOG_ROUTES } from '@amazon-mvp/api-contract';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';

describe('product details (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const id = randomUUID();
  const categoryId = randomUUID();
  const uuidSlug = randomUUID();
  const uuidSlugId = randomUUID();
  const slug = `detail-${id}`;
  beforeAll(async () => {
    app = (await createApp()).app;
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.product.create({
      data: {
        id: uuidSlugId,
        slug: uuidSlug,
        sku: uuidSlug,
        name: 'UUID-looking slug',
        priceMinor: 0,
      },
    });
    await prisma.category.create({ data: { id: categoryId, name: 'Detail category', slug } });
    await prisma.product.create({
      data: {
        id,
        slug,
        sku: slug,
        name: 'Product details test',
        description: 'Actual description',
        priceMinor: 12345,
        inventory: { create: { quantity: 5, reserved: 2 } },
        categories: { create: { categoryId } },
      },
    });
  });
  afterAll(async () => {
    if (prisma) {
      await prisma.product.deleteMany({ where: { id: { in: [id, uuidSlugId] } } });
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
    await app?.close();
  });
  const get = (identifier: string) =>
    request(app.getHttpServer()).get(`${CATALOG_ROUTES.products}/${identifier}`);
  it('reads identical public details by UUID and slug, with categories and unreserved stock', async () => {
    const response = await get(id).expect(200);
    expect(response.body).toEqual({
      id,
      sku: slug,
      slug,
      name: 'Product details test',
      description: 'Actual description',
      priceMinor: 12345,
      currency: 'BRL',
      active: true,
      availableQuantity: 3,
      inStock: true,
      categories: [{ name: 'Detail category', slug }],
    });
    expect(response.headers['cache-control']).toBe('no-store');
    expect((await get(slug).expect(200)).body).toEqual(response.body);
    const related = await request(app.getHttpServer())
      .get(`${CATALOG_ROUTES.products}?category=${slug}`)
      .expect(200);
    expect(related.body.items.map((item: { id: string }) => item.id)).toEqual([id]);
  });
  it('accepts UUID-shaped slugs without confusing them with absent primary IDs', async () => {
    expect((await get(uuidSlug).expect(200)).body.id).toBe(uuidSlugId);
  });
  it('returns updated prices and out-of-stock details, without hiding the active product', async () => {
    await prisma.product.update({ where: { id }, data: { priceMinor: 6789, description: null } });
    await prisma.inventory.update({ where: { productId: id }, data: { quantity: 2 } });
    const response = await get(slug).expect(200);
    expect(response.body).toMatchObject({
      priceMinor: 6789,
      description: null,
      availableQuantity: 0,
      inStock: false,
    });
  });
  it('returns standard 404s for absent products and disables purchase for inactive products', async () => {
    for (const identifier of [randomUUID(), `absent-${randomUUID()}`, 'not-a-uuid']) {
      const result = await get(identifier).expect(404);
      expect(result.body.error.code).toBe('RESOURCE_NOT_FOUND');
    }
    await prisma.product.update({ where: { id }, data: { active: false } });
    expect((await get(id).expect(200)).body).toMatchObject({
      active: false,
      inStock: false,
      availableQuantity: 0,
    });
    expect((await get(slug).expect(200)).body.active).toBe(false);
    await get('a'.repeat(201)).expect(400);
  });
});
