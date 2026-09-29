'use client';

import Link from 'next/link';
import { useState } from 'react';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { ProductImage } from '@/components/amazon/product-image';
import { useCart } from '@/features/cart/cart-provider';
import { formatCartMoney } from '@/features/cart/money';
import { deliveryStatus, formatLongDate, photoForSku, returnWindow } from './order-presentation';

const productHref = (productId: string) => `/products/${encodeURIComponent(productId)}`;
const orderHref = (order: OrderResponse) => `/orders/${encodeURIComponent(order.id)}`;

/** One order as in Amazon's "Seus pedidos": grey summary header + shipment. */
export function OrderCard({ order }: { order: OrderResponse }) {
  const address = order.shippingAddress;
  return (
    <article className="az-order" aria-label={`Pedido nº ${order.orderNumber}`}>
      <header className="az-order__header">
        <dl className="az-order__facts">
          <div>
            <dt>Pedido realizado</dt>
            <dd>{formatLongDate(order.placedAt)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatCartMoney(order.totalMinor, order.currency)}</dd>
          </div>
          {address && (
            <div>
              <dt>Enviar para</dt>
              <dd>
                <details className="az-order__popover">
                  <summary>
                    {address.recipient}
                    <Chevron />
                  </summary>
                  <address className="az-order__popover-body">
                    <strong>{address.recipient}</strong>
                    <br />
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''}
                    <br />
                    {address.neighborhood}, {address.city} — {address.state}
                    <br />
                    {address.postalCode}
                  </address>
                </details>
              </dd>
            </div>
          )}
        </dl>
        <div className="az-order__id">
          <p>Pedido nº {order.orderNumber}</p>
          <div className="az-order__links">
            <Link href={orderHref(order)}>Exibir detalhes do pedido</Link>
            <span className="az-order__sep" aria-hidden="true" />
            <details className="az-order__popover az-order__popover--end">
              <summary>
                Fatura
                <Chevron />
              </summary>
              <div className="az-order__popover-body">
                <Link href={`${orderHref(order)}#resumo`}>Resumo do pedido</Link>
              </div>
            </details>
          </div>
        </div>
      </header>
      <OrderShipment order={order} />
    </article>
  );
}

/** Delivery status, items and actions — reused by the order details page. */
export function OrderShipment({ order }: { order: OrderResponse }) {
  const status = deliveryStatus(order);
  const returns = returnWindow(order);
  const first = order.lines[0];
  return (
    <div className="az-order__body">
      <div className="az-order__shipment">
        <h2 className="az-order__status">{status.headline}</h2>
        {status.detail && <p className="az-order__status-detail">{status.detail}</p>}
        <ul className="az-order__items">
          {order.lines.map((line) => (
            <li key={line.productId} className="az-order__item">
              <Link
                href={productHref(line.productId)}
                className="az-order__item-media"
                tabIndex={-1}
                aria-hidden="true"
              >
                <ProductImage image={photoForSku(line.sku)} />
              </Link>
              <div className="az-order__item-info">
                <Link href={productHref(line.productId)} className="az-order__item-name">
                  {line.productName}
                </Link>
                {line.quantity > 1 && (
                  <p className="az-order__item-meta">Quantidade: {line.quantity}</p>
                )}
                {returns && <p className="az-order__item-meta">{returns}</p>}
                <div className="az-order__item-actions">
                  <BuyAgainButton productId={line.productId} />
                  <Link href={productHref(line.productId)} className="az-order-btn">
                    Ver o seu item
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="az-order__actions">
        <Link href="/help" className="az-order-btn az-order-btn--primary">
          Obter suporte de produto
        </Link>
        {order.status !== 'CANCELLED' && (
          <Link href={orderHref(order)} className="az-order-btn">
            Rastrear pacote
          </Link>
        )}
        {order.deliveredAt && first && (
          <Link href={productHref(first.productId)} className="az-order-btn">
            Avaliar o produto
          </Link>
        )}
      </div>
    </div>
  );
}

/** Adds to the persistent cart when it is available; otherwise opens the product. */
export function BuyAgainButton({ productId }: { productId: string }) {
  const cart = useCart();
  const [clicked, setClicked] = useState(false);
  const content = (
    <>
      <BuyAgainIcon />
      Comprar novamente
    </>
  );
  if (cart.status === 'guest')
    return (
      <Link href={productHref(productId)} className="az-order-btn az-order-btn--buy">
        {content}
      </Link>
    );
  return (
    <>
      <button
        type="button"
        className="az-order-btn az-order-btn--buy"
        disabled={cart.pending}
        onClick={() => {
          setClicked(true);
          void cart.add(productId);
        }}
      >
        {content}
      </button>
      {clicked && !cart.pending && (cart.error || cart.notice) && (
        <span className="az-order__buy-status" role="status">
          {cart.error ?? cart.notice}
        </span>
      )}
    </>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className="az-order__chevron"
    >
      <path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BuyAgainIcon() {
  return (
    <span className="az-order-btn__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="#0f1111"
        strokeWidth="1.6"
      >
        <path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" />
        <path d="M20 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 9h1.2l1.2 5.2h5.2L16.5 10H9.3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10.5" cy="16.3" r=".8" fill="#0f1111" stroke="none" />
        <circle cx="14.6" cy="16.3" r=".8" fill="#0f1111" stroke="none" />
      </svg>
    </span>
  );
}
