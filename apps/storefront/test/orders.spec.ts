// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { CartProvider } from '../src/features/cart/cart-provider';
import { OrdersView } from '../src/features/orders/orders-view';
import {
  deliveryStatus,
  orderCountLabel,
  ordersInPeriod,
  periodOptions,
  returnWindow,
  searchOrders,
} from '../src/features/orders/order-presentation';

vi.mock('next/navigation', () => ({ usePathname: () => '/orders' }));

afterEach(cleanup);

const order = (
  id: string,
  placedAt: string,
  name: string,
  extra: Partial<OrderResponse> = {},
): OrderResponse => ({
  id,
  orderNumber: `702-000000${id.slice(-1)}-1234567`,
  status: 'PENDING',
  subtotalMinor: 32900,
  shippingMinor: 0,
  discountMinor: 0,
  totalMinor: 32900,
  currency: 'BRL',
  shippingAddress: null,
  paymentMethod: 'SIMULATED_CARD',
  placedAt,
  deliveredAt: null,
  deliveryNote: null,
  lines: [
    {
      productId: `product-${id}`,
      productName: name,
      sku: 'DEMO-p6',
      quantity: 1,
      unitPriceMinor: 32900,
      lineTotalMinor: 32900,
      currency: 'BRL',
    },
  ],
  ...extra,
});

const NOW = new Date('2026-09-29T12:00:00Z');
const ORDERS = [
  order('o1', '2026-08-10T13:32:00Z', 'Controle Sem Fio para Console, Preto', {
    status: 'FULFILLED',
    deliveredAt: '2026-08-17T15:10:00Z',
    deliveryNote: 'O pacote foi entregue nas mãos de um morador.',
  }),
  order('o2', '2025-05-15T12:00:00Z', 'Kindle 11ª Geração'),
  order('o3', '2024-11-20T12:00:00Z', 'Air Fryer Elétrica'),
];

describe('period filter', () => {
  it('offers only the years that have orders, newest first', () => {
    expect(periodOptions(ORDERS).map((o) => o.label)).toEqual([
      'últimos 30 dias',
      'nos últimos 3 meses',
      '2026',
      '2025',
      '2024',
    ]);
    expect(periodOptions([ORDERS[0], ORDERS[2]]).map((o) => o.value)).toEqual([
      'last30',
      'months3',
      '2026',
      '2024',
    ]);
    expect(periodOptions([]).map((o) => o.value)).toEqual(['last30', 'months3']);
  });

  it('filters by calendar year and by relative period', () => {
    expect(ordersInPeriod(ORDERS, '2026', NOW).map((o) => o.id)).toEqual(['o1']);
    expect(ordersInPeriod(ORDERS, '2025', NOW).map((o) => o.id)).toEqual(['o2']);
    expect(ordersInPeriod(ORDERS, '2024', NOW).map((o) => o.id)).toEqual(['o3']);
    expect(ordersInPeriod(ORDERS, 'months3', NOW).map((o) => o.id)).toEqual(['o1']);
    expect(ordersInPeriod(ORDERS, 'last30', NOW)).toEqual([]);
  });

  it('uses Brazilian time for the year boundary', () => {
    // 02:00 UTC on Jan 1st is still Dec 31st in São Paulo.
    const newYearsEve = order('o9', '2026-01-01T02:00:00Z', 'X');
    expect(periodOptions([newYearsEve]).map((o) => o.value)).toContain('2025');
  });
});

it('pluralizes the counter', () => {
  expect(orderCountLabel(1)).toEqual({ count: '1 pedido', verb: 'feito em' });
  expect(orderCountLabel(3)).toEqual({ count: '3 pedidos', verb: 'feitos em' });
  expect(orderCountLabel(0)).toEqual({ count: '0 pedidos', verb: 'feitos em' });
});

