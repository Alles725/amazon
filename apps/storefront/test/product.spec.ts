// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductGallery } from '../src/features/product/product-gallery';
import { ProductPurchase } from '../src/features/product/product-purchase';
import { useCart } from '../src/features/cart/cart-provider';
import { CatalogItem } from '@amazon-mvp/api-contract';

vi.mock('../src/features/cart/cart-provider', () => ({ useCart: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({ unoptimized: _u, ...props }: Record<string, unknown>) => createElement('img', props),
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
  availableQuantity: 5,
  inStock: true,
};
const state = () => ({
  cart: null,
  status: 'ready' as const,
  pending: false,
  error: null,
  notice: '',
  refresh: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
});
beforeEach(() => vi.mocked(useCart).mockReturnValue(state()));
afterEach(cleanup);

describe('product interactions', () => {
  it('selects a thumbnail and shows a fallback when that image fails', () => {
    render(
      createElement(ProductGallery, {
        name: 'Product',
        images: [
          { src: '/one.jpg', alt: 'Front' },
          { src: '/two.jpg', alt: 'Back' },
        ],
      }),
    );
    expect(screen.getByAltText('Front').getAttribute('src')).toBe('/one.jpg');
    const thumbnail = screen.getByRole('button', { name: 'Ver imagem 2 de Product' });
    fireEvent.click(thumbnail);
    expect(thumbnail.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByAltText('Back').getAttribute('src')).toBe('/two.jpg');
    fireEvent.error(screen.getByAltText('Back'));
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
  });
  it('does not invent thumbnails for a product without images', () => {
    render(createElement(ProductGallery, { name: 'Product', images: [] }));
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('Imagem indisponível')).toBeTruthy();
  });
  it('adds the selected quantity and real product ID through the existing cart', () => {
    const cart = state();
    vi.mocked(useCart).mockReturnValue(cart);
    render(createElement(ProductPurchase, { product, cartEnabled: true }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }));
    expect(cart.add).toHaveBeenCalledWith(product.id, 3);
    expect(screen.getByRole('button', { name: 'Comprar agora' }).hasAttribute('disabled')).toBe(
      true,
    );
  });
  it('caps additions using existing cart quantity and prevents stock overflow', () => {
    const cart = {
      ...state(),
      cart: {
        id: 'cart',
        userId: 'user',
        lines: [
          {
            productId: product.id,
            product,
            quantity: 4,
            unitPriceMinor: 1099,
            lineTotalMinor: 4396,
          },
        ],
        itemCount: 4,
        subtotalMinor: 4396,
        currency: 'BRL',
      },
    };
    vi.mocked(useCart).mockReturnValue(cart);
    const view = render(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(screen.getAllByRole('option')).toHaveLength(1);
    vi.mocked(useCart).mockReturnValue({
      ...cart,
      cart: { ...cart.cart, lines: [{ ...cart.cart.lines[0], quantity: 5 }] },
    });
    view.rerender(createElement(ProductPurchase, { product, cartEnabled: true }));
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
  });
  it.each(['guest', 'loading', 'error'] as const)(
    'prevents writes while cart status is %s',
    (status) => {
      vi.mocked(useCart).mockReturnValue({ ...state(), status });
      render(createElement(ProductPurchase, { product, cartEnabled: true }));
      expect(
        screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
      ).toBe(true);
      if (status === 'guest')
        expect(screen.getByRole('link', { name: 'Entre na sua conta' }).getAttribute('href')).toBe(
          '/login',
        );
    },
  );
  it('prevents writes when unavailable or disabled by configuration', () => {
    const view = render(
      createElement(ProductPurchase, {
        product: { ...product, inStock: false, availableQuantity: 0 },
        cartEnabled: true,
      }),
    );
    expect(screen.getByText('Indisponível no momento')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
    view.rerender(createElement(ProductPurchase, { product, cartEnabled: false }));
    expect(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }).hasAttribute('disabled'),
    ).toBe(true);
  });
});
