import { FeatureRoute } from '@/config/feature-gate';
import { CONDITIONS_OF_USE } from '@/features/legal/conditions-of-use-content';
import { LegalPageLayout, legalPageMetadata } from '@/features/legal/legal-page';

export const metadata = legalPageMetadata(CONDITIONS_OF_USE);

export default function ConditionsOfUsePage() {
  return (
    <FeatureRoute routeKey="conditionsOfUse" title={CONDITIONS_OF_USE.title}>
      <LegalPageLayout doc={CONDITIONS_OF_USE} />
    </FeatureRoute>
  );
}
