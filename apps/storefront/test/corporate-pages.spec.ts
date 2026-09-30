// @vitest-environment jsdom
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, type ComponentType } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { FeatureRegistry, readYamlFile } from '@amazon-mvp/config-schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CorporateBody } from '../src/features/corporate/corporate-body';
import { CORPORATE_PAGES, getCorporatePage } from '../src/features/corporate/corporate-content';
import { ICONS } from '../src/features/corporate/corporate-icons';
import { CORPORATE_GROUPS, CORPORATE_ROUTES } from '../src/features/corporate/corporate-routes';
import type { CorporateAction, CorporatePage } from '../src/features/corporate/corporate-types';

const REPO_FEATURES = join(process.cwd(), '..', '..', 'config', 'features.yaml');
const APP_DIR = join(process.cwd(), 'src', 'app');
const loadShipped = () => FeatureRegistry.fromConfig(readYamlFile(REPO_FEATURES));

// The page modules resolve flags through the real registry (config/features.yaml),
// swapped per test when a disabled flag must be simulated.
const flags = vi.hoisted(() => ({ registry: null as null | { routeState(key: string): string; isEnabled(feature: string): boolean } }));

vi.mock('server-only', () => ({}));
vi.mock('next/font/local', () => ({ default: () => ({ variable: 'font-corp', className: '' }) }));
vi.mock('../src/components/amazon/amazon-header', () => ({ AmazonHeader: () => null }));
vi.mock('../src/config/storefront-config', () => ({ getFeatureRegistry: () => flags.registry }));

beforeEach(() => {
  flags.registry = loadShipped();
});
afterEach(cleanup);

const ROUTE_DIRS: Record<string, string> = {
  about: 'about',
  corporateInformation: 'corporate-information',
  careers: 'careers',
  press: 'press',
  community: 'community',
  accessibility: 'accessibility',
  amazonScience: 'amazon-science',
  brandProtection: 'brand-protection',
  supply: 'supply',
  publish: 'publish',
  associates: 'associates',
  advertise: 'advertise',
};

const FOOTER_ORDER = Object.keys(ROUTE_DIRS);

const loadPage = async (key: string) =>
  (await import(`../src/app/${ROUTE_DIRS[key]}/page.tsx`)) as {
    default: ComponentType;
    generateMetadata: () => { title?: string; description?: string };
  };

