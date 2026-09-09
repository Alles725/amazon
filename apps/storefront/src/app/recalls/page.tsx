import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function RecallsPage() {
  return (
    <FeatureRoute routeKey="recalls" title="Recalls e alertas de segurança do produto">
      <PageContainer eyebrow="Ajuda" title="Recalls e alertas de segurança do produto">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
