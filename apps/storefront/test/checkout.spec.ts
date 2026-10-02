// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  CartResponse,
  CheckoutQuote,
  OrderResponse,
  SavedAddress,
  SavedPaymentCard,
} from '@amazon-mvp/api-contract';
import { CheckoutContent } from '../src/features/checkout/checkout-content';
import { checkoutClient, CheckoutError } from '../src/features/checkout/checkout-client';
import { useCart } from '../src/features/cart/cart-provider';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../src/features/cart/cart-provider', () => ({ useCart: vi.fn() }));
vi.mock('../src/features/checkout/checkout-client', async (original) => ({
  ...(await original<typeof import('../src/features/checkout/checkout-client')>()),
  checkoutClient: {
    addresses: vi.fn(),
    quote: vi.fn(),
    place: vi.fn(),
    saveAddress: vi.fn(),
    cards: vi.fn(),
    saveCard: vi.fn(),
  },
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
  paymentMethod: 'SIMULATED_CARD',
  discountPercent: 0,
  // 1099 with a R$ 5,00 minimum installment: 1x or 2x (550 + 549).
  installmentOptions: [
    { count: 1, installmentMinor: 1099, firstInstallmentMinor: 1099 },
    { count: 2, installmentMinor: 549, firstInstallmentMinor: 550 },
  ],
};
// What the API answers for Pix: 5% of 1099 = 54.95 -> 54 (rounded down).
const pixQuote: CheckoutQuote = {
  ...quote,
  revision: 'pix-revision',
  discountMinor: 54,
  totalMinor: 1045,
  paymentMethod: 'SIMULATED_PIX',
  discountPercent: 5,
  installmentOptions: [],
};
const choosePix = async () => {
  fireEvent.click(screen.getByRole('radio', { name: 'Pix simulado' }));
  await ready();
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
  vi.mocked(checkoutClient.cards).mockResolvedValue([]);
  vi.mocked(checkoutClient.quote).mockImplementation(async (method) =>
    method === 'SIMULATED_PIX' ? pixQuote : quote,
  );
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
  await choosePix();
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/success/saved-order'));
  expect(checkoutClient.place).toHaveBeenCalledWith({
    cartId: 'cart',
    revision: 'pix-revision',
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
  await choosePix();
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
  await choosePix();
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
it('re-quotes from the API when switching card and Pix, showing the Pix discount', async () => {
  render(createElement(CheckoutContent, { name: 'Teste', pixDiscountPercent: 5 }));
  await ready();
  expect(checkoutClient.quote).toHaveBeenLastCalledWith('SIMULATED_CARD');
  const summary = screen.getByRole('complementary', { name: 'Resumo do pedido' });
  expect(summary.textContent).not.toContain('Desconto Pix');
  const pix = screen.getByRole('radio', { name: 'Pix simulado' });
  expect(document.getElementById(pix.getAttribute('aria-describedby')!)?.textContent).toBe(
    '5% de desconto à vista no Pix',
  );
  await choosePix();
  expect(checkoutClient.quote).toHaveBeenLastCalledWith('SIMULATED_PIX');
  expect(summary.textContent).toContain('Desconto Pix (5%)');
  expect(summary.textContent).toMatch(/−\sR\$\s0,54/);
  expect(summary.textContent).toMatch(/Total do pedidoR\$\s10,45/);
  fireEvent.click(screen.getByRole('radio', { name: 'Cartão fictício · Visa final 4242' }));
  await ready();
  expect(checkoutClient.quote).toHaveBeenLastCalledWith('SIMULATED_CARD');
  expect(summary.textContent).not.toContain('Desconto Pix');
  expect(summary.textContent).toMatch(/Total do pedidoR\$\s10,99/);
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
  await waitFor(() =>
    expect(checkoutClient.place).toHaveBeenCalledWith(
      expect.objectContaining({ revision: 'revision', paymentMethod: 'SIMULATED_CARD' }),
    ),
  );
});
it('keeps confirmation disabled while the quote is for another payment method', async () => {
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  let answer: (value: CheckoutQuote) => void = () => {};
  vi.mocked(checkoutClient.quote).mockImplementationOnce(
    () => new Promise<CheckoutQuote>((resolve) => (answer = resolve)),
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Pix simulado' }));
  const confirm = screen.getAllByRole('button', { name: 'Confirmar pedido' })[0];
  expect(confirm.hasAttribute('disabled')).toBe(true);
  fireEvent.click(confirm);
  expect(checkoutClient.place).not.toHaveBeenCalled();
  // No advertised rate without the API's pricing.
  expect(screen.queryByText(/de desconto à vista no Pix/)).toBeNull();
  answer(pixQuote);
  await ready();
});

const nextYear = new Date().getFullYear() + 1;
const savedCard: SavedPaymentCard = {
  id: 'card-1',
  brand: 'MASTERCARD',
  last4: '5100',
  holderName: 'Teste',
  expMonth: 12,
  expYear: nextYear,
};
const confirmOrder = () =>
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirmar pedido' })[0]);
it('adds a card sending only brand and last four digits, then pays with it', async () => {
  vi.mocked(checkoutClient.saveCard).mockResolvedValue(savedCard);
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  fireEvent.click(screen.getByRole('button', { name: '+ Adicionar cartão de crédito' }));
  const form = screen.getByRole('form', { name: 'Adicionar cartão' });
  const number = screen.getByLabelText('Número do cartão');
  fireEvent.change(number, { target: { value: '5105 1051 0510 5101' } });
  fireEvent.change(screen.getByLabelText('Mês de validade'), { target: { value: '12' } });
  fireEvent.change(screen.getByLabelText('Ano de validade'), { target: { value: String(nextYear) } });
  fireEvent.submit(form);
  expect((await screen.findByRole('alert')).textContent).toBe('Número de cartão inválido.');
  expect(checkoutClient.saveCard).not.toHaveBeenCalled();
  fireEvent.change(number, { target: { value: '5105105105105100' } });
  expect((number as HTMLInputElement).value).toBe('5105 1051 0510 5100');
  expect(screen.getByText('Mastercard')).toBeTruthy();
  fireEvent.submit(form);
  await waitFor(() =>
    expect(checkoutClient.saveCard).toHaveBeenCalledWith({
      brand: 'MASTERCARD',
      last4: '5100',
      holderName: 'Teste',
      expMonth: 12,
      expYear: nextYear,
    }),
  );
  const radio = await screen.findByRole('radio', { name: /Mastercard final 5100/ });
  expect((radio as HTMLInputElement).checked).toBe(true);
  await ready();
  confirmOrder();
  await waitFor(() =>
    expect(checkoutClient.place).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: 'SIMULATED_CARD', cardId: 'card-1', installments: 1 }),
    ),
  );
});
it('lists saved cards and disables expired ones', async () => {
  vi.mocked(checkoutClient.cards).mockResolvedValue([
    savedCard,
    { ...savedCard, id: 'old', last4: '0001', expMonth: 1, expYear: 2020 },
  ]);
  render(createElement(CheckoutContent, { name: 'Teste' }));
  const expired = await screen.findByRole('radio', { name: /final 0001.*Vencido/ });
  expect((expired as HTMLInputElement).disabled).toBe(true);
  expect(screen.getByRole('radio', { name: /final 5100.*Validade 12\// })).toBeTruthy();
});
it('offers the quoted installments for card and sends the chosen plan', async () => {
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  expect(screen.queryByLabelText('Parcelamento')).toBeNull();
  fireEvent.click(screen.getByRole('radio', { name: 'Cartão fictício · Visa final 4242' }));
  await ready();
  const select = screen.getByLabelText('Parcelamento') as HTMLSelectElement;
  expect(Array.from(select.options).map((o) => o.textContent!.replace(/\s/g, ' '))).toEqual([
    '1x de R$ 10,99 sem juros (à vista)',
    '2x sem juros (1ª de R$ 5,50 + 1x de R$ 5,49)',
  ]);
  fireEvent.change(select, { target: { value: '2' } });
  const summary = screen.getByRole('complementary', { name: 'Resumo do pedido' });
  expect(summary.textContent).toContain('No cartão: 2x sem juros');
  confirmOrder();
  await waitFor(() => expect(checkoutClient.place).toHaveBeenCalled());
  const request = vi.mocked(checkoutClient.place).mock.calls[0][0];
  expect(request).toMatchObject({ paymentMethod: 'SIMULATED_CARD', installments: 2 });
  expect(request).not.toHaveProperty('cardId');
});
it('sends no card or installments with Pix', async () => {
  render(createElement(CheckoutContent, { name: 'Teste' }));
  await ready();
  await choosePix();
  expect(screen.queryByLabelText('Parcelamento')).toBeNull();
  confirmOrder();
  await waitFor(() => expect(checkoutClient.place).toHaveBeenCalled());
  const request = vi.mocked(checkoutClient.place).mock.calls[0][0];
  expect(request).not.toHaveProperty('cardId');
  expect(request).not.toHaveProperty('installments');
});
