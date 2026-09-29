import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import demos from '../../../config/demo-products.json';
import contents from '../../../config/demo-product-content.json';
import categories from '../../../config/demo-categories.json';

/** The demo catalog is seeded into the database and powers the Home, the product
 * page and its recommendations, so its integrity is checked as data. */

type Demo = (typeof demos)[number] & { variantOf?: string; oldPriceMinor?: number };
type Content = {
  id: string;
  sku: string;
  description?: string;
  categories?: string[];
  brand?: string;
  gallery?: Array<{ src: string; alt: string }>;
  attributes?: Array<{ label: string; value: string }>;
  variant?: { group: string; options: Array<{ name: string; value: string }> };
  fulfillment?: { shippedBy?: string; soldBy?: string; returns?: string };
};

const PUBLIC = join(process.cwd(), 'public');
const products = demos as Demo[];
const content = new Map((contents as Content[]).map((entry) => [entry.id, entry]));
const parents = new Map(
  (categories as Array<{ slug: string; parent?: string }>).map((c) => [c.slug, c.parent]),
);
const GLYPHS = [
  ...'headphones echo ereader blender sneaker controller plant beauty laptop watch backpack camera'.split(
    ' ',
  ),
  ...'airfryer book lamp bottle sandal boot speaker charger keyboard mouse monitor storage'.split(
    ' ',
  ),
  ...'coffee kitchen vacuum hairdryer shaver perfume shirt fitness ball frame tv'.split(' '),
];
const ORIGINAL = Array.from({ length: 23 }, (_, index) => `p${index + 1}`);

describe('demo catalog', () => {
  it('is large enough to fill recommendations (~150 products with the 4 base-seed ones)', () => {
    expect(products.length).toBeGreaterThanOrEqual(140);
    expect(products.length).toBeLessThanOrEqual(160);
  });

  it('keeps the original products first, with the same ids and SKUs', () => {
    expect(products.slice(0, 23).map((p) => [p.id, p.sku])).toEqual(
      ORIGINAL.map((id) => [id, `DEMO-${id}`]),
    );
  });

  it('has unique ids (= slugs), SKUs and image files', () => {
    const unique = (values: string[]) => expect(new Set(values).size).toBe(values.length);
    unique(products.map((p) => p.id));
    unique(products.map((p) => p.sku));
    // p5 and p19 already shared one photo before the expansion; no new product
    // reuses an image, neither another new product's nor an original one.
    const originalImages = products.slice(0, 23).flatMap((p) => (p.image ? [p.image.src] : []));
    const newImages = products.slice(23).map((p) => p.image!.src);
    unique(newImages);
    for (const src of newImages) expect(originalImages).not.toContain(src);
    for (const product of products) {
      expect(product.id).toMatch(/^p\d+$/);
      expect(product.sku).toBe(`DEMO-${product.id}`);
    }
  });

  it('gives every product a name, a positive integer price, valid stock and a glyph', () => {
    for (const product of products) {
      expect(product.name.trim(), product.id).not.toBe('');
      expect(Number.isInteger(product.priceMinor) && product.priceMinor > 0, product.id).toBe(true);
      if (product.oldPriceMinor) expect(product.oldPriceMinor).toBeGreaterThan(product.priceMinor);
      expect(Number.isInteger(product.inventoryQuantity), product.id).toBe(true);
      expect(product.inventoryQuantity, product.id).toBeGreaterThanOrEqual(0);
      expect(GLYPHS, product.id).toContain(product.glyph);
      expect(product.rating).toBeGreaterThanOrEqual(1);
      expect(product.rating).toBeLessThanOrEqual(5);
    }
  });

  it('keeps most products purchasable, with some low-stock and a few sold-out ones', () => {
    const stock = products.map((p) => p.inventoryQuantity);
    const soldOut = stock.filter((quantity) => quantity === 0).length;
    expect(soldOut).toBeGreaterThan(0);
    expect(soldOut / products.length).toBeLessThan(0.05);
    expect(stock.filter((quantity) => quantity > 0 && quantity <= 5).length).toBeGreaterThan(3);
  });

  it('spreads prices across realistic ranges', () => {
    const bands = [0, 5000, 10000, 20000, 50000, 100000, Infinity];
    for (let band = 0; band < bands.length - 1; band++) {
      const inBand = products.filter(
        (p) => p.priceMinor >= bands[band] && p.priceMinor < bands[band + 1],
      ).length;
      expect(inBand, `R$ ${bands[band] / 100}+`).toBeGreaterThan(3);
    }
  });

  it('describes every new product with its own image, category, brand and delivery data', () => {
    for (const product of products.filter((p) => !ORIGINAL.includes(p.id))) {
      const entry = content.get(product.id)!;
      expect(entry, product.id).toBeDefined();
      expect(entry.sku).toBe(product.sku);
      expect(entry.description?.trim(), product.id).toBeTruthy();
      expect(entry.brand?.trim(), product.id).toBeTruthy();
      expect(entry.categories?.length, product.id).toBeGreaterThanOrEqual(1);
      expect(entry.gallery?.[0], product.id).toEqual(product.image);
      expect(entry.fulfillment?.returns, product.id).toBeTruthy();
      for (const image of entry.gallery ?? [])
        expect(existsSync(join(PUBLIC, image.src)), image.src).toBe(true);
    }
  });

  it('places every product in a known category of a taxonomy without cycles', () => {
    for (const product of products) {
      const slugs = content.get(product.id)?.categories ?? [];
      expect(slugs.length, product.id).toBeGreaterThan(0);
      for (const slug of slugs) expect(parents.has(slug), `${product.id} ${slug}`).toBe(true);
    }
    for (const slug of parents.keys()) {
      const chain = new Set<string>();
      for (let current: string | undefined = slug; current; current = parents.get(current)) {
        expect(chain.has(current), slug).toBe(false);
        chain.add(current);
      }
    }
  });

  it('has many brands, several per busy category', () => {
    const brands = new Set([...content.values()].flatMap((entry) => entry.brand ?? []));
    expect(brands.size).toBeGreaterThanOrEqual(25);
    const brandsIn = (leaf: string) =>
      new Set(
        [...content.values()]
          .filter((entry) => entry.categories?.includes(leaf))
          .map((entry) => entry.brand),
      ).size;
    expect(brandsIn('tenis-corrida')).toBeGreaterThanOrEqual(3);
    expect(brandsIn('tenis-casual')).toBeGreaterThanOrEqual(4);
  });
});

