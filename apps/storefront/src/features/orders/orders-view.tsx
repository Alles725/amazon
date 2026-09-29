'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { ProductImage } from '@/components/amazon/product-image';
import { BuyAgainButton, OrderCard } from './order-card';
import {
  DEFAULT_PERIOD,
  distinctOrderedProducts,
  formatOrderDate,
  isNotYetShipped,
  orderCountLabel,
  ordersInPeriod,
  periodOptions,
  photoForSku,
  searchOrders,
} from './order-presentation';

const TABS = [
  { id: 'orders', label: 'Pedidos' },
  { id: 'buy-again', label: 'Compre Novamente' },
  { id: 'not-shipped', label: 'Ainda não enviado' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/** "Seus pedidos" body. Receives only the signed-in user's persisted orders. */
export function OrdersView({ orders }: { orders: OrderResponse[] }) {
  const [tab, setTab] = useState<TabId>('orders');
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const options = useMemo(() => periodOptions(orders), [orders]);
  const periodLabel = options.find((option) => option.value === period)?.label ?? '';

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setQuery(draft.trim());
    setTab('orders');
  }
  function clearSearch() {
    setDraft('');
    setQuery('');
  }

  return (
    <main className="az-orders">
      <nav className="az-orders__crumbs" aria-label="Trilha de navegação">
        <ol>
          <li>
            <Link href="/account">Sua conta</Link>
          </li>
          <li aria-current="page">Seus pedidos</li>
        </ol>
      </nav>

      <div className="az-orders__top">
        <h1 className="az-orders__title">Seus pedidos</h1>
        <form className="az-orders__search" role="search" onSubmit={submitSearch}>
          <label className="az-orders__search-field">
            <SearchIcon />
            <span className="visually-hidden">Pesquisar todos os pedidos</span>
            <input
              type="search"
              placeholder="Pesquisar todos os pedidos"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button type="submit" className="az-orders__search-button">
            Buscar pedidos
          </button>
        </form>
      </div>

      <div className="az-orders__tabs" role="tablist" aria-label="Seus pedidos">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`az-orders-tab-${item.id}`}
            aria-controls="az-orders-panel"
            aria-selected={tab === item.id}
            className="az-orders__tab"
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id="az-orders-panel"
        role="tabpanel"
        aria-labelledby={`az-orders-tab-${tab}`}
        className="az-orders__panel"
      >
        {tab === 'orders' &&
          (query ? (
            <SearchResults
              orders={searchOrders(orders, query)}
              query={query}
              onClear={clearSearch}
            />
          ) : (
            <PeriodResults
              orders={ordersInPeriod(orders, period)}
              period={period}
              periodLabel={periodLabel}
              options={options}
              onPeriod={setPeriod}
            />
          ))}
        {tab === 'buy-again' && <BuyAgainList orders={orders} />}
        {tab === 'not-shipped' && <NotShippedList orders={orders.filter(isNotYetShipped)} />}
      </div>
    </main>
  );
}

function PeriodResults({
  orders,
  period,
  periodLabel,
  options,
  onPeriod,
}: {
  orders: OrderResponse[];
  period: string;
  periodLabel: string;
  options: ReturnType<typeof periodOptions>;
  onPeriod: (period: string) => void;
}) {
  const label = orderCountLabel(orders.length);
  return (
    <>
      <div className="az-orders__summary">
        <span id="az-orders-count">
          <strong>{label.count}</strong> {label.verb}
        </span>
        <span className="az-orders__select">
          <select
            aria-labelledby="az-orders-count"
            value={period}
            onChange={(event) => onPeriod(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
      </div>
      {orders.length ? (
        <OrderList orders={orders} />
      ) : (
        <p className="az-orders__empty">
          Parece que você não fez nenhum pedido{' '}
          {period === 'last30'
            ? 'nos últimos 30 dias'
            : period === 'months3'
              ? periodLabel
              : `em ${periodLabel}`}
          . {options.length > 2 && 'Escolha outro período para ver pedidos anteriores.'}
        </p>
      )}
    </>
  );
}

function SearchResults({
  orders,
  query,
  onClear,
}: {
  orders: OrderResponse[];
  query: string;
  onClear: () => void;
}) {
  return (
    <>
      <div className="az-orders__summary">
        <span>
          <strong>{orders.length === 1 ? '1 pedido' : `${orders.length} pedidos`}</strong>{' '}
          {orders.length === 1 ? 'corresponde' : 'correspondem'} a “{query}”
        </span>
        <button type="button" className="az-orders__clear" onClick={onClear}>
          Limpar pesquisa
        </button>
      </div>
      {orders.length ? (
        <OrderList orders={orders} />
      ) : (
        <p className="az-orders__empty">Nenhum pedido encontrado para “{query}”.</p>
      )}
    </>
  );
}

function OrderList({ orders }: { orders: OrderResponse[] }) {
  return (
    <ul className="az-orders__list" aria-label="Pedidos">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}

function BuyAgainList({ orders }: { orders: OrderResponse[] }) {
  const products = distinctOrderedProducts(orders);
  if (!products.length)
    return <p className="az-orders__empty">Os produtos que você comprar aparecerão aqui.</p>;
  return (
    <ul className="az-orders__buy-again" aria-label="Compre novamente">
      {products.map(({ line, order }) => (
        <li key={line.productId} className="az-orders__buy-card">
          <Link
            href={`/products/${encodeURIComponent(line.productId)}`}
            className="az-orders__buy-link"
          >
            <span className="az-orders__buy-media">
              <ProductImage image={photoForSku(line.sku)} />
            </span>
            <span className="az-orders__buy-name">{line.productName}</span>
          </Link>
          <span className="az-orders__buy-date">Pedido em {formatOrderDate(order.placedAt)}</span>
          <BuyAgainButton productId={line.productId} />
        </li>
      ))}
    </ul>
  );
}

function NotShippedList({ orders }: { orders: OrderResponse[] }) {
  return orders.length ? (
    <>
      <div className="az-orders__summary">
        <span>
          <strong>{orders.length === 1 ? '1 pedido' : `${orders.length} pedidos`}</strong> ainda não{' '}
          {orders.length === 1 ? 'enviado' : 'enviados'}
        </span>
      </div>
      <OrderList orders={orders} />
    </>
  ) : (
    <p className="az-orders__empty">Todos os seus pedidos já foram enviados.</p>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="#0f1111">
      <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
    </svg>
  );
}
