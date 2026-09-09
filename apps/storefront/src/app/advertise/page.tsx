import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function AdvertisePage() {
  return (
    <FeatureRoute routeKey="advertise" title="Anuncie seus produtos">
      <PageContainer eyebrow="Ganhe dinheiro conosco" title="Anuncie seus produtos">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
