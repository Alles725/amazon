import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function OrdersPage() {
  return (
    <FeatureRoute routeKey="orders" title="Orders">
      <PageContainer eyebrow="Orders" title="Your orders">
        <EmptyState title="No orders yet" body="Order history arrives in Iteration 7." />
      </PageContainer>
    </FeatureRoute>
  );
}
