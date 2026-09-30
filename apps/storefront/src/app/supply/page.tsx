import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('supply');
}

export default function SupplyPage() {
  return (
    <FeatureRoute routeKey="supply" title="Forneça para a Amazon">
      <CorporatePageShell pageKey="supply" />
    </FeatureRoute>
  );
}
