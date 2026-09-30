import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('about');
}

export default function AboutPage() {
  return (
    <FeatureRoute routeKey="about" title="Sobre a Amazon">
      <CorporatePageShell pageKey="about" />
    </FeatureRoute>
  );
}
