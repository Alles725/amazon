// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountAddress, CatalogItem, UserProfile } from '@amazon-mvp/api-contract';

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock('../src/features/account/account-client', async (original) => ({
  ...(await original<typeof import('../src/features/account/account-client')>()),
  accountClient: {
    addresses: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
    updateAddress: vi.fn(),
    changePassword: vi.fn(),
    changeEmail: vi.fn(),
    updateName: vi.fn(),
    lists: vi.fn(),
    addToList: vi.fn(),
  },
}));

import { accountClient, AccountRequestError } from '../src/features/account/account-client';
import { listHref, stockLabel } from '../src/features/account/account-presentation';
import { AddressesManager } from '../src/features/account/addresses-manager';
import { AddToList } from '../src/features/account/add-to-list';
import { SecuritySettings } from '../src/features/account/security-settings';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const product = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  id: 'p',
  sku: 'sku',
  slug: 'p',
  name: 'Produto',
  description: null,
  priceMinor: 1000,
  currency: 'BRL',
  active: true,
  availableQuantity: 10,
  inStock: true,
  ...overrides,
});

describe('account presentation', () => {
  it('describes stock the same way as the product page', () => {
    expect(stockLabel(product()).text).toBe('Em estoque');
    expect(stockLabel(product({ availableQuantity: 3 })).text).toBe('Apenas 3 em estoque');
    expect(stockLabel(product({ inStock: false, availableQuantity: 0 })).text).toBe(
      'Fora de estoque',
    );
    expect(stockLabel(product({ active: false })).text).toBe('Indisponível no momento');
  });

  it('builds list links', () => {
    expect(listHref('a b')).toBe('/lists?list=a%20b');
  });
});

const address = (
  id: string,
  isDefault: boolean,
  extra: Partial<AccountAddress> = {},
): AccountAddress => ({
  id,
  recipient: `Pessoa ${id}`,
  postalCode: '90020060',
  street: `Rua ${id}`,
  number: '1',
  neighborhood: 'Centro',
  city: 'Porto Alegre',
  state: 'RS',
  isDefault,
  ...extra,
});

