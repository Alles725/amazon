import Link from 'next/link';
import type { OrderResponse } from '@amazon-mvp/api-contract';
import { formatCartMoney } from '@/features/cart/money';
import { formatOrderDate, paymentLabel } from '@/features/orders/order-presentation';

export const TRANSACTIONS_LIMIT = 5;
const LOGIN_HREF = `/login?next=${encodeURIComponent('/payment-methods')}`;

/** The user's most recent orders with the payment method and total they were
 * placed with — the only "transactions" this store has. `orders` is null when
 * the orders API could not be reached. */
export function PaymentTransactions({
  signedIn,
  orders,
}: {
  signedIn: boolean;
  orders: OrderResponse[] | null;
}) {
  if (!signedIn)
    return (
      <div className="az-cp__panel">
        <p className="az-cp__panel-text">
          Faça login para ver a forma de pagamento e o total dos seus pedidos.
        </p>
        <Link href={LOGIN_HREF} className="az-cp__button">
          Fazer login
        </Link>
      </div>
    );

  if (!orders)
    return (
      <div className="az-cp__panel">
        <p className="az-cp__panel-text" role="alert">
          Não foi possível carregar suas transações agora. Tente novamente em instantes.
        </p>
      </div>
    );

  if (!orders.length)
    return (
      <div className="az-cp__panel">
        <p className="az-cp__panel-text">
          Você ainda não fez pedidos. A forma de pagamento e o total de cada pedido aparecem aqui
          depois da primeira compra.
        </p>
      </div>
    );

  const recent = [...orders]
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
    .slice(0, TRANSACTIONS_LIMIT);

  return (
    <div className="az-cp__panel az-cp__panel--flush">
      <h3 className="az-cp__panel-title" id="az-cp-transactions">
        Transações recentes
      </h3>
      <ul className="az-cp__transactions" aria-labelledby="az-cp-transactions">
        {recent.map((order) => (
          <li key={order.id} className="az-cp__transaction">
            <span className="az-cp__transaction-main">
              <Link href={`/orders/${encodeURIComponent(order.id)}`} className="az-cp__link">
                Pedido nº {order.orderNumber}
              </Link>
              <span className="az-cp__transaction-date">{formatOrderDate(order.placedAt)}</span>
            </span>
            <span className="az-cp__transaction-method">
              {paymentLabel(order)}
            </span>
            <strong className="az-cp__transaction-total">
              {formatCartMoney(order.totalMinor, order.currency)}
            </strong>
          </li>
        ))}
      </ul>
      <p className="az-cp__panel-footer">
        <Link href="/orders" className="az-cp__link">
          Ver todos os pedidos
        </Link>
      </p>
    </div>
  );
}
