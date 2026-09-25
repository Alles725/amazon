// @vitest-environment jsdom
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartResponse } from '@amazon-mvp/api-contract';
import { CartProvider, useCart } from '../src/features/cart/cart-provider';
import { cartClient, CartRequestError } from '../src/features/cart/cart-client';

vi.mock('next/navigation', () => ({ usePathname: () => '/cart' }));
vi.mock('../src/features/cart/cart-client', async (original) => {
  const actual = await original<typeof import('../src/features/cart/cart-client')>();
  return {
    ...actual,
    cartClient: { get: vi.fn(), add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn() },
  };
});

const cart = (count: number, userId = 'one'): CartResponse => ({
  id: 'cart',
  userId,
  lines: [],
  itemCount: count,
  subtotalMinor: count * 12345,
  currency: 'BRL',
});
function Probe() {
  const state = useCart();
  return createElement(
    'div',
    {},
    createElement(
      'output',
      {},
      `${state.status}:${state.cart?.itemCount ?? '-'}:${state.cart?.subtotalMinor ?? '-'}`,
    ),
    createElement('p', { role: 'alert' }, state.error),
    createElement(
      'button',
      { onClick: () => void state.add('product'), disabled: state.pending },
      'add',
    ),
    createElement('button', { onClick: () => void state.refresh() }, 'refresh'),
  );
}
const tree = (userId: string | null = 'one') =>
  createElement(CartProvider, {
    key: userId ?? 'guest',
    userId,
    enabled: true,
    children: createElement(Probe),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'BroadcastChannel',
    class {
      postMessage() {}
      close() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('cart state', () => {
  it('never fetches or exposes an account cart for a guest', () => {
    render(tree(null));
    expect(screen.getByRole('status').textContent).toBe('guest:-:-');
    expect(cartClient.get).not.toHaveBeenCalled();
  });
  it('uses persisted quantities and server totals, then the mutation response', async () => {
    vi.mocked(cartClient.get).mockResolvedValue(cart(2));
    vi.mocked(cartClient.add).mockResolvedValue(cart(3));
    render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:2:24690'));
    fireEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:3:37035'));
    expect(cartClient.add).toHaveBeenCalledWith({ productId: 'product', quantity: 1 });
  });
  it('keeps the last confirmed cart when a mutation fails', async () => {
    vi.mocked(cartClient.get).mockResolvedValue(cart(2));
    vi.mocked(cartClient.add).mockRejectedValue(new CartRequestError('Sem estoque', 409));
    render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:2:24690'));
    fireEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Sem estoque'));
    expect(screen.getByRole('status').textContent).toBe('ready:2:24690');
  });
  it('does not replace a successful mutation with an older read response', async () => {
    vi.mocked(cartClient.get).mockResolvedValueOnce(cart(1));
    vi.mocked(cartClient.add).mockResolvedValue(cart(2));
    render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:1:12345'));
    let resolveRead!: (result: CartResponse) => void;
    vi.mocked(cartClient.get).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        }),
    );
    fireEvent.click(screen.getByText('refresh'));
    fireEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:2:24690'));
    await act(async () => resolveRead(cart(1)));
    expect(screen.getByRole('status').textContent).toBe('ready:2:24690');
  });
  it('revalidates a refresh requested while a write is pending', async () => {
    vi.mocked(cartClient.get).mockResolvedValueOnce(cart(1)).mockResolvedValueOnce(cart(3));
    let finishWrite!: (result: CartResponse) => void;
    vi.mocked(cartClient.add).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishWrite = resolve;
        }),
    );
    render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:1:12345'));
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('refresh'));
    expect(cartClient.get).toHaveBeenCalledTimes(1);
    await act(async () => finishWrite(cart(2)));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:3:37035'));
    expect(cartClient.get).toHaveBeenCalledTimes(2);
  });
  it('clears account data when the session expires', async () => {
    vi.mocked(cartClient.get).mockResolvedValueOnce(cart(2));
    render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:2:24690'));
    vi.mocked(cartClient.get).mockRejectedValueOnce(new CartRequestError('Session expired', 401));
    fireEvent.click(screen.getByText('refresh'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('guest:-:-'));
  });
  it('does not carry another user cart through an account change', async () => {
    vi.mocked(cartClient.get).mockResolvedValueOnce(cart(2));
    const view = render(tree());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:2:24690'));
    vi.mocked(cartClient.get).mockResolvedValueOnce(cart(0, 'two'));
    view.rerender(tree('two'));
    expect(screen.getByRole('status').textContent).toBe('loading:-:-');
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('ready:0:0'));
  });
});
