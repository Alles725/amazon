import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function SupplyPage() {
  return (
    <FeatureRoute routeKey="supply" title="Forneça para a Amazon">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Forneça para a Amazon">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
