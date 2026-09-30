// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CatalogCategoryNode,
  CatalogFacets,
  CatalogItem,
  CatalogPage,
} from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
const { push, flags } = vi.hoisted(() => ({ push: vi.fn(), flags: {} as Record<string, boolean> }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next/image', () => ({
  default: ({ priority: _p, sizes: _s, fill: _f, ...props }: Record<string, unknown>) =>
    createElement('img', props),
}));
vi.mock('../src/config/storefront-config', () => ({
  getConfig: () => ({ api: { internalBaseUrl: 'http://api', publicBasePath: '/api/v1' } }),
}));
vi.mock('../src/config/feature-gate', () => ({
  isFeatureEnabled: (feature: string) => flags[feature] ?? false,
}));

import { BrowseResults } from '../src/features/browse/browse-view';
import { parseBrowseParams, type SearchParams } from '../src/features/browse/browse-params';
import { generateMetadata } from '../src/app/products/page';

const CATEGORIES: CatalogCategoryNode[] = [
  { slug: 'games-e-consoles', name: 'Games e Consoles', parentSlug: null },
  { slug: 'games-pc', name: 'PC', parentSlug: 'games-e-consoles' },
  { slug: 'dispositivos-amazon', name: 'Dispositivos Amazon', parentSlug: null },
  { slug: 'livros', name: 'Livros', parentSlug: null },
];
const item = (slug: string, sku: string, name: string, extra: Partial<CatalogItem> = {}) => ({
  id: `uuid-${slug}`,
  slug,
  sku,
  name,
  description: null,
  priceMinor: 20520,
  currency: 'BRL',
  active: true,
  availableQuantity: 10,
  inStock: true,
  ...extra,
});
// Real fixture records (config/demo-products.json): p6/p21 are 8BitDo, p1 is Amazon.
const P6 = item('p6', 'DEMO-P6', '8BitDo Ultimate 2C (Mint)');
const P21 = item('p21', 'DEMO-P21', '8BitDo Ultimate 2C (Peach)', {
  availableQuantity: 2,
});
const P1 = item('p1', 'DEMO-P1', 'Echo Dot', { inStock: false, availableQuantity: 0 });

let page: CatalogPage;
let facets: CatalogFacets;
let failing = false;
const requests: string[] = [];

const facetsOf = (slugs: string[], extra: Partial<CatalogFacets> = {}): CatalogFacets => ({
  total: slugs.length,
  inStock: slugs.length - 1,
  priceBuckets: [
    { minMinor: 0, maxMinor: 5000, count: 0 },
    { minMinor: 20000, maxMinor: 50000, count: slugs.length },
  ],
  categories: [
    { slug: 'games-e-consoles', count: 2 },
    { slug: 'games-pc', count: 2 },
    { slug: 'dispositivos-amazon', count: 1 },
  ],
  slugs,
  slugsTruncated: false,
  ...extra,
});

