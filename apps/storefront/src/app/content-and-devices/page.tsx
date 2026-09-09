import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function ContentAndDevicesPage() {
  return (
    <FeatureRoute routeKey="contentAndDevices" title="Gerencie seu conteúdo e dispositivos">
      <PageContainer eyebrow="Ajuda" title="Gerencie seu conteúdo e dispositivos">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
