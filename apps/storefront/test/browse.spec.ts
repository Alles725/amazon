import { describe, expect, it } from 'vitest';
import type { CatalogCategoryNode } from '@amazon-mvp/api-contract';
import {
  brandHref,
  brandKey,
  browseHref,
  categoryHref,
  EMPTY_BROWSE,
  parseBrowseParams,
  parsePrice,
  priceLabel,
} from '../src/features/browse/browse-params';
import {
  brandFacet,
  buildCategoryTree,
  categoryTrail,
  departmentFacet,
  listingTitle,
  pageWindow,
  resultsSummary,
} from '../src/features/browse/browse-model';

describe('listing URL parameters', () => {
  it('reads search, filters, sort and page from the URL', () => {
    expect(
      parseBrowseParams({
        q: '  fone   bluetooth ',
        category: 'eletronicos',
        brand: 'Letra Viva',
        price: '5000-10000',
        inStock: '1',
        sort: 'price-desc',
        page: '3',
      }),
    ).toEqual({
      q: 'fone bluetooth',
      category: 'eletronicos',
      brand: 'letra-viva',
      price: { min: 5000, max: 10000 },
      inStock: true,
      sort: 'price-desc',
      page: 3,
      pageValid: true,
    });
  });

  it('falls back to defaults for unknown values and flags malformed pages', () => {
    const params = parseBrowseParams({ sort: 'rating', price: 'cheap', inStock: 'yes' });
    expect(params).toEqual(EMPTY_BROWSE);
    // The header's "Todos" submits an empty category.
    expect(parseBrowseParams({ category: '', q: 'x' }).category).toBe('');
    for (const page of ['0', '-1', 'abc', '1.5', '10001'])
      expect(parseBrowseParams({ page }).pageValid).toBe(false);
    expect(parseBrowseParams({ page: '2' }).pageValid).toBe(true);
    expect(parseBrowseParams({ q: 'a'.repeat(300) }).q).toHaveLength(100);
    expect(parseBrowseParams({ q: ['first', 'second'] }).q).toBe('first');
  });

  it('parses price ranges in minor units, open-ended or bounded', () => {
    expect(parsePrice('200000-')).toEqual({ min: 200000, max: null });
    expect(parsePrice('0-5000')).toEqual({ min: 0, max: 5000 });
    expect(parsePrice('5000-5000')).toBeNull();
    expect(parsePrice('9000-5000')).toBeNull();
    expect(parsePrice('-5000')).toBeNull();
  });

  it('builds canonical URLs and resets the page when a filter changes', () => {
    const params = parseBrowseParams({ q: 'fone', category: 'audio', page: '2' });
    expect(browseHref(params, { page: 2 })).toBe('/products?q=fone&category=audio&page=2');
    expect(browseHref(params, { sort: 'price-asc' })).toBe(
      '/products?q=fone&category=audio&sort=price-asc',
    );
    expect(browseHref(params, { price: { min: 0, max: 5000 }, inStock: true })).toBe(
      '/products?q=fone&category=audio&price=0-5000&inStock=1',
    );
    expect(browseHref(EMPTY_BROWSE)).toBe('/products');
    expect(categoryHref('games-e-consoles')).toBe('/products?category=games-e-consoles');
    expect(brandHref('Genérico')).toBe('/products?brand=generico');
    expect(brandKey('Calvin Klein')).toBe('calvin-klein');
    expect(brandKey('8BitDo')).toBe('8bitdo');
  });

  it('labels price buckets in reais', () => {
    expect(priceLabel({ min: 0, max: 5000 })).toMatch(/^Até R\$\s50$/);
    expect(priceLabel({ min: 5000, max: 10000 })).toMatch(/^R\$\s50 a R\$\s100$/);
    expect(priceLabel({ min: 200000, max: null })).toMatch(/^R\$\s2\.000 ou mais$/);
    expect(priceLabel({ min: 4990, max: null })).toMatch(/^R\$\s49,90 ou mais$/);
  });
});

const NODES: CatalogCategoryNode[] = [
  { slug: 'eletronicos', name: 'Eletrônicos', parentSlug: null },
  { slug: 'audio', name: 'Áudio', parentSlug: 'eletronicos' },
  { slug: 'fones', name: 'Fones de Ouvido', parentSlug: 'audio' },
  { slug: 'wearables', name: 'Wearables', parentSlug: 'eletronicos' },
  { slug: 'livros', name: 'Livros', parentSlug: null },
  { slug: 'orphan', name: 'Órfã', parentSlug: 'missing' },
];

describe('listing view model', () => {
  const tree = buildCategoryTree(NODES);

  it('rebuilds the taxonomy, treating a missing parent as a root', () => {
    expect(tree.children.get(null)?.map((node) => node.slug)).toEqual([
      'eletronicos',
      'livros',
      'orphan',
    ]);
    expect(categoryTrail(tree, 'fones').map((node) => node.slug)).toEqual([
      'eletronicos',
      'audio',
      'fones',
    ]);
    expect(categoryTrail(tree, 'absent')).toEqual([]);
  });

  it('lists only departments with results, below the selected category', () => {
    const counts = [
      { slug: 'eletronicos', count: 5 },
      { slug: 'audio', count: 5 },
      { slug: 'fones', count: 4 },
    ];
    const roots = departmentFacet(tree, counts, '');
    expect(roots.selected).toBeNull();
    expect(roots.options.map(({ node, count }) => [node.slug, count])).toEqual([
      ['eletronicos', 5],
    ]);
    const audio = departmentFacet(tree, counts, 'audio');
    expect(audio.trail.map((node) => node.slug)).toEqual(['eletronicos']);
    expect(audio.selected?.slug).toBe('audio');
    expect(audio.options.map(({ node }) => node.slug)).toEqual(['fones']);
  });

  it('counts brands of the matched products, most frequent first, skipping unbranded', () => {
    const brands: Record<string, string> = { a: 'Vortex', b: 'Amazon', c: 'Vortex', d: 'Apple' };
    expect(brandFacet(['a', 'b', 'c', 'd', 'x'], (slug) => brands[slug])).toEqual([
      { name: 'Vortex', key: 'vortex', count: 2 },
      { name: 'Amazon', key: 'amazon', count: 1 },
      { name: 'Apple', key: 'apple', count: 1 },
    ]);
  });

  it('summarizes the result range like Amazon', () => {
    expect(resultsSummary(1, 48, 150)).toBe('1-48 de 150 resultados');
    expect(resultsSummary(4, 48, 150)).toBe('145-150 de 150 resultados');
    expect(resultsSummary(1, 48, 12)).toBe('12 resultados');
    expect(resultsSummary(1, 48, 1)).toBe('1 resultado');
    expect(resultsSummary(1, 48, 1500)).toBe('1-48 de 1.500 resultados');
  });

  it('titles the listing by search, brand or category', () => {
    expect(listingTitle({ q: 'fone' })).toBe('Resultados para “fone”');
    expect(listingTitle({ q: 'fone', categoryName: 'Áudio' })).toBe(
      'Resultados para “fone” em Áudio',
    );
    expect(listingTitle({ q: '', brandName: 'Vortex' })).toBe('Vortex');
    expect(listingTitle({ q: '', categoryName: 'Livros' })).toBe('Livros');
    expect(listingTitle({ q: '' })).toBe('Todos os produtos');
  });

  it('windows page links around the current page', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4]);
    expect(pageWindow(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
    expect(pageWindow(3, 20)).toEqual([1, 2, 3, 4, 'gap', 20]);
  });
});
