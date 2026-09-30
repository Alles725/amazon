import { FeatureRoute } from '@/config/feature-gate';
import { CorporatePageShell, corporateMetadata } from '@/features/corporate/corporate-shell';

export function generateMetadata() {
  return corporateMetadata('publish');
}

export default function PublishPage() {
  return (
    <FeatureRoute routeKey="publish" title="Publique seus livros">
      <CorporatePageShell pageKey="publish" />
    </FeatureRoute>
  );
}
