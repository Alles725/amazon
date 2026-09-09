import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AmazonSciencePage() {
  return (
    <FeatureRoute routeKey="amazonScience" title="Amazon Science">
      <PageContainer eyebrow="Institucional" title="Amazon Science">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
