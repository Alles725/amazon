import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ListsPage() {
  return (
    <FeatureRoute routeKey="lists" title="Suas listas">
      <PageContainer eyebrow="Sua conta" title="Suas listas">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
