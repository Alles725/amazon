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
  image?: ProductPhoto;
  glyph: GlyphKind;
}

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const discountPercent = (product: Product): number | undefined =>
  product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : undefined;

export const PRODUCTS: Product[] = demoProducts.map(
  ({ priceMinor, oldPriceMinor, ...product }) => ({
    ...product,
    glyph: product.glyph as GlyphKind,
    price: priceMinor / 100,
    ...(oldPriceMinor ? { oldPrice: oldPriceMinor / 100 } : {}),
  }),
);

export const DEALS_OF_THE_DAY = PRODUCTS.filter((p) => p.oldPrice).slice(0, 8);
export const BEST_SELLERS = [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);
export const RECOMMENDED = PRODUCTS.slice(8, 16);
export const ALSO_CONSIDER = [...PRODUCTS].reverse().slice(0, 8);

export const CATEGORIES: Category[] = [
  { id: 'c1', image: PRODUCTS[1].image, name: 'Eletrônicos', glyph: 'headphones' },
  { id: 'c2', image: PRODUCTS[8].image, name: 'Computadores', glyph: 'laptop' },
  { id: 'c3', image: PRODUCTS[3].image, name: 'Casa e Cozinha', glyph: 'airfryer' },
  { id: 'c4', image: PRODUCTS[12].image, name: 'Livros', glyph: 'book' },
  { id: 'c5', image: PRODUCTS[7].image, name: 'Beleza', glyph: 'beauty' },
  { id: 'c6', image: PRODUCTS[4].image, name: 'Moda', glyph: 'sneaker' },
  { id: 'c7', image: PRODUCTS[5].image, name: 'Games', glyph: 'controller' },
  { id: 'c8', image: PRODUCTS[9].image, name: 'Ofertas', glyph: 'watch' },
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
