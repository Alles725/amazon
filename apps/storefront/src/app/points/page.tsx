import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('points');

export default function PointsPage() {
  return (
    <FeatureRoute routeKey="points" title="Compre com Pontos">
      <CustomerPageLayout page={CUSTOMER_PAGES.points} />
    </FeatureRoute>
  );
}
