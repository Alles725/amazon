// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogProductDetails, OrderResponse } from '@amazon-mvp/api-contract';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ toString: () => 'amzmvp_sid=x' }) }));
const { notFound, flags, session, fetchOrders, pricing } = vi.hoisted(() => ({
  pricing: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  flags: {} as Record<string, boolean>,
  session: vi.fn(),
  fetchOrders: vi.fn(),
}));
vi.mock('next/navigation', () => ({ notFound, useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/image', () => ({
  default: ({ priority: _p, sizes: _s, ...props }: Record<string, unknown>) =>
    createElement('img', props),
}));
vi.mock('../src/config/feature-gate', () => ({
  isFeatureEnabled: (feature: string) => flags[feature] ?? false,
  FeatureRoute: ({ title }: { title: string }) => createElement('p', null, `coming soon: ${title}`),
}));
vi.mock('../src/config/storefront-config', () => ({
  getConfig: () => ({ api: { internalBaseUrl: 'http://api', publicBasePath: '/api/v1' } }),
}));
vi.mock('../src/features/auth/server-session', () => ({ getServerSession: () => session() }));
vi.mock('../src/features/orders/orders-server', () => ({ fetchOrders: () => fetchOrders() }));
vi.mock('../src/features/cart/cart-provider', () => ({
  useCart: () => ({
    cart: null,
    status: 'ready',
    pending: false,
    error: null,
    notice: '',
    refresh: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}));

import ProductDetailPage, { generateMetadata } from '../src/app/products/[productId]/page';

const games = [
  { slug: 'games-e-consoles', name: 'Games e Consoles' },
  { slug: 'games-pc', name: 'PC' },
  { slug: 'games-pc-acessorios', name: 'Acessórios' },
  { slug: 'games-pc-controles', name: 'Controles e Gamepads' },
];
const echo = [
  { slug: 'dispositivos-amazon', name: 'Dispositivos Amazon' },
  { slug: 'echo-e-alexa', name: 'Echo e Alexa' },
  { slug: 'echo-smart-speakers', name: 'Smart Speakers' },
];
const record = (
  slug: string,
  name: string,
  priceMinor: number,
  categoryPath: CatalogProductDetails['categoryPath'],
  extra: Partial<CatalogProductDetails> = {},
): CatalogProductDetails => ({
  id: `uuid-${slug}`,
  slug,
  sku: slug.startsWith('p') ? `DEMO-${slug}` : slug.toUpperCase(),
  name,
  description: null,
  priceMinor,
  currency: 'BRL',
  active: true,
  availableQuantity: 10,
  inStock: true,
  categories: categoryPath.slice(-1),
  categoryPath,
  ...extra,
});
const CATALOG = [
  record('p6', '8BitDo Ultimate 2C (Mint)', 20520, games, {
    description: 'Qualidade 8BitDo em controles e gamepads para consoles.',
  }),
  record('p21', '8BitDo Ultimate 2C (Peach)', 21000, games),
  record('p22', '8BitDo Ultimate 2C (Purple)', 19950, games),
  record('p23', 'Controle 8BitDo Ultimate 2C, Verde', 20010, games, {
    inStock: false,
    availableQuantity: 0,
  }),
  record('p1', 'Echo Dot (5ª geração) com Alexa, Preto', 27900, echo),
  record('p18', 'Echo Show 5, Tela Inteligente com Alexa', 39900, [
    ...echo.slice(0, 2),
    { slug: 'echo-smart-displays', name: 'Smart Displays' },
  ]),
  record('plain-mug', 'Plain mug', 1990, [{ slug: 'kitchen', name: 'Kitchen' }]),
];

const EMPTY = { average: null, count: 0 };
const RATINGS: Record<string, { average: number; count: number }> = {
  'uuid-p6': { average: 4.8, count: 5512 },
  'uuid-p1': { average: 4.7, count: 48213 },
  'uuid-p18': { average: 4.6, count: 9123 },
};
const REVIEWS = ['uuid-p6', 'uuid-p21', 'uuid-p22', 'uuid-p23'].map((productId, index) => ({
  id: `r${index}`,
  productId,
  authorName: `Autor ${index}`,
  rating: 5,
  title: `Título ${index}`,
  body: 'Texto da avaliação.',
  verifiedPurchase: index < 2,
  helpfulCount: 4 - index,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
}));

beforeEach(() => {
  Object.assign(flags, {
    productDetails: true,
    cart: true,
    checkout: true,
    orders: true,
    catalog: false,
  });
  session.mockReset().mockResolvedValue(null);
  fetchOrders.mockReset().mockResolvedValue([]);
  pricing
    .mockReset()
    .mockImplementation(
      () => ({ ok: true, status: 200, json: async () => ({ pixDiscountPercent: 5 }) }) as Response,
    );
  notFound.mockClear();
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const json = (body: unknown, status = 200) =>
        ({ ok: status < 400, status, json: async () => body }) as Response;
      const path = url.replace('http://api/api/v1', '');
      if (path === '/addresses') return json([]);
      if (path === '/orders/pricing') return pricing();
      const reviewIds = (path.match(/productIds=([^&]+)/)?.[1] ?? '').split(',');
      if (path.startsWith('/reviews/summaries'))
        return json({
          items: reviewIds.map((id) => ({ productId: id, ...(RATINGS[id] ?? EMPTY) })),
        });
      if (path.startsWith('/reviews/summary')) {
        const rated = reviewIds.map((id) => RATINGS[id]).find(Boolean);
        return json(
          rated && reviewIds.includes('uuid-p6')
            ? { ...rated, distribution: [92, 5, 1, 0, 2].map((percent, i) => ({ stars: 5 - i, percent })) }
            : { ...(rated ?? EMPTY), distribution: null },
        );
      }
      if (path.startsWith('/reviews/viewer')) return json({ ownReviews: [], helpfulReviewIds: [] });
      if (path.startsWith('/reviews?')) {
        const items = REVIEWS.filter((review) => reviewIds.includes(review.productId));
        return json({ items, total: items.length, page: 1, pageSize: 8 });
      }
      const list = path.match(/^\/catalog\/products\?.*category=([^&]+)/);
      if (list)
        return json({
          items: CATALOG.filter((p) => p.categoryPath.some((c) => c.slug === list[1])),
          total: 0,
        });
      const id = decodeURIComponent(path.replace('/catalog/products/', ''));
      const found = CATALOG.find((p) => p.slug === id || p.id === id);
      return found ? json(found) : json({ error: {} }, 404);
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderPage = async (productId: string) =>
  render(await ProductDetailPage({ params: { productId } }));

const order = (placedAt: string, productId: string): OrderResponse => ({
  id: 'order-1',
  orderNumber: '702-1',
  status: 'FULFILLED',
  subtotalMinor: 0,
  shippingMinor: 0,
  discountMinor: 0,
  totalMinor: 0,
  currency: 'BRL',
  shippingAddress: null,
  paymentMethod: null,
  paymentCard: null,
  installments: null,
  placedAt,
  deliveredAt: null,
  deliveryNote: null,
  lines: [
    {
      productId,
      productName: 'x',
      sku: 'x',
      quantity: 1,
      unitPriceMinor: 0,
      lineTotalMinor: 0,
      currency: 'BRL',
    },
  ],
});

describe('product detail page', () => {
  it('renders the reference product entirely from its own records', async () => {
    await renderPage('p6');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('8BitDo Ultimate 2C (Mint)');
    const crumbs = screen.getByRole('navigation', { name: 'Categorias do produto' });
    expect(
      within(crumbs)
        .getAllByRole('listitem')
        .map((li) => li.textContent?.replace('›', '')),
    ).toEqual(games.map((c) => c.name));
    expect(screen.getByRole('link', { name: 'Marca: 8BitDo' }).getAttribute('href')).toBe(
      '#brand-story',
    );
    expect(screen.getByText('Escolha da Amazon')).toBeTruthy();
    expect(screen.getByText('Mais de 200 compras')).toBeTruthy();
    expect(screen.getByText('Sobre este item')).toBeTruthy();
    expect(screen.getByText('B0D736BCNM')).toBeTruthy();
    expect(
      screen.getByText('Qualidade 8BitDo em controles e gamepads para consoles.'),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Da marca' })).toBeTruthy();
    // Rating and reviews come from the reviews API, pooled across the variant family.
    expect(screen.getByText('92%')).toBeTruthy();
    expect(screen.getByRole('link', { name: '5.512 avaliações de clientes' })).toBeTruthy();
    expect(screen.getAllByText('Compra verificada')).toHaveLength(2);
    expect(screen.getByText('Cor: Verde')).toBeTruthy();
    const reviewsCall = vi
      .mocked(fetch)
      .mock.calls.map(([url]) => String(url))
      .find((url) => url.includes('/reviews?'));
    expect(reviewsCall).toContain('productIds=uuid-p6,uuid-p21,uuid-p22,uuid-p23');
    // Sibling variants: own links, prices and stock.
    const swatches = screen.getByRole('list', { name: 'Escolher cor' });
    expect(
      within(swatches)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual(['/products/p6', '/products/p21', '/products/p22', '/products/p23']);
    expect(
      within(swatches).getByRole('link', { name: /Cor Verde, R\$\s200,10, indisponível/ }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: /Cor Hortelã/ }).getAttribute('aria-current')).toBe(
      'true',
    );
    // Its own gallery, no related rail padded with unrelated items.
    expect(screen.getByRole('group', { name: 'Escolher imagem do produto' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Produtos relacionados a este item' })).toBeNull();
  });

  it('links breadcrumbs and the brand to their listings when the catalog is enabled', async () => {
    flags.catalog = true;
    await renderPage('p6');
    const crumbs = screen.getByRole('navigation', { name: 'Categorias do produto' });
    expect(
      within(crumbs)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual(games.map((c) => `/products?category=${c.slug}`));
    expect(screen.getByRole('link', { name: 'Marca: 8BitDo' }).getAttribute('href')).toBe(
      '/products?brand=8bitdo',
    );
    expect(
      screen
        .getByRole('link', { name: 'Ver todos os produtos da marca 8BitDo' })
        .getAttribute('href'),
    ).toBe('/products?brand=8bitdo');
  });

  it('shows the purchase banner from real orders, including a sibling variant', async () => {
    session.mockResolvedValue({ user: { id: 'u' } });
    fetchOrders.mockResolvedValue([order('2026-08-10T13:32:00.000Z', 'uuid-p21')]);
    await renderPage('p6');
    const banner = screen.getByRole('region', { name: 'Compra anterior' });
    expect(banner.textContent).toContain(
      'Você comprou este produto pela última vez em 10 de Ago de 2026',
    );
    expect(banner.textContent).toContain('Cor: Pêssego');
    expect(within(banner).getByRole('link', { name: 'Ver pedido' }).getAttribute('href')).toBe(
      '/orders/order-1',
    );
    expect(
      within(banner).getByRole('link', { name: 'Incluir avaliação' }).getAttribute('href'),
    ).toBe('/products/p6/review');
    expect(
      within(banner).getByRole('link', { name: 'Suporte ao produto' }).getAttribute('href'),
    ).toBe('/help');
    expect(screen.getByText(/Sua assinatura Prime está pausada/)).toBeTruthy();
  });

  it('never invents purchases: no orders, other products, guests or orders disabled', async () => {
    session.mockResolvedValue({ user: { id: 'u' } });
    fetchOrders.mockResolvedValue([order('2026-08-10T13:32:00.000Z', 'uuid-p1')]);
    await renderPage('p6');
    expect(screen.queryByRole('region', { name: 'Compra anterior' })).toBeNull();
    cleanup();
    flags.orders = false;
    fetchOrders.mockClear();
    await renderPage('p1');
    expect(fetchOrders).not.toHaveBeenCalled();
    cleanup();
    session.mockResolvedValue(null);
    flags.orders = true;
    await renderPage('p1');
    expect(fetchOrders).not.toHaveBeenCalled();
    expect(screen.queryByText(/Sua assinatura Prime está pausada/)).toBeNull();
  });

  it('keeps other products free of the reference content', async () => {
    await renderPage('uuid-p1');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Echo Dot (5ª geração) com Alexa, Preto',
    );
    expect(screen.getByText('Marca: Amazon')).toBeTruthy();
    for (const absent of ['Escolha da Amazon', 'Sobre este item', 'Da marca', '8BitDo'])
      expect(screen.queryByText(absent)).toBeNull();
    expect(screen.queryByRole('list', { name: /Escolher/ })).toBeNull();
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByRole('link', { name: '48.213 avaliações de clientes' })).toBeTruthy();
    expect(screen.getByText('Nenhuma avaliação escrita para exibir.')).toBeTruthy();
    // Related: widened to the "Dispositivos Amazon" level, never itself.
    const rail = screen
      .getByRole('heading', { name: 'Produtos relacionados a este item' })
      .closest('section') as HTMLElement;
    const hrefs = within(rail)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/products/uuid-p18']);
  });

  it('degrades gracefully for a product with no content, rating or photo', async () => {
    await renderPage('plain-mug');
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Detalhes do produto' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Descrição do produto' })).toBeNull();
    expect(screen.getByText('Ainda não há avaliações de clientes para este produto.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Escreva uma avaliação' }).getAttribute('href')).toBe(
      '/products/plain-mug/review',
    );
    expect(screen.queryByText(/Marca:/)).toBeNull();
  });

  it('404s unknown products and respects the feature flag', async () => {
    await expect(ProductDetailPage({ params: { productId: 'nope' } })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(notFound).toHaveBeenCalled();
    flags.productDetails = false;
    await renderPage('p6');
    expect(screen.getByText('coming soon: Produto')).toBeTruthy();
  });

  it('advertises the Pix price with the API rate and the checkout rounding', async () => {
    await renderPage('p6');
    // 20520 cents - floor(20520 * 5 / 100) = 19494.
    const overview = screen.getByRole('region', { name: 'Informações do produto' });
    expect(overview.textContent).toMatch(/R\$\s194,94 no Pix \(5% de desconto\)/);
    const buyBox = screen.getByRole('region', { name: 'Comprar produto' });
    expect(buyBox.textContent).toMatch(/ou R\$\s194,94 no Pix \(5% de desconto\)/);
    cleanup();
    // Out of stock: the overview keeps the Pix price next to the price, the buy box does not.
    await renderPage('p23');
    expect(screen.getByRole('region', { name: 'Informações do produto' }).textContent).toMatch(
      /R\$\s190,10 no Pix/,
    );
    expect(screen.getByRole('region', { name: 'Comprar produto' }).textContent).not.toContain(
      'no Pix',
    );
  });

  it('shows no Pix price without a rate from the API or without checkout', async () => {
    pricing.mockImplementation(() => ({ ok: false, status: 500, json: async () => ({}) }));
    await renderPage('p6');
    expect(screen.queryByText(/no Pix/)).toBeNull();
    cleanup();
    pricing.mockImplementation(() => ({
      ok: true,
      status: 200,
      json: async () => ({ pixDiscountPercent: 0 }),
    }));
    await renderPage('p6');
    expect(screen.queryByText(/no Pix/)).toBeNull();
    cleanup();
    pricing.mockClear();
    flags.checkout = false;
    await renderPage('p6');
    expect(screen.queryByText(/no Pix/)).toBeNull();
    expect(pricing).not.toHaveBeenCalled();
  });

  it('builds metadata from the product', async () => {
    expect(await generateMetadata({ params: { productId: 'p6' } })).toMatchObject({
      title: '8BitDo Ultimate 2C (Mint) | Amazon.com.br',
      description: 'Qualidade 8BitDo em controles e gamepads para consoles.',
      openGraph: { images: [{ url: '/images/products/8bitdo-ultimate-2c/hortela-1.jpg' }] },
    });
    // Without a description, the page falls back to the name, never another product's text.
    expect((await generateMetadata({ params: { productId: 'p1' } })).description).toBe(
      'Echo Dot (5ª geração) com Alexa, Preto',
    );
    expect((await generateMetadata({ params: { productId: 'nope' } })).title).toBe(
      'Produto não encontrado | Amazon.com.br',
    );
  });
});
