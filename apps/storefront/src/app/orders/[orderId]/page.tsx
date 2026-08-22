import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <FeatureRoute routeKey="orderDetails" title="Order">
      <PageContainer eyebrow="Orders" title="Order">
        <EmptyState
          title={`Nothing loaded for order "${params.orderId}"`}
          body="Order details arrive in Iteration 7."
        />
      </PageContainer>
    </FeatureRoute>
  );
}
