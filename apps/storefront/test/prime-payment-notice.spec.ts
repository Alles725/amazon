// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedPaymentCard } from '@amazon-mvp/api-contract';

const { refresh, client } = vi.hoisted(() => ({
  refresh: vi.fn(),
  client: { cards: vi.fn(), saveCard: vi.fn(), deleteCard: vi.fn() },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('../src/features/checkout/checkout-client', () => ({ checkoutClient: client }));

import { PrimePaymentNotice } from '../src/features/product/prime-payment-notice';
import { showPrimeNotice } from '../src/features/product/product-rules';

const card = (id: string, expYear: number): SavedPaymentCard => ({
  id,
  brand: 'VISA',
  last4: '4242',
  holderName: 'Ana Souza',
  expMonth: 1,
  expYear,
});
const BANNER = /Sua assinatura Prime está pausada/;
const renderNotice = () =>
  render(createElement(PrimePaymentNotice, { userId: 'user-1', userName: 'Ana Souza' }));

beforeEach(() => {
  refresh.mockReset();
  client.cards.mockReset().mockResolvedValue([]);
  client.saveCard.mockReset();
  client.deleteCard.mockReset();
  document.cookie = 'az_prime_notice_dismissed=; Max-Age=0; Path=/';
});
afterEach(cleanup);

describe('showPrimeNotice', () => {
  const now = new Date('2026-10-02T12:00:00Z');
  it('needs a non-expired card or a dismissal by this user to go away', () => {
    expect(showPrimeNotice(null, undefined, 'u', now)).toBe(true);
    expect(showPrimeNotice([], undefined, 'u', now)).toBe(true);
    expect(showPrimeNotice([card('a', 2025)], undefined, 'u', now)).toBe(true);
    expect(showPrimeNotice([card('a', 2025), card('b', 2027)], undefined, 'u', now)).toBe(false);
    expect(showPrimeNotice([], 'u', 'u', now)).toBe(false);
    expect(showPrimeNotice([], 'other', 'u', now)).toBe(true);
  });
});

describe('PrimePaymentNotice', () => {
  it('dismisses for this user only, remembered in a cookie', () => {
    renderNotice();
    fireEvent.click(screen.getByRole('button', { name: 'Dispensar aviso' }));
    expect(screen.queryByText(BANNER)).toBeNull();
    expect(document.cookie).toContain('az_prime_notice_dismissed=user-1');
  });

  it('saves a valid card through the checkout API and hides the banner', async () => {
    const saved = card('new', new Date().getFullYear() + 2);
    client.saveCard.mockResolvedValue(saved);
    renderNotice();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar meio de pagamento' }));
    const dialog = screen.getByRole('dialog', { name: 'Atualizar meio de pagamento' });
    const form = await within(dialog).findByRole('form', { name: 'Adicionar cartão' });
    expect(within(form).getByLabelText<HTMLInputElement>('Nome no cartão').value).toBe('Ana Souza');
    fireEvent.change(within(form).getByLabelText('Número do cartão'), {
      target: { value: '4111 1111 1111 1111' },
    });
    fireEvent.change(within(form).getByLabelText('Mês de validade'), { target: { value: '1' } });
    fireEvent.change(within(form).getByLabelText('Ano de validade'), {
      target: { value: String(saved.expYear) },
    });
    fireEvent.submit(form);
    await waitFor(() => expect(screen.queryByText(BANNER)).toBeNull());
    expect(client.saveCard).toHaveBeenCalledWith({
      brand: 'VISA',
      last4: '1111',
      holderName: 'Ana Souza',
      expMonth: 1,
      expYear: saved.expYear,
    });
    expect(refresh).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists saved cards and removes expired ones', async () => {
    client.cards.mockResolvedValue([card('old', 2020), card('ok', 2099)]);
    client.deleteCard.mockResolvedValue([card('ok', 2099)]);
    renderNotice();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar meio de pagamento' }));
    const list = await screen.findByRole('list', { name: 'Cartões salvos' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText(/Vencido/)).toBeTruthy();
    fireEvent.click(within(list).getByRole('button', { name: 'Remover Visa final 4242' }));
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(1));
    expect(client.deleteCard).toHaveBeenCalledWith('old');
    expect(screen.getByText(BANNER)).toBeTruthy();
  });

  it('closes the dialog with Escape and keeps the banner', async () => {
    renderNotice();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar meio de pagamento' }));
    await screen.findByRole('form', { name: 'Adicionar cartão' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(BANNER)).toBeTruthy();
  });
});
