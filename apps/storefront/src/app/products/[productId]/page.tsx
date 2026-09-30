import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CatalogProductDetails } from '@amazon-mvp/api-contract';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { fetchOrders } from '@/features/orders/orders-server';
import { getCheckoutPricing } from '@/features/checkout/pricing-server';
import { RecordProductView } from '@/features/browsing-history/record-product-view';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import { ProductCard } from '@/components/amazon/product-card';
import {
  brandSlugs,
  brandStory,
  productContent,
  variantGroupSlugs,
} from '@/features/product/product-content';
import {
  findCatalogProduct,
  getCatalogProduct,
  getDeliveryAddress,
  relatedProducts,
} from '@/features/product/product-server';
import {
  lastPurchase,
  variantDimensions,
  type VariantMember,
} from '@/features/product/product-rules';
import { ProductGallery } from '@/features/product/product-gallery';
import { ProductOverview } from '@/features/product/product-overview';
import { ProductPurchase } from '@/features/product/product-purchase';
import {
  PrimePaymentNotice,
  PrimeUpsell,
  ProductBreadcrumb,
  PurchaseNotice,
} from '@/features/product/product-notices';
import {
  BrandStorySection,
  ProductDescription,
  ProductDetailsSection,
} from '@/features/product/product-sections';
import {
  parseReviewQuery,
  productReviews,
  withRatings,
} from '@/features/product/reviews/product-reviews';
import { CustomerReviews, type ReviewNotice } from '@/features/product/reviews/customer-reviews';

type Params = { params: { productId: string } };
type PageProps = Params & { searchParams?: Record<string, string | string[] | undefined> };

const SITE = 'Amazon.com.br';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!isFeatureEnabled('productDetails')) return {};
  const product = await getCatalogProduct(params.productId).catch(() => null);
  if (!product) return { title: `Produto não encontrado | ${SITE}` };
  const content = productContent(product);
  const description = (product.description ?? content.bullets[0] ?? product.name).slice(0, 160);
  return {
    title: `${product.name} | ${SITE}`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: content.images.slice(0, 1).map((image) => ({ url: image.src, alt: image.alt })),
    },
  };
}

/** One template for every catalog product (UUID or slug). All product facts come
 * from the catalog API; ratings and reviews from the reviews API; merchandising
 * content and purchase history are layered on only when they exist for THIS product. */
