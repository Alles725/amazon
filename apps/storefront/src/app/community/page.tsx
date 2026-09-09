import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';

export default function CommunityPage() {
  return (
    <FeatureRoute routeKey="community" title="Comunidade">
      <PageContainer eyebrow="Institucional" title="Comunidade">
        <EmptyState title="Conteúdo em construção" body="Esta página ainda não foi implementada." />
      </PageContainer>
    </FeatureRoute>
  );
}
