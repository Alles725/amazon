import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('press');
}

export default function PressPage() {
  return (
    <FeatureRoute routeKey="press" title="Comunicados à imprensa">
      <CorporatePageShell pageKey="press" />
    </FeatureRoute>
  );
}
