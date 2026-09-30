// @vitest-environment jsdom
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { OrderResponse } from '@amazon-mvp/api-contract';
import { CustomerArticle } from '../src/features/customer-pages/customer-article';
import { InstallmentExample } from '../src/features/customer-pages/customer-blocks';
import {
  CUSTOMER_PAGES,
  CUSTOMER_PAGE_ORDER,
  ContentBlock,
  CustomerPage,
  RichText,
  customerPageMetadata,
} from '../src/features/customer-pages/customer-page-content';
import {
  PaymentTransactions,
  TRANSACTIONS_LIMIT,
} from '../src/features/customer-pages/payment-transactions';

afterEach(cleanup);

const PAGES = CUSTOMER_PAGE_ORDER.map((key) => CUSTOMER_PAGES[key]);
const APP = join(process.cwd(), 'src', 'app');

const richText = (text: RichText): string =>
  typeof text === 'string'
    ? text
    : text.map((part) => (typeof part === 'string' ? part : part.text)).join('');
const richLinks = (text: RichText): string[] =>
  typeof text === 'string'
    ? []
    : text.flatMap((part) => (typeof part === 'string' ? [] : [part.href]));

function blockTexts(block: ContentBlock): { text: string[]; hrefs: string[] } {
  switch (block.kind) {
    case 'text':
      return { text: block.paragraphs.map(richText), hrefs: block.paragraphs.flatMap(richLinks) };
    case 'list':
      return { text: block.items.map(richText), hrefs: block.items.flatMap(richLinks) };
    case 'steps':
      return {
        text: block.items.flatMap((s) => [s.title, richText(s.body)]),
        hrefs: block.items.flatMap((s) => richLinks(s.body)),
      };
    case 'facts':
      return {
        text: block.items.flatMap((f) => [f.term, richText(f.detail)]),
        hrefs: block.items.flatMap((f) => richLinks(f.detail)),
      };
    case 'methods':
      return {
        text: block.items.flatMap((m) => [m.title, m.label, ...m.points.map(richText)]),
        hrefs: block.items.flatMap((m) => m.points.flatMap(richLinks)),
      };
    case 'links':
      return {
        text: block.items.flatMap((l) => [l.title, l.body]),
        hrefs: block.items.map((l) => l.href),
      };
    case 'faq':
      return {
        text: block.items.flatMap((q) => [q.question, ...q.answer.map(richText)]),
        hrefs: block.items.flatMap((q) => q.answer.flatMap(richLinks)),
      };
    case 'empty':
      return { text: [block.title, block.body], hrefs: [] };
    default:
      return { text: [], hrefs: [] };
  }
}

function pageTexts(page: CustomerPage) {
  const parts = page.sections.flatMap((s) => s.blocks.map(blockTexts));
  const notice = page.notice ? [page.notice.title, richText(page.notice.body)] : [];
  return {
    text: [page.title, page.lead, page.summary, ...notice, ...parts.flatMap((p) => p.text)].join(
      '\n',
    ),
    hrefs: [
      page.href,
      ...parts.flatMap((p) => p.hrefs),
      ...(page.notice ? richLinks(page.notice.body) : []),
    ],
  };
}

