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
import { normalizeProductDetails } from './product-presentation';

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

/** Same-category products, widening one breadcrumb level at a time until the rail
 * is full. Excludes the product itself and its variants (shown as swatches). */
export async function relatedProducts(
  product: CatalogProductDetails,
  exclude: Set<string>,
  limit = 12,
): Promise<CatalogItem[]> {
  const levels = product.categoryPath.length
    ? [...product.categoryPath].reverse().map((category) => category.slug)
    : product.categories.map((category) => category.slug);
  const found = new Map<string, CatalogItem>();
  for (const slug of levels) {
    for (const item of await listCategory(slug)) {
      if (!exclude.has(item.id) && !found.has(item.id)) found.set(item.id, item);
    }
    if (found.size >= limit) break;
  }
  return [...found.values()].slice(0, limit);
}
