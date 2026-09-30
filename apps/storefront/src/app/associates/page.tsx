import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('associates');
}

export default function AssociatesPage() {
  return (
    <FeatureRoute routeKey="associates" title="Seja um associado">
      <CorporatePageShell pageKey="associates" />
    </FeatureRoute>
  );
}
