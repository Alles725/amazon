'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useCart } from './cart-provider';

export function CartHeaderLink({ icon }: { icon: ReactNode }) {
  const { cart, status } = useCart();
  const count = status === 'guest' ? 0 : status === 'ready' ? (cart?.itemCount ?? 0) : null;
  return (
    <Link
      href="/cart"
      className="az-topbar__cart"
      aria-label={
        count === null
          ? 'Carrinho, quantidade indisponível'
          : `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`
      }
    >
      <span className="az-topbar__cart-icon">
        {icon}
        <span className="az-topbar__cart-count" aria-live="polite">
          {count === null ? '—' : count}
        </span>
      </span>
      <span className="az-topbar__cart-label">Carrinho</span>
    </Link>
  );
}
