import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { CategorySection } from '@/components/amazon/category-section';
import { HeroBanner } from '@/components/amazon/hero-banner';
import { ProductCollections } from '@/components/amazon/product-collections';
import { ProductSection } from '@/components/amazon/product-section';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { fetchOrders } from '@/features/orders/orders-server';
import { RecentOrdersCard } from '@/features/orders/recent-orders-card';
import {
  ALSO_CONSIDER,
  BEST_SELLERS,
  CATEGORIES,
  DEALS_OF_THE_DAY,
  HOME_COLLECTIONS,
  RECOMMENDED,
} from '@/features/home/catalog-mock';

export default async function HomePage() {
  // The signed-in user's real orders take the first collection slot.
  const orders =
    isFeatureEnabled('orders') && (await getServerSession()) ? ((await fetchOrders()) ?? []) : [];
  const collections = orders.length ? HOME_COLLECTIONS.slice(0, -1) : HOME_COLLECTIONS;

  return (
    <FeatureRoute routeKey="home" title="Home">
      <div className="amazon-home" id="top">
        <AmazonHeader />

        <main className="az-main">
          <HeroBanner />

          <div className="az-content">
            <ProductSection title="Ofertas do dia" products={DEALS_OF_THE_DAY} />
            <CategorySection title="Compre por categoria" categories={CATEGORIES} />
            <ProductCollections
              collections={collections}
              leading={orders.length ? <RecentOrdersCard orders={orders} /> : undefined}
            />
            <ProductSection title="Mais vendidos" products={BEST_SELLERS} />
            <div className="az-home-ending">
              <ProductSection title="Recomendados para você" products={RECOMMENDED} />
              <ProductSection title="Confira também" products={ALSO_CONSIDER} />
            </div>
          </div>
        </main>

        <AmazonFooter />
      </div>
    </FeatureRoute>
  );
}
