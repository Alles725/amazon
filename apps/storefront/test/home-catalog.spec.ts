import { describe, expect, it, vi } from 'vitest';
import type { CatalogProductDetails } from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));
const records: Record<string, Partial<CatalogProductDetails> | null> = {
  p1: { name: 'Echo Dot (nome do banco)', priceMinor: 19900, active: true },
  p2: { name: 'JBL', priceMinor: 19990, active: false },
  p3: null,
};
vi.mock('../src/features/product/product-server', () => ({
  findCatalogProduct: vi.fn(async (slug: string) =>
    records[slug] ? { id: `uuid-${slug}`, slug, sku: `DEMO-${slug}`, ...records[slug] } : null,
  ),
}));

import { resolveHomeProducts } from '../src/features/home/home-catalog';
import { PRODUCTS } from '../src/features/home/catalog-mock';

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
});
