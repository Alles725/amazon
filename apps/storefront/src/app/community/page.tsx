import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('community');
}

export default function CommunityPage() {
  return (
    <FeatureRoute routeKey="community" title="Comunidade">
      <CorporatePageShell pageKey="community" />
    </FeatureRoute>
  );
}
