import { FeatureRoute } from '@/config/feature-gate';
import { LegalPageLayout, legalPageMetadata } from '@/features/legal/legal-page';
import { PRIVACY_NOTICE } from '@/features/legal/privacy-notice-content';

export const metadata = legalPageMetadata(PRIVACY_NOTICE);

export default function PrivacyPage() {
  return (
    <FeatureRoute routeKey="privacyNotice" title={PRIVACY_NOTICE.title}>
      <LegalPageLayout doc={PRIVACY_NOTICE} />
    </FeatureRoute>
  );
}
