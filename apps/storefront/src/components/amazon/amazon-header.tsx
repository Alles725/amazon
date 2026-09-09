import 'server-only';
import Link from 'next/link';
import { AmazonLogo } from '@/components/amazon-logo';
import { getServerSession } from '@/features/auth/server-session';

const NAV_LINKS = [
  { label: 'Todos', href: '/products' },
  { label: 'Venda na Amazon', href: '/products' },
  { label: 'Atendimento ao Cliente', href: '/products' },
  { label: 'Ofertas do Dia', href: '/products' },
  { label: 'Comprar novamente', href: '/orders' },
  { label: 'Alimentos e Bebidas', href: '/products' },
  { label: 'Sua Amazon.com.br', href: '/account' },
  { label: 'Ideias de Presente', href: '/products' },
];

export async function AmazonHeader() {
  const session = await getServerSession();
  const firstName = session?.user.displayName.split(' ')[0];

  return (
    <header className="az-header">
      <div className="az-topbar">
        <Link href="/" className="az-topbar__logo" aria-label="Amazon.com.br - Página inicial">
          <AmazonLogo variant="light" />
          <span className="az-topbar__tld">.com.br</span>
        </Link>

        <Link href="/account" className="az-topbar__deliver">
          <span className="az-topbar__deliver-line1">Enviar para {firstName ?? 'Paulo'}</span>
          <span className="az-topbar__deliver-line2">
            <PinIcon /> Porto Alegre 90020060
          </span>
        </Link>

        <form action="/products" method="GET" className="az-search" role="search">
          <label htmlFor="az-search-department" className="visually-hidden">
            Selecionar departamento
          </label>
          <select id="az-search-department" name="department" className="az-search__department" defaultValue="all">
            <option value="all">Todos</option>
            <option value="electronics">Eletrônicos</option>
            <option value="books">Livros</option>
            <option value="fashion">Moda</option>
            <option value="home">Casa</option>
          </select>
          <label htmlFor="az-search-input" className="visually-hidden">
            Pesquisar Amazon.com.br
          </label>
          <input
            id="az-search-input"
            name="q"
            type="text"
            className="az-search__input"
            placeholder="Pesquisar Amazon.com.br"
            autoComplete="off"
          />
          <button type="submit" className="az-search__button" aria-label="Pesquisar">
            <SearchIcon />
          </button>
        </form>

        <Link href={session ? '/account' : '/login'} className="az-topbar__account">
          <span className="az-topbar__account-line1">
            Olá, {session ? firstName : 'faça login'}
          </span>
          <span className="az-topbar__account-line2">Contas e Listas</span>
        </Link>

        <Link href="/orders" className="az-topbar__orders">
          <span className="az-topbar__account-line1">Devoluções</span>
          <span className="az-topbar__account-line2">e Pedidos</span>
        </Link>

        <Link href="/cart" className="az-topbar__cart" aria-label="Carrinho, 0 itens">
          <span className="az-topbar__cart-icon">
            <CartIcon />
            <span className="az-topbar__cart-count">0</span>
          </span>
          <span className="az-topbar__cart-label">Carrinho</span>
        </Link>
      </div>

      <nav className="az-navbar" aria-label="Categorias">
        <div className="az-navbar__links">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className={`az-navbar__link${index === 0 ? ' az-navbar__link--all' : ''}`}
            >
              {index === 0 && <MenuIcon />}
              {link.label}
            </Link>
          ))}
        </div>
        <p className="az-navbar__promo">Aproveite as ofertas do 9.9!</p>
      </nav>
    </header>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="#0f1111">
      <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="#fff" strokeWidth="1.6">
      <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="21" r="1.4" fill="#fff" stroke="none" />
      <circle cx="17" cy="21" r="1.4" fill="#fff" stroke="none" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
