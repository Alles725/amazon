import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AccessibilityPage() {
  return (
    <FeatureRoute routeKey="accessibility" title="Acessibilidade">
      <PageContainer eyebrow="Institucional" title="Acessibilidade">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
