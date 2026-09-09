import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function PressPage() {
  return (
    <FeatureRoute routeKey="press" title="Comunicados à imprensa">
      <PageContainer eyebrow="Institucional" title="Comunicados à imprensa">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
