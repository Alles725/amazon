import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function HelpPage() {
  return (
    <FeatureRoute routeKey="help" title="Ajuda">
      <PageContainer eyebrow="Ajuda" title="Ajuda">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
