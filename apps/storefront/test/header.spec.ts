// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AmazonHeader } from '../src/components/amazon/amazon-header';
import { ALL_MENU_SECTIONS } from '../src/components/amazon/all-menu';

const { features } = vi.hoisted(() => ({ features: { browsingHistory: true } }));

vi.mock('server-only', () => ({}));
vi.mock('../src/config/feature-gate', () => ({
  isFeatureEnabled: (feature: string) => features[feature as keyof typeof features] ?? false,
}));
vi.mock('../src/features/auth/server-session', () => ({ getServerSession: async () => null }));
vi.mock('../src/features/cart/cart-header-link', () => ({ CartHeaderLink: () => null }));
vi.mock('../src/components/amazon/account-menu', () => ({ AccountMenu: () => null }));
vi.mock('../src/features/cart/cart-provider', () => ({ useCart: () => ({ cart: null }) }));

afterEach(() => {
  cleanup();
  features.browsingHistory = true;
});

const renderHeader = async () => render(await AmazonHeader());
const navbar = () => screen.getByRole('navigation', { name: 'Categorias' });
const openButton = () => within(navbar()).getByRole('button', { name: 'Todos' });

it('renders exactly the nine navbar items in order', async () => {
  await renderHeader();
  const items = Array.from(navbar().querySelectorAll('.az-navbar__link')).map((item) =>
    item.textContent?.trim(),
  );
  expect(items).toEqual([
    'Todos',
    'Venda na Amazon',
    'Atendimento ao cliente',
    'Comprar novamente',
    'Ofertas do dia',
    'Sua Amazon.com.br',
    'Alimentos e Bebidas',
    'Histórico de navegação',
    'Ideias de Presente',
  ]);
});

it('toggles the "Todos" menu and closes on outside click, close button and Escape', async () => {
  await renderHeader();
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(openButton());
  expect(openButton().getAttribute('aria-expanded')).toBe('true');
  const dialog = screen.getByRole('dialog', { name: 'Menu Todos' });
  fireEvent.click(dialog);
  expect(screen.queryByRole('dialog')).not.toBeNull();

  fireEvent.click(screen.getByTestId('az-all-menu-overlay'));
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(openButton());
  fireEvent.click(screen.getByRole('button', { name: 'Fechar menu' }));
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(openButton());
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(openButton());
  fireEvent.click(openButton());
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('lists every section and link of the "Todos" menu', async () => {
  await renderHeader();
  fireEvent.click(openButton());
  const dialog = screen.getByRole('dialog', { name: 'Menu Todos' });

  expect(within(dialog).getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
    'Destaques',
    'Conteúdo digital e dispositivos',
    'Comprar por categoria',
    'PROGRAMAS E RECURSOS',
    'AJUDA E CONFIGURAÇÕES',
  ]);
  const links = within(dialog).getAllByRole('link');
  expect(links.map((link) => link.textContent)).toEqual(
    ALL_MENU_SECTIONS.flatMap((section) => section.links.map((link) => link.label)),
  );
  expect(links.map((link) => link.getAttribute('href'))).toEqual(
    ALL_MENU_SECTIONS.flatMap((section) => section.links.map((link) => link.href)),
  );
  expect(within(dialog).getByRole('link', { name: 'Mais Vendidos' }).getAttribute('href')).toBe(
    'https://www.amazon.com.br/gp/bestsellers/?ref_=nav_em_cs_bestsellers_0_1_1_2',
  );
  expect(within(dialog).getByRole('link', { name: 'Sair' }).getAttribute('href')).toBe(
    'javascript:void(0)',
  );
});

it('shows the browsing history flyout trigger only when its feature is enabled', async () => {
  await renderHeader();
  expect(
    within(navbar()).getByRole('button', { name: 'Histórico de navegação' }),
  ).toBeTruthy();
  cleanup();

  features.browsingHistory = false;
  await renderHeader();
  expect(within(navbar()).queryByRole('button', { name: 'Histórico de navegação' })).toBeNull();
  expect(
    within(navbar()).getByRole('link', { name: 'Histórico de navegação' }).getAttribute('href'),
  ).toBe('/products');
});
