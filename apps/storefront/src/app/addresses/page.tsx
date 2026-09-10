import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AddressesPage() {
  return (
    <FeatureRoute routeKey="addresses" title="Seus endereços">
      <PageContainer eyebrow="Sua conta" title="Seus endereços">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
