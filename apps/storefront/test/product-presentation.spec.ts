import { describe, expect, it } from 'vitest';
import { CatalogItem } from '@amazon-mvp/api-contract';
import {
  normalizeProductDetails,
  productPresentation,
} from '../src/features/product/product-presentation';
import demos from '../../../config/demo-products.json';

const product: CatalogItem = {
  id: 'arbitrary-uuid',
  slug: 'any-new-product',
  sku: 'ANY',
  name: 'Any product',
  description: null,
  priceMinor: 12345,
  currency: 'BRL',
  active: true,
  availableQuantity: 3,
  inStock: true,
};
describe('generic product presentation', () => {
  it('keeps arbitrary database identities and prices without requiring any fixture', () => {
    const normalized = normalizeProductDetails(product);
    expect(normalized).toEqual({ ...product, categories: [] });
    expect(productPresentation(normalized)).toEqual({
      images: [],
      demo: false,
      oldPriceMinor: undefined,
    });
  });
  it('normalizes blank descriptions and does not invent stock', () => {
    expect(
      normalizeProductDetails({
        ...product,
        description: '  ',
        availableQuantity: 0,
        inStock: false,
      }),
    ).toMatchObject({ description: null, categories: [], inStock: false, availableQuantity: 0 });
  });
  it('reuses existing demo images without overriding API price, name, ID or stock', () => {
    for (const demo of demos) {
      const data = normalizeProductDetails({ ...product, slug: demo.id, sku: demo.sku });
      expect(productPresentation(data).images).toEqual(demo.image ? [demo.image] : []);
      expect(data).toMatchObject({
        id: product.id,
        name: product.name,
        priceMinor: product.priceMinor,
        availableQuantity: product.availableQuantity,
      });
    }
  });
  it('does not associate media by an ID or slug collision alone', () => {
    expect(productPresentation({ ...product, slug: demos[0].id }).images).toEqual([]);
    expect(productPresentation({ ...product, id: demos[0].id }).images).toEqual([]);
  });
  it('only displays a previous price above the current authoritative price', () => {
    const demo = demos.find((p) => p.oldPriceMinor)!;
    expect(
      productPresentation({
        ...product,
        slug: demo.id,
        sku: demo.sku,
        priceMinor: demo.oldPriceMinor!,
      }).oldPriceMinor,
    ).toBeUndefined();
  });
});
