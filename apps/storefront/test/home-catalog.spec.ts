import { describe, expect, it, vi } from 'vitest';
import type { CatalogProductDetails } from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));
const records: Record<string, Partial<CatalogProductDetails> | null> = {
  p1: { name: 'Echo Dot (nome do banco)', priceMinor: 19900, active: true },
  p2: { name: 'JBL', priceMinor: 19990, active: false },
  p3: null,
};
const { listBySlugs } = vi.hoisted(() => ({ listBySlugs: vi.fn() }));
vi.mock('../src/features/product/product-server', () => ({ listBySlugs }));
listBySlugs.mockImplementation(async (slugs: string[]) =>
  slugs.flatMap((slug) =>
    records[slug] ? [{ id: `uuid-${slug}`, slug, sku: `DEMO-${slug}`, ...records[slug] }] : [],
  ),
);

import { resolveHomeProducts } from '../src/features/home/home-catalog';
import {
  ALSO_CONSIDER,
  BEST_SELLERS,
  DEALS_OF_THE_DAY,
  PRODUCTS,
  RECOMMENDED,
} from '../src/features/home/catalog-mock';

describe('Home cards', () => {
  it('show the catalog record (name, price) instead of the fixture copy', async () => {
    const curated = PRODUCTS.filter((product) => ['p1', 'p2', 'p3'].includes(product.id));
    const resolve = await resolveHomeProducts([curated]);
    const cards = resolve(curated);
    // Fixture says R$ 279,00; the database record wins everywhere.
    expect(curated.find((p) => p.id === 'p1')?.price).toBe(279);
    expect(cards).toEqual([
      expect.objectContaining({
        id: 'uuid-p1',
        name: 'Echo Dot (nome do banco)',
        priceMinor: 19900,
      }),
    ]);
  });

  it('drops inactive or missing products rather than showing fixture data', async () => {
    const curated = PRODUCTS.filter((product) => ['p2', 'p3'].includes(product.id));
    expect((await resolveHomeProducts([curated]))(curated)).toEqual([]);
  });

  it('resolves every rail with one batched lookup instead of one request per card', async () => {
    listBySlugs.mockClear();
    const rails = [DEALS_OF_THE_DAY, BEST_SELLERS, RECOMMENDED, ALSO_CONSIDER];
    await resolveHomeProducts(rails);
    expect(listBySlugs).toHaveBeenCalledTimes(1);
    const slugs = listBySlugs.mock.calls[0][0] as string[];
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('Home rails', () => {
  const rails = { DEALS_OF_THE_DAY, BEST_SELLERS, RECOMMENDED, ALSO_CONSIDER };

  it('stay short, varied and free of duplicates or variant siblings', () => {
    for (const [name, rail] of Object.entries(rails)) {
      expect(rail.length, name).toBeGreaterThanOrEqual(8);
      expect(rail.length, name).toBeLessThanOrEqual(10);
      expect(new Set(rail.map((product) => product.id)).size, name).toBe(rail.length);
      // One card per product type while the catalog has enough types.
      expect(new Set(rail.map((product) => product.glyph)).size, name).toBe(rail.length);
      for (const product of rail) expect(PRODUCTS, name).toContain(product);
    }
  });

  it('draw from the whole catalog, not only the original products', () => {
    const shown = Object.values(rails).flat();
    expect(shown.some((product) => Number(product.id.slice(1)) > 23)).toBe(true);
    expect(DEALS_OF_THE_DAY.every((product) => product.oldPrice! > product.price)).toBe(true);
    expect(RECOMMENDED.some((product) => BEST_SELLERS.includes(product))).toBe(false);
  });
});
