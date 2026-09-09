import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ShippingPage() {
  return (
    <FeatureRoute routeKey="shipping" title="Frete e prazo de entrega">
      <PageContainer eyebrow="Ajuda" title="Frete e prazo de entrega">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
