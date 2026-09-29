import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogItem } from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));

import {
  brandSlugs,
  brandStory,
  productContent,
  variantGroupSlugs,
} from '../src/features/product/product-content';
import { productReviews } from '../src/features/product/reviews/product-reviews';
import demos from '../../../config/demo-products.json';
import contents from '../../../config/demo-product-content.json';
import categories from '../../../config/demo-categories.json';
import brands from '../../../config/demo-brands.json';

const PUBLIC = join(process.cwd(), 'public');
const catalogItem = (slug: string, sku: string): CatalogItem => ({
  id: `uuid-${slug}`,
  slug,
  sku,
  name: slug,
  description: null,
  priceMinor: 1000,
  currency: 'BRL',
  active: true,
  availableQuantity: 1,
  inStock: true,
});

describe('product content fixtures', () => {
  it('only describe existing demo products (same slug and SKU) and known categories', () => {
    const slugs = new Set(categories.map((category) => category.slug));
    for (const entry of contents) {
      expect(demos.some((demo) => demo.id === entry.id && demo.sku === entry.sku)).toBe(true);
      for (const slug of entry.categories ?? []) expect(slugs.has(slug)).toBe(true);
    }
    for (const category of categories as Array<{ slug: string; parent?: string }>)
      if (category.parent) expect(slugs.has(category.parent)).toBe(true);
  });

  it('reference only images that exist in the storefront', () => {
    const sources = [
      ...demos.map((demo) => demo.image?.src),
      ...contents.flatMap((entry) =>
        (('gallery' in entry && entry.gallery) || []).map((i) => i.src),
      ),
      ...brands.flatMap((brand) => [brand.logo.src, brand.banner.src]),
    ].filter(Boolean) as string[];
    for (const src of sources) expect(existsSync(join(PUBLIC, src)), src).toBe(true);
  });
});

describe('productContent', () => {
  it('gives the reference product its own gallery, brand, specs and variant options', () => {
    const content = productContent(catalogItem('p6', 'DEMO-p6'));
    expect(content.images).toHaveLength(9);
    expect(content.images.every((image) => image.src.includes('/hortela-'))).toBe(true);
    expect(content.brand).toBe('8BitDo');
    expect(content.attributes).toEqual([{ label: 'Plataforma', value: 'Windows, Android' }]);
    expect(content.badges).toEqual({ amazonChoice: true, boughtLastMonth: 'Mais de 200 compras' });
    expect(content.variant?.options).toEqual([
      { name: 'Estilo', value: 'Ultimate 2C' },
      { name: 'Cor', value: 'Hortelã' },
    ]);
    expect(content.rating).toEqual({ average: 4.8, count: 5508, distribution: [92, 5, 1, 0, 2] });
    expect(content.details.find((d) => d.label === 'ASIN')?.value).toBe('B0D736BCNM');
  });

  it('never leaks the reference content into other products', () => {
    const echo = productContent(catalogItem('p1', 'DEMO-p1'));
    expect(echo.images).toEqual([demos[0].image]);
    expect(echo.brand).toBe('Amazon');
    expect(echo.variant).toBeUndefined();
    expect(echo.badges).toEqual({ amazonChoice: false, boughtLastMonth: undefined });
    expect(echo.bullets).toEqual([]);
    expect(echo.rating).toEqual({ average: 4.7, count: 48213 });

    const peach = productContent(catalogItem('p21', 'DEMO-p21'));
    expect(peach.images[0].src).toContain('/pessego-1');
    expect(peach.badges.amazonChoice).toBe(false);
  });

  it('returns nothing for arbitrary records or a slug whose SKU does not match', () => {
    for (const product of [catalogItem('new-product', 'ANY'), catalogItem('p6', 'OTHER-SKU')]) {
      const content = productContent(product);
      expect(content).toMatchObject({
        images: [],
        brand: undefined,
        attributes: [],
        details: [],
        rating: undefined,
        variant: undefined,
        demo: false,
      });
    }
  });

  it('groups variants and brand products, and only has brand stories for registered brands', () => {
    expect(variantGroupSlugs('8bitdo-ultimate-2c')).toEqual(['p6', 'p21', 'p22', 'p23']);
    expect(brandSlugs('8BitDo')).toEqual(['p6', 'p21', 'p22', 'p23']);
    expect(brandStory('8BitDo')?.story).toHaveLength(3);
    expect(brandStory('Amazon')).toBeUndefined();
    expect(brandStory(undefined)).toBeUndefined();
  });
});

describe('productReviews', () => {
  it('shares one review pool across variants, most helpful first', () => {
    const mint = catalogItem('p6', 'DEMO-p6');
    const purple = catalogItem('p22', 'DEMO-p22');
    const a = productReviews(mint, productContent(mint));
    const b = productReviews(purple, productContent(purple));
    expect(a.reviews.map((r) => r.id)).toEqual(b.reviews.map((r) => r.id));
    expect(a.reviews[0].helpfulCount).toBeGreaterThanOrEqual(a.reviews[1].helpfulCount);
    expect(a.media).toEqual([]);
  });

  it('keeps the aggregate rating but invents no written reviews for other products', () => {
    const echo = catalogItem('p1', 'DEMO-p1');
    expect(productReviews(echo, productContent(echo))).toEqual({
      summary: { average: 4.7, count: 48213 },
      media: [],
      reviews: [],
    });
    const plain = catalogItem('usb-c-charger-65w', 'ELEC-0001');
    expect(productReviews(plain, productContent(plain)).summary).toBeNull();
  });
});

describe('home cards', () => {
  it('show one card per variant family, linking to the family head', async () => {
    const { PRODUCTS } = await import('../src/features/home/catalog-mock');
    const ids = PRODUCTS.map((product) => product.id);
    expect(ids).toContain('p6');
    for (const sibling of ['p21', 'p22', 'p23']) expect(ids).not.toContain(sibling);
    expect(PRODUCTS.find((product) => product.id === 'p6')?.image?.src).toContain('hortela-1');
  });
});
