import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('advertise');
}

export default function AdvertisePage() {
  return (
    <FeatureRoute routeKey="advertise" title="Anuncie seus produtos">
      <CorporatePageShell pageKey="advertise" />
    </FeatureRoute>
  );
}
