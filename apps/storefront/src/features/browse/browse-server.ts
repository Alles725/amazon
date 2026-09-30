import 'server-only';
import { cache } from 'react';
import {
  CATALOG_MAX_PAGE_SIZE,
  type CatalogCategoryNode,
  type CatalogFacets,
  type CatalogPage,
} from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';
import { brandByKey, brandOfSlug, brandSlugs } from '@/features/product/product-content';
import {
  brandFacet,
  buildCategoryTree,
  categoryTrail,
  type BrandOption,
  type CategoryTree,
} from './browse-model';
import type { BrowseParams } from './browse-params';

/** Listing pages show 48 cards, the API's page-size limit. */
export const BROWSE_PAGE_SIZE = CATALOG_MAX_PAGE_SIZE;

const apiUrl = (path: string, query?: URLSearchParams) => {
  const search = query?.toString();
  const { internalBaseUrl, publicBasePath } = getConfig().api;
  return `${internalBaseUrl}${publicBasePath}${path}${search ? `?${search}` : ''}`;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  return (await response.json()) as T;
}

// The header imports this module on every page; React's stable build (used by unit
// tests) has no `cache`, which only exists in the React that Next.js bundles.
const perRequest: typeof cache = typeof cache === 'function' ? cache : (fn) => fn;

/** The taxonomy, read once per request (header departments and the listing share it). */
export const fetchCategories = perRequest(
  (): Promise<CatalogCategoryNode[]> => getJson(apiUrl('/catalog/categories')),
);

/** Root categories for the header's department select, and the one containing the
 * current category. The header must never fail because the catalog is down, so an
 * error means "only Todos". */
export async function searchDepartments(
  category?: string,
): Promise<{ options: CatalogCategoryNode[]; selected: string }> {
  try {
    const tree = buildCategoryTree(await fetchCategories());
    return {
      options: tree.children.get(null) ?? [],
      selected: category ? (categoryTrail(tree, category)[0]?.slug ?? '') : '',
    };
  } catch {
    return { options: [], selected: '' };
  }
}

export type BrowseData =
  | { kind: 'unknown-category'; tree: CategoryTree }
  | { kind: 'unknown-brand'; tree: CategoryTree }
  | {
      kind: 'results';
      tree: CategoryTree;
      page: CatalogPage;
      /** Counts over q + category (+ the brand's products when a brand is chosen). */
      facets: CatalogFacets;
      /** Brands of q + category, so choosing one brand still lists the others. */
      brands: BrandOption[];
      brandName?: string;
    };

/** Everything a listing page needs, fetched in parallel. Throws when the catalog API is
 * unavailable (the page renders its error state). */
export async function loadBrowse(params: BrowseParams): Promise<BrowseData> {
  const tree = buildCategoryTree(await fetchCategories());
  if (params.category && !tree.bySlug.has(params.category))
    return { kind: 'unknown-category', tree };
  const brandName = params.brand ? brandByKey(params.brand) : undefined;
  if (params.brand && !brandName) return { kind: 'unknown-brand', tree };

  // Brand is presentation data: the brand's catalog slugs narrow the API query.
  const scope = new URLSearchParams();
  if (params.q) scope.set('q', params.q);
  if (params.category) scope.set('category', params.category);
  const scoped = new URLSearchParams(scope);
  if (brandName) scoped.set('slugs', brandSlugs(brandName).slice(0, BROWSE_PAGE_SIZE).join(','));

  const list = new URLSearchParams(scoped);
  list.set('page', String(params.page));
  list.set('pageSize', String(BROWSE_PAGE_SIZE));
  list.set('sort', params.sort);
  if (params.price) {
    list.set('minPriceMinor', String(params.price.min));
    if (params.price.max !== null) list.set('maxPriceMinor', String(params.price.max));
  }
  if (params.inStock) list.set('inStock', 'true');

  const [page, facets, brandScope] = await Promise.all([
    getJson<CatalogPage>(apiUrl('/catalog/products', list)),
    getJson<CatalogFacets>(apiUrl('/catalog/facets', scoped)),
    brandName ? getJson<CatalogFacets>(apiUrl('/catalog/facets', scope)) : Promise.resolve(null),
  ]);
  return {
    kind: 'results',
    tree,
    page,
    facets,
    brands: brandFacet((brandScope ?? facets).slugs, brandOfSlug),
    brandName,
  };
}
