// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CartResponse } from '@amazon-mvp/api-contract';
import { PixPrice } from '../src/features/checkout/pix-price';
import { CartContent } from '../src/features/cart/cart-content';
import { useCart } from '../src/features/cart/cart-provider';

vi.mock('../src/features/cart/cart-provider', () => ({ useCart: vi.fn() }));
afterEach(cleanup);

const text = (amountMinor: number, percent: number | null) =>
  render(createElement(PixPrice, { amountMinor, currency: 'BRL', percent })).container.textContent;

describe('PixPrice', () => {
  it('uses the checkout rounding rule (discount rounded down)', () => {
    expect(text(32900, 5)).toMatch(/^R\$\s312,55 no Pix \(5% de desconto\)$/);
    cleanup();
    expect(text(99999, 5)).toMatch(/^R\$\s950,00 no Pix/);
    cleanup();
    expect(text(20, 5)).toMatch(/^R\$\s0,19 no Pix/);
  });

  it('renders nothing without a rate or when the discount rounds to zero', () => {
    expect(text(32900, null)).toBe('');
    expect(text(32900, 0)).toBe('');
    expect(text(19, 5)).toBe('');
  });
});

describe('cart summary', () => {
  const cart: CartResponse = {
    id: 'cart',
    userId: 'user',
    currency: 'BRL',
    itemCount: 3,
    subtotalMinor: 3702,
    lines: [
      {
        productId: 'product',
        quantity: 3,
        unitPriceMinor: 1234,
        lineTotalMinor: 3702,
        product: {
          id: 'product',
          name: 'Produto teste',
          slug: 'test',
          sku: 'TEST',
          description: null,
          active: true,
          inStock: true,
          availableQuantity: 5,
          priceMinor: 1234,
          currency: 'BRL',
        },
      },
    ],
  };
  const renderCart = (pixDiscountPercent: number | null, checkoutEnabled = true) => {
    vi.mocked(useCart).mockReturnValue({
      cart,
      status: 'ready',
      pending: false,
      error: null,
      notice: '',
      refresh: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    } as unknown as ReturnType<typeof useCart>);
    return render(
      createElement(CartContent, {
        products: [],
        catalogFailed: false,
        checkoutEnabled,
        pixDiscountPercent,
      }),
    );
  };

  it('offers the Pix total of the whole subtotal', () => {
    const view = renderCart(5);
    // floor(3702 * 5 / 100) = 185 -> 3517, what the checkout quote charges.
    expect(view.getByRole('complementary', { name: 'Resumo da compra' }).textContent).toMatch(
      /ou R\$\s35,17 no Pix \(5% de desconto\)/,
    );
  });

  it('hides it without a rate or without checkout', () => {
    expect(renderCart(null).container.textContent).not.toContain('no Pix');
    cleanup();
    expect(renderCart(5, false).container.textContent).not.toContain('no Pix');
  });
});
