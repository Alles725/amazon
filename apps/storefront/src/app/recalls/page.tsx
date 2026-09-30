import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('recalls');

export default function RecallsPage() {
  return (
    <FeatureRoute routeKey="recalls" title="Recalls e alertas de segurança do produto">
      <CustomerPageLayout page={CUSTOMER_PAGES.recalls} />
    </FeatureRoute>
  );
}
