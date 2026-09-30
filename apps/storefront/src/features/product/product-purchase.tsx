'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CatalogItem, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { AddToList } from '@/features/account/add-to-list';
import { useCart } from '@/features/cart/cart-provider';
import { formatCartMoney } from '@/features/cart/money';
import { PixPrice } from '@/features/checkout/pix-price';
import { ProductPrice } from './product-price';

/** Amazon's quantity menu stops at 30 even when more stock exists. */
const QUANTITY_MENU_LIMIT = 30;
/** Amazon starts showing "Apenas N em estoque" at this level. */
const LOW_STOCK = 5;

export interface DeliveryAddress {
  recipient: string;
  city: string;
  postalCode: string;
}

/** Buy box. Cart and checkout are the existing CartProvider and /checkout flow:
 * "Comprar agora" makes sure the cart holds the chosen quantity, then opens checkout. */
export function ProductPurchase({
  product,
  cartEnabled,
  checkoutEnabled = false,
  installments,
  fulfillment,
  address,
  pixDiscountPercent = null,
  lists,
}: {
  product: CatalogItem;
  cartEnabled: boolean;
  checkoutEnabled?: boolean;
  installments?: { count: number };
  fulfillment?: { shippedBy?: string; soldBy?: string; returns?: string };
  address?: DeliveryAddress | null;
  /** Rate from the API's checkout config (GET /orders/pricing); null = not advertised. */
  pixDiscountPercent?: number | null;
  /** Present when the lists feature is on: renders "Adicionar à lista". */
  lists?: { signedIn: boolean };
}) {
  const router = useRouter();
  const { cart, status, pending, error, notice, add, refresh } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [attempted, setAttempted] = useState(false);
  const [buying, setBuying] = useState(false);
  const inCart = cart?.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const limit = Math.min(MAX_CART_QUANTITY, product.availableQuantity);
  const remaining = Math.max(0, limit - inCart);
  const selectedQuantity = Math.max(1, Math.min(quantity, remaining || 1));
  const ready = cartEnabled && status === 'ready' && !pending && !buying;
  const canAdd = ready && product.inStock && remaining > 0;
  const canBuyNow = ready && checkoutEnabled && product.inStock && (remaining > 0 || inCart > 0);
  const guest = cartEnabled && status === 'guest';
  const loginHref = `/login?next=${encodeURIComponent(`/products/${product.slug}`)}`;
  const menuSize = Math.max(1, Math.min(remaining, QUANTITY_MENU_LIMIT));

  async function buyNow() {
    setAttempted(true);
    setBuying(true);
    try {
      // Same meaning as "Adicionar ao carrinho": the menu is the number of units to
      // add. When the cart already holds every available unit, go straight to checkout.
      const ok = remaining > 0 ? await add(product.id, selectedQuantity) : true;
      if (ok) router.push('/checkout');
    } finally {
      setBuying(false);
    }
  }

  const stock = !product.active
    ? { text: 'Indisponível no momento', tone: 'unavailable' }
    : !product.inStock
      ? { text: 'Fora de estoque', tone: 'unavailable' }
      : product.availableQuantity <= LOW_STOCK
        ? { text: `Apenas ${product.availableQuantity} em estoque`, tone: 'low' }
        : { text: 'Em estoque', tone: 'available' };

  return (
    <section className="az-pdp-buy" aria-label="Comprar produto" aria-busy={pending || buying}>
      <ProductPrice amount={product.priceMinor} currency={product.currency} />
      {product.inStock && checkoutEnabled && (
        <PixPrice
          amountMinor={product.priceMinor}
          currency={product.currency}
          percent={pixDiscountPercent}
          prefix="ou "
          className="az-pix-price--small"
        />
      )}
      {installments && product.inStock && (
        <p className="az-pdp-buy__installments">
          ou em até {installments.count}x de{' '}
          {formatCartMoney(Math.floor(product.priceMinor / installments.count), product.currency)}
          /mês
        </p>
      )}
      {product.inStock && (
        <p className="az-pdp-buy__delivery">
          Entrega <strong>GRÁTIS</strong>
        </p>
      )}
      {address && (
        <p className="az-pdp-buy__address">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <span>
            Enviar para {address.recipient} - {address.city} {address.postalCode}
          </span>
        </p>
      )}
      <p className={`az-pdp-stock az-pdp-stock--${stock.tone}`}>{stock.text}</p>
      {!product.inStock && product.active && (
        <p className="az-pdp-muted">
          Não sabemos quando ou se este item estará disponível novamente.
        </p>
      )}
      {inCart > 0 && (
        <p className="az-pdp-muted">
          {inCart} {inCart === 1 ? 'unidade no carrinho' : 'unidades no carrinho'}
        </p>
      )}
      {product.inStock && inCart > 0 && remaining === 0 && (
        <p className="az-pdp-muted">Você já adicionou a quantidade disponível para este produto.</p>
      )}

      {product.inStock && (
        <>
          <label className="az-pdp-quantity">
            <span>Quantidade:</span>
            <select
              aria-label="Quantidade"
              value={selectedQuantity}
              disabled={!canAdd}
              onChange={(event) => setQuantity(Number(event.target.value))}
            >
              {Array.from({ length: menuSize }, (_, i) => i + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {guest ? (
            <>
              <Link className="az-pdp-button" href={loginHref}>
                Adicionar ao carrinho
              </Link>
              <Link className="az-pdp-button az-pdp-button--buy" href={loginHref}>
                Comprar agora
              </Link>
              <p className="az-pdp-muted">Entre na sua conta para comprar este produto.</p>
            </>
          ) : (
            <>
              <button
                type="button"
                className="az-pdp-button"
                disabled={!canAdd}
                onClick={() => {
                  setAttempted(true);
                  void add(product.id, selectedQuantity);
                }}
              >
                {pending && !buying ? 'Adicionando…' : 'Adicionar ao carrinho'}
              </button>
              <button
                type="button"
                className="az-pdp-button az-pdp-button--buy"
                disabled={!canBuyNow}
                aria-describedby={checkoutEnabled ? undefined : 'checkout-unavailable'}
                onClick={() => void buyNow()}
              >
                {buying ? 'Abrindo o checkout…' : 'Comprar agora'}
              </button>
              {!checkoutEnabled && (
                <p id="checkout-unavailable" className="az-pdp-muted">
                  A finalização da compra ainda não está disponível.
                </p>
              )}
            </>
          )}
        </>
      )}

      {!cartEnabled ? (
        <p className="az-pdp-muted">O carrinho ainda não está disponível.</p>
      ) : status === 'loading' ? (
        <p role="status" className="az-pdp-muted">
          Carregando seu carrinho…
        </p>
      ) : null}
      {cartEnabled && error && (
        <div className="az-pdp-error" role="alert">
          {error}
          {status !== 'guest' && (
            <button type="button" disabled={pending} onClick={() => void refresh()}>
              Tentar novamente
            </button>
          )}
        </div>
      )}
      <div className="az-pdp-feedback" role="status">
        {attempted && notice && !buying && (
          <>
            {notice} <Link href="/cart">Ver carrinho</Link>
          </>
        )}
      </div>

      {fulfillment && (fulfillment.shippedBy || fulfillment.soldBy || fulfillment.returns) && (
        <dl className="az-pdp-fulfillment">
          {fulfillment.shippedBy && (
            <div>
              <dt>Enviado por</dt>
              <dd>{fulfillment.shippedBy}</dd>
            </div>
          )}
          {fulfillment.soldBy && (
            <div>
              <dt>Vendido por</dt>
              <dd>{fulfillment.soldBy}</dd>
            </div>
          )}
          {fulfillment.returns && (
            <div>
              <dt>Devolução</dt>
              <dd>
                <Link href="/returns">{fulfillment.returns}</Link>
              </dd>
            </div>
          )}
        </dl>
      )}
      {lists && <AddToList productId={product.id} signedIn={lists.signedIn} loginHref={loginHref} />}
    </section>
  );
}
