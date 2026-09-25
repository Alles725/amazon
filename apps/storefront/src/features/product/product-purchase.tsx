'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CatalogItem, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { useCart } from '@/features/cart/cart-provider';
import { ProductPrice } from './product-price';

export function ProductPurchase({
  product,
  cartEnabled,
}: {
  product: CatalogItem;
  cartEnabled: boolean;
}) {
  const { cart, status, pending, error, notice, add, refresh } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [attempted, setAttempted] = useState(false);
  const inCart = cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, Math.min(MAX_CART_QUANTITY, product.availableQuantity) - inCart);
  const selectedQuantity = Math.min(quantity, remaining);
  const canAdd = cartEnabled && status === 'ready' && product.inStock && remaining > 0 && !pending;

  return (
    <aside className="az-detail-buy" aria-label="Comprar produto" aria-busy={pending}>
      <ProductPrice amount={product.priceMinor} currency={product.currency} />
      <p className={`az-detail-stock${product.inStock ? '' : ' az-detail-stock--unavailable'}`}>
        {product.inStock ? 'Em estoque' : 'Indisponível no momento'}
      </p>
      {inCart > 0 && (
        <p className="az-detail-muted">
          {inCart} {inCart === 1 ? 'unidade no carrinho' : 'unidades no carrinho'}
        </p>
      )}
      {product.inStock && remaining === 0 && (
        <p className="az-detail-muted">
          Você já adicionou a quantidade disponível para este produto.
        </p>
      )}
      <label className="az-detail-quantity">
        Quantidade:
        <select
          aria-label="Quantidade"
          value={selectedQuantity || 1}
          disabled={!canAdd}
          onChange={(event) => setQuantity(Number(event.target.value))}
        >
          {Array.from({ length: Math.max(1, remaining) }, (_, i) => i + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="az-detail-button"
        disabled={!canAdd}
        onClick={() => {
          setAttempted(true);
          void add(product.id, selectedQuantity);
        }}
      >
        {pending ? 'Adicionando…' : 'Adicionar ao carrinho'}
      </button>
      <button
        type="button"
        className="az-detail-button az-detail-button--buy"
        disabled
        aria-describedby="checkout-unavailable"
      >
        Comprar agora
      </button>
      <p id="checkout-unavailable" className="az-detail-muted">
        A finalização da compra ainda não está disponível.
      </p>
      {!cartEnabled ? (
        <p className="az-detail-muted">O carrinho ainda não está disponível.</p>
      ) : status === 'guest' ? (
        <p>
          <Link href="/login">Entre na sua conta</Link> para adicionar este produto.
        </p>
      ) : status === 'loading' ? (
        <p role="status">Carregando seu carrinho…</p>
      ) : null}
      {cartEnabled && error && (
        <div className="az-detail-error" role="alert">
          {error}
          {status !== 'guest' && (
            <button type="button" disabled={pending} onClick={() => void refresh()}>
              Tentar novamente
            </button>
          )}
        </div>
      )}
      <div className="az-detail-feedback" role="status">
        {attempted && notice && (
          <>
            {notice} <Link href="/cart">Ver carrinho</Link>
          </>
        )}
      </div>
    </aside>
  );
}
