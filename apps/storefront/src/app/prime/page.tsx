import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function PrimePage() {
  return (
    <FeatureRoute routeKey="prime" title="Sua assinatura Prime">
      <PageContainer eyebrow="Sua conta" title="Sua assinatura Prime">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
