import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getConfig } from '@/config/storefront-config';
import { getServerSession } from '@/features/auth/server-session';
import { CheckoutShell } from '@/features/checkout/checkout-shell';
import { formatCartMoney } from '@/features/cart/money';
export default async function CheckoutSuccess({ params }: { params: { orderId: string } }) {
  if (!isFeatureEnabled('checkout'))
    return (
      <FeatureRoute routeKey="checkout" title="Pedido">
        {null}
      </FeatureRoute>
    );
  if (!(await getServerSession())) redirect('/login?next=checkout');
  if (!/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(params.orderId)) notFound();
  const config = getConfig();
  const response = await fetch(
    `${config.api.internalBaseUrl}${config.api.publicBasePath}/orders/${params.orderId}`,
    { cache: 'no-store', headers: { cookie: cookies().toString() } },
  );
  if (response.status === 401) redirect('/login?next=checkout');
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Order unavailable');
  const order = (await response.json()) as OrderResponse;
  const address = order.shippingAddress;
  return (
    <CheckoutShell>
      <main className="az-checkout-main az-checkout-success">
        <section className="az-checkout-panel">
          <h1>Pedido confirmado!</h1>
          <p>Seu pedido foi salvo. O pagamento é simulado e não houve cobrança real.</p>
          <p className="az-checkout-order-number">
            Número do pedido: <strong>{order.orderNumber}</strong>
          </p>
          <p>Status: {order.status === 'PENDING' ? 'Recebido — pendente' : order.status}</p>
        </section>
        <section className="az-checkout-panel">
          <h2>Entrega</h2>
          {address && (
            <p>
              {address.recipient}
              <br />
              {address.street}, {address.number}
              {address.complement ? `, ${address.complement}` : ''}
              <br />
              {address.neighborhood}, {address.city} — {address.state}
              <br />
              {address.postalCode}
            </p>
          )}
          <p>
            Pagamento:{' '}
            {order.paymentMethod === 'SIMULATED_CARD'
              ? 'Cartão fictício · Visa final 4242'
              : order.paymentMethod === 'SIMULATED_PIX'
                ? 'Pix simulado'
                : 'Não informado'}
          </p>
        </section>
        <section className="az-checkout-panel">
          <h2>Resumo do pedido</h2>
          <ul className="az-checkout-confirmed-items">
            {order.lines.map((line) => (
              <li key={line.productId}>
                <span>
                  {line.quantity} × {line.productName}
                </span>
                <strong>{formatCartMoney(line.lineTotalMinor, line.currency)}</strong>
              </li>
            ))}
          </ul>
          <p>Frete: {formatCartMoney(order.shippingMinor, order.currency)}</p>
          <p className="az-checkout-total">
            Total: <strong>{formatCartMoney(order.totalMinor, order.currency)}</strong>
          </p>
          <Link className="az-cart-button" href="/">
            Continuar comprando
          </Link>
        </section>
      </main>
    </CheckoutShell>
  );
}
