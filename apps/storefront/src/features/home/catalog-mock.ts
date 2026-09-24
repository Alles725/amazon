import { GlyphKind } from '@/components/amazon/product-glyph';

/**
 * The `catalog` feature is switched off in the shipped feature config —
 * there is no product backend yet. This local, static list exists only to
 * give the home page's Amazon-style layout something to render; it is not
 * wired to any API and carries no persistence.
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

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    image: { src: '/images/products/echo-dot.jpg', alt: 'Echo Dot preto' },
    name: 'Echo Dot (5ª geração) com Alexa, Preto',
    price: 279,
    oldPrice: 349,
    rating: 4.7,
    reviewCount: 48213,
    glyph: 'echo',
  },
  {
    id: 'p2',
    image: { src: '/images/products/jbl-tune-510bt.jpg', alt: 'JBL Tune 510BT preto' },
    name: 'Fone de Ouvido Bluetooth JBL Tune 510BT',
    price: 199.9,
    oldPrice: 279.9,
    rating: 4.6,
    reviewCount: 15342,
    glyph: 'headphones',
  },
  {
    id: 'p3',
    image: { src: '/images/products/kindle.jpg', alt: 'Kindle preto' },
    name: "Kindle 11ª Geração, 16GB, à prova d'água",
    price: 449,
    oldPrice: 599,
    rating: 4.8,
    reviewCount: 9871,
    glyph: 'ereader',
  },
  {
    id: 'p4',
    image: { src: '/images/products/air-fryer.jpg', alt: 'Foto ilustrativa de air fryer digital' },
    name: 'Air Fryer Elétrica 4L Digital 127V',
    price: 259,
    oldPrice: 399,
    rating: 4.5,
    reviewCount: 20044,
    glyph: 'airfryer',
  },
  {
    id: 'p5',
    image: { src: '/images/products/sneakers.webp', alt: 'Foto ilustrativa de tênis esportivo' },
    name: 'Tênis Esportivo Confort Run',
    price: 159.9,
    oldPrice: 219.9,
    rating: 4.3,
    reviewCount: 3021,
    glyph: 'sneaker',
  },
  {
    id: 'p6',
    image: { src: '/images/products/controller.jpg', alt: 'Foto ilustrativa de controle sem fio' },
    name: 'Controle Sem Fio para Console, Preto',
    price: 329,
    rating: 4.7,
    reviewCount: 8842,
    glyph: 'controller',
  },
  {
    id: 'p7',
    image: { src: '/images/products/plant.webp', alt: 'Foto ilustrativa de vaso com planta' },
    name: 'Vaso Autoirrigável com Suculenta Artificial',
    price: 39.9,
    rating: 4.4,
    reviewCount: 612,
    glyph: 'plant',
  },
  {
    id: 'p8',
    image: {
      src: '/images/products/lipstick-kit.png',
      alt: 'Foto ilustrativa de kit com três batons',
    },
    name: 'Kit Batom Matte Longa Duração, 3 unidades',
    price: 49.9,
    oldPrice: 79.9,
    rating: 4.5,
    reviewCount: 2210,
    glyph: 'beauty',
  },
  {
    id: 'p9',
    image: { src: '/images/home/huawei-matebook-x-pro.webp', alt: 'Foto ilustrativa de notebook' },
    name: 'Notebook Ultrafino 15.6" 8GB 256GB SSD',
    price: 2399,
    oldPrice: 2899,
    rating: 4.4,
    reviewCount: 1523,
    glyph: 'laptop',
  },
  {
    id: 'p10',
    image: { src: '/images/products/watch.webp', alt: 'Foto ilustrativa de smartwatch' },
    name: 'Smartwatch Esportivo com Monitor Cardíaco',
    price: 189.9,
    oldPrice: 259.9,
    rating: 4.2,
    reviewCount: 4210,
    glyph: 'watch',
  },
  {
    id: 'p11',
    image: {
      src: '/images/products/backpack.png',
      alt: 'Foto ilustrativa de mochila para notebook',
    },
    name: 'Mochila para Notebook até 15.6", Resistente à Água',
    price: 129.9,
    rating: 4.6,
    reviewCount: 5471,
    glyph: 'backpack',
  },
  {
    id: 'p12',
    name: 'Câmera de Segurança Wi-Fi Full HD',
    price: 149.9,
    oldPrice: 219.9,
    rating: 4.3,
    reviewCount: 3389,
    glyph: 'camera',
  },
  {
    id: 'p13',
    image: { src: '/images/products/hobbit.jpg', alt: 'Capa do livro O Hobbit' },
    name: 'O Hobbit - Edição de Colecionador',
    price: 54.9,
    rating: 4.9,
    reviewCount: 12043,
    glyph: 'book',
  },
  {
    id: 'p14',
    name: 'Luminária de Mesa LED Regulável',
    price: 89.9,
    oldPrice: 119.9,
    rating: 4.5,
    reviewCount: 1876,
    glyph: 'lamp',
  },
  {
    id: 'p15',
    name: 'Garrafa Térmica Inox 1L à Prova de Vazamento',
    price: 69.9,
    rating: 4.6,
    reviewCount: 2650,
    glyph: 'bottle',
  },
  {
    id: 'p16',
    image: { src: '/images/products/blender.jpg', alt: 'Foto ilustrativa de liquidificador' },
    name: 'Liquidificador Turbo 1200W 6 Velocidades',
    price: 179.9,
    oldPrice: 249.9,
    rating: 4.4,
    reviewCount: 3987,
    glyph: 'blender',
  },
  {
    id: 'p17',
    image: { src: '/images/products/earphones.webp', alt: 'Foto ilustrativa de fone Bluetooth' },
    name: 'Fone Bluetooth Esportivo à Prova de Suor',
    price: 89.9,
    oldPrice: 139.9,
    rating: 4.1,
    reviewCount: 1765,
    glyph: 'headphones',
  },
  {
    id: 'p18',
    image: { src: '/images/products/echo-show.jpg', alt: 'Echo Show 5 preto' },
    name: 'Echo Show 5, Tela Inteligente com Alexa',
    price: 399,
    oldPrice: 499,
    rating: 4.6,
    reviewCount: 6234,
    glyph: 'echo',
  },
  {
    id: 'p19',
    image: { src: '/images/products/sneakers.webp', alt: 'Foto ilustrativa de tênis casual' },
    name: 'Tênis Casual Unissex Leve',
    price: 139.9,
    rating: 4.2,
    reviewCount: 987,
    glyph: 'sneaker',
  },
  {
    id: 'p20',
    name: 'Kit 3 Livros Best-sellers de Ficção',
    price: 99.9,
    oldPrice: 149.9,
    rating: 4.8,
    reviewCount: 4102,
    glyph: 'book',
  },
];

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
