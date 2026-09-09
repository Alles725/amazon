import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function PublishPage() {
  return (
    <FeatureRoute routeKey="publish" title="Publique seus livros">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Publique seus livros">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
