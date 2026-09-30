'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  LIST_NAME_MAX_LENGTH,
  ListDetails,
  ListSummary,
  MAX_LISTS_PER_USER,
} from '@amazon-mvp/api-contract';
import { ProductImage } from '@/components/amazon/product-image';
import { useCart } from '@/features/cart/cart-provider';
import { formatCartMoney } from '@/features/cart/money';
import { productPresentation } from '@/features/product/product-presentation';
import { accountClient, AccountRequestError } from './account-client';
import { listHref, stockLabel } from './account-presentation';

const addedOn = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});

/** "Suas listas": list navigation on the left, the selected list on the right. */
export function ListsView({ lists, initial }: { lists: ListSummary[]; initial: ListDetails }) {
  const router = useRouter();
  const cart = useCart();
  const [list, setList] = useState(initial);
  const [mode, setMode] = useState<'create' | 'rename' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [itemBusy, setItemBusy] = useState<string | null>(null);
  const [cartAdded, setCartAdded] = useState(false);

  function go(href: string) {
    router.push(href);
    router.refresh();
  }

  async function act(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    setCartAdded(false);
    setStatus('');
    try {
      await work();
    } catch (reason) {
      if (reason instanceof AccountRequestError && reason.status === 401)
        return go(`/login?next=${encodeURIComponent(listHref(list.id))}`);
      setError(reason instanceof Error ? reason.message : 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  function nameFrom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return String(new FormData(event.currentTarget).get('name') ?? '').trim();
  }

  const summaries = lists.map((item) =>
    item.id === list.id ? { ...item, name: list.name, itemCount: list.itemCount } : item,
  );

  return (
    <div className="az-acct-lists">
      <nav className="az-acct-lists__nav" aria-label="Suas listas">
        <ul>
          {summaries.map((item) => (
            <li key={item.id}>
              <Link href={listHref(item.id)} aria-current={item.id === list.id ? 'page' : undefined}>
                <strong>{item.name}</strong>
                <span>
                  {item.isDefault ? 'Padrão · ' : ''}
                  {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'} · Privada
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="list-title">
        <div className="az-acct-status" role="status" aria-live="polite">
          {status && (
            <p className="az-acct-success">
              {status}
              {cartAdded && (
                <>
                  {' '}
                  <Link href="/cart">Ver carrinho</Link>
                </>
              )}
            </p>
          )}
        </div>
        {error && (
          <p className="az-acct-error" role="alert">
            {error}
          </p>
        )}

        <div className="az-acct-list-head">
          <h2 id="list-title">{list.name}</h2>
          <div className="az-acct-list-head__actions">
            <button
              type="button"
              className="az-acct-button"
              disabled={busy || lists.length >= MAX_LISTS_PER_USER}
              onClick={() => setMode(mode === 'create' ? null : 'create')}
              aria-expanded={mode === 'create'}
            >
              Criar uma lista
            </button>
            <button
              type="button"
              className="az-acct-linkbutton"
              disabled={busy}
              onClick={() => setMode(mode === 'rename' ? null : 'rename')}
              aria-expanded={mode === 'rename'}
            >
              Renomear lista
            </button>
            {!list.isDefault && (
              <button
                type="button"
                className="az-acct-linkbutton"
                disabled={busy}
                onClick={() => setMode(mode === 'delete' ? null : 'delete')}
                aria-expanded={mode === 'delete'}
              >
                Excluir lista
              </button>
            )}
          </div>
        </div>

        {mode === 'create' && (
          <form
            className="az-acct-inline-form"
            aria-label="Criar uma lista"
            onSubmit={(event) => {
              const name = nameFrom(event);
              void act(async () => {
                const created = await accountClient.createList(name);
                go(listHref(created.id));
              });
            }}
          >
            <label>
              Nome da lista
              <input name="name" required maxLength={LIST_NAME_MAX_LENGTH} autoFocus disabled={busy} />
            </label>
            <button type="submit" className="az-acct-button az-acct-button--primary" disabled={busy}>
              Criar lista
            </button>
            <button type="button" className="az-acct-button" disabled={busy} onClick={() => setMode(null)}>
              Cancelar
            </button>
          </form>
        )}
        {mode === 'rename' && (
          <form
            className="az-acct-inline-form"
            aria-label="Renomear lista"
            onSubmit={(event) => {
              const name = nameFrom(event);
              void act(async () => {
                const renamed = await accountClient.renameList(list.id, name);
                setList({ ...list, name: renamed.name });
                setMode(null);
                setStatus('Lista renomeada.');
                router.refresh();
              });
            }}
          >
            <label>
              Novo nome
              <input
                name="name"
                required
                maxLength={LIST_NAME_MAX_LENGTH}
                defaultValue={list.name}
                autoFocus
                disabled={busy}
              />
            </label>
            <button type="submit" className="az-acct-button az-acct-button--primary" disabled={busy}>
              Salvar
            </button>
            <button type="button" className="az-acct-button" disabled={busy} onClick={() => setMode(null)}>
              Cancelar
            </button>
          </form>
        )}
        {mode === 'delete' && (
          <div className="az-acct-inline-form" role="group" aria-label="Confirmar exclusão da lista">
            <p className="az-acct-muted">
              Excluir a lista “{list.name}” e todos os seus itens? Esta ação não pode ser desfeita.
            </p>
            <button
              type="button"
              className="az-acct-button az-acct-button--primary"
              disabled={busy}
              autoFocus
              onClick={() =>
                void act(async () => {
                  await accountClient.deleteList(list.id);
                  go('/lists');
                })
              }
            >
              {busy ? 'Excluindo…' : 'Sim, excluir'}
            </button>
            <button type="button" className="az-acct-button" disabled={busy} onClick={() => setMode(null)}>
              Cancelar
            </button>
          </div>
        )}

        {list.items.length === 0 ? (
          <div className="az-acct-list-empty">
            <p className="az-acct-empty">Não há itens nesta lista.</p>
            <p className="az-acct-muted">
              Use o botão “Adicionar à lista” na página de um produto para salvá-lo aqui.
            </p>
          </div>
        ) : (
          <ul className="az-acct-items" aria-label={`Itens de ${list.name}`}>
            {list.items.map(({ product, productId, addedAt }) => {
              const stock = stockLabel(product);
              const presentation = productPresentation(product);
              const href = `/products/${encodeURIComponent(product.slug)}`;
              const canBuy =
                product.inStock && cart.status === 'ready' && !cart.pending && itemBusy === null;
              return (
                <li key={productId} className="az-acct-item">
                  <Link href={href} className="az-acct-item__image" tabIndex={-1} aria-hidden="true">
                    <ProductImage image={presentation.images[0]} glyph={presentation.glyph} />
                  </Link>
                  <div>
                    <h3>
                      <Link href={href}>{product.name}</Link>
                    </h3>
                    <p className="az-acct-item__price">
                      {formatCartMoney(product.priceMinor, product.currency)}
                    </p>
                    <p className={`az-acct-item__stock az-acct-item__stock--${stock.tone}`}>
                      {stock.text}
                    </p>
                    <p className="az-acct-muted">
                      Item adicionado em {addedOn.format(new Date(addedAt))}
                    </p>
                  </div>
                  <div className="az-acct-item__actions">
                    <button
                      type="button"
                      className="az-acct-button az-acct-button--primary"
                      disabled={!canBuy}
                      aria-label={`Adicionar ao carrinho: ${product.name}`}
                      onClick={async () => {
                        setItemBusy(productId);
                        setStatus('');
                        setError('');
                        const ok = await cart.add(productId, 1);
                        setItemBusy(null);
                        setCartAdded(ok);
                        if (ok) setStatus(`“${product.name}” foi adicionado ao carrinho.`);
                      }}
                    >
                      {itemBusy === productId && cart.pending
                        ? 'Adicionando…'
                        : 'Adicionar ao carrinho'}
                    </button>
                    <button
                      type="button"
                      className="az-acct-button"
                      disabled={itemBusy !== null || busy}
                      aria-label={`Excluir da lista: ${product.name}`}
                      onClick={() => {
                        setItemBusy(productId);
                        void act(async () => {
                          setList(await accountClient.removeFromList(list.id, productId));
                          setStatus(`“${product.name}” foi excluído da lista.`);
                        }).finally(() => setItemBusy(null));
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {cart.error && (
          <p className="az-acct-error" role="alert">
            {cart.error}
          </p>
        )}
      </section>
    </div>
  );
}