describe('variant families', () => {
  const groups = new Map<string, Content[]>();
  for (const entry of content.values())
    if (entry.variant)
      groups.set(entry.variant.group, [...(groups.get(entry.variant.group) ?? []), entry]);

  it('follow the 8BitDo pattern: sibling records pointing at the family head', () => {
    expect(groups.size).toBeGreaterThanOrEqual(20);
    expect(groups.get('8bitdo-ultimate-2c')!.map((entry) => entry.id)).toEqual([
      'p6',
      'p21',
      'p22',
      'p23',
    ]);
    for (const [group, members] of groups) {
      expect(members.length, group).toBeGreaterThanOrEqual(2);
      const [head, ...siblings] = members.map((entry) => products.find((p) => p.id === entry.id)!);
      expect(head.variantOf, group).toBeUndefined();
      for (const sibling of siblings) expect(sibling.variantOf, group).toBe(head.id);
    }
    for (const product of products.filter((p) => p.variantOf)) {
      const group = content.get(product.id)?.variant?.group;
      expect(group, product.id).toBeDefined();
      expect(content.get(product.variantOf!)?.variant?.group).toBe(group);
    }
  });

  it('share brand and category, and differ in exactly the chosen option', () => {
    for (const [group, members] of groups) {
      expect(new Set(members.map((entry) => entry.brand)).size, group).toBe(1);
      expect(new Set(members.map((entry) => entry.categories?.join())).size, group).toBe(1);
      const names = members[0].variant!.options.map((option) => option.name);
      const combos = members.map((entry) => {
        expect(
          entry.variant!.options.map((option) => option.name),
          entry.id,
        ).toEqual(names);
        return entry.variant!.options.map((option) => option.value).join('/');
      });
      expect(new Set(combos).size, group).toBe(members.length);
    }
  });

  it('show the colour of the record in its own image and attributes', () => {
    for (const [group, members] of groups) {
      if (group === '8bitdo-ultimate-2c') continue;
      for (const entry of members) {
        const colour = entry.variant!.options.find((option) => option.name === 'Cor')!.value;
        expect(entry.attributes, entry.id).toContainEqual({ label: 'Cor', value: colour });
        expect(entry.gallery![0].alt.toLowerCase(), entry.id).toContain(colour.toLowerCase());
      }
    }
  });
});
