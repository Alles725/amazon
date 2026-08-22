import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ProductsPage() {
  return (
    <FeatureRoute routeKey="products" title="Products">
      <PageContainer eyebrow="Catalog" title="Products">
        <EmptyState
          title="No products to show"
          body="The catalog feature is enabled but the listing is not wired to the API yet (Iteration 4)."
        />
      </PageContainer>
    </FeatureRoute>
  );
}
