import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function CreditCardPage() {
  return (
    <FeatureRoute routeKey="creditCard" title="Cartão de crédito Amazon">
      <PageContainer eyebrow="Pagamento" title="Cartão de crédito Amazon">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
