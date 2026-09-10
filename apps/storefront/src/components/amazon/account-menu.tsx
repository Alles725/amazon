'use client';

import { FocusEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SessionResponse } from '@amazon-mvp/api-contract';
import { authClient } from '@/features/auth/auth-client';

const LISTS_LINKS = [
  { label: 'Lista de compras', href: '/lists' },
  { label: 'Criar uma Lista de desejos', href: '/lists' },
  { label: 'Lista do Bebê', href: '/lists' },
];

const ACCOUNT_LINKS = [
  { label: 'Sua conta', href: '/account' },
  { label: 'Seus pedidos', href: '/orders' },
  { label: 'Sua Lista de desejos', href: '/lists' },
  { label: 'Continuar comprando', href: '/products' },
  { label: 'Recomendados para você', href: '/' },
  { label: 'Devoluções', href: '/returns' },
  { label: 'Recalls e alertas de segurança do produto', href: '/recalls' },
  { label: 'Programa e Poupe', href: '/subscribe-and-save' },
  { label: 'Sua assinatura Prime', href: '/prime' },
  { label: 'Inscrições e assinaturas', href: '/subscriptions' },
  { label: 'Biblioteca de conteúdo', href: '/content-and-devices' },
  { label: 'Dispositivos', href: '/content-and-devices' },
  { label: 'Seu Prime Video', href: '/prime' },
  { label: 'Seu Kindle Unlimited', href: '/subscriptions' },
  { label: 'Seu Amazon Photos', href: '/content-and-devices' },
  { label: 'Seus aplicativos e dispositivos', href: '/content-and-devices' },
];

/**
 * Trigger + hover dropdown for the header's "Olá, {cliente} / Contas e
 * Listas" item. A client component because the dropdown needs mouse/focus
 * state; the session itself still comes from the server (AmazonHeader).
 */
export function AccountMenu({ session }: { session: SessionResponse | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const firstName = session?.user.displayName.split(' ')[0];

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };

  const signOut = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      await authClient.logout();
      setOpen(false);
      router.push('/');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  if (!session) {
    return (
      <Link href="/login" className="az-topbar__account">
        <span className="az-topbar__account-line1">Olá, faça login</span>
        <span className="az-topbar__account-line2">Contas e Listas</span>
      </Link>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="az-topbar__account-wrap"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <Link href="/account" className="az-topbar__account" aria-expanded={open} aria-haspopup="true">
        <span className="az-topbar__account-line1">Olá, {firstName}</span>
        <span className="az-topbar__account-line2">Contas e Listas</span>
      </Link>

      {open && (
        <div className="az-account-dropdown" role="menu">
          <div className="az-account-dropdown__profile">
            <span className="az-account-dropdown__profile-text">
              Quem está comprando? Selecione um perfil.
            </span>
            <Link href="/security" className="az-account-dropdown__manage">
              Gerenciar perfis &gt;
            </Link>
          </div>

          <div className="az-account-dropdown__columns">
            <div>
              <h3 className="az-account-dropdown__heading">Suas listas</h3>
              <ul className="az-account-dropdown__list">
                {LISTS_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="az-account-dropdown__heading">Sua conta</h3>
              <ul className="az-account-dropdown__list">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>

              <hr className="az-account-dropdown__divider" />

              <ul className="az-account-dropdown__list">
                <li>
                  <Link href="/login">Trocar contas</Link>
                </li>
                <li>
                  <button type="button" onClick={(event) => void signOut(event)} disabled={pending}>
                    {pending ? 'Saindo…' : 'Sair da conta'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
