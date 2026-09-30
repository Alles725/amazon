import demoProducts from '../../../../../config/demo-products.json';
import { GlyphKind } from '@/components/amazon/product-glyph';

/** Shared demo fixtures also seed database products. IDs are stable catalog slugs;
 * product details and cart always use the persisted catalog record and UUID.
 * Prices below are converted only for the existing homepage display helpers.
 */
export interface ProductPhoto {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  image?: ProductPhoto;
  glyph: GlyphKind;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  /** Catalog category slug the tile opens (/products?category=...); none = all products. */
  category?: string;
  image?: ProductPhoto;
  glyph: GlyphKind;
}

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const discountPercent = (product: Product): number | undefined =>
  product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : undefined;

// One card per variant family, like Amazon: sibling colors/sizes (variantOf) are
// reached through the swatches on the product page, not as separate home cards.
export const PRODUCTS: Product[] = demoProducts
  .filter((product) => !('variantOf' in product))
  .map(({ priceMinor, oldPriceMinor, ...product }) => ({
    id: product.id,
    name: product.name,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: product.image,
    glyph: product.glyph as GlyphKind,
    price: priceMinor / 100,
    ...(oldPriceMinor ? { oldPrice: oldPriceMinor / 100 } : {}),
  }));

/** Rails are a window on the catalog, not a dump of it: at most RAIL_SIZE cards,
 * one product type (glyph) each before any type repeats, so a rail never turns into
 * a wall of near-identical items. */
const RAIL_SIZE = 10;
function varied(candidates: Product[], exclude: Product[] = []): Product[] {
  const pool = candidates.filter((product) => !exclude.includes(product));
  const first = pool.filter(
    (product, index) => pool.findIndex((other) => other.glyph === product.glyph) === index,
  );
  return [...first, ...pool.filter((product) => !first.includes(product))].slice(0, RAIL_SIZE);
}

export const DEALS_OF_THE_DAY = varied(
  PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => discountPercent(b)! - discountPercent(a)!),
);
export const BEST_SELLERS = varied([...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount));
export const RECOMMENDED = varied(
  PRODUCTS.filter((p) => p.rating >= 4.6).sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  ),
  BEST_SELLERS,
);
// Newest additions to the catalog first.
export const ALSO_CONSIDER = varied([...PRODUCTS].reverse(), [...BEST_SELLERS, ...RECOMMENDED]);

export const CATEGORIES: Category[] = [
  {
    id: 'c1',
    category: 'eletronicos',
    image: PRODUCTS[1].image,
    name: 'Eletrônicos',
    glyph: 'headphones',
  },
  {
    id: 'c2',
    category: 'computadores',
    image: PRODUCTS[8].image,
    name: 'Computadores',
    glyph: 'laptop',
  },
  {
    id: 'c3',
    category: 'cozinha',
    image: PRODUCTS[3].image,
    name: 'Casa e Cozinha',
    glyph: 'airfryer',
  },
  { id: 'c4', category: 'livros', image: PRODUCTS[12].image, name: 'Livros', glyph: 'book' },
  { id: 'c5', category: 'beleza', image: PRODUCTS[7].image, name: 'Beleza', glyph: 'beauty' },
  { id: 'c6', category: 'moda', image: PRODUCTS[4].image, name: 'Moda', glyph: 'sneaker' },
  {
    id: 'c7',
    category: 'games-e-consoles',
    image: PRODUCTS[5].image,
    name: 'Games',
    glyph: 'controller',
  },
  { id: 'c8', image: PRODUCTS[9].image, name: 'Ofertas', glyph: 'watch' },
  {
    id: 'c9',
    category: 'esportes',
    image: PRODUCTS.find((product) => product.glyph === 'fitness')?.image,
    name: 'Esportes',
    glyph: 'fitness',
  },
];

export interface ProductCollection {
  id: string;
  title: string;
  products: Product[];
}

/** Curated views of the same records; no copied prices or invented customer history. */
export const HOME_COLLECTIONS: ProductCollection[] = [
  {
    id: 'home',
    title: 'Mais para sua casa',
    products: PRODUCTS.filter((product) =>
      ['airfryer', 'plant', 'lamp', 'blender'].includes(product.glyph),
    ).slice(0, 4),
  },
  {
    id: 'under-150',
    title: 'Bem avaliados até R$ 150',
    products: PRODUCTS.filter((product) => product.price <= 150 && product.rating >= 4.5).slice(
      0,
      4,
    ),
  },
  {
    id: 'technology',
    title: 'Tecnologia no seu dia a dia',
    products: PRODUCTS.filter((product) =>
      ['echo', 'headphones', 'ereader', 'laptop'].includes(product.glyph),
    ).slice(0, 4),
  },
  {
    id: 'everyday',
    title: 'Escolhas para sua rotina',
    products: PRODUCTS.filter((product) =>
      ['sneaker', 'beauty', 'watch', 'backpack'].includes(product.glyph),
    ).slice(0, 4),
  },
];
