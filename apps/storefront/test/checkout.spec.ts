// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CartResponse, CheckoutQuote, OrderResponse, SavedAddress } from '@amazon-mvp/api-contract';
import { CheckoutContent } from '../src/features/checkout/checkout-content';
import { checkoutClient, CheckoutError } from '../src/features/checkout/checkout-client';
import { useCart } from '../src/features/cart/cart-provider';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../src/features/cart/cart-provider', () => ({ useCart: vi.fn() }));
vi.mock('../src/features/checkout/checkout-client', async (original) => ({
  ...(await original<typeof import('../src/features/checkout/checkout-client')>()),
  checkoutClient: { addresses: vi.fn(), quote: vi.fn(), place: vi.fn(), saveAddress: vi.fn() },
}));
const address: SavedAddress = {
  id: 'address',
  recipient: 'Teste',
  postalCode: '90000000',
  street: 'Rua de teste',
  number: '1',
  neighborhood: 'Centro',
  city: 'Porto Alegre',
  state: 'RS',
};
const cart: CartResponse = {
  id: 'cart',
  userId: 'user',
  currency: 'BRL',
  itemCount: 1,
  subtotalMinor: 1099,
  lines: [
    {
      productId: 'product',
      quantity: 1,
      unitPriceMinor: 1099,
      lineTotalMinor: 1099,
      product: {
        id: 'product',
        name: 'Produto teste',
        slug: 'test',
        sku: 'TEST',
        description: null,
        active: true,
        inStock: true,
        availableQuantity: 5,
        priceMinor: 1099,
        currency: 'BRL',
      },
    },
  ],
};
const quote: CheckoutQuote = {
  cart,
  revision: 'revision',
  currency: 'BRL',
  subtotalMinor: 1099,
  shippingMinor: 0,
  discountMinor: 0,
  totalMinor: 1099,
};
function state() {
  return {
    cart,
    status: 'ready' as const,
    pending: false,
    error: null,
    notice: '',
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    refresh: vi.fn().mockResolvedValue(undefined),
  };
}
async function ready() {
  await waitFor(() =>
    expect(
      screen.getAllByRole('button', { name: 'Confirmar pedido' })[0].hasAttribute('disabled'),
    ).toBe(false),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCart).mockReturnValue(state());
  vi.mocked(checkoutClient.addresses).mockResolvedValue([address]);
  vi.mocked(checkoutClient.quote).mockResolvedValue(quote);
});
afterEach(cleanup);
it('requires a saved address and payment before calling the API', async () => {
  vi.mocked(checkoutClient.addresses).mockResolvedValue([]);
  const view = render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  expect(screen.getByRole('alert').textContent).toContain('endereço');
  expect(checkoutClient.place).not.toHaveBeenCalled();
  view.unmount();
  vi.mocked(checkoutClient.addresses).mockResolvedValue([address]);
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  expect(screen.getByRole('alert').textContent).toContain('pagamento');
  expect(checkoutClient.place).not.toHaveBeenCalled();
});
it('uses existing cart mutations and disables confirmation until its new quote agrees', async () => {
  const model = state();
  vi.mocked(useCart).mockReturnValue(model);
  const view = render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.change(screen.getByRole('combobox', { name: 'Quantidade de Produto teste' }), {
    target: { value: '2' },
  });
  expect(model.update).toHaveBeenCalledWith('product', 2);
  fireEvent.click(screen.getByRole('button', { name: 'Remover Produto teste' }));
  expect(model.remove).toHaveBeenCalledWith('product');
  model.cart = { ...cart, itemCount: 2, lines: [{ ...cart.lines[0], quantity: 2 }] };
  view.rerender(createElement(CheckoutContent, { name: 'Teste' }));
  await waitFor(() => expect(checkoutClient.quote).toHaveBeenCalledTimes(2));
  expect(
    screen.getAllByRole('button', { name: 'Confirmar pedido' })[0].hasAttribute('disabled'),
  ).toBe(true);
});
it('refreshes the cart only after success and navigates to the persisted order', async () => {
  const model = state();
  vi.mocked(useCart).mockReturnValue(model);
  vi.mocked(checkoutClient.place).mockResolvedValue({ id: 'saved-order' } as OrderResponse);
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getByRole('radio', { name: 'Pix simulado' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/success/saved-order'));
  expect(checkoutClient.place).toHaveBeenCalledWith({
    cartId: 'cart',
    revision: 'revision',
    addressId: 'address',
    paymentMethod: 'SIMULATED_PIX',
  });
  expect(model.refresh).toHaveBeenCalledOnce();
  expect(model.clear).not.toHaveBeenCalled();
});
it('retries the same request after a lost response even if the cart became empty', async () => {
  const model = state();
  vi.mocked(useCart).mockReturnValue(model);
  vi.mocked(checkoutClient.place)
    .mockRejectedValueOnce(new TypeError('Network failure'))
    .mockResolvedValueOnce({ id: 'same-order' } as OrderResponse);
  const view = render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getByRole('radio', { name: 'Pix simulado' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  await screen.findAllByRole('button', { name: 'Tentar confirmar novamente' });
  expect(model.refresh).not.toHaveBeenCalled();
  expect(model.clear).not.toHaveBeenCalled();
  model.cart = { ...cart, id: null, lines: [], itemCount: 0, subtotalMinor: 0 };
  view.rerender(createElement(CheckoutContent, { name: 'Teste' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Tentar confirmar novamente' })[0]);
  await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/success/same-order'));
  expect(vi.mocked(checkoutClient.place).mock.calls[1][0]).toEqual(
    vi.mocked(checkoutClient.place).mock.calls[0][0],
  );
});
it('returns expired sessions to login without clearing the cart', async () => {
  const model = state();
  vi.mocked(useCart).mockReturnValue(model);
  vi.mocked(checkoutClient.place).mockRejectedValue(new CheckoutError('Entre novamente', 401));
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getByRole('radio', { name: 'Pix simulado' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  await waitFor(() => expect(push).toHaveBeenCalledWith('/login?next=checkout'));
  expect(model.clear).not.toHaveBeenCalled();
});
it('shows the empty state without allowing confirmation', () => {
  vi.mocked(useCart).mockReturnValue({
    ...state(),
    cart: { ...cart, lines: [], itemCount: 0, subtotalMinor: 0 },
  });
  render(createElement(CheckoutContent, { name: 'Teste' }));
  expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).toBeNull();
});
