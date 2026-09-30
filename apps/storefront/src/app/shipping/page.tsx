import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('shipping');

export default function ShippingPage() {
  return (
    <FeatureRoute routeKey="shipping" title="Frete e prazo de entrega">
      <CustomerPageLayout page={CUSTOMER_PAGES.shipping} />
    </FeatureRoute>
  );
}
