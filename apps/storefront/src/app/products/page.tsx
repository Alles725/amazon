import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { brandByKey } from '@/features/product/product-content';
import { listingTitle } from '@/features/browse/browse-model';
import { browseKey, parseBrowseParams, type SearchParams } from '@/features/browse/browse-params';
import { fetchCategories } from '@/features/browse/browse-server';
import { BrowseResults, BrowseSkeleton } from '@/features/browse/browse-view';
import '@/features/browse/browse.css';

type Props = { searchParams: SearchParams };

const SITE = 'Amazon.com.br';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  if (!isFeatureEnabled('catalog')) return {};
  const params = parseBrowseParams(searchParams);
  const categories = params.category ? await fetchCategories().catch(() => []) : [];
  const title = listingTitle({
    q: params.q,
    categoryName: categories.find((node) => node.slug === params.category)?.name,
    brandName: params.brand ? brandByKey(params.brand) : undefined,
  });
  // Result pages are endless combinations; only the plain listing is worth indexing.
  const plain = !params.q && !params.price && !params.inStock && params.page === 1;
  return { title: `${title} | ${SITE}`, robots: plain ? undefined : { index: false } };
}

/** Product listing, search results, category pages (?category=) and brand pages
 * (?brand=) — one template driven by the URL (see features/browse/browse-params.ts). */
export default function ProductsPage({ searchParams }: Props) {
  const params = parseBrowseParams(searchParams);
  return (
    <FeatureRoute routeKey="products" title="Produtos">
      <div className="amazon-browse-page" id="top">
        <AmazonHeader search={{ q: params.q, category: params.category }} />
        <main className="az-browse-main">
          {/* Keyed per URL: a new search or filter shows the skeleton instead of the
              previous results while it loads. */}
          <Suspense key={browseKey(params)} fallback={<BrowseSkeleton />}>
            <BrowseResults params={params} />
          </Suspense>
        </main>
        <AmazonFooter />
      </div>
    </FeatureRoute>
  );
}
