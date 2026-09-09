import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function CorporateInformationPage() {
  return (
    <FeatureRoute routeKey="corporateInformation" title="Informações corporativas">
      <PageContainer eyebrow="Institucional" title="Informações corporativas">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
