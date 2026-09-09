import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function BrandProtectionPage() {
  return (
    <FeatureRoute routeKey="brandProtection" title="Proteja e construa sua marca">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Proteja e construa sua marca">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
