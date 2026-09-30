import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('amazonScience');
}

export default function AmazonSciencePage() {
  return (
    <FeatureRoute routeKey="amazonScience" title="Amazon Science">
      <CorporatePageShell pageKey="amazonScience" />
    </FeatureRoute>
  );
}