export default async function ProductDetailPage({ params, searchParams = {} }: PageProps) {
  if (!isFeatureEnabled('productDetails'))
    return (
      <FeatureRoute routeKey="productDetails" title="Produto">
        {null}
      </FeatureRoute>
    );
  const product = await getCatalogProduct(params.productId);
  if (!product) notFound();
  const content = productContent(product);
  const cartEnabled = isFeatureEnabled('cart');
  const checkoutEnabled = isFeatureEnabled('checkout');

  // Variants are sibling catalog records (Amazon child ASINs) sharing a group.
  const siblings = content.variant
    ? (
        await Promise.all(
          variantGroupSlugs(content.variant.group)
            .filter((slug) => slug !== product.slug)
            .map(findCatalogProduct),
        )
      ).filter((item): item is CatalogProductDetails => item !== null)
    : [];
  const member = (item: CatalogProductDetails): VariantMember => {
    const itemContent = item.id === product.id ? content : productContent(item);
    return {
      product: item,
      options: itemContent.variant?.options ?? [],
      image: itemContent.images[0],
    };
  };
  const current = member(product);
  const members = [current, ...siblings.map(member)].sort(
    (a, b) =>
      variantOrder(content.variant?.group, a.product.slug) -
      variantOrder(content.variant?.group, b.product.slug),
  );
  const dimensions = siblings.length ? variantDimensions(current, members) : [];
  const familyIds = new Set(members.map((item) => item.product.id));

  const session = await getServerSession();
  const [orders, address, pricing, related, brandProducts, reviews] = await Promise.all([
    session && isFeatureEnabled('orders') ? fetchOrders() : Promise.resolve(null),
    session && checkoutEnabled ? getDeliveryAddress() : Promise.resolve(null),
    // The Pix price is only advertised when checkout (which grants it) is available.
    checkoutEnabled ? getCheckoutPricing() : Promise.resolve(null),
    relatedProducts(product, familyIds).then(withRatings),
    content.brand
      ? Promise.all(
          brandSlugs(content.brand)
            .filter((slug) => slug !== product.slug)
            .map(findCatalogProduct),
        )
      : Promise.resolve([]),
    // Variants share one review pool and one rating, like Amazon's parent listing.
    productReviews({
      productId: product.id,
      familyIds: [...familyIds],
      variantOptions: new Map(members.map((item) => [item.product.id, item.options])),
      productSlugs: new Map(members.map((item) => [item.product.id, item.product.slug])),
      query: parseReviewQuery(searchParams),
      signedIn: Boolean(session),
    }),
  ]);
  const purchase = orders ? lastPurchase(orders, [...familyIds]) : null;
  const purchasedOptions = purchase
    ? (members.find((item) => item.product.id === purchase.line.productId)?.options ?? [])
    : [];
  const story = brandStory(content.brand);
  const pixDiscountPercent = pricing?.pixDiscountPercent ?? null;
  const productPath = `/products/${encodeURIComponent(product.slug)}`;
  const reviewHref = `${productPath}/review`;
  const rating = reviews.summary ?? undefined;
  const notice = searchParams.review;
  const reviewNotice: ReviewNotice | undefined =
    notice === 'published' || notice === 'updated' ? notice : undefined;

  return (
    <main className="az-pdp">
      {isFeatureEnabled('browsingHistory') && (
        <RecordProductView id={product.id} name={product.name} image={content.images[0]} />
      )}
      {session && <PrimePaymentNotice />}
      <ProductBreadcrumb path={product.categoryPath} />
      {purchase && (
        <PurchaseNotice purchase={purchase} options={purchasedOptions} reviewHref={reviewHref} />
      )}

      <div className="az-pdp-layout">
        <ProductGallery key={`gallery-${product.id}`} name={product.name} images={content.images} />
        <ProductOverview
          product={product}
          content={content}
          rating={rating}
          dimensions={dimensions}
          brandHref={story ? '#brand-story' : undefined}
          pixDiscountPercent={pixDiscountPercent}
        />
        <aside className="az-pdp-aside" aria-label="Opções de compra">
          <PrimeUpsell />
          <ProductPurchase
            key={`purchase-${product.id}`}
            product={product}
            cartEnabled={cartEnabled}
            checkoutEnabled={checkoutEnabled}
            installments={content.installments}
            fulfillment={content.fulfillment}
            address={address}
            pixDiscountPercent={pixDiscountPercent}
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="az-pdp-section" aria-labelledby="related-title">
          <h2 id="related-title">Produtos relacionados a este item</h2>
          <HorizontalRail label="Produtos relacionados a este item" className="az-pdp-product-rail">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact freeDelivery />
            ))}
          </HorizontalRail>
        </section>
      )}
      <ProductDetailsSection content={content} rating={rating} />
      <ProductDescription description={product.description} />
      {story && (
        <BrandStorySection
          story={story}
          products={brandProducts
            .filter((item): item is CatalogProductDetails => item !== null && item.active)
            .map((item) => ({ product: item, image: productContent(item).images[0] }))}
        />
      )}
      <CustomerReviews
        reviews={reviews}
        writeReviewHref={reviewHref}
        productPath={productPath}
        loginHref={`/login?next=${encodeURIComponent(`${productPath}#customer-reviews`)}`}
        notice={reviewNotice}
      />
    </main>
  );
}

/** Swatches keep the order the variants are declared in the content file. */
function variantOrder(group: string | undefined, slug: string) {
  return group ? variantGroupSlugs(group).indexOf(slug) : 0;
}