describe('AddressesManager', () => {
  it('marks the default and only offers "Definir como padrão" on the others', () => {
    render(
      createElement(AddressesManager, {
        initial: [address('a', true), address('b', false)],
        name: 'Ada',
      }),
    );
    expect(screen.getByText('Endereço padrão:')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Definir como padrão/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Adicionar endereço' })).toBeTruthy();
  });

  it('asks for confirmation before removing and shows the server result', async () => {
    vi.mocked(accountClient.deleteAddress).mockResolvedValue([address('b', true)]);
    render(
      createElement(AddressesManager, {
        initial: [address('a', true), address('b', false)],
        name: 'Ada',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Excluir endereço de Pessoa a/ }));
    expect(accountClient.deleteAddress).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));
    await waitFor(() => expect(screen.getByText('Endereço excluído.')).toBeTruthy());
    expect(accountClient.deleteAddress).toHaveBeenCalledWith('a');
    expect(screen.queryByText('Pessoa a')).toBeNull();
  });

  it('prints the address the Amazon way, with phone only when saved', () => {
    render(
      createElement(AddressesManager, {
        initial: [
          address('a', true, { complement: 'ap 710', phone: '54996704398' }),
          address('b', false),
        ],
        name: 'Ada',
      }),
    );
    const cards = document.querySelectorAll('address');
    expect(cards[0].textContent).toContain('Rua a 1');
    expect(cards[0].textContent).toContain('ap 710 Centro');
    expect(cards[0].textContent).toContain('Porto Alegre, RS 90020060');
    expect(cards[0].textContent).toContain('Telefone: +5554996704398');
    expect(cards[1].textContent).not.toContain('Telefone');
  });

  it('saves delivery instructions with the rest of the address', async () => {
    const original = address('a', true, { phone: '54996704398' });
    vi.mocked(accountClient.updateAddress).mockResolvedValue({
      ...original,
      deliveryInstructions: 'Deixar com o porteiro',
    });
    render(createElement(AddressesManager, { initial: [original], name: 'Ada' }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar instruções de entrega/ }));
    fireEvent.change(screen.getByLabelText('Instruções de entrega'), {
      target: { value: '  Deixar com o porteiro ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.getByText('Instruções de entrega salvas.')).toBeTruthy());
    const { id: _id, isDefault: _isDefault, ...input } = original;
    expect(accountClient.updateAddress).toHaveBeenCalledWith('a', {
      ...input,
      deliveryInstructions: 'Deixar com o porteiro',
    });
    expect(screen.getByText('Deixar com o porteiro')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Editar instruções de entrega/ })).toBeTruthy();
  });

  it('keeps the instructions draft open when saving fails', async () => {
    vi.mocked(accountClient.updateAddress).mockRejectedValue(new Error('Falhou.'));
    render(createElement(AddressesManager, { initial: [address('a', true)], name: 'Ada' }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar instruções de entrega/ }));
    fireEvent.change(screen.getByLabelText('Instruções de entrega'), {
      target: { value: 'Portão azul' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Falhou.'));
    expect((screen.getByLabelText('Instruções de entrega') as HTMLTextAreaElement).value).toBe(
      'Portão azul',
    );
  });
});

describe('SecuritySettings', () => {
  const user: UserProfile = {
    id: 'u',
    email: 'ada@example.com',
    displayName: 'Ada',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  it('never shows the password and validates the confirmation locally', () => {
    render(createElement(SecuritySettings, { user }));
    expect(screen.getByText('********')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    fill('Senha atual', 'current password 1');
    fill('Nova senha', 'new password 12345');
    fill('Digite a nova senha novamente', 'different password');
    fireEvent.submit(screen.getByRole('form', { name: 'Alterar sua senha' }));
    expect(screen.getByRole('alert').textContent).toContain('não coincidem');
    expect(accountClient.changePassword).not.toHaveBeenCalled();
  });

  it('reports a wrong current password without signing the user out', async () => {
    vi.mocked(accountClient.changePassword).mockRejectedValue(
      new AccountRequestError('Sua senha atual está incorreta.', 403, 'AUTH_INVALID_CREDENTIALS'),
    );
    render(createElement(SecuritySettings, { user }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    fill('Senha atual', 'wrong password 12');
    fill('Nova senha', 'new password 12345');
    fill('Digite a nova senha novamente', 'new password 12345');
    fireEvent.submit(screen.getByRole('form', { name: 'Alterar sua senha' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Sua senha atual está incorreta.'),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('reports how many other sessions were ended', async () => {
    vi.mocked(accountClient.changePassword).mockResolvedValue({
      success: true,
      revokedSessions: 2,
    });
    render(createElement(SecuritySettings, { user }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    fill('Senha atual', 'current password 1');
    fill('Nova senha', 'new password 12345');
    fill('Digite a nova senha novamente', 'new password 12345');
    fireEvent.submit(screen.getByRole('form', { name: 'Alterar sua senha' }));
    await waitFor(() =>
      expect(screen.getByText(/2 outras sessões foram encerradas/)).toBeTruthy(),
    );
  });
});

describe('AddToList', () => {
  it('sends guests to login instead of calling the API', () => {
    render(createElement(AddToList, { productId: 'p', signedIn: false, loginHref: '/login?next=x' }));
    expect(screen.getByRole('link', { name: 'Adicionar à lista' }).getAttribute('href')).toBe(
      '/login?next=x',
    );
    expect(accountClient.lists).not.toHaveBeenCalled();
  });

  it('adds to the default list and links to it', async () => {
    vi.mocked(accountClient.lists).mockResolvedValue([
      { id: 'other', name: 'Outra', isDefault: false, itemCount: 0, createdAt: '' },
      { id: 'wish', name: 'Lista de desejos', isDefault: true, itemCount: 0, createdAt: '' },
    ]);
    vi.mocked(accountClient.addToList).mockResolvedValue({} as never);
    render(createElement(AddToList, { productId: 'p', signedIn: true, loginHref: '/login' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Ver sua lista' }).getAttribute('href')).toBe(
        '/lists?list=wish',
      ),
    );
    expect(accountClient.addToList).toHaveBeenCalledWith('wish', 'p');
  });
});
