import Link from 'next/link';
import { ReactNode } from 'react';
import { AmazonLogo } from '@/components/amazon-logo';
export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="amazon-checkout-page" id="top">
      <header className="az-checkout-header">
        <Link href="/" aria-label="Página inicial">
          <AmazonLogo variant="light" />
        </Link>
        <span>
          Finalização da compra segura{' '}
          <svg
            className="az-checkout-lock"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>
        </span>
        <Link href="/cart">Carrinho</Link>
      </header>
      {children}
      <footer className="az-checkout-footer">
        <a href="#top" className="az-footer__back-to-top">
          Voltar ao início
        </a>
        <div>
          <Link href="/" aria-label="Página inicial">
            <AmazonLogo variant="light" />
          </Link>
          <Link href="/help">Ajuda</Link>
        </div>
        <p>Projeto acadêmico · Pagamentos simulados, sem cobrança real.</p>
      </footer>
    </div>
  );
}
