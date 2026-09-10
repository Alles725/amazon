import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function RefundsPage() {
  return (
    <FeatureRoute routeKey="refunds" title="Reembolsos Boleto/Pix">
      <PageContainer eyebrow="Sua conta" title="Reembolsos Boleto/Pix">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
