import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import {
  CatalogItem,
  CatalogPage,
  CatalogProductDetails,
  SavedAddress,
} from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';
import { productContent, variantGroupSlugs } from './product-content';
import { normalizeProductDetails } from './product-presentation';
import {
  distinctCards,
  rankRelated,
  type RelatedCandidate,
  type RelatedFacts,
} from './related-products';

const apiBase = () => {
  const config = getConfig();
  return `${config.api.internalBaseUrl}${config.api.publicBasePath}`;
};

/** One catalog read per identifier per request (metadata, page, variants and brand
 * sections all share it). null = no such product; throws when the API is down. */
export const getCatalogProduct = cache(
  async (identifier: string): Promise<CatalogProductDetails | null> => {
    const response = await fetch(
      `${apiBase()}/catalog/products/${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Product catalog unavailable');
    return normalizeProductDetails((await response.json()) as CatalogProductDetails);
  },
);

/** Secondary sections degrade to "absent" instead of failing the whole page. */
export async function findCatalogProduct(slug: string): Promise<CatalogProductDetails | null> {
  try {
    return await getCatalogProduct(slug);
  } catch {
    return null;
  }
}

/** Active products of a category subtree. */
export async function listCategory(slug: string, pageSize = 24): Promise<CatalogItem[]> {
  try {
    const response = await fetch(
      `${apiBase()}/catalog/products?pageSize=${pageSize}&category=${encodeURIComponent(slug)}`,
      { cache: 'no-store' },
    );
    return response.ok ? ((await response.json()) as CatalogPage).items : [];
  } catch {
    return [];
  }
}

/** First saved address of the signed-in user (checkout lists them in the same order). */
export async function getDeliveryAddress(): Promise<SavedAddress | null> {
  try {
    const response = await fetch(`${apiBase()}/addresses`, {
      headers: { cookie: cookies().toString() },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return ((await response.json()) as SavedAddress[])[0] ?? null;
  } catch {
    return null;
  }
}

/** Active products with these slugs, in one request per 48 slugs (the API page limit).
 * Order is the API's; callers pick records by slug. */
export async function listBySlugs(slugs: string[]): Promise<CatalogItem[]> {
  const chunks: string[][] = [];
  for (let start = 0; start < slugs.length; start += 48)
    chunks.push(slugs.slice(start, start + 48));
  const pages = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const response = await fetch(
          `${apiBase()}/catalog/products?pageSize=48&slugs=${chunk.map(encodeURIComponent).join(',')}`,
          { cache: 'no-store' },
        );
        return response.ok ? ((await response.json()) as CatalogPage).items : [];
      } catch {
        return [];
      }
    }),
  );
  return pages.flat();
}

const relatedFacts = (item: CatalogItem): RelatedFacts => {
  const content = productContent(item);
  const family = content.variant?.group;
  return {
    brand: content.brand,
    family,
    familyHead: family !== undefined && variantGroupSlugs(family)[0] === item.slug,
    attributes: content.attributes,
  };
};

/** Recommendations for the product page. Candidates come from the product's own
 * category first, widening one breadcrumb level at a time only until the rail can
 * be filled (each level is one bounded, database-filtered request); they are then
 * ranked by category distance, brand, shared attributes and price (rankRelated).
 * Excludes the product itself and its variants (shown as swatches). */
export async function relatedProducts(
  product: CatalogProductDetails,
  exclude: Set<string>,
  limit = 12,
): Promise<CatalogItem[]> {
  // Distance 0 = every category the product is listed in (a gamer keyboard is both a
  // keyboard and a gamer peripheral); then the breadcrumb's ancestors, nearest first.
  const ancestors = [...product.categoryPath].reverse().slice(1);
  const levels: Array<[slug: string, distance: number]> = [
    ...product.categories.map((category): [string, number] => [category.slug, 0]),
    ...ancestors.map((category, index): [string, number] => [category.slug, index + 1]),
  ].filter(([slug], index, all) => all.findIndex(([other]) => other === slug) === index);
  const candidates = new Map<string, RelatedCandidate>();
  for (const [position, [slug, distance]] of levels.entries()) {
    for (const item of await listCategory(slug)) {
      const known = candidates.get(item.id);
      if (known && distance === 0 && known.distance === 0)
        known.sharedCategories = (known.sharedCategories ?? 1) + 1;
      if (known || exclude.has(item.id)) continue;
      candidates.set(item.id, { item, distance, sharedCategories: 1, facts: relatedFacts(item) });
    }
    // Finish the current distance before deciding whether to widen.
    const nextDistance = levels[position + 1]?.[1];
    if (nextDistance !== distance && distinctCards([...candidates.values()]) >= limit) break;
  }
  return rankRelated(
    { item: product, facts: relatedFacts(product) },
    [...candidates.values()],
    limit,
  );
}
