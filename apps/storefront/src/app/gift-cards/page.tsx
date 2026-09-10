import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function GiftCardsPage() {
  return (
    <FeatureRoute routeKey="giftCards" title="Vales-presente">
      <PageContainer eyebrow="Sua conta" title="Vales-presente">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
