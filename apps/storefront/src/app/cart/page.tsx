import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function CartPage() {
  return (
    <FeatureRoute routeKey="cart" title="Cart">
      <PageContainer eyebrow="Cart" title="Your cart">
        <EmptyState title="Your cart is empty" body="Cart contents arrive in Iteration 5." />
      </PageContainer>
    </FeatureRoute>
  );
}
