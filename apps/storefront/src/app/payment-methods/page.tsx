import { FeatureRoute } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';
import { PaymentTransactions } from '@/features/customer-pages/payment-transactions';
import { fetchOrders } from '@/features/orders/orders-server';

export const metadata = customerPageMetadata('paymentMethods');

export default function PaymentMethodsPage() {
  return (
    <FeatureRoute routeKey="paymentMethods" title="Meios de pagamento">
      <PaymentMethodsContent />
    </FeatureRoute>
  );
}

// Separate so the session/orders lookups only run when the route is enabled.
async function PaymentMethodsContent() {
  const session = await getServerSession();
  const orders = session ? await fetchOrders() : null;

  return (
    <CustomerPageLayout
      page={CUSTOMER_PAGES.paymentMethods}
      slots={{ transactions: <PaymentTransactions signedIn={Boolean(session)} orders={orders} /> }}
    />
  );
}
