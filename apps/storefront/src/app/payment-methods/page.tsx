import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function PaymentMethodsPage() {
  return (
    <FeatureRoute routeKey="paymentMethods" title="Meios de pagamento">
      <PageContainer eyebrow="Pagamento" title="Meios de pagamento">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
