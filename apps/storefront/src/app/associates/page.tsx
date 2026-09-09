import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AssociatesPage() {
  return (
    <FeatureRoute routeKey="associates" title="Seja um associado">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Seja um associado">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
