import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { CategorySection } from '@/components/amazon/category-section';
import { HeroBanner } from '@/components/amazon/hero-banner';
import { ProductSection } from '@/components/amazon/product-section';
import { FeatureRoute } from '@/config/feature-gate';
import {
  ALSO_CONSIDER,
  BEST_SELLERS,
  CATEGORIES,
  DEALS_OF_THE_DAY,
  RECOMMENDED,
} from '@/features/home/catalog-mock';

export default async function HomePage() {
  return (
    <FeatureRoute routeKey="home" title="Home">
      <div className="amazon-home" id="top">
        <AmazonHeader />

        <main className="az-main">
          <HeroBanner />

          <div className="az-content">
            <ProductSection title="Ofertas do dia" products={DEALS_OF_THE_DAY} />
            <CategorySection title="Compre por categoria" categories={CATEGORIES} />
            <ProductSection title="Mais vendidos" products={BEST_SELLERS} />
            <ProductSection title="Recomendados para você" products={RECOMMENDED} />
            <ProductSection title="Confira também" products={ALSO_CONSIDER} />
          </div>
        </main>

        <AmazonFooter />
      </div>
    </FeatureRoute>
  );
}
