'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import { ProductImage } from '@/components/amazon/product-image';
import { useCart } from '@/features/cart/cart-provider';
import {
  clearBrowsingHistory,
  formatHistoryDay,
  removeProductView,
  useBrowsingHistory,
} from './browsing-history-store';

/**
 * The navbar's "Histórico de navegação" item and the full-width flyout it
 * opens under the navbar (hover with a mouse, click/tap otherwise), like Amazon.
 */
export function BrowsingHistoryMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();
  // A mouse click lands right after the hover that already opened the flyout;
  // it must not immediately toggle it closed again.
  const openedByHover = useRef(false);

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) {
      openedByHover.current = false;
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    if (!open) openedByHover.current = true;
    setOpen(true);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={wrapperRef}
      className="az-history-menu"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        className={`az-navbar__link az-history-menu__trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="az-history-flyout"
        onClick={() => {
          if (openedByHover.current) openedByHover.current = false;
          else setOpen((value) => !value);
        }}
      >
        Histórico de navegação
        <span className="az-history-menu__caret" aria-hidden="true" />
      </button>

      {open && (
        <div id="az-history-flyout" className="az-history-flyout">
          <BrowsingHistoryStrip />
        </div>
      )}
    </div>
  );
}

export function BrowsingHistoryStrip({ now = new Date() }: { now?: Date }) {
  const history = useBrowsingHistory();
  const { cart } = useCart();
  const [editing, setEditing] = useState(false);
  const inCart = new Set(cart?.lines.map((line) => line.productId));

  return (
    <section className="az-history" aria-labelledby="az-history-title">
      <div className="az-history__header">
        <h2 id="az-history-title" className="az-history__title">
          Seu histórico de navegação
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            className="az-history__edit"
            aria-pressed={editing}
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? 'Concluir' : 'Exibir e editar'}
          </button>
        )}
        {editing && (
          <button type="button" className="az-history__edit" onClick={clearBrowsingHistory}>
            Limpar histórico
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="az-history__empty">
          Os produtos que você visualizar aparecerão aqui.{' '}
          <Link href="/products">Explorar produtos</Link>
        </p>
      ) : (
        <HorizontalRail label="Seu histórico de navegação" className="az-history__rail">
          {history.map((entry, index) => {
            const day = formatHistoryDay(entry.viewedAt, now);
            const firstOfDay = index === 0 || formatHistoryDay(history[index - 1].viewedAt, now) !== day;
            return (
              <article key={entry.id} className="az-history__item">
                <Link href={`/products/${entry.id}`} className="az-history__product" title={entry.name}>
                  <span className="az-history__image">
                    <ProductImage image={entry.image} />
                    {inCart.has(entry.id) && <span className="az-history__in-cart">No carrinho</span>}
                  </span>
                  <span className="az-history__name">{entry.name}</span>
                </Link>
                {editing && (
                  <button
                    type="button"
                    className="az-history__remove"
                    onClick={() => removeProductView(entry.id)}
                  >
                    Remover
                  </button>
                )}
                <span className="az-history__timeline" aria-hidden="true">
                  <span className="az-history__dot" />
                </span>
                <time className="az-history__date" dateTime={entry.viewedAt}>
                  {firstOfDay ? day : ''}
                </time>
              </article>
            );
          })}
        </HorizontalRail>
      )}
    </section>
  );
}
