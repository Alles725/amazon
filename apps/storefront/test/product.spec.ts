// @vitest-environment jsdom
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductGallery } from '../src/features/product/product-gallery';
import { ProductPurchase } from '../src/features/product/product-purchase';
import { useCart } from '../src/features/cart/cart-provider';
import { CatalogItem } from '@amazon-mvp/api-contract';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../src/features/cart/cart-provider', () => ({ useCart: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({ priority: _p, sizes: _s, ...props }: Record<string, unknown>) =>
    createElement('img', props),
}));
const product: CatalogItem = {
  id: 'real-product-id',
  slug: 'real-product',
  sku: 'TEST',
  name: 'Product',
  description: null,
  priceMinor: 1099,
  currency: 'BRL',
  active: true,
  availableQuantity: 10,
  inStock: true,
};
const state = () => ({
  cart: null,
  status: 'ready' as const,
  pending: false,
  error: null,
  notice: '',
  refresh: vi.fn(),
  add: vi.fn().mockResolvedValue(true),
  update: vi.fn().mockResolvedValue(true),
  remove: vi.fn(),
  clear: vi.fn(),
});
const withLine = (quantity: number) => ({
  ...state(),
  cart: {
    id: 'cart',
    userId: 'user',
    lines: [
      {
        productId: product.id,
        product,
        quantity,
        unitPriceMinor: 1099,
        lineTotalMinor: 1099 * quantity,
      },
    ],
    itemCount: quantity,
    subtotalMinor: 1099 * quantity,
    currency: 'BRL',
  },
});
beforeEach(() => {
  push.mockReset();
  vi.mocked(useCart).mockReturnValue(state());
});
afterEach(cleanup);

const images = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ src: `/p-${i + 1}.jpg`, alt: `Foto ${i + 1}` }));