it('searches product names (accent/case-insensitive) and order numbers', () => {
  expect(searchOrders(ORDERS, 'CONTROLE').map((o) => o.id)).toEqual(['o1']);
  expect(searchOrders(ORDERS, 'eletrica').map((o) => o.id)).toEqual(['o3']);
  expect(searchOrders(ORDERS, '702-0000002-1234567').map((o) => o.id)).toEqual(['o2']);
  expect(searchOrders(ORDERS, '70200000031234567').map((o) => o.id)).toEqual(['o3']);
  expect(searchOrders(ORDERS, 'xyz')).toEqual([]);
  expect(searchOrders(ORDERS, '  ')).toHaveLength(3);
});

it('derives delivery status and return window from the persisted order', () => {
  expect(deliveryStatus(ORDERS[0])).toEqual({
    headline: 'Entregue no dia 17 agosto',
    detail: 'O pacote foi entregue nas mãos de um morador.',
  });
  expect(deliveryStatus(ORDERS[1]).headline).toBe('Pedido recebido');
  expect(returnWindow(ORDERS[0], NOW)).toBe(
    'O período de devolução se encerrou em 17 de setembro de 2026',
  );
  expect(returnWindow(ORDERS[1], NOW)).toBeNull();
});

describe('Seus pedidos page', () => {
  const renderView = (orders = ORDERS) =>
    render(
      createElement(CartProvider, {
        userId: null,
        enabled: false,
        children: createElement(OrdersView, { orders }),
      }),
    );
  const countText = () => document.getElementById('az-orders-count')?.textContent;
  const listedOrders = () =>
    screen.queryAllByRole('article').map((article) => article.getAttribute('aria-label'));

  it('starts on "Pedidos" with the last 3 months and a computed counter', () => {
    renderView();
    expect(screen.getByRole('tab', { name: 'Pedidos' }).getAttribute('aria-selected')).toBe('true');
    expect(countText()).toBe('1 pedido feito em');
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent)).toEqual([
      'últimos 30 dias',
      'nos últimos 3 meses',
      '2026',
      '2025',
      '2024',
    ]);
    expect(screen.getByText('Entregue no dia 17 agosto')).toBeTruthy();
  });

  it('filters by the selected year', () => {
    renderView();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2025' } });
    expect(listedOrders()).toEqual(['Pedido nº 702-0000002-1234567']);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2024' } });
    expect(listedOrders()).toEqual(['Pedido nº 702-0000003-1234567']);
  });

  it('searches all orders by product name and can be cleared', () => {
    renderView();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'kindle' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar pedidos' }));
    expect(listedOrders()).toEqual(['Pedido nº 702-0000002-1234567']);
    expect(screen.getByText(/corresponde a “kindle”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar pesquisa' }));
    expect(countText()).toBe('1 pedido feito em');
  });

  it('shows order actions and product links built from the order item', () => {
    renderView([ORDERS[0]]);
    const card = screen.getByRole('article');
    for (const name of [
      'Obter suporte de produto',
      'Rastrear pacote',
      'Avaliar o produto',
      'Comprar novamente',
      'Ver o seu item',
    ])
      expect(within(card).getByRole('link', { name })).toBeTruthy();
    expect(within(card).getByRole('link', { name: 'Ver o seu item' }).getAttribute('href')).toBe(
      '/products/product-o1',
    );
    expect(card.querySelector('img')?.getAttribute('src')).toContain(encodeURIComponent('8bitdo-ultimate-2c/hortela-1.jpg'));
  });

  it('lists only unshipped orders in "Ainda não enviado"', () => {
    renderView();
    fireEvent.click(screen.getByRole('tab', { name: 'Ainda não enviado' }));
    expect(listedOrders()).toEqual([
      'Pedido nº 702-0000002-1234567',
      'Pedido nº 702-0000003-1234567',
    ]);
  });

  it('renders nothing invented when the user has no orders', () => {
    renderView([]);
    expect(countText()).toBe('0 pedidos feitos em');
    expect(screen.queryAllByRole('article')).toEqual([]);
    fireEvent.click(screen.getByRole('tab', { name: 'Compre Novamente' }));
    expect(screen.getByText('Os produtos que você comprar aparecerão aqui.')).toBeTruthy();
  });
});
