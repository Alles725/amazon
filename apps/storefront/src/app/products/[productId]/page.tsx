import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  return (
    <FeatureRoute routeKey="productDetails" title="Product">
      <PageContainer eyebrow="Catalog" title="Product">
        <EmptyState
          title={`Nothing loaded for "${params.productId}"`}
          body="Product details are not wired to the API yet (Iteration 4)."
        />
      </PageContainer>
    </FeatureRoute>
  );
}
