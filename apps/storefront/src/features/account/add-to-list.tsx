'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ListSummary } from '@amazon-mvp/api-contract';
import { accountClient, AccountRequestError } from './account-client';
import { listHref } from './account-presentation';
import './account.css';

/** Product-page "Adicionar à lista": the main button saves to the default list
 * ("Lista de desejos"), the arrow picks another list. Guests go to login. */
export function AddToList({
  productId,
  signedIn,
  loginHref,
}: {
  productId: string;
  signedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (!signedIn)
    return (
      <div className="az-add-to-list">
        <Link className="az-add-to-list__main" href={loginHref}>
          Adicionar à lista
        </Link>
      </div>
    );

  async function load(): Promise<ListSummary[]> {
    const result = lists ?? (await accountClient.lists());
    setLists(result);
    return result;
  }

  async function add(pick?: ListSummary) {
    setBusy(true);
    setError('');
    setAdded(null);
    setOpen(false);
    try {
      const target = pick ?? (await load()).find((list) => list.isDefault);
      if (!target) throw new Error('Não foi possível encontrar sua lista.');
      await accountClient.addToList(target.id, productId);
      setAdded({ id: target.id, name: target.name });
      setLists(null); // counts changed
    } catch (reason) {
      if (reason instanceof AccountRequestError && reason.status === 401) {
        router.push(loginHref);
        return;
      }
      setError(reason instanceof Error ? reason.message : 'Não foi possível adicionar à lista.');
    } finally {
      setBusy(false);
    }
  }

  async function openMenu() {
    if (open) return setOpen(false);
    setError('');
    try {
      await load();
      setOpen(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar suas listas.');
    }
  }

  return (
    <div className="az-add-to-list" ref={root}>
      <div className="az-add-to-list__group">
        <button
          type="button"
          className="az-add-to-list__main"
          disabled={busy}
          onClick={() => void add()}
        >
          {busy ? 'Adicionando…' : 'Adicionar à lista'}
        </button>
        <button
          ref={toggle}
          type="button"
          className="az-add-to-list__toggle"
          aria-label="Escolher uma lista"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="add-to-list-menu"
          disabled={busy}
          onClick={() => void openMenu()}
        >
          <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
            <path d="m1 1 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>
      {open && lists && (
        <ul id="add-to-list-menu" className="az-add-to-list__menu" aria-label="Suas listas">
          {lists.map((list, index) => (
            <li key={list.id}>
              <button type="button" autoFocus={index === 0} onClick={() => void add(list)}>
                {list.name}
                {list.isDefault ? ' (padrão)' : ''}
              </button>
            </li>
          ))}
          <li>
            <p>
              <Link href="/lists">Gerenciar suas listas</Link>
            </p>
          </li>
        </ul>
      )}
      <p className="az-add-to-list__feedback" role="status">
        {added && (
          <>
            Adicionado a <strong>{added.name}</strong>.{' '}
            <Link href={listHref(added.id)}>Ver sua lista</Link>
          </>
        )}
      </p>
      {error && (
        <p className="az-add-to-list__feedback az-add-to-list__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
