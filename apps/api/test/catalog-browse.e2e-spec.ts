import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import {
  CATALOG_BROWSE_ROUTES,
  CATALOG_ROUTES,
  CatalogCategoryNode,
  CatalogFacets,
  CatalogItem,
} from '@amazon-mvp/api-contract';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';

/** Every record carries a unique marker word, so searches only see this suite's rows
 * even on a database that also holds the demo catalog. */
describe('catalog browse and search (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const run = randomUUID().replace(/-/g, '').slice(0, 10);
  const marker = `brw${run}`;
  const rootId = randomUUID();
  const leafId = randomUUID();
  const otherId = randomUUID();
  const ids = {
    camera: randomUUID(),
    described: randomUUID(),
    categorized: randomUUID(),
    soldOut: randomUUID(),
    inactive: randomUUID(),
  };
  const slug = (key: string) => `${marker}-${key}`;

  beforeAll(async () => {
    app = (await createApp()).app;
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.category.create({ data: { id: rootId, slug: slug('root'), name: 'Raiz Busca' } });
    await prisma.category.create({
      data: { id: leafId, slug: slug('leaf'), name: `Câmeras ${marker}`, parentId: rootId },
    });
    await prisma.category.create({ data: { id: otherId, slug: slug('other'), name: 'Outra' } });
    const create = (
      key: keyof typeof ids,
      data: { name: string; description?: string; priceMinor: number; categoryId: string },
      stock: { quantity: number; reserved?: number },
      active = true,
    ) =>
      prisma.product.create({
        data: {
          id: ids[key],
          slug: slug(key),
          sku: slug(key),
          name: data.name,
          description: data.description,
          priceMinor: data.priceMinor,
          active,
          inventory: { create: stock },
          categories: { create: { categoryId: data.categoryId } },
        },
      });
    // Created in sequence so `newest` has a defined order.
    await create(
      'camera',
      { name: `CÂMERA Ação ${marker}`, priceMinor: 20000, categoryId: leafId },
      { quantity: 3 },
    );
    await create(
      'described',
      {
        name: 'Suporte articulado',
        description: `Compatível com câmera ${marker} e similares`,
        priceMinor: 4990,
        categoryId: otherId,
      },
      { quantity: 1 },
    );
    await create(
      'categorized',
      { name: 'Tripé compacto', priceMinor: 10000, categoryId: leafId },
      { quantity: 2 },
    );
    await create(
      'soldOut',
      { name: `Lente ${marker}`, priceMinor: 250000, categoryId: leafId },
      { quantity: 2, reserved: 2 },
    );
    await create(
      'inactive',
      { name: `Inativo ${marker}`, priceMinor: 100, categoryId: leafId },
      { quantity: 5 },
      false,
    );
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.product.deleteMany({ where: { id: { in: Object.values(ids) } } });
      await prisma.category.deleteMany({ where: { id: { in: [leafId, rootId, otherId] } } });
    }
    await app?.close();
  });

  const list = async (query: string) =>
    (await request(app.getHttpServer()).get(`${CATALOG_ROUTES.products}?${query}`).expect(200))
      .body as { items: CatalogItem[]; total: number };
  const slugsOf = (page: { items: CatalogItem[] }) => page.items.map((item) => item.slug);

  it('searches name, description and category names, ignoring case and accents', async () => {
    const page = await list(`q=${encodeURIComponent(`camera ${marker.toUpperCase()}`)}`);
    // Both words in the name (and category) first; the lens has the marker in its name
    // and "câmera" only in its category; the tripod only through its category; the
    // mount only in its description. The inactive product never appears.
    expect(slugsOf(page)).toEqual([
      slug('camera'),
      slug('soldOut'),
      slug('categorized'),
      slug('described'),
    ]);
    expect(page.total).toBe(4);
    // Every word must match somewhere.
    const lens = await list(`q=${encodeURIComponent(`lente ${marker}`)}`);
    expect(slugsOf(lens)).toEqual([slug('soldOut')]);
    expect((await list(`q=${marker}%20inexistente`)).total).toBe(0);
  });

  it('ranks by relevance and sorts by price and creation date', async () => {
    const byRelevance = await list(`q=${marker}&pageSize=48`);
    expect(byRelevance.total).toBe(4);
    // Name hits (ties alphabetical) > category-only hit > description-only hit.
    expect(slugsOf(byRelevance)).toEqual([
      slug('camera'),
      slug('soldOut'),
      slug('categorized'),
      slug('described'),
    ]);
    expect(slugsOf(await list(`q=${marker}&sort=price-asc`))).toEqual([
      slug('described'),
      slug('categorized'),
      slug('camera'),
      slug('soldOut'),
    ]);
    expect(slugsOf(await list(`q=${marker}&sort=price-desc`))[0]).toBe(slug('soldOut'));
    expect(slugsOf(await list(`q=${marker}&sort=newest`))).toEqual([
      slug('soldOut'),
      slug('categorized'),
      slug('described'),
      slug('camera'),
    ]);
  });

  it('pages a ranked result without repeating or skipping records', async () => {
    const first = await list(`q=${marker}&sort=price-asc&pageSize=3&page=1`);
    const second = await list(`q=${marker}&sort=price-asc&pageSize=3&page=2`);
    expect(first.total).toBe(4);
    expect(second.total).toBe(4);
    expect([...slugsOf(first), ...slugsOf(second)]).toHaveLength(4);
    expect(new Set([...slugsOf(first), ...slugsOf(second)]).size).toBe(4);
    expect(await list(`q=${marker}&page=9`)).toEqual({ items: [], total: 4 });
  });

  it('filters by price range (min inclusive, max exclusive), stock, category and slugs', async () => {
    expect(slugsOf(await list(`q=${marker}&minPriceMinor=10000&maxPriceMinor=20000`))).toEqual([
      slug('categorized'),
    ]);
    const inStock = await list(`q=${marker}&inStock=true&sort=price-asc`);
    expect(slugsOf(inStock)).toEqual([slug('described'), slug('categorized'), slug('camera')]);
    expect(inStock.items.every((item) => item.inStock)).toBe(true);
    expect((await list(`category=${slug('root')}&sort=price-asc`)).total).toBe(3);
    expect(
      slugsOf(await list(`category=${slug('root')}&slugs=${slug('camera')},${slug('described')}`)),
    ).toEqual([slug('camera')]);
  });

  it('treats LIKE wildcards in the query as plain text', async () => {
    expect((await list(`q=${encodeURIComponent(`${marker}_`)}`)).total).toBe(4);
    const phrase = await list(`q=${encodeURIComponent(`%${marker}`)}`);
    expect(phrase.total).toBe(4);
  });

  it('returns facet counts over the search scope, with category ancestors', async () => {
    const facets = (
      await request(app.getHttpServer())
        .get(`${CATALOG_BROWSE_ROUTES.facets}?q=${marker}`)
        .expect(200)
    ).body as CatalogFacets;
    expect(facets.total).toBe(4);
    expect(facets.inStock).toBe(3);
    expect(facets.slugs).toEqual(
      [slug('camera'), slug('categorized'), slug('described'), slug('soldOut')].sort(),
    );
    expect(facets.slugsTruncated).toBe(false);
    const counts = Object.fromEntries(facets.categories.map((row) => [row.slug, row.count]));
    expect(counts).toEqual({ [slug('root')]: 3, [slug('leaf')]: 3, [slug('other')]: 1 });
    const bucket = (min: number) => facets.priceBuckets.find((row) => row.minMinor === min);
    expect(bucket(0)).toEqual({ minMinor: 0, maxMinor: 5000, count: 1 });
    expect(bucket(10000)).toEqual({ minMinor: 10000, maxMinor: 20000, count: 1 });
    expect(bucket(20000)).toEqual({ minMinor: 20000, maxMinor: 50000, count: 1 });
    expect(bucket(200000)).toEqual({ minMinor: 200000, maxMinor: null, count: 1 });
    expect(facets.priceBuckets.reduce((sum, row) => sum + row.count, 0)).toBe(4);

    // A brand listing narrows the scope with its slugs.
    const scoped = (
      await request(app.getHttpServer())
        .get(
          `${CATALOG_BROWSE_ROUTES.facets}?q=${marker}&slugs=${slug('camera')},${slug('soldOut')}`,
        )
        .expect(200)
    ).body as CatalogFacets;
    expect(scoped).toMatchObject({ total: 2, inStock: 1 });
    expect(scoped.slugs).toEqual([slug('camera'), slug('soldOut')]);

    const unknown = (
      await request(app.getHttpServer())
        .get(`${CATALOG_BROWSE_ROUTES.facets}?category=${slug('absent')}`)
        .expect(200)
    ).body as CatalogFacets;
    expect(unknown).toMatchObject({ total: 0, inStock: 0, categories: [], slugs: [] });
  });

  it('lists the category taxonomy with parent links', async () => {
    const nodes = (
      await request(app.getHttpServer()).get(CATALOG_BROWSE_ROUTES.categories).expect(200)
    ).body as CatalogCategoryNode[];
    expect(nodes).toEqual(
      expect.arrayContaining([
        { slug: slug('root'), name: 'Raiz Busca', parentSlug: null },
        { slug: slug('leaf'), name: `Câmeras ${marker}`, parentSlug: slug('root') },
      ]),
    );
  });

  it('rejects invalid browse parameters', async () => {
    for (const query of [
      'sort=rating',
      'inStock=maybe',
      'minPriceMinor=-1',
      'maxPriceMinor=1.5',
      `q=${'a'.repeat(101)}`,
      'pageSize=49',
      'department=all',
    ])
      await request(app.getHttpServer()).get(`${CATALOG_ROUTES.products}?${query}`).expect(400);
    await request(app.getHttpServer()).get(`${CATALOG_BROWSE_ROUTES.facets}?page=2`).expect(400);
  });
});