function actionsOf(page: CorporatePage): CorporateAction[] {
  const actions: CorporateAction[] = [...(page.hero.actions ?? [])];
  for (const block of page.blocks) {
    if (block.kind === 'cta') actions.push(...block.actions);
    if ((block.kind === 'split' || block.kind === 'notice') && block.action) actions.push(block.action);
    if (block.kind === 'cards') for (const card of block.cards) if (card.action) actions.push(card.action);
  }
  return actions;
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('corporate content data', () => {
  it('covers the twelve footer destinations, in footer order', () => {
    expect(CORPORATE_PAGES.map((page) => page.key)).toEqual(FOOTER_ORDER);
    expect(CORPORATE_ROUTES).toEqual(CORPORATE_PAGES.map((page) => page.href));
    for (const page of CORPORATE_PAGES) {
      expect(page.href).toBe(`/${ROUTE_DIRS[page.key]}`);
      const link = CORPORATE_GROUPS.flatMap((group) => group.links).find((l) => l.pageKey === page.key);
      expect(link?.href).toBe(page.href);
      expect(CORPORATE_GROUPS.find((group) => group.id === page.group)?.links).toContain(link);
    }
  });

  it('ships every page enabled behind its own flag', () => {
    const registry = loadShipped();
    for (const page of CORPORATE_PAGES) {
      expect(registry.isEnabled(page.key)).toBe(true);
      expect(registry.routeState(page.key)).toBe('enabled');
    }
  });

  it('gives every page metadata-ready copy and unique section ids', () => {
    for (const page of CORPORATE_PAGES) {
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.description.length).toBeLessThanOrEqual(160);
      expect(page.blocks.length).toBeGreaterThanOrEqual(4);
      const ids = page.blocks.map((block) => block.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
      expect(ids).not.toContain('az-corp-title');
    }
  });

  it('only links to routes of this store or to sections of the same page', () => {
    for (const page of CORPORATE_PAGES) {
      const ids = page.blocks.map((block) => block.id);
      for (const action of actionsOf(page)) {
        expect(action.label.trim()).not.toBe('');
        if (action.href.startsWith('#')) {
          expect(ids).toContain(action.href.slice(1));
          continue;
        }
        expect(action.href).toMatch(/^\/[a-z-]*$/);
        if (action.href !== '/') expect(existsSync(join(APP_DIR, action.href.slice(1)))).toBe(true);
      }
    }
  });

  it('references only icons that exist', () => {
    for (const page of CORPORATE_PAGES) {
      const icons = [
        page.hero.icon,
        ...page.blocks.flatMap((block) =>
          block.kind === 'split' ? [block.icon] : block.kind === 'cards' ? block.cards.map((c) => c.icon) : [],
        ),
      ];
      for (const icon of icons) expect(Object.keys(ICONS)).toContain(icon);
    }
  });

  // Academic project: no invented statistics, money, years or external URLs.
  it('does not present figures, dates or external links as facts', () => {
    for (const page of CORPORATE_PAGES) {
      for (const text of strings(page)) {
        expect(text).not.toMatch(/\d\s*%|R\$|\b(19|20)\d{2}\b|https?:|www\.|@/);
        expect(text).not.toMatch(/\b\d{1,3}([.,]\d{3})+\b|\bmil(hões|hão)?\b|\bbilh/);
      }
    }
  });

  it('uses honest notices where the real pages list records', () => {
    const notice = (key: Parameters<typeof getCorporatePage>[0]) =>
      getCorporatePage(key).blocks.find((block) => block.kind === 'notice');
    expect(notice('press')).toMatchObject({ message: 'Nenhum comunicado publicado nesta loja acadêmica.' });
    expect(notice('careers')).toMatchObject({ message: 'Não há vagas abertas nesta demonstração.' });
    for (const key of ['corporateInformation', 'community', 'amazonScience', 'supply', 'publish', 'associates', 'advertise'] as const) {
      expect(notice(key)).toBeDefined();
    }
  });
});

describe('corporate page template', () => {
  it.each(CORPORATE_PAGES.map((page) => [page.key, page] as const))(
    'renders %s with one h1, its sections and the group navigation',
    (_key, page) => {
      render(createElement(CorporateBody, { page }));

      const h1s = screen.getAllByRole('heading', { level: 1 });
      expect(h1s.map((h) => h.textContent)).toEqual([page.hero.title]);
      expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(
        page.blocks.map((block) => block.title),
      );
      expect(screen.getByRole('main')).toBeTruthy();

      const group = CORPORATE_GROUPS.find((g) => g.id === page.group)!;
      const nav = screen.getByRole('navigation', { name: group.label });
      const current = nav.querySelectorAll('[aria-current="page"]');
      expect(current).toHaveLength(1);
      expect(current[0].getAttribute('href')).toBe(page.href);
      expect(within(nav).getAllByRole('link')).toHaveLength(group.links.length);

      const faqs = page.blocks.flatMap((block) => (block.kind === 'faq' ? block.items : []));
      const details = Array.from(document.querySelectorAll('details'));
      expect(details.map((item) => item.querySelector('summary')?.textContent)).toEqual(
        faqs.map((item) => item.question),
      );
      expect(details.every((item) => !item.open)).toBe(true);

      for (const block of page.blocks) {
        if (block.kind === 'notice') expect(screen.getByText(block.message)).toBeTruthy();
        if (block.kind === 'cards') {
          for (const card of block.cards) {
            expect(screen.getAllByRole('heading', { level: 3, name: card.title }).length).toBeGreaterThan(0);
          }
        }
      }

      for (const link of screen.getAllByRole('link')) {
        const href = link.getAttribute('href') ?? '';
        expect(href.startsWith('/') || href.startsWith('#')).toBe(true);
      }
      expect(document.body.textContent).toContain('projeto acadêmico');
    },
  );

  it('renders the comparison as an accessible table', () => {
    render(createElement(CorporateBody, { page: getCorporatePage('supply') }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Fornecedor (1P)',
      'Vendedor parceiro (3P)',
    ]);
    expect(within(table).getAllByRole('rowheader')).toHaveLength(5);
  });
});

describe('corporate routes', () => {
  it.each(FOOTER_ORDER)('%s renders the finished page, never Coming Soon', async (key) => {
    const { default: Page, generateMetadata } = await loadPage(key);
    const page = getCorporatePage(key as CorporatePage['key']);
    render(createElement(Page));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(page.hero.title);
    expect(document.body.textContent).not.toMatch(/Not built yet|Feature disabled|Conteúdo em construção/);
    expect(screen.getByRole('contentinfo')).toBeTruthy(); // Amazon footer
    expect(generateMetadata()).toMatchObject({
      title: `${page.title} | Amazon.com.br`,
      description: page.description,
    });
  });

  it('falls back to Coming Soon when a page flag is switched off', async () => {
    const shipped = loadShipped();
    flags.registry = {
      isEnabled: (feature) => feature !== 'press' && shipped.isEnabled(feature),
      routeState: (key) => (key === 'press' ? 'coming-soon' : shipped.routeState(key)),
    };
    const { default: Page, generateMetadata } = await loadPage('press');
    render(createElement(Page));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Comunicados à imprensa');
    expect(screen.getByText('Not built yet')).toBeTruthy();
    expect(screen.queryByRole('contentinfo')).toBeNull();
    expect(generateMetadata()).toEqual({});
  });
});
