import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('corporateInformation');
}

export default function CorporateInformationPage() {
  return (
    <FeatureRoute routeKey="corporateInformation" title="Informações corporativas">
      <CorporatePageShell pageKey="corporateInformation" />
    </FeatureRoute>
  );
}
