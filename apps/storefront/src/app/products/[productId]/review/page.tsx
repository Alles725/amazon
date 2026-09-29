import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

/** Destination of "Escreva uma avaliação" / "Incluir avaliação". Reviews have no
 * backend yet, so the route stays behind the productReviews flag (Coming Soon). */
export default function WriteReviewPage() {
  return (
    <FeatureRoute routeKey="productReviews" title="Escreva uma avaliação">
      <PageContainer eyebrow="Avaliações de clientes" title="Escreva uma avaliação">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
