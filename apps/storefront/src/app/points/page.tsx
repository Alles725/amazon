import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function PointsPage() {
  return (
    <FeatureRoute routeKey="points" title="Compre com Pontos">
      <PageContainer eyebrow="Pagamento" title="Compre com Pontos">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