describe('product gallery', () => {
  it('switches the main image on thumbnail click and hover', () => {
    render(createElement(ProductGallery, { name: 'Product', images: images(3) }));
    const main = () => screen.getByRole('button', { name: /Ampliar imagem/ }).querySelector('img');
    expect(main()?.getAttribute('src')).toBe('/p-1.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2 de Product' }));
    expect(main()?.getAttribute('src')).toBe('/p-2.jpg');
    const third = screen.getByRole('button', { name: 'Ver imagem 3 de Product' });
    fireEvent.mouseEnter(third);
    expect(third.getAttribute('aria-pressed')).toBe('true');
    expect(main()?.getAttribute('src')).toBe('/p-3.jpg');
  });

  it('folds extra thumbnails into "N+" and shows every image in the viewer', () => {
    render(createElement(ProductGallery, { name: 'Product', images: images(9) }));
    const group = screen.getByRole('group', { name: 'Escolher imagem do produto' });
    expect(within(group).getAllByRole('button', { name: /Ver imagem/ })).toHaveLength(6);
    fireEvent.click(within(group).getByRole('button', { name: 'Ver todas as 9 imagens' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByRole('button', { name: /Imagem \d de 9/ })).toHaveLength(9);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Imagem 8 de 9' }));
    expect(within(dialog).getByAltText('Foto 8')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(within(screen.getByRole('dialog')).getByAltText('Foto 9')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the full image from the main picture', () => {
    render(createElement(ProductGallery, { name: 'Product', images: images(2) }));
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar imagem: Foto 1' }));
    expect(screen.getByRole('dialog', { name: 'Imagens de Product' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a single image without inventing thumbnails', () => {
    render(createElement(ProductGallery, { name: 'Product', images: images(1) }));
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByAltText('Foto 1')).toBeTruthy();
  });

  it('uses the shared placeholder without photos or when a photo fails', () => {
    const view = render(createElement(ProductGallery, { name: 'Product', images: [] }));
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
    expect(screen.queryByText('Clique para ver a imagem completa')).toBeNull();
    view.unmount();
    render(createElement(ProductGallery, { name: 'Product', images: images(1) }));
    fireEvent.error(screen.getByAltText('Foto 1'));
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
  });
});

describe('buy box', () => {
  it('adds the selected quantity of the real product ID through the existing cart', () => {
    const cart = state();
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Quantidade' }), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }));
    expect(cart.add).toHaveBeenCalledWith(product.id, 3);
    expect(push).not.toHaveBeenCalled();
  });

  it('"Comprar agora" adds the product and then opens the existing checkout', async () => {
    const cart = state();
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Quantidade' }), {
      target: { value: '2' },
    });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Comprar agora' })));
    expect(cart.add).toHaveBeenCalledWith(product.id, 2);
    expect(push).toHaveBeenCalledWith('/checkout');
  });

  it('"Comprar agora" adds the chosen units exactly like "Adicionar ao carrinho"', async () => {
    // 1 already in the cart + 3 chosen = 4 in both buttons.
    const cart = withLine(1);
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Quantidade' }), {
      target: { value: '3' },
    });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Comprar agora' })));
    expect(cart.add).toHaveBeenCalledWith(product.id, 3);
    expect(cart.update).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/checkout');
  });

  it('"Comprar agora" goes straight to checkout when the cart already holds all stock', async () => {
    const cart = withLine(10);
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Comprar agora' })));
    expect(cart.add).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/checkout');
  });

  it('stays on the page when the cart rejects the purchase', async () => {
    const cart = { ...state(), add: vi.fn().mockResolvedValue(false) };
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Comprar agora' })));
    expect(push).not.toHaveBeenCalled();
  });

  it('caps quantities by stock already in the cart', () => {
    vi.mocked(useCart).mockReturnValue(withLine(8));
    const view = render(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(screen.getAllByRole('option')).toHaveLength(2);
    vi.mocked(useCart).mockReturnValue(withLine(10));
    view.rerender(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByText('Você já adicionou a quantidade disponível para este produto.'),
    ).toBeTruthy();
  });

  it('sends guests to login and back to this product', () => {
    vi.mocked(useCart).mockReturnValue({ ...state(), status: 'guest' });
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    for (const name of ['Adicionar ao carrinho', 'Comprar agora'])
      expect(screen.getByRole('link', { name }).getAttribute('href')).toBe(
        '/login?next=%2Fproducts%2Freal-product',
      );
  });

  it.each(['loading', 'error'] as const)('prevents writes while cart status is %s', (status) => {
    vi.mocked(useCart).mockReturnValue({ ...state(), status });
    render(createElement(ProductPurchase, { product, cartEnabled: true, checkoutEnabled: true }));
    for (const name of ['Adicionar ao carrinho', 'Comprar agora'])
      expect(screen.getByRole('button', { name }).hasAttribute('disabled')).toBe(true);
  });

  it('explains when checkout or cart are switched off', () => {
    const view = render(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(screen.getByRole('button', { name: 'Comprar agora' }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(screen.getByText('A finalização da compra ainda não está disponível.')).toBeTruthy();
    view.rerender(createElement(ProductPurchase, { product, cartEnabled: false }));
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(screen.getByText('O carrinho ainda não está disponível.')).toBeTruthy();
  });

  it('out of stock: says so and offers no purchase actions', () => {
    render(
      createElement(ProductPurchase, {
        product: { ...product, inStock: false, availableQuantity: 0 },
        cartEnabled: true,
        checkoutEnabled: true,
      }),
    );
    expect(screen.getByText('Fora de estoque')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Adicionar ao carrinho' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Comprar agora' })).toBeNull();
    expect(screen.queryByText(/Entrega/)).toBeNull();
  });

  it('inactive and low-stock products are labelled from real stock', () => {
    const view = render(
      createElement(ProductPurchase, {
        product: { ...product, active: false, inStock: false, availableQuantity: 0 },
        cartEnabled: true,
      }),
    );
    expect(screen.getByText('Indisponível no momento')).toBeTruthy();
    view.rerender(
      createElement(ProductPurchase, {
        product: { ...product, availableQuantity: 3 },
        cartEnabled: true,
      }),
    );
    expect(screen.getByText('Apenas 3 em estoque')).toBeTruthy();
  });

  it('shows installments, address and fulfillment only when provided', () => {
    const view = render(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(screen.queryByText(/ou em até/)).toBeNull();
    expect(screen.queryByText(/Enviar para/)).toBeNull();
    expect(screen.queryByText('Vendido por')).toBeNull();
    view.rerender(
      createElement(ProductPurchase, {
        product: { ...product, priceMinor: 20520 },
        cartEnabled: true,
        installments: { count: 6 },
        address: { recipient: 'Suely', city: 'Cruzaltense', postalCode: '99665000' },
        fulfillment: { shippedBy: 'Amazon', soldBy: 'Amazon.com.br' },
      }),
    );
    expect(screen.getByText(/ou em até 6x de R\$\s34,20\/mês/)).toBeTruthy();
    expect(screen.getByText('Enviar para Suely - Cruzaltense 99665000')).toBeTruthy();
    expect(screen.getByText('Amazon.com.br')).toBeTruthy();
    expect(screen.queryByText('Devolução')).toBeNull();
  });
});
