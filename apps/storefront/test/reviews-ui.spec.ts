// @vitest-environment jsdom
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => createElement('img', props),
}));

import { CustomerReviews } from '../src/features/product/reviews/customer-reviews';
import type {
  CustomerReview,
  ProductReviews,
} from '../src/features/product/reviews/product-reviews';
import { ReviewFeedback } from '../src/features/product/reviews/review-interactions';
import { ReviewForm, validateReview } from '../src/features/product/reviews/review-form';

const fetchMock = vi.fn();
beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const reply = (status: number, body: unknown) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

const customerReview = (extra: Partial<CustomerReview> = {}): CustomerReview => ({
  id: 'r1',
  productId: 'uuid-p6',
  author: 'Camila S.',
  rating: 4,
  title: 'Muito bom',
  date: '2026-09-02',
  country: 'Brasil',
  variant: [],
  verified: false,
  body: 'Linha 1\nLinha 2',
  helpfulCount: 2,
  own: false,
  votedHelpful: false,
  ...extra,
});
const reviews = (extra: Partial<ProductReviews> = {}): ProductReviews => ({
  summary: { average: 4.3, count: 3, distribution: [67, 0, 0, 33, 0] },
  media: [],
  reviews: [customerReview()],
  total: 1,
  pageSize: 8,
  query: { sort: 'helpful', page: 1 },
  signedIn: true,
  hasOwnReview: false,
  unavailable: false,
  ...extra,
});
const renderSection = (data: ProductReviews, notice?: 'published' | 'updated') =>
  render(
    createElement(CustomerReviews, {
      reviews: data,
      writeReviewHref: '/products/p6/review',
      productPath: '/products/p6',
      loginHref: '/login?next=%2Fproducts%2Fp6',
      notice,
    }),
  );

