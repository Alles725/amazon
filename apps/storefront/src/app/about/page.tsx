import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AboutPage() {
  return (
    <FeatureRoute routeKey="about" title="Sobre a Amazon">
      <PageContainer eyebrow="Institucional" title="Sobre a Amazon">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
