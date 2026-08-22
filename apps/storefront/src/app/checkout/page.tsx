import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

/** Configured as not-found while disabled: a half-built checkout should not be
 *  discoverable at all, unlike browsing pages. */
export default function CheckoutPage() {
  return (
    <FeatureRoute routeKey="checkout" title="Checkout">
      <PageContainer eyebrow="Checkout" title="Checkout">
        <EmptyState title="Nothing to check out" body="Order placement arrives in Iteration 6." />
      </PageContainer>
    </FeatureRoute>
  );
}
