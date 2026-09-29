import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { formatCartMoney } from '@/features/cart/money';
import { OrderShipment } from '@/features/orders/order-card';
import { formatLongDate } from '@/features/orders/order-presentation';
import { ordersFont } from '@/features/orders/orders-font';
import { fetchOrder } from '@/features/orders/orders-server';

const UUID = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
const PAYMENT = {
  SIMULATED_CARD: 'Cartão fictício · Visa final 4242',
  SIMULATED_PIX: 'Pix simulado',
} as const;

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <FeatureRoute routeKey="orderDetails" title="Detalhes do pedido">
      <OrderDetailContent orderId={params.orderId} />
    </FeatureRoute>
  );
}

async function OrderDetailContent({ orderId }: { orderId: string }) {
  if (!(await getServerSession())) redirect('/login');
  if (!UUID.test(orderId)) notFound();
  const order = await fetchOrder(orderId);
  if (order === 'not-found') notFound();
  if (!order) throw new Error('Order unavailable');
  const address = order.shippingAddress;

  return (
    <div className={`amazon-orders-page ${ordersFont.variable}`} id="top">
      <AmazonHeader />
      <main className="az-orders">
        <nav className="az-orders__crumbs" aria-label="Trilha de navegação">
          <ol>
            <li>
              <Link href="/account">Sua conta</Link>
            </li>
            <li>
              <Link href="/orders">Seus pedidos</Link>
            </li>
            <li aria-current="page">Detalhes do pedido</li>
          </ol>
        </nav>
        <h1 className="az-orders__title">Detalhes do pedido</h1>
        <p className="az-order-detail__meta">
          Pedido feito em {formatLongDate(order.placedAt)}
          <span className="az-order__sep" aria-hidden="true" />
          Pedido nº {order.orderNumber}
        </p>

        <section className="az-order-detail__summary" aria-label="Informações do pedido">
          <div>
            <h2>Endereço de envio</h2>
            {address ? (
              <address>
                {address.recipient}
                <br />
                {address.street}, {address.number}
                {address.complement ? `, ${address.complement}` : ''}
                <br />
                {address.neighborhood}, {address.city} — {address.state}
                <br />
                {address.postalCode}
              </address>
            ) : (
              <p>Não informado</p>
            )}
          </div>
          <div>
            <h2>Forma de pagamento</h2>
            <p>{order.paymentMethod ? PAYMENT[order.paymentMethod] : 'Não informado'}</p>
          </div>
          <div id="resumo">
            <h2>Resumo do pedido</h2>
            <dl className="az-order-detail__totals">
              <div>
                <dt>Subtotal do(s) item(ns):</dt>
                <dd>{formatCartMoney(order.subtotalMinor, order.currency)}</dd>
              </div>
              <div>
                <dt>Frete e manuseio:</dt>
                <dd>{formatCartMoney(order.shippingMinor, order.currency)}</dd>
              </div>
              {order.discountMinor > 0 && (
                <div>
                  <dt>Desconto:</dt>
                  <dd>-{formatCartMoney(order.discountMinor, order.currency)}</dd>
                </div>
              )}
              <div className="az-order-detail__grand">
                <dt>Total do pedido:</dt>
                <dd>{formatCartMoney(order.totalMinor, order.currency)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <article className="az-order" aria-label={`Pedido nº ${order.orderNumber}`}>
          <OrderShipment order={order} />
        </article>
      </main>
      <AmazonFooter />
    </div>
  );
}
