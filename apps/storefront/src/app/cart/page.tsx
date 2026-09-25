import { CatalogPage } from '@amazon-mvp/api-contract';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getConfig } from '@/config/storefront-config';
import { CartContent } from '@/features/cart/cart-content';

export default async function CartPage() {
  if (!isFeatureEnabled('cart'))
    return (
      <FeatureRoute routeKey="cart" title="Carrinho">
        {null}
      </FeatureRoute>
    );
  const config = getConfig();
  let catalog: CatalogPage = { items: [], total: 0 };
  let catalogFailed = false;
  try {
    const response = await fetch(
      `${config.api.internalBaseUrl}${config.api.publicBasePath}/catalog/products?pageSize=12`,
      { cache: 'no-store' },
    );
    if (!response.ok) throw new Error('Catalog unavailable');
    catalog = (await response.json()) as CatalogPage;
  } catch {
    catalogFailed = true;
  }

  return (
    <div className="amazon-cart-page" id="top">
      <AmazonHeader />
      <CartContent
        products={catalog.items}
        catalogFailed={catalogFailed}
        checkoutEnabled={isFeatureEnabled('checkout')}
      />
      <AmazonFooter />
    </div>
  );
}
