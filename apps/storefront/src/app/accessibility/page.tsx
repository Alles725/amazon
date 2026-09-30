import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('accessibility');
}

export default function AccessibilityPage() {
  return (
    <FeatureRoute routeKey="accessibility" title="Acessibilidade">
      <CorporatePageShell pageKey="accessibility" />
    </FeatureRoute>
  );
}
