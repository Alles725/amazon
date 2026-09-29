import 'server-only';
import { CatalogItem } from '@amazon-mvp/api-contract';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import contentFixtures from '../../../../../config/demo-product-content.json';
import brandFixtures from '../../../../../config/demo-brands.json';
import { productPresentation } from './product-presentation';

/** Merchandising content the catalog schema does not store (brand, gallery, specs,
 * variants...). Server-only: it never ships in client bundles. Like the card
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
  rating?: { average: number; count: number; distribution?: number[] };
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
  ratingDistribution?: number[];
}

const fixtures = contentFixtures as ContentFixture[];

const fixtureFor = (product: Pick<CatalogItem, 'slug' | 'sku'>) =>
  fixtures.find((item) => item.id === product.slug && item.sku === product.sku);

export function productContent(product: CatalogItem): ProductContent {
  const presentation = productPresentation(product);
  const fixture = fixtureFor(product);
  const distribution = fixture?.ratingDistribution;
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
    rating: presentation.rating && {
      ...presentation.rating,
      // A distribution must describe all five star levels to be shown.
      ...(distribution?.length === 5 ? { distribution } : {}),
    },
    demo: presentation.demo || Boolean(fixture),
  };
}

/** Catalog slugs of every product in a variant group (the current one included). */
export const variantGroupSlugs = (group: string): string[] =>
  fixtures.filter((item) => item.variant?.group === group).map((item) => item.id);

/** Catalog slugs of the brand's products, for the "Da marca" section. */
export const brandSlugs = (brand: string): string[] =>
  fixtures.filter((item) => item.brand === brand).map((item) => item.id);

export const brandStory = (brand: string | undefined): BrandStory | undefined =>
  brand ? (brandFixtures as BrandStory[]).find((item) => item.name === brand) : undefined;
