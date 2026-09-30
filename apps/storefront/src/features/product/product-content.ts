import 'server-only';
import { CatalogItem } from '@amazon-mvp/api-contract';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import contentFixtures from '../../../../../config/demo-product-content.json';
import brandFixtures from '../../../../../config/demo-brands.json';
import { productPresentation } from './product-presentation';
import { brandKey } from '@/features/browse/browse-params';

/** Merchandising content the catalog schema does not store (brand, gallery, specs,
 * variants...). Ratings are not content: they come from the reviews API. Server-only: it never ships in client bundles. Like the card
 * presentation, an entry applies only when slug AND SKU match, and it never
 * overrides the catalog's identity, price, stock, description or categories. */

export interface Labelled {
  label: string;
  value: string;
}
export interface VariantOption {
  name: string;
  value: string;
}
export interface ProductContent {
  images: ProductPhoto[];
  oldPriceMinor?: number;
  brand?: string;
  attributes: Labelled[];
  bullets: string[];
  details: Labelled[];
  bestSellerRanks: Array<{ rank: number; category: string }>;
  badges: { amazonChoice: boolean; boughtLastMonth?: string };
  installments?: { count: number };
  variant?: { group: string; options: VariantOption[] };
  fulfillment?: { shippedBy?: string; soldBy?: string; returns?: string };
  demo: boolean;
}

export interface BrandStory {
  name: string;
  logo?: ProductPhoto;
  banner?: ProductPhoto;
  story: string[];
}

interface ContentFixture {
  id: string;
  sku: string;
  brand?: string;
  gallery?: ProductPhoto[];
  attributes?: Labelled[];
  bullets?: string[];
  details?: Labelled[];
  bestSellerRanks?: Array<{ rank: number; category: string }>;
  badges?: { amazonChoice?: boolean; boughtLastMonth?: string };
  installments?: { count: number };
  variant?: { group: string; options: VariantOption[] };
  fulfillment?: { shippedBy?: string; soldBy?: string; returns?: string };
}

const fixtures = contentFixtures as ContentFixture[];

const fixtureFor = (product: Pick<CatalogItem, 'slug' | 'sku'>) =>
  fixtures.find((item) => item.id === product.slug && item.sku === product.sku);

export function productContent(product: CatalogItem): ProductContent {
  const presentation = productPresentation(product);
  const fixture = fixtureFor(product);
  return {
    images: fixture?.gallery?.length ? fixture.gallery : presentation.images,
    oldPriceMinor: presentation.oldPriceMinor,
    brand: fixture?.brand,
    attributes: fixture?.attributes ?? [],
    bullets: fixture?.bullets ?? [],
    details: fixture?.details ?? [],
    bestSellerRanks: fixture?.bestSellerRanks ?? [],
    badges: {
      amazonChoice: fixture?.badges?.amazonChoice ?? false,
      boughtLastMonth: fixture?.badges?.boughtLastMonth,
    },
    installments: fixture?.installments,
    variant: fixture?.variant,
    fulfillment: fixture?.fulfillment,
    demo: presentation.demo || Boolean(fixture),
  };
}

/** Catalog slugs of every product in a variant group (the current one included). */
export const variantGroupSlugs = (group: string): string[] =>
  fixtures.filter((item) => item.variant?.group === group).map((item) => item.id);

/** Catalog slugs of the brand's products, for the "Da marca" section. */
export const brandSlugs = (brand: string): string[] =>
  fixtures.filter((item) => item.brand === brand).map((item) => item.id);

/** Brand name for a listing URL key ("letra-viva"), or undefined when no product has it. */
export const brandByKey = (key: string): string | undefined =>
  fixtures.find((item) => item.brand && brandKey(item.brand) === key)?.brand;

/** Brand of a catalog slug (the same slug-based lookup as brandSlugs). */
export const brandOfSlug = (slug: string): string | undefined =>
  fixtures.find((item) => item.id === slug)?.brand;

export const brandStory = (brand: string | undefined): BrandStory | undefined =>
  brand ? (brandFixtures as BrandStory[]).find((item) => item.name === brand) : undefined;
