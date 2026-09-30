import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('returns');

export default function ReturnsPage() {
  return (
    <FeatureRoute routeKey="returns" title="Devoluções e reembolsos">
      <CustomerPageLayout page={CUSTOMER_PAGES.returns} />
    </FeatureRoute>
  );
}
