// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SellLanding } from '../src/features/sell/sell-landing';
import { FAQ, SELL_LINKS } from '../src/features/sell/sell-content';
import { AmazonHeader } from '../src/components/amazon/amazon-header';

vi.mock('server-only', () => ({}));
vi.mock('../src/config/feature-gate', () => ({ isFeatureEnabled: () => false }));
vi.mock('../src/features/auth/server-session', () => ({ getServerSession: async () => null }));
vi.mock('../src/features/cart/cart-header-link', () => ({ CartHeaderLink: () => null }));
vi.mock('../src/components/amazon/account-menu', () => ({ AccountMenu: () => null }));

afterEach(cleanup);

const renderLanding = () => render(createElement(SellLanding));

it('renders the sections in the order of the reference page', () => {
  renderLanding();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Venda até R$ 500 mil com comissão ZERO*',
  );
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
    'Precisa de mais motivos para vender online com a Amazon?',
    'Perguntas Frequentes',
    'Mensalidade GRÁTIS por 1 ano!',
  ]);
  expect(
    Array.from(document.querySelectorAll('.az-sell__stat-value')).map((el) => el.textContent),
  ).toEqual(['1,9M+', '300M+', '70%', '74%', '60%', '58%']);
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
    'Receba dinheiro ao completar tarefas',
    'Comece no FBA sem pagar nada por 30 dias',
    'Mais benefícios para CNPJs do estado de SP',
  ]);
});

it('sends both sign-up CTAs to seller registration and keeps the reference destinations', () => {
  renderLanding();
  const href = (name: string | RegExp) => screen.getByRole('link', { name }).getAttribute('href');
  expect(href('Comece a vender')).toBe(SELL_LINKS.signUp);
  expect(href('Cadastre-se')).toBe(SELL_LINKS.signUp);
  expect(SELL_LINKS.signUp).toMatch(/^https:\/\/sellercentral\.amazon\.com\.br\/.*Registration/);
  expect(href(/Conheça sua história/)).toBe(SELL_LINKS.story);
  expect(href(/Veja mais histórias de sucesso/)).toBe(SELL_LINKS.moreStories);
  expect(href('Consulte os Termos e Condições')).toBe(SELL_LINKS.terms);
  expect(
    screen.getAllByRole('link', { name: 'Saiba mais' }).map((link) => link.getAttribute('href')),
  ).toEqual([SELL_LINKS.rewards, SELL_LINKS.fba, SELL_LINKS.sellWithAmazon]);
  for (const link of screen.getAllByRole('link')) {
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  }
});

// Opening/closing is native <details> behaviour (jsdom doesn't implement it),
// so this pins the structure: one collapsed item per question, answer inside.
it('lists every FAQ question collapsed with its answer inside', () => {
  renderLanding();
  const items = Array.from(document.querySelectorAll('details'));
  expect(items.map((item) => item.querySelector('summary')?.textContent)).toEqual(
    FAQ.map((entry) => entry.question),
  );
  expect(items.every((item) => !item.open)).toBe(true);
  expect(within(items[2]).getByText(/R\$ 19,00/)).toBeTruthy();
  expect(
    within(items[2])
      .getByRole('link', { name: 'Mais informações sobre tarifas e preços.' })
      .getAttribute('href'),
  ).toBe(SELL_LINKS.sellingPlans);
});

it('marks "Venda na Amazon" as the current header item', async () => {
  render(await AmazonHeader({ currentHref: '/sell' }));
  const nav = screen.getByRole('navigation', { name: 'Categorias' });
  const current = nav.querySelectorAll('[aria-current="page"]');
  expect(current).toHaveLength(1);
  expect(current[0].textContent).toBe('Venda na Amazon');
});
