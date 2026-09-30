import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('careers');
}

export default function CareersPage() {
  return (
    <FeatureRoute routeKey="careers" title="Carreiras">
      <CorporatePageShell pageKey="careers" />
    </FeatureRoute>
  );
}