beforeEach(() => {
  Object.assign(flags, { catalog: true });
  page = { items: [P6, P21, P1], total: 3 };
  facets = facetsOf(['p1', 'p21', 'p6']);
  failing = false;
  requests.length = 0;
  push.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const json = (body: unknown, status = 200) =>
        ({ ok: status < 400, status, json: async () => body }) as Response;
      const path = url.replace('http://api/api/v1', '');
      requests.push(path);
      if (failing) return json({ error: {} }, 503);
      if (path === '/catalog/categories') return json(CATEGORIES);
      if (path.startsWith('/catalog/facets')) return json(facets);
      if (path.startsWith('/catalog/products')) return json(page);
      return json({ error: {} }, 404);
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const show = async (searchParams: SearchParams) =>
  render(await BrowseResults({ params: parseBrowseParams(searchParams) }));

describe('product listing', () => {
  it('shows search results with the Amazon summary, cards and real facets', async () => {
    await show({ q: 'ultimate' });
    expect(screen.getByRole('status').textContent).toBe('3 resultados para “ultimate”');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Resultados para “ultimate”',
    );
    const cards = screen.getAllByRole('listitem').filter((li) => li.querySelector('.az-card'));
    expect(cards.map((li) => li.querySelector('a')?.getAttribute('href'))).toEqual([
      '/products/uuid-p6',
      '/products/uuid-p21',
      '/products/uuid-p1',
    ]);
    expect(screen.getByText('Apenas 2 em estoque')).toBeTruthy();
    expect(screen.getByText('Indisponível no momento')).toBeTruthy();
    // The API receives the search, the page size and the sort.
    expect(requests).toContain('/catalog/products?q=ultimate&page=1&pageSize=48&sort=relevance');
    expect(requests).toContain('/catalog/facets?q=ultimate');

    const filters = screen.getByRole('navigation', { name: 'Filtros de resultados' });
    // Departments with results only (Livros has none).
    expect(
      within(filters).getByRole('link', { name: 'Games e Consoles (2)' }).getAttribute('href'),
    ).toBe('/products?q=ultimate&category=games-e-consoles');
    expect(within(filters).queryByText(/Livros/)).toBeNull();
    // Brands derived from the matched products' presentation data.
    expect(
      within(filters)
        .getByRole('link', { name: /8BitDo \(2\)/ })
        .getAttribute('href'),
    ).toBe('/products?q=ultimate&brand=8bitdo');
    expect(within(filters).getByRole('link', { name: /^Amazon \(1\)$/ })).toBeTruthy();
    // Empty price buckets are not offered.
    expect(within(filters).queryByText(/Até R\$/)).toBeNull();
    expect(within(filters).getByRole('link', { name: /R\$\s200 a R\$\s500 \(3\)/ })).toBeTruthy();
    expect(
      within(filters)
        .getByRole('link', { name: /Em estoque \(2\)/ })
        .getAttribute('href'),
    ).toBe('/products?q=ultimate&inStock=1');
  });

  it('navigates when a sort option is picked, keeping the filters', async () => {
    await show({ q: 'ultimate', category: 'games-e-consoles' });
    fireEvent.change(screen.getByLabelText('Classificar por:'), {
      target: { value: 'price-asc' },
    });
    expect(push).toHaveBeenCalledWith(
      '/products?q=ultimate&category=games-e-consoles&sort=price-asc',
    );
  });

  it('shows a category page with its trail and sub-categories', async () => {
    await show({ category: 'games-e-consoles' });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Games e Consoles');
    const filters = screen.getByRole('navigation', { name: 'Filtros de resultados' });
    expect(
      within(filters)
        .getByRole('link', { name: /Qualquer departamento/ })
        .getAttribute('href'),
    ).toBe('/products');
    expect(within(filters).getByText('Games e Consoles').getAttribute('aria-current')).toBe('true');
    expect(within(filters).getByRole('link', { name: 'PC (2)' })).toBeTruthy();
  });

  it('lists a brand through its catalog slugs and keeps the other brands selectable', async () => {
    await show({ brand: '8bitdo' });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('8BitDo');
    const list = requests.find((path) => path.startsWith('/catalog/products'));
    expect(decodeURIComponent(list ?? '')).toMatch(/slugs=p6,p21,p22,p23/);
    // Scoped facets (with the brand) plus the brand list without it.
    expect(requests.filter((path) => path.startsWith('/catalog/facets'))).toHaveLength(2);
    const filters = screen.getByRole('navigation', { name: 'Filtros de resultados' });
    expect(
      within(filters)
        .getByRole('link', { name: /8BitDo/ })
        .getAttribute('aria-current'),
    ).toBe('true');
  });

  it('pages through large results', async () => {
    page = { items: [P6], total: 150 };
    facets = facetsOf(['p6'], { total: 150 });
    await show({ page: '2' });
    expect(screen.getByRole('status').textContent).toBe('49-96 de 150 resultados');
    const pages = screen.getByRole('navigation', { name: 'Paginação' });
    expect(within(pages).getByText('2').getAttribute('aria-current')).toBe('page');
    expect(
      within(pages)
        .getByRole('link', { name: /Anterior/ })
        .getAttribute('href'),
    ).toBe('/products');
    expect(
      within(pages)
        .getByRole('link', { name: /Próximo/ })
        .getAttribute('href'),
    ).toBe('/products?page=3');
    expect(within(pages).getByRole('link', { name: 'Página 4' })).toBeTruthy();
  });

  it('explains empty results without inventing products', async () => {
    page = { items: [], total: 0 };
    facets = facetsOf([], { total: 0, inStock: 0, categories: [] });
    await show({ q: 'xyzzy' });
    expect(screen.getByText('Nenhum resultado para “xyzzy”.')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Filtros de resultados' })).toBeNull();
    expect(document.querySelectorAll('.az-card')).toHaveLength(0);
  });

  it('offers to drop refinements that emptied the result', async () => {
    page = { items: [], total: 0 };
    await show({ q: 'ultimate', price: '0-5000' });
    expect(
      screen.getByText('Nenhum resultado para “ultimate” com os filtros selecionados.'),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Remover filtros de preço e disponibilidade' })
        .getAttribute('href'),
    ).toBe('/products?q=ultimate');
  });

  it('handles invalid and out-of-range pages', async () => {
    await show({ page: 'abc' });
    expect(screen.getByRole('heading', { name: 'Página inválida' })).toBeTruthy();
    expect(requests).toEqual([]);
    cleanup();
    await show({ page: '9' });
    expect(screen.getByText('A página 9 não existe.')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ir para a primeira página' }).getAttribute('href'),
    ).toBe('/products');
  });

  it('reports unknown categories and brands', async () => {
    await show({ category: 'nope' });
    expect(screen.getByRole('heading', { name: 'Categoria não encontrada' })).toBeTruthy();
    cleanup();
    await show({ brand: 'nope' });
    expect(screen.getByRole('heading', { name: 'Marca não encontrada' })).toBeTruthy();
  });

  it('shows an error state with a retry link when the catalog is down', async () => {
    failing = true;
    await show({ q: 'fone', page: '2' });
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar os produtos',
    );
    expect(screen.getByRole('link', { name: 'Tentar novamente' }).getAttribute('href')).toBe(
      '/products?q=fone&page=2',
    );
  });

  it('titles the page and keeps filtered combinations out of the index', async () => {
    expect((await generateMetadata({ searchParams: { category: 'livros' } })).title).toBe(
      'Livros | Amazon.com.br',
    );
    const search = await generateMetadata({ searchParams: { q: 'fone' } });
    expect(search.title).toBe('Resultados para “fone” | Amazon.com.br');
    expect(search.robots).toEqual({ index: false });
  });
});
