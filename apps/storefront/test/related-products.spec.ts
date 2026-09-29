import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogItem, CatalogProductDetails } from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ toString: () => '' }) }));
vi.mock('../src/config/storefront-config', () => ({
  getConfig: () => ({ api: { internalBaseUrl: 'http://api', publicBasePath: '/api/v1' } }),
}));

import { rankRelated, type RelatedCandidate } from '../src/features/product/related-products';
import { relatedProducts } from '../src/features/product/product-server';
import demos from '../../../config/demo-products.json';
import contents from '../../../config/demo-product-content.json';
import categories from '../../../config/demo-categories.json';

const item = (id: string, priceMinor = 10000, extra: Partial<CatalogItem> = {}): CatalogItem => ({
  id,
  slug: id,
  sku: `SKU-${id}`,
  name: id,
  description: null,
  priceMinor,
  currency: 'BRL',
  active: true,
  availableQuantity: 5,
  inStock: true,
  ...extra,
});
const candidate = (
  id: string,
  distance: number,
  facts: Partial<RelatedCandidate['facts']> = {},
  extra: Partial<CatalogItem> = {},
): RelatedCandidate => ({
  item: item(id, extra.priceMinor, extra),
  distance,
  facts: { attributes: [], ...facts },
});

describe('rankRelated', () => {
  const target = { item: item('shoe', 30000), facts: { brand: 'A', attributes: [] } };

  it('prefers the closest category, then brand, then similar price', () => {
    const ranked = rankRelated(
      target,
      [
        candidate('parent-same-brand', 1, { brand: 'A' }, { priceMinor: 30000 }),
        candidate('leaf-cheap', 0, {}, { priceMinor: 2000 }),
        candidate('leaf-same-brand', 0, { brand: 'A' }, { priceMinor: 90000 }),
        candidate('leaf-similar-price', 0, {}, { priceMinor: 31000 }),
      ],
      10,
    );
    expect(ranked.map((p) => p.id)).toEqual([
      'leaf-same-brand',
      'leaf-similar-price',
      'leaf-cheap',
      'parent-same-brand',
    ]);
  });

  it('never returns the product itself, its family, duplicates or inactive records', () => {
    const own = { item: item('p1'), facts: { family: 'fam', attributes: [] } };
    const ranked = rankRelated(
      own,
      [
        candidate('p1', 0),
        candidate('sibling', 0, { family: 'fam' }),
        candidate('other', 0),
        candidate('other', 1),
        candidate('inactive', 0, {}, { active: false }),
      ],
      10,
    );
    expect(ranked.map((p) => p.id)).toEqual(['other']);
  });

  it('shows one card per other family, preferring the member that shares attributes', () => {
    const black = { label: 'Cor', value: 'Preto' };
    const ranked = rankRelated(
      { item: item('mine'), facts: { attributes: [black] } },
      [
        candidate('run-white', 0, {
          family: 'run',
          attributes: [{ label: 'Cor', value: 'Branco' }],
        }),
        candidate('run-black', 0, { family: 'run', attributes: [black] }),
        candidate('single', 0),
      ],
      10,
    );
    expect(ranked.map((p) => p.id)).toEqual(['run-black', 'single']);
  });

  it('ranks candidates sharing more of the product categories first', () => {
    const ranked = rankRelated(
      target,
      [
        candidate('gamer-keyboard', 0, { brand: 'A' }),
        { ...candidate('other-headset', 0), sharedCategories: 2 },
      ],
      10,
    );
    expect(ranked.map((p) => p.id)).toEqual(['other-headset', 'gamer-keyboard']);
  });

  it('represents a family by its head when no attribute is shared', () => {
    const ranked = rankRelated(
      target,
      [
        candidate('fam-branco', 0, { family: 'fam' }),
        candidate('fam-preto', 0, { family: 'fam', familyHead: true }),
      ],
      10,
    );
    expect(ranked.map((p) => p.id)).toEqual(['fam-preto']);
  });

  it('puts sold-out products after available ones and honours the limit', () => {
    const ranked = rankRelated(
      target,
      [
        candidate('sold-out', 0, { brand: 'A' }, { inStock: false, availableQuantity: 0 }),
        ...['a', 'b', 'c'].map((id) => candidate(id, 0)),
      ],
      3,
    );
    expect(ranked).toHaveLength(3);
    expect(ranked.map((p) => p.id)).not.toContain('sold-out');
  });
});

// ---------------------------------------------------------------------------
// The real demo catalog behind a fake API: category lists include the subtree
// and are capped like the real endpoint, so this exercises the same requests
// the product page makes.

type Content = { id: string; sku: string; categories?: string[]; variant?: { group: string } };
const parent = new Map(
  (categories as Array<{ slug: string; name: string; parent?: string }>).map((c) => [c.slug, c]),
);
const pathOf = (slug: string) => {
  const chain: Array<{ slug: string; name: string }> = [];
  for (let current = parent.get(slug); current; current = parent.get(current.parent ?? ''))
    chain.unshift({ slug: current.slug, name: current.name });
  return chain;
};
const categoriesOf = new Map((contents as Content[]).map((c) => [c.id, c.categories ?? []]));
const categoryOf = new Map([...categoriesOf].map(([id, slugs]) => [id, slugs[0]]));
const familyOf = new Map((contents as Content[]).map((c) => [c.id, c.variant?.group]));
// Like the API: every linked category is listed; the deepest chain is the breadcrumb.
const CATALOG: CatalogProductDetails[] = demos.map((demo) => ({
  ...item(`uuid-${demo.id}`, demo.priceMinor, {
    slug: demo.id,
    sku: demo.sku,
    name: demo.name,
    availableQuantity: demo.inventoryQuantity,
    inStock: demo.inventoryQuantity > 0,
  }),
  categories: categoriesOf.get(demo.id)!.map((slug) => ({ slug, name: '' })),
  categoryPath: categoriesOf
    .get(demo.id)!
    .map(pathOf)
    .reduce((deepest, path) => (path.length > deepest.length ? path : deepest), []),
}));
const inSubtree = (product: CatalogProductDetails, slug: string) =>
  product.categories.some((category) => pathOf(category.slug).some((c) => c.slug === slug));
