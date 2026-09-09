import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function SellPage() {
  return (
    <FeatureRoute routeKey="sell" title="Venda na Amazon">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Venda na Amazon">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
