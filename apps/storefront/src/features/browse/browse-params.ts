import {
  CATALOG_SEARCH_MAX_LENGTH,
  CATALOG_SORTS,
  type CatalogSort,
} from '@amazon-mvp/api-contract';

/**
 * The listing URL is the single source of truth for a result page:
 *
 *   /products?q=fone&category=eletronicos&brand=vortex&price=5000-10000&inStock=1&sort=price-asc&page=2
 *
 * Category and brand pages are the same listing with one filter set
 * (`/products?category=<slug>`, `/products?brand=<key>`), so every filter combines with
 * search, sorting and paging. Prices are integer minor units, like the API.
 */

export interface PriceRange {
  /** Inclusive, minor units. */
  min: number;
  /** Exclusive, minor units; null = no upper bound. */
  max: number | null;
}

export interface BrowseParams {
  q: string;
  category: string;
  /** brandKey() of the brand name. */
  brand: string;
  price: PriceRange | null;
  inStock: boolean;
  sort: CatalogSort;
  page: number;
  /** false when `page` was present but not a usable page number. */
  pageValid: boolean;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export const MAX_PAGE = 10000;

export const SORT_LABELS: Record<CatalogSort, string> = {
  relevance: 'Relevância',
  'price-asc': 'Preço: do menor para o maior',
  'price-desc': 'Preço: do maior para o menor',
  newest: 'Lançamentos',
};

const first = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? '';

/** URL key of a brand name: "Letra Viva" → "letra-viva", "Genérico" → "generico". */
export const brandKey = (brand: string): string =>
  brand
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function parsePrice(value: string): PriceRange | null {
  const match = /^(\d{1,9})-(\d{1,9})?$/.exec(value);
  if (!match) return null;
  const min = Number(match[1]);
  const max = match[2] === undefined ? null : Number(match[2]);
  return max !== null && max <= min ? null : { min, max };
}

export const priceParam = (range: PriceRange): string => `${range.min}-${range.max ?? ''}`;

export function parseBrowseParams(searchParams: SearchParams): BrowseParams {
  const rawPage = first(searchParams.page).trim();
  const page = rawPage === '' ? 1 : Number(rawPage);
  const pageValid = /^\d+$/.test(rawPage || '1') && page >= 1 && page <= MAX_PAGE;
  const sort = first(searchParams.sort);
  return {
    q: first(searchParams.q).trim().replace(/\s+/g, ' ').slice(0, CATALOG_SEARCH_MAX_LENGTH),
    category: first(searchParams.category).trim().slice(0, 100),
    brand: brandKey(first(searchParams.brand)).slice(0, 100),
    price: parsePrice(first(searchParams.price).trim()),
    inStock: ['1', 'true'].includes(first(searchParams.inStock)),
    sort: (CATALOG_SORTS as readonly string[]).includes(sort) ? (sort as CatalogSort) : 'relevance',
    page: pageValid ? page : 1,
    pageValid,
  };
}

/** URL of the listing with some parameters changed. Any change other than `page` goes
 * back to the first page, as a new filter produces a new result. */
export function browseHref(params: BrowseParams, change: Partial<BrowseParams> = {}): string {
  const next = { ...params, page: 1, ...change };
  const query = new URLSearchParams();
  if (next.q) query.set('q', next.q);
  if (next.category) query.set('category', next.category);
  if (next.brand) query.set('brand', next.brand);
  if (next.price) query.set('price', priceParam(next.price));
  if (next.inStock) query.set('inStock', '1');
  if (next.sort !== 'relevance') query.set('sort', next.sort);
  if (next.page > 1) query.set('page', String(next.page));
  const search = query.toString();
  return search ? `/products?${search}` : '/products';
}

export const EMPTY_BROWSE: BrowseParams = {
  q: '',
  category: '',
  brand: '',
  price: null,
  inStock: false,
  sort: 'relevance',
  page: 1,
  pageValid: true,
};

/** Category listing (breadcrumbs, department links). */
export const categoryHref = (slug: string): string => browseHref(EMPTY_BROWSE, { category: slug });

/** Brand listing ("Marca: X", "Da marca"). */
export const brandHref = (brand: string): string =>
  browseHref(EMPTY_BROWSE, { brand: brandKey(brand) });

/** A key that changes whenever the result changes (Suspense key, cache key). */
export const browseKey = (params: BrowseParams): string =>
  `${browseHref(params, { page: params.page })}#${params.pageValid ? 'ok' : 'invalid'}`;

const brl = (minor: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: minor % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(minor / 100);

/** "Até R$ 50", "R$ 50 a R$ 100", "R$ 2.000 ou mais". */
export function priceLabel(range: PriceRange): string {
  if (range.max === null) return `${brl(range.min)} ou mais`;
  if (range.min === 0) return `Até ${brl(range.max)}`;
  return `${brl(range.min)} a ${brl(range.max)}`;
}