describe('CustomerReviews', () => {
  it('shows the API summary with star-filter links and sort controls', () => {
    renderSection(reviews());
    expect(screen.getByText('4,3 de 5')).toBeTruthy();
    expect(screen.getByText('3 avaliações globais')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ver avaliações com 2 estrelas' }).getAttribute('href'),
    ).toBe('/products/p6?reviewStars=2#customer-reviews');
    const controls = screen.getByRole('navigation', { name: 'Organizar avaliações' });
    expect(
      within(controls).getByRole('link', { name: 'Mais recentes' }).getAttribute('href'),
    ).toBe('/products/p6?reviewSort=recent#customer-reviews');
    expect(
      within(controls).getByRole('link', { name: 'Mais úteis' }).getAttribute('aria-current'),
    ).toBe('true');
    expect(screen.getByText('2 pessoas acharam isso útil')).toBeTruthy();
    expect(screen.queryByText('Compra verificada')).toBeNull();
    expect(screen.queryByText('Fotos e vídeos de clientes')).toBeNull();
  });

  it('is honest for products without reviews: empty state and a write CTA', () => {
    renderSection(reviews({ summary: null, reviews: [], total: 0 }));
    expect(screen.getByText('Ainda não há avaliações de clientes para este produto.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByText(/de 5/)).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Escreva uma avaliação' }).getAttribute('href'),
    ).toBe('/products/p6/review');
  });

  it('keeps an active filter, paginates and offers editing the own review', () => {
    renderSection(
      reviews({
        query: { sort: 'recent', stars: 4, page: 2 },
        total: 20,
        hasOwnReview: true,
        reviews: [customerReview({ own: true, editHref: '/products/p6/review', verified: true })],
      }),
      'updated',
    );
    expect(screen.getByRole('status').textContent).toBe('Sua avaliação foi atualizada.');
    expect(screen.getByRole('heading', { name: 'Avaliações com 4 estrelas' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Remover o filtro de 4 estrelas' }).getAttribute('href'),
    ).toBe('/products/p6?reviewSort=recent#customer-reviews');
    const pages = screen.getByRole('navigation', { name: 'Páginas de avaliações' });
    expect(pages.textContent).toContain('Página 2 de 3');
    expect(within(pages).getByRole('link', { name: 'Próxima ›' }).getAttribute('href')).toBe(
      '/products/p6?reviewSort=recent&reviewStars=4&reviewPage=3#customer-reviews',
    );
    expect(screen.getAllByRole('link', { name: 'Editar sua avaliação' })).toHaveLength(2);
    expect(screen.getByText('Sua avaliação')).toBeTruthy();
    expect(screen.getByText('Compra verificada')).toBeTruthy();
    // Authors cannot vote their own review.
    expect(screen.queryByRole('button', { name: 'Útil' })).toBeNull();
  });

  it('says when the reviews service is unavailable instead of guessing', () => {
    renderSection(reviews({ summary: null, reviews: [], total: 0, unavailable: true }));
    expect(screen.getByText(/Não foi possível carregar as avaliações/)).toBeTruthy();
  });
});

describe('ReviewFeedback ("Útil")', () => {
  const renderFeedback = (extra: Record<string, unknown> = {}) =>
    render(
      createElement(ReviewFeedback, {
        reviewId: 'r1',
        helpfulCount: 2,
        votedHelpful: false,
        own: false,
        signedIn: true,
        loginHref: '/login?next=x',
        ...extra,
      }),
    );

  it('counts optimistically, then keeps the server count', async () => {
    let resolve!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    renderFeedback();
    fireEvent.click(screen.getByRole('button', { name: 'Útil' }));
    expect(screen.getByText('3 pessoas acharam isso útil')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Obrigado pelo seu feedback.');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/reviews/r1/helpful',
      expect.objectContaining({ method: 'PUT' }),
    );
    await act(async () => resolve(reply(200, { reviewId: 'r1', helpfulCount: 5, voted: true })));
    expect(screen.getByText('5 pessoas acharam isso útil')).toBeTruthy();
  });

  it('rolls back and explains when the vote fails', async () => {
    fetchMock.mockResolvedValue(reply(500, null));
    renderFeedback();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Útil' })));
    expect(screen.getByText('2 pessoas acharam isso útil')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível registrar/);
    expect(screen.getByRole('button', { name: 'Útil' })).toBeTruthy();
  });

  it('sends guests to sign in and never calls the API', () => {
    renderFeedback({ signedIn: false });
    fireEvent.click(screen.getByRole('button', { name: 'Útil' }));
    expect(push).toHaveBeenCalledWith('/login?next=x');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows an existing vote as already thanked', () => {
    renderFeedback({ votedHelpful: true });
    expect(screen.queryByRole('button', { name: 'Útil' })).toBeNull();
    expect(screen.getByText('Obrigado pelo seu feedback.')).toBeTruthy();
  });
});

describe('ReviewForm', () => {
  const renderForm = (initial?: { rating: number; title: string; body: string }) =>
    render(
      createElement(ReviewForm, {
        productId: 'uuid-p6',
        productHref: '/products/p6',
        loginHref: '/login?next=%2Fproducts%2Fp6%2Freview',
        initial,
      }),
    );

  it('validates like the API', () => {
    expect(validateReview({ rating: 0, title: ' a ', body: 'curto' })).toEqual({
      rating: expect.any(String),
      title: expect.any(String),
      body: expect.any(String),
    });
    expect(validateReview({ rating: 5, title: 'Bom', body: 'Dez letras' })).toEqual({});
  });

  it('uses a native radio group for the stars and blocks invalid submissions', () => {
    renderForm();
    const group = screen.getByRole('group', { name: 'Classificação geral' });
    const stars = within(group).getAllByRole('radio');
    expect(stars).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Selecione uma classificação por estrelas.')).toBeTruthy();
    expect(document.activeElement).toBe(stars[0]);
    expect(screen.getByLabelText('Adicione um título').getAttribute('aria-invalid')).toBe('true');
  });

  it('publishes a new review and returns to the product with feedback', async () => {
    fetchMock.mockResolvedValue(reply(200, {}));
    renderForm();
    fireEvent.click(screen.getByLabelText('4 estrelas: Gostei'));
    fireEvent.change(screen.getByLabelText('Adicione um título'), {
      target: { value: '  Muito bom  ' },
    });
    fireEvent.change(screen.getByLabelText('Adicione uma avaliação escrita'), {
      target: { value: 'Uso todos os dias no PC.' },
    });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Enviar' })));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/reviews/mine');
    expect(JSON.parse(init.body)).toEqual({
      productId: 'uuid-p6',
      rating: 4,
      title: 'Muito bom',
      body: 'Uso todos os dias no PC.',
    });
    expect(push).toHaveBeenCalledWith('/products/p6?review=published#customer-reviews');
  });

  it('prefills an existing review and sends expired sessions to sign in', async () => {
    fetchMock.mockResolvedValue(reply(401, null));
    renderForm({ rating: 2, title: 'Antigo', body: 'Texto antigo da avaliação.' });
    expect((screen.getByLabelText('2 estrelas: Não gostei') as HTMLInputElement).checked).toBe(
      true,
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' })),
    );
    expect(push).toHaveBeenCalledWith('/login?next=%2Fproducts%2Fp6%2Freview');
  });
});
