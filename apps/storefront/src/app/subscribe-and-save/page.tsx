import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function SubscribeAndSavePage() {
  return (
    <FeatureRoute routeKey="subscribeAndSave" title="Programa e Poupe">
      <PageContainer eyebrow="Sua conta" title="Programa e Poupe">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
