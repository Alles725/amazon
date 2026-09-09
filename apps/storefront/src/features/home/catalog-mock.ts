import { GlyphKind } from '@/components/amazon/product-glyph';

/**
 * The `catalog` feature is switched off in the shipped feature config —
 * there is no product backend yet. This local, static list exists only to
 * give the home page's Amazon-style layout something to render; it is not
 * wired to any API and carries no persistence.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  glyph: GlyphKind;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  glyph: GlyphKind;
}

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const discountPercent = (product: Product): number | undefined =>
  product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : undefined;

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Echo Dot (5ª geração) com Alexa, Preto', price: 279, oldPrice: 349, rating: 4.7, reviewCount: 48213, glyph: 'echo' },
  { id: 'p2', name: 'Fone de Ouvido Bluetooth JBL Tune 510BT', price: 199.9, oldPrice: 279.9, rating: 4.6, reviewCount: 15342, glyph: 'headphones' },
  { id: 'p3', name: 'Kindle 11ª Geração, 16GB, à prova d\'água', price: 449, oldPrice: 599, rating: 4.8, reviewCount: 9871, glyph: 'ereader' },
  { id: 'p4', name: 'Air Fryer Elétrica 4L Digital 127V', price: 259, oldPrice: 399, rating: 4.5, reviewCount: 20044, glyph: 'airfryer' },
  { id: 'p5', name: 'Tênis Esportivo Confort Run', price: 159.9, oldPrice: 219.9, rating: 4.3, reviewCount: 3021, glyph: 'sneaker' },
  { id: 'p6', name: 'Controle Sem Fio para Console, Preto', price: 329, rating: 4.7, reviewCount: 8842, glyph: 'controller' },
  { id: 'p7', name: 'Vaso Autoirrigável com Suculenta Artificial', price: 39.9, rating: 4.4, reviewCount: 612, glyph: 'plant' },
  { id: 'p8', name: 'Kit Batom Matte Longa Duração, 3 unidades', price: 49.9, oldPrice: 79.9, rating: 4.5, reviewCount: 2210, glyph: 'beauty' },
  { id: 'p9', name: 'Notebook Ultrafino 15.6" 8GB 256GB SSD', price: 2399, oldPrice: 2899, rating: 4.4, reviewCount: 1523, glyph: 'laptop' },
  { id: 'p10', name: 'Smartwatch Esportivo com Monitor Cardíaco', price: 189.9, oldPrice: 259.9, rating: 4.2, reviewCount: 4210, glyph: 'watch' },
  { id: 'p11', name: 'Mochila para Notebook até 15.6", Resistente à Água', price: 129.9, rating: 4.6, reviewCount: 5471, glyph: 'backpack' },
  { id: 'p12', name: 'Câmera de Segurança Wi-Fi Full HD', price: 149.9, oldPrice: 219.9, rating: 4.3, reviewCount: 3389, glyph: 'camera' },
  { id: 'p13', name: 'O Hobbit - Edição de Colecionador', price: 54.9, rating: 4.9, reviewCount: 12043, glyph: 'book' },
  { id: 'p14', name: 'Luminária de Mesa LED Regulável', price: 89.9, oldPrice: 119.9, rating: 4.5, reviewCount: 1876, glyph: 'lamp' },
  { id: 'p15', name: 'Garrafa Térmica Inox 1L à Prova de Vazamento', price: 69.9, rating: 4.6, reviewCount: 2650, glyph: 'bottle' },
  { id: 'p16', name: 'Liquidificador Turbo 1200W 6 Velocidades', price: 179.9, oldPrice: 249.9, rating: 4.4, reviewCount: 3987, glyph: 'blender' },
  { id: 'p17', name: 'Fone Bluetooth Esportivo à Prova de Suor', price: 89.9, oldPrice: 139.9, rating: 4.1, reviewCount: 1765, glyph: 'headphones' },
  { id: 'p18', name: 'Echo Show 5, Tela Inteligente com Alexa', price: 399, oldPrice: 499, rating: 4.6, reviewCount: 6234, glyph: 'echo' },
  { id: 'p19', name: 'Tênis Casual Unissex Leve', price: 139.9, rating: 4.2, reviewCount: 987, glyph: 'sneaker' },
  { id: 'p20', name: 'Kit 3 Livros Best-sellers de Ficção', price: 99.9, oldPrice: 149.9, rating: 4.8, reviewCount: 4102, glyph: 'book' },
];

export const DEALS_OF_THE_DAY = PRODUCTS.filter((p) => p.oldPrice).slice(0, 8);
export const BEST_SELLERS = [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);
export const RECOMMENDED = PRODUCTS.slice(8, 16);
export const ALSO_CONSIDER = [...PRODUCTS].reverse().slice(0, 8);

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Eletrônicos', glyph: 'headphones' },
  { id: 'c2', name: 'Computadores', glyph: 'laptop' },
  { id: 'c3', name: 'Casa e Cozinha', glyph: 'airfryer' },
  { id: 'c4', name: 'Livros', glyph: 'book' },
  { id: 'c5', name: 'Beleza', glyph: 'beauty' },
  { id: 'c6', name: 'Moda', glyph: 'sneaker' },
  { id: 'c7', name: 'Games', glyph: 'controller' },
  { id: 'c8', name: 'Ofertas', glyph: 'watch' },
];