describe('footer help/payment pages content', () => {
  it('covers the seven footer destinations with the footer routes', () => {
    expect(PAGES.map((p) => p.href)).toEqual([
      '/payment-methods',
      '/points',
      '/credit-card',
      '/shipping',
      '/returns',
      '/content-and-devices',
      '/recalls',
    ]);
    for (const page of PAGES) expect(CUSTOMER_PAGES[page.key]).toBe(page);
  });

  it('gives every page an "X | Amazon.com.br" title', () => {
    expect(customerPageMetadata('shipping').title).toBe('Frete e prazo de entrega | Amazon.com.br');
    for (const page of PAGES) {
      expect(customerPageMetadata(page.key)).toEqual({
        title: `${page.title} | Amazon.com.br`,
        description: page.lead,
      });
    }
  });

  it('only links to routes that exist in the storefront, never to external sites', () => {
    for (const page of PAGES) {
      const { hrefs } = pageTexts(page);
      for (const href of hrefs) {
        expect(href, `${page.key}: ${href}`).toMatch(/^\/[a-z-]*$/);
        const file = href === '/' ? join(APP, 'page.tsx') : join(APP, href.slice(1), 'page.tsx');
        expect(existsSync(file), `${page.key}: ${href}`).toBe(true);
      }
    }
  });

  it('does not invent numbers, companies, contacts or external links', () => {
    for (const page of PAGES) {
      const { text } = pageTexts(page);
      expect(text, page.key).not.toMatch(/https?:\/\/|www\.|CNPJ|0800|\(\d{2}\)\s?\d|\d+\s?%/i);
    }
  });

  it('is honest about what this academic store does not offer', () => {
    const text = (key: keyof typeof CUSTOMER_PAGES) => pageTexts(CUSTOMER_PAGES[key]).text;
    expect(text('paymentMethods')).toContain('Cartão fictício · Visa final 4242');
    expect(text('paymentMethods')).toContain('Pix simulado');
    expect(text('paymentMethods')).toMatch(/nenhuma forma de pagamento gera cobrança real/);
    expect(text('shipping')).toContain('R$ 0,00');
    expect(text('shipping')).toMatch(/não calcula nem promete uma data de entrega/);
    expect(text('returns')).toContain('Devoluções não podem ser solicitadas online nesta loja');
    expect(text('points')).toContain('Indisponível nesta loja acadêmica');
    expect(text('creditCard')).toContain('Não é possível solicitar cartão aqui');
    expect(text('contentAndDevices')).toContain('Área não disponível nesta loja');
    expect(text('recalls')).toContain('Não há recalls ativos para produtos desta loja');
  });

  it('keeps section ids unique so the "Nesta página" anchors work', () => {
    for (const page of PAGES) {
      const ids = page.sections.map((s) => s.id);
      expect(new Set(ids).size, page.key).toBe(ids.length);
    }
  });
});

