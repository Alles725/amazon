import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function CareersPage() {
  return (
    <FeatureRoute routeKey="careers" title="Carreiras">
      <PageContainer eyebrow="Institucional" title="Carreiras">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
