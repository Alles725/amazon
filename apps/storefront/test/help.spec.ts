// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { CustomerServiceBar, HelpCenter } from '../src/features/help/help-center';
import { HELP_CATEGORIES } from '../src/features/help/help-content';
import { searchHelpTopics } from '../src/features/help/help-topics';
import {
  RecentProduct,
  formatOrderDate,
  recentProductsFromOrders,
} from '../src/features/help/recent-products';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: () => ({ toString: () => '' }) }));

afterEach(cleanup);

type Line = { productId: string; productName: string; sku?: string };
const order = (id: string, placedAt: string, lines: Line[]): OrderResponse =>
  ({
    id,
    placedAt,
    lines: lines.map((line) => ({ sku: 'NO-MEDIA', ...line })),
  }) as OrderResponse;
const item = (name: string, sku?: string): Line => ({ productId: name, productName: name, sku });

const ORDERS = [
  order('o1', '2026-03-12T12:00:00Z', [item('Kindle', 'DEMO-p3')]),
  order('o2', '2026-08-10T12:00:00Z', [item('Controle', 'DEMO-p6')]),
];

const renderHelp = (firstName?: string, products: RecentProduct[] = []) =>
  render(createElement(HelpCenter, { firstName, products }));

it('greets the signed-in user by first name when they have orders', () => {
  renderHelp('Camila', recentProductsFromOrders(ORDERS));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Você precisa de ajuda com um produto recente, Camila?',
  );
});

it('shows only the products of real orders, newest first, with the order date', () => {
  renderHelp('Camila', recentProductsFromOrders(ORDERS));
  const items = within(screen.getByRole('list', { name: 'Produtos recentes' })).getAllByRole(
    'listitem',
  );
  expect(items.map((li) => li.querySelector('.az-help__product-name')?.textContent)).toEqual([
    'Controle',
    'Kindle',
  ]);
  expect(items[0].textContent).toContain('Pedido em 10 de ago. de 2026');
  expect(items[0].querySelector('a')?.getAttribute('href')).toBe('/orders/o2');
});

it('never fills the grid when there are no orders', () => {
  renderHelp('Camila');
  expect(screen.queryByRole('list', { name: 'Produtos recentes' })).toBeNull();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Bem-vindo ao Atendimento ao Cliente da Amazon, Camila',
  );
  expect(recentProductsFromOrders([])).toEqual([]);
});

it('marks "Página inicial" as current in the customer service bar', () => {
  render(createElement(CustomerServiceBar, { currentHref: '/help' }));
  const nav = screen.getByRole('navigation', { name: 'Atendimento ao Cliente' });
  expect(
    within(nav).getByRole('link', { name: 'Página inicial' }).getAttribute('aria-current'),
  ).toBe('page');
  expect(
    within(nav)
      .getByRole('link', { name: 'Suporte para dispositivos e serviços digitais' })
      .getAttribute('aria-current'),
  ).toBeNull();
});

it('lists every help category and switches the visible cards', () => {
  renderHelp();
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.textContent)).toEqual(HELP_CATEGORIES.map((c) => c.label));
  expect(within(screen.getByRole('tabpanel')).getAllByRole('link')).toHaveLength(11);

  fireEvent.click(screen.getByRole('tab', { name: 'Devoluções e Reembolsos' }));
  expect(
    screen.getByRole('tab', { name: 'Devoluções e Reembolsos' }).getAttribute('aria-selected'),
  ).toBe('true');
  expect(
    within(screen.getByRole('tabpanel'))
      .getAllByRole('link')
      .map((link) => link.querySelector('.az-help__card-title')?.textContent),
  ).toEqual([
    'Devolver itens que você comprou',
    'Verificar o status do seu reembolso',
    'Cancelar itens ou pedidos',
  ]);
});

it('searches the help library ignoring accents and case', () => {
  expect(searchHelpTopics('REEMBOLSO').map((card) => card.title)).toContain(
    'Verificar o status do seu reembolso',
  );
  expect(searchHelpTopics('devolucao').length).toBeGreaterThan(0);

  renderHelp();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'xyzzy' } });
  expect(screen.getByText('Nenhum resultado para “xyzzy”')).toBeTruthy();
  expect(screen.queryByRole('tablist')).toBeNull();
});

it('builds recent products from orders: newest first, distinct, at most six', () => {
  const recent = recentProductsFromOrders([
    order('o1', '2026-01-01T12:00:00Z', [item('Kindle', 'DEMO-p3'), item('A')]),
    order(
      'o2',
      '2026-02-01T12:00:00Z',
      ['B', 'A', 'C', 'D', 'E', 'F', 'G'].map((n) => item(n)),
    ),
  ]);
  expect(recent.map((p) => p.name)).toEqual(['B', 'A', 'C', 'D', 'E', 'F']);
  expect(recent.every((p) => p.href === '/orders/o2')).toBe(true);
});

it('takes the photo from the order item SKU and leaves unknown SKUs without one', () => {
  const [kindle, other] = recentProductsFromOrders([
    order('o1', '2026-01-01T12:00:00Z', [item('Kindle', 'DEMO-p3'), item('Sem foto')]),
  ]);
  expect(kindle.image?.src).toBe('/images/products/kindle.jpg');
  expect(other.image).toBeUndefined();
  expect(formatOrderDate('2025-05-09T12:00:00Z')).toBe('9 de mai. de 2025');
});
