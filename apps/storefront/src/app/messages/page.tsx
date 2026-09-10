import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function MessagesPage() {
  return (
    <FeatureRoute routeKey="messages" title="Suas mensagens">
      <PageContainer eyebrow="Sua conta" title="Suas mensagens">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
