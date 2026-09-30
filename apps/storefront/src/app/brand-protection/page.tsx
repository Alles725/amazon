import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('brandProtection');
}

export default function BrandProtectionPage() {
  return (
    <FeatureRoute routeKey="brandProtection" title="Proteja e construa a sua marca">
      <CorporatePageShell pageKey="brandProtection" />
    </FeatureRoute>
  );
}
