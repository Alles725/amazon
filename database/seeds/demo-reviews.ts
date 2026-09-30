import { PrismaClient } from '@prisma/client';
import products from '../../config/demo-products.json';
import content from '../../config/demo-product-content.json';
import reviews from '../../config/demo-reviews.json';

/**
 * Demo fixtures for the Reviews module, clearly marked as such:
 * - review_rating_baselines: the aggregate rating each demo listing already showed
 *   (config/demo-products.json), with its star distribution when the listing has
 *   one. There are no written texts behind these numbers.
 * - reviews with source DEMO: the written fixture texts (config/demo-reviews.json)
 *   with fictitious authors and no account behind them, so they are never
 *   "Compra verificada".
 * Like the catalog seed, a fixture only applies to the record whose slug AND SKU
 * match, and existing rows are never overwritten, so reruns are safe.
 */
export async function seedDemoReviews(prisma: PrismaClient) {
  let baselines = 0;
  for (const product of products) {
    if (!product.reviewCount) continue;
    const saved = await prisma.product.findUnique({ where: { slug: product.id } });
    if (!saved || saved.sku !== product.sku) continue;
    const extra = content.find((item) => item.id === product.id && item.sku === product.sku);
    const distribution = extra?.ratingDistribution?.length === 5 ? extra.ratingDistribution : [];
    await prisma.reviewRatingBaseline.upsert({
      where: { productId: saved.id },
      update: {},
      create: {
        productId: saved.id,
        // Variants of one listing share its aggregate; summaries count it once.
        listingKey: extra?.variant?.group ?? product.id,
        ratingCount: product.reviewCount,
        ratingSum: Math.round(product.rating * product.reviewCount),
        distribution,
      },
    });
    baselines++;
  }

  let texts = 0;
  for (const review of reviews) {
    const saved = await prisma.product.findUnique({ where: { slug: review.productSlug } });
    if (!saved) continue;
    await prisma.review.upsert({
      where: { fixtureKey: review.fixtureKey },
      update: {},
      create: {
        productId: saved.id,
        userId: null,
        authorName: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
        verifiedPurchase: false,
        helpfulCount: review.helpfulCount,
        source: 'DEMO',
        fixtureKey: review.fixtureKey,
        createdAt: new Date(`${review.date}T12:00:00Z`),
      },
    });
    texts++;
  }
  return { baselines, texts };
}
