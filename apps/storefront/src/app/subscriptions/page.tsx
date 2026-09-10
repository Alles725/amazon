import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function SubscriptionsPage() {
  return (
    <FeatureRoute routeKey="subscriptions" title="Inscrições e assinaturas">
      <PageContainer eyebrow="Sua conta" title="Inscrições e assinaturas">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
