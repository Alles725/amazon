// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountAddress } from '@amazon-mvp/api-contract';
import { AmazonHeader } from '../src/components/amazon/amazon-header';
import { ALL_MENU_SECTIONS } from '../src/components/amazon/all-menu';

const { features, auth, fetchAddresses } = vi.hoisted(() => ({
  features: { browsingHistory: true, catalog: false, addresses: true } as Record<string, boolean>,
  auth: { session: null as null | { user: { displayName: string } } },
  fetchAddresses: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('../src/config/feature-gate', () => ({
  isFeatureEnabled: (feature: string) => features[feature] ?? false,
}));
vi.mock('../src/features/auth/server-session', () => ({
  getServerSession: async () => auth.session,
}));
vi.mock('../src/features/account/account-server', () => ({ fetchAddresses }));
vi.mock('../src/features/cart/cart-header-link', () => ({ CartHeaderLink: () => null }));
vi.mock('../src/components/amazon/account-menu', () => ({ AccountMenu: () => null }));
vi.mock('../src/features/cart/cart-provider', () => ({ useCart: () => ({ cart: null }) }));
vi.mock('../src/features/browse/browse-server', () => ({
  searchDepartments: async (category?: string) => ({
    options: [
      { slug: 'eletronicos', name: 'Eletrônicos', parentSlug: null },
      { slug: 'livros', name: 'Livros', parentSlug: null },
    ],
    selected: category ? 'livros' : '',
  }),
}));

afterEach(() => {
  cleanup();
  features.browsingHistory = true;
  features.catalog = false;
  features.addresses = true;
  auth.session = null;
  fetchAddresses.mockReset();
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

  expect(
    within(dialog)
      .getAllByRole('heading')
      .map((heading) => heading.textContent),
  ).toEqual([
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
  expect(within(navbar()).getByRole('button', { name: 'Histórico de navegação' })).toBeTruthy();
  cleanup();

  features.browsingHistory = false;
  await renderHeader();
  expect(within(navbar()).queryByRole('button', { name: 'Histórico de navegação' })).toBeNull();
  expect(
    within(navbar()).getByRole('link', { name: 'Histórico de navegação' }).getAttribute('href'),
  ).toBe('/products');
});

it('searches the catalog: departments are the root categories and results keep the query', async () => {
  features.catalog = true;
  render(await AmazonHeader({ search: { q: 'fone', category: 'literatura' } }));
  const form = screen.getByRole('search');
  expect(form.getAttribute('action')).toBe('/products');
  const select = within(form).getByLabelText('Selecionar departamento') as HTMLSelectElement;
  expect(select.name).toBe('category');
  expect(Array.from(select.options).map((option) => [option.value, option.text])).toEqual([
    ['', 'Todos'],
    ['eletronicos', 'Eletrônicos'],
    ['livros', 'Livros'],
  ]);
  expect(select.value).toBe('livros');
  expect((within(form).getByLabelText('Pesquisar Amazon.com.br') as HTMLInputElement).value).toBe(
    'fone',
  );
});

it('offers only "Todos" while the catalog listing is disabled', async () => {
  await renderHeader();
  const select = screen.getByLabelText('Selecionar departamento') as HTMLSelectElement;
  expect(Array.from(select.options).map((option) => option.text)).toEqual(['Todos']);
});

describe('"Enviar para" block', () => {
  const address = (id: string, isDefault: boolean, city: string, postalCode: string) =>
    ({
      id,
      recipient: `Pessoa ${id}`,
      postalCode,
      street: `Rua ${id}`,
      number: '1',
      neighborhood: 'Centro',
      city,
      state: 'RS',
      isDefault,
    }) satisfies AccountAddress;
  const deliver = () => screen.getByText(/Enviar para|Olá/).closest('a') as HTMLAnchorElement;
  const signIn = (addresses: AccountAddress[] | null) => {
    auth.session = { user: { displayName: 'Ada Lovelace' } };
    fetchAddresses.mockResolvedValue(addresses);
  };

  it('shows the default address city and CEP and links to "Seus endereços"', async () => {
    signIn([address('a', true, 'Porto Alegre', '90020060')]);
    await renderHeader();
    expect(deliver().textContent).toBe('Enviar para Ada Porto Alegre 90020060');
    expect(deliver().getAttribute('href')).toBe('/addresses');
  });

  it('uses the address marked as default, not the first one listed', async () => {
    signIn([
      address('a', false, 'Porto Alegre', '90020060'),
      address('b', true, 'Caxias do Sul', '95020000'),
      address('c', false, 'Pelotas', '96010000'),
    ]);
    await renderHeader();
    expect(deliver().textContent).toBe('Enviar para Ada Caxias do Sul 95020000');
  });

  it('follows the default as it changes between requests', async () => {
    signIn([
      address('a', true, 'Porto Alegre', '90020060'),
      address('b', false, 'Pelotas', '96010000'),
    ]);
    await renderHeader();
    expect(deliver().textContent).toContain('Porto Alegre 90020060');
    cleanup();

    signIn([
      address('b', true, 'Pelotas', '96010000'),
      address('a', false, 'Porto Alegre', '90020060'),
    ]);
    await renderHeader();
    expect(deliver().textContent).toContain('Pelotas 96010000');
  });

  it.each([
    ['no saved address', []],
    ['no address marked as default', [address('a', false, 'Porto Alegre', '90020060')]],
  ])('asks to add an address when there is %s', async (_case, addresses) => {
    signIn(addresses);
    await renderHeader();
    expect(deliver().textContent).toBe('Enviar para Ada Cadastrar endereço');
    expect(deliver().getAttribute('href')).toBe('/addresses?add=1');
    expect(deliver().textContent).not.toMatch(/\d{8}/);
  });

  it('never invents an address while the API is unavailable', async () => {
    signIn(null);
    await renderHeader();
    expect(deliver().textContent).toBe('Enviar para Ada Seus endereços');
    expect(deliver().getAttribute('href')).toBe('/addresses');
  });

  it('greets guests without a name or address and does not read addresses', async () => {
    await renderHeader();
    expect(deliver().textContent).toBe('Olá Cadastrar endereço');
    expect(deliver().getAttribute('href')).toBe('/addresses?add=1');
    expect(fetchAddresses).not.toHaveBeenCalled();
  });

  it('does not read addresses while the addresses feature is off', async () => {
    features.addresses = false;
    signIn([address('a', true, 'Porto Alegre', '90020060')]);
    await renderHeader();
    expect(deliver().textContent).toBe('Enviar para Ada Cadastrar endereço');
    expect(fetchAddresses).not.toHaveBeenCalled();
  });
});
