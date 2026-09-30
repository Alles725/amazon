import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('creditCard');

export default function CreditCardPage() {
  return (
    <FeatureRoute routeKey="creditCard" title="Cartão de crédito Amazon">
      <CustomerPageLayout page={CUSTOMER_PAGES.creditCard} />
    </FeatureRoute>
  );
}
