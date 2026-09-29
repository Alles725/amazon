import { redirect } from 'next/navigation';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { ordersFont } from '@/features/orders/orders-font';
import { fetchOrders } from '@/features/orders/orders-server';
import { OrdersView } from '@/features/orders/orders-view';

export default function OrdersPage() {
  return (
    <FeatureRoute routeKey="orders" title="Seus pedidos">
      <OrdersPageContent />
    </FeatureRoute>
  );
}

// Separate so the session/orders lookups only run when the route is enabled.
async function OrdersPageContent() {
  if (!(await getServerSession())) redirect('/login');
  const orders = await fetchOrders();

  return (
    <div className={`amazon-orders-page ${ordersFont.variable}`} id="top">
      <AmazonHeader />
      {orders ? (
        <OrdersView orders={orders} />
      ) : (
        <main className="az-orders">
          <h1 className="az-orders__title">Seus pedidos</h1>
          <p className="az-orders__empty" role="alert">
            Não foi possível carregar seus pedidos agora. Tente novamente em instantes.
          </p>
        </main>
      )}
      <AmazonFooter />
    </div>
  );
}
