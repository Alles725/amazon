import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function SecurityPage() {
  return (
    <FeatureRoute routeKey="security" title="Acesso e segurança">
      <PageContainer eyebrow="Sua conta" title="Acesso e segurança">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
