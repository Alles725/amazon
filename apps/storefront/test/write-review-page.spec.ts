// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
vi.mock('next/headers', () => ({ cookies: () => ({ toString: () => 'amzmvp_sid=x' }) }));
const { flags, session, redirect, notFound } = vi.hoisted(() => ({
  flags: {} as Record<string, boolean>,
  session: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT ${to}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('next/navigation', () => ({
  redirect,
  notFound,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => createElement('img', props),
}));
vi.mock('../src/config/feature-gate', () => ({
  isFeatureEnabled: (feature: string) => flags[feature] ?? false,
  FeatureRoute: ({ title }: { title: string }) => createElement('p', null, `coming soon: ${title}`),
}));
vi.mock('../src/config/storefront-config', () => ({
  getConfig: () => ({ api: { internalBaseUrl: 'http://api', publicBasePath: '/api/v1' } }),
}));
vi.mock('../src/features/auth/server-session', () => ({ getServerSession: () => session() }));

import WriteReviewPage from '../src/app/products/[productId]/review/page';

let own: { status: number; body: unknown };
beforeEach(() => {
  flags.productReviews = true;
  session.mockReset().mockResolvedValue({ user: { id: 'u' } });
  own = { status: 200, body: { review: null, verifiedPurchase: false } };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const json = (body: unknown, status = 200) =>
        ({ ok: status < 400, status, json: async () => body }) as Response;
      if (url.includes('/reviews/mine')) return json(own.body, own.status);
      if (url.endsWith('/catalog/products/p6'))
        return json({
          id: 'uuid-p6',
          slug: 'p6',
          sku: 'DEMO-p6',
          name: '8BitDo Ultimate 2C',
          description: null,
          priceMinor: 20520,
          currency: 'BRL',
          active: true,
          availableQuantity: 3,
          inStock: true,
          categories: [],
          categoryPath: [],
        });
      return json({ error: {} }, 404);
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderPage = async (productId = 'p6') =>
  render(await WriteReviewPage({ params: { productId } }));

describe('write-review page', () => {
  it('creates a review with the product thumbnail and name', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Criar avaliação');
    expect(screen.getByRole('link', { name: '8BitDo Ultimate 2C' }).getAttribute('href')).toBe(
      '/products/p6',
    );
    expect(screen.getByRole('img')).toBeTruthy();
    expect(screen.queryByText(/Compra verificada/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('edits the existing review and announces the verified purchase', async () => {
    own.body = {
      review: { id: 'r1', rating: 3, title: 'Razoável', body: 'Texto anterior aqui.' },
      verifiedPurchase: true,
    };
    await renderPage();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Editar avaliação');
    expect((screen.getByLabelText('Adicione um título') as HTMLInputElement).value).toBe(
      'Razoável',
    );
    expect(screen.getByText('Compra verificada')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeTruthy();
  });

  it('sends guests to sign in and back to this page', async () => {
    session.mockResolvedValue(null);
    await expect(renderPage()).rejects.toThrow(
      'REDIRECT /login?next=%2Fproducts%2Fp6%2Freview',
    );
  });

  it('404s unknown products and respects the feature flag', async () => {
    await expect(renderPage('nope')).rejects.toThrow('NEXT_NOT_FOUND');
    flags.productReviews = false;
    await renderPage();
    expect(screen.getByText('coming soon: Escreva uma avaliação')).toBeTruthy();
  });
});