describe('CustomerArticle', () => {
  it('renders title, breadcrumb, sections and the anchors to them', () => {
    const page = CUSTOMER_PAGES.shipping;
    render(createElement(CustomerArticle, { page }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(page.title);
    const crumbs = screen.getByRole('navigation', { name: 'Trilha de navegação' });
    expect(
      within(crumbs).getByRole('link', { name: 'Atendimento ao Cliente' }).getAttribute('href'),
    ).toBe('/help');
    expect(crumbs.textContent).toContain('Envios e entregas');

    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual([
      ...page.sections.map((s) => s.title),
      'Tópicos relacionados',
      'Mais tópicos de ajuda',
    ]);
    const toc = screen.getByRole('navigation', { name: 'Nesta página' });
    expect(
      within(toc)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual(page.sections.map((s) => `#${s.id}`));
    for (const section of page.sections) expect(document.getElementById(section.id)).not.toBeNull();
    expect(screen.getByRole('table', { name: 'Status exibidos em Seus pedidos' })).toBeTruthy();
  });

  it('marks the current page in the sidebar and lists all seven pages', () => {
    render(createElement(CustomerArticle, { page: CUSTOMER_PAGES.returns }));
    const aside = screen.getByRole('complementary', { name: 'Mais tópicos de ajuda' });
    const links = within(aside).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      ...PAGES.map((p) => p.href),
      '/help',
    ]);
    expect(
      within(aside)
        .getByRole('link', { name: 'Devoluções e reembolsos' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      within(aside)
        .getByRole('link', { name: 'Frete e prazo de entrega' })
        .getAttribute('aria-current'),
    ).toBeNull();
  });

  it('shows the honest notice and keyboard-friendly FAQ accordions', () => {
    render(createElement(CustomerArticle, { page: CUSTOMER_PAGES.returns }));
    expect(screen.getByRole('note', { name: CUSTOMER_PAGES.returns.notice!.title })).toBeTruthy();
    const summaries = document.querySelectorAll('details > summary');
    expect(summaries.length).toBeGreaterThan(0);
    expect(summaries[0].textContent).toBe('Recebi um produto com defeito. O que faço?');
  });

  it('renders the recall empty state instead of fake records', () => {
    render(createElement(CustomerArticle, { page: CUSTOMER_PAGES.recalls }));
    expect(screen.getByRole('status').textContent).toContain(
      'Não há recalls ativos para produtos desta loja',
    );
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('fills the transactions slot on the payment page', () => {
    render(
      createElement(CustomerArticle, {
        page: CUSTOMER_PAGES.paymentMethods,
        slots: { transactions: createElement('p', null, 'slot-content') },
      }),
    );
    const section = document.getElementById('transacoes')!;
    expect(section.textContent).toContain('slot-content');
    expect(screen.getByRole('heading', { level: 3, name: 'Cartão de crédito' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Pix' })).toBeTruthy();
  });
});

describe('InstallmentExample', () => {
  it('uses the product page rule: floor per installment, last one absorbs the rest', () => {
    render(createElement(InstallmentExample, { totalMinor: 100000, count: 6 }));
    const table = screen.getByRole('table');
    const text = table.textContent!.replace(/\s/g, ' ');
    expect(text).toContain('Parcelas 1 a 5');
    expect(text).toContain('R$ 166,66 cada');
    expect(text).toContain('Parcela 6');
    expect(text).toContain('R$ 166,70');
    expect(text).toContain('R$ 1.000,00');
  });
});

describe('PaymentTransactions', () => {
  const order = (n: number, placedAt: string, extra: Partial<OrderResponse> = {}) =>
    ({
      id: `id-${n}`,
      orderNumber: `000-${n}`,
      placedAt,
      totalMinor: n * 1000,
      currency: 'BRL',
      paymentMethod: 'SIMULATED_PIX',
      ...extra,
    }) as OrderResponse;

  it('asks signed-out visitors to log in and come back', () => {
    render(createElement(PaymentTransactions, { signedIn: false, orders: null }));
    expect(screen.getByRole('link', { name: 'Fazer login' }).getAttribute('href')).toBe(
      '/login?next=%2Fpayment-methods',
    );
  });

  it('reports an unavailable orders API instead of showing nothing', () => {
    render(createElement(PaymentTransactions, { signedIn: true, orders: null }));
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível carregar');
  });

  it('shows an empty message when there are no orders', () => {
    render(createElement(PaymentTransactions, { signedIn: true, orders: [] }));
    expect(screen.getByText(/Você ainda não fez pedidos/)).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('lists the most recent orders with their payment method and total', () => {
    const orders = [
      order(1, '2026-01-01T12:00:00Z', { paymentMethod: 'SIMULATED_CARD' }),
      ...[2, 3, 4, 5, 6].map((n) => order(n, `2026-0${n}-01T12:00:00Z`)),
      order(7, '2025-12-01T12:00:00Z', { paymentMethod: null }),
    ];
    render(createElement(PaymentTransactions, { signedIn: true, orders }));
    const items = within(screen.getByRole('list', { name: 'Transações recentes' })).getAllByRole(
      'listitem',
    );
    expect(items).toHaveLength(TRANSACTIONS_LIMIT);
    expect(items[0].textContent).toContain('Pedido nº 000-6');
    expect(items[0].textContent).toContain('Pix simulado');
    expect(items[0].textContent!.replace(/\s/g, ' ')).toContain('R$ 60,00');
    expect(items[0].querySelector('a')?.getAttribute('href')).toBe('/orders/id-6');
    expect(items.at(-1)!.textContent).toContain('Pedido nº 000-2');
    expect(screen.getByRole('link', { name: 'Ver todos os pedidos' }).getAttribute('href')).toBe(
      '/orders',
    );
  });

  it('labels the simulated card exactly like the checkout', () => {
    render(
      createElement(PaymentTransactions, {
        signedIn: true,
        orders: [order(1, '2026-01-01T12:00:00Z', { paymentMethod: 'SIMULATED_CARD' })],
      }),
    );
    expect(screen.getByText('Cartão fictício · Visa final 4242')).toBeTruthy();
  });
});

describe('page files', () => {
  const ROUTES: Record<string, string> = {
    'payment-methods': 'paymentMethods',
    points: 'points',
    'credit-card': 'creditCard',
    shipping: 'shipping',
    returns: 'returns',
    'content-and-devices': 'contentAndDevices',
    recalls: 'recalls',
  };

  it('keeps every page behind its own feature route and drops the placeholder', () => {
    for (const [dir, key] of Object.entries(ROUTES)) {
      const source = readFileSync(join(APP, dir, 'page.tsx'), 'utf8');
      expect(source, dir).toContain(`routeKey="${key}"`);
      expect(source, dir).toContain(`customerPageMetadata('${key}')`);
      expect(source, dir).not.toContain('Conteúdo em construção');
    }
  });
});
