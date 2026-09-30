import { FeatureRoute } from '@/config/feature-gate';
import {
  CUSTOMER_PAGES,
  customerPageMetadata,
} from '@/features/customer-pages/customer-page-content';
import { CustomerPageLayout } from '@/features/customer-pages/customer-page';

export const metadata = customerPageMetadata('contentAndDevices');

export default function ContentAndDevicesPage() {
  return (
    <FeatureRoute routeKey="contentAndDevices" title="Gerencie seu conteúdo e dispositivos">
      <CustomerPageLayout page={CUSTOMER_PAGES.contentAndDevices} />
    </FeatureRoute>
  );
}