const rootsOf = (product: CatalogItem) =>
  categoriesOf.get(product.slug)!.map((slug) => pathOf(slug)[0].slug);

let requests: string[] = [];
beforeEach(() => {
  requests = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      requests.push(url);
      const query = new URL(url).searchParams;
      const slug = query.get('category')!;
      const items = CATALOG.filter((product) => inSubtree(product, slug))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, Number(query.get('pageSize')));
      return { ok: true, status: 200, json: async () => ({ items, total: items.length }) };
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const bySlug = (slug: string) => CATALOG.find((product) => product.slug === slug)!;
const recommend = (slug: string) => {
  const product = bySlug(slug);
  const family = familyOf.get(slug);
  const exclude = new Set(
    CATALOG.filter((p) => p.id === product.id || (family && familyOf.get(p.slug) === family)).map(
      (p) => p.id,
    ),
  );
  return relatedProducts(product, exclude);
};
const leafOf = (product: CatalogItem) => categoryOf.get(product.slug)!;

describe('relatedProducts over the demo catalog', () => {
  // A sample of every department, including the reference 8BitDo and legacy items.
  const SAMPLE = {
    'tênis de corrida': 'p24',
    'tênis casual': 'p5',
    'fone bluetooth': 'p2',
    headset: 'p55',
    teclado: 'p84',
    notebook: 'p9',
    'air fryer': 'p4',
    cafeteira: 'p100',
    aspirador: 'p115',
    secador: 'p120',
    'camiseta esportiva': 'p133',
    garrafa: 'p141',
    controle: 'p6',
    livro: 'p13',
  };

  it.each(Object.entries(SAMPLE))('fills the rail for a %s (%s)', async (_, slug) => {
    const product = bySlug(slug);
    const related = await recommend(slug);
    expect(related.length).toBeGreaterThanOrEqual(6);
    expect(related.length).toBeLessThanOrEqual(12);
    const ids = related.map((p) => p.id);
    expect(ids).not.toContain(product.id);
    expect(new Set(ids).size).toBe(ids.length);
    // One card per family, never the product's own family.
    const families = related.flatMap((p) => familyOf.get(p.slug) ?? []);
    expect(new Set(families).size).toBe(families.length);
    if (familyOf.get(slug)) expect(families).not.toContain(familyOf.get(slug));
    // Same department only, and the most specific category first.
    for (const recommended of related)
      expect(rootsOf(recommended).some((root) => rootsOf(product).includes(root))).toBe(true);
  });

  it('recommends shoes for a shoe, and same-type products first', async () => {
    const running = await recommend('p24');
    expect(running.length).toBe(12);
    // The two other running-shoe listings (Veloce Pulse, Kinetik Marathon) lead.
    expect(running.slice(0, 2).map((p) => leafOf(p))).toEqual(['tenis-corrida', 'tenis-corrida']);
    expect(running.slice(2, 9).every((p) => inSubtree(p as CatalogProductDetails, 'tenis'))).toBe(
      true,
    );
    expect(running.every((p) => inSubtree(p as CatalogProductDetails, 'calcados'))).toBe(true);
    // Stride Aero 3 (p24-p27) is the product's own family: none of its colours appear.
    for (const sibling of ['p25', 'p26', 'p27'])
      expect(running.map((p) => p.slug)).not.toContain(sibling);

    const keyboard = await recommend('p84');
    expect(leafOf(keyboard[0])).toBe('teclados');
    expect(keyboard.every((p) => inSubtree(p as CatalogProductDetails, 'computadores'))).toBe(true);
  });

  it('fills the 8BitDo rail with other controllers first, then gamer peripherals', async () => {
    const related = await recommend('p6');
    const slugs = related.map((p) => p.slug);
    for (const sibling of ['p21', 'p22', 'p23']) expect(slugs).not.toContain(sibling);
    expect(related.length).toBeGreaterThanOrEqual(8);
    expect(related.slice(0, 2).every((p) => leafOf(p) === 'games-pc-controles')).toBe(true);
    // A gamer keyboard lives in "Teclados" and in "Periféricos Gamer".
    // Controller families are shown by their head record, as on the Home.
    expect(slugs).not.toContain('p86');
    expect(slugs).toContain('p85');
    const headset = await recommend('p55');
    expect(leafOf(headset[0])).toBe('headsets');
    const gamerKeyboard = await recommend('p82');
    expect(gamerKeyboard.map((p) => leafOf(p))).toContain('teclados');
    expect(gamerKeyboard.map((p) => p.slug)).toContain('p77');
  });

  it('prefers the same colour when showing another family (black shoe → black variants)', async () => {
    const related = await recommend('p24');
    const urbano = related.find((p) => familyOf.get(p.slug) === 'urbano-classic');
    expect(urbano?.name).toMatch(/Preto$/);
  });

  it('only widens the search while the rail is not full', async () => {
    await recommend('p24');
    // Running shoes, then all shoes; "Calçados" completes the rail, "Moda" is never needed.
    expect(requests.map((url) => new URL(url).searchParams.get('category'))).toEqual([
      'tenis-corrida',
      'tenis',
      'calcados',
    ]);
    for (const url of requests)
      expect(Number(new URL(url).searchParams.get('pageSize'))).toBeLessThanOrEqual(24);
  });
});
