import { redirect } from 'next/navigation';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { CheckoutShell } from '@/features/checkout/checkout-shell';
import { CheckoutContent } from '@/features/checkout/checkout-content';
export default async function CheckoutPage() {
  if (!isFeatureEnabled('checkout'))
    return (
      <FeatureRoute routeKey="checkout" title="Finalizar compra">
        {null}
      </FeatureRoute>
    );
  if (!isFeatureEnabled('cart')) redirect('/cart');
  const session = await getServerSession();
  if (!session) redirect('/login?next=checkout');
  return (
    <CheckoutShell>
      <CheckoutContent name={session.user.displayName} />
    </CheckoutShell>
  );
}
