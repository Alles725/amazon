import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ReturnsPage() {
  return (
    <FeatureRoute routeKey="returns" title="Devoluções e reembolsos">
      <PageContainer eyebrow="Ajuda" title="Devoluções e reembolsos">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
