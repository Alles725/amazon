import Image from 'next/image';
import Link from 'next/link';
import type { CatalogItem } from '@amazon-mvp/api-contract';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import type { BrandStory, ProductContent } from './product-content';
import { ProductStars } from './product-stars';
import { formatRating } from './product-rules';

/** Only fields this product actually has; the section is omitted when none exist. */
export function ProductDetailsSection({ content }: { content: ProductContent }) {
  const { details, bestSellerRanks, rating } = content;
  if (!details.length && !bestSellerRanks.length && !rating) return null;
  return (
    <section
      className="az-pdp-section"
      id="product-details"
      aria-labelledby="product-details-title"
    >
      <h2 id="product-details-title">Detalhes do produto</h2>
      <ul className="az-pdp-details">
        {details.map((detail) => (
          <li key={detail.label}>
            <strong>{detail.label} :</strong> {detail.value}
          </li>
        ))}
        {bestSellerRanks.length > 0 && (
          <li>
            <strong>Ranking dos mais vendidos:</strong>{' '}
            {bestSellerRanks.map((rank, index) => (
              <span key={rank.category} className={index > 0 ? 'az-pdp-details__subrank' : ''}>
                Nº {rank.rank} em {rank.category}
              </span>
            ))}
          </li>
        )}
        {rating && (
          <li>
            <strong>Avaliações dos clientes:</strong> {formatRating(rating.average)}{' '}
            <ProductStars rating={rating.average} />{' '}
            <a href="#customer-reviews">({rating.count.toLocaleString('pt-BR')})</a>
          </li>
        )}
      </ul>
    </section>
  );
}

export function ProductDescription({ description }: { description: string | null }) {
  if (!description) return null;
  return (
    <section className="az-pdp-section" aria-labelledby="product-description-title">
      <h2 id="product-description-title">Descrição do produto</h2>
      <p className="az-pdp-description">{description}</p>
    </section>
  );
}

/** Rendered only for brands with registered content (config/demo-brands.json);
 * the product cards are catalog records of the same brand. */
export function BrandStorySection({
  story,
  products,
}: {
  story: BrandStory;
  products: Array<{ product: CatalogItem; image?: ProductPhoto }>;
}) {
  return (
    <section className="az-pdp-section" id="brand-story" aria-labelledby="brand-story-title">
      <h2 id="brand-story-title">Da marca</h2>
      <div className="az-pdp-brand-story">
        <HorizontalRail label={`Conteúdo da marca ${story.name}`} className="az-pdp-brand-rail">
          {story.banner && (
            <div className="az-pdp-brand-card az-pdp-brand-card--banner">
              <Image
                src={story.banner.src}
                alt={story.banner.alt}
                width={1464}
                height={625}
                sizes="(max-width: 600px) 90vw, 700px"
              />
            </div>
          )}
          <div className="az-pdp-brand-card az-pdp-brand-card--story">
            {story.logo && (
              <Image src={story.logo.src} alt={story.logo.alt} width={315} height={145} />
            )}
            {story.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {products.map(({ product, image }) => (
            <Link
              key={product.id}
              href={`/products/${encodeURIComponent(product.slug)}`}
              className="az-pdp-brand-card az-pdp-brand-card--product"
              title={product.name}
            >
              {image && <Image src={image.src} alt={image.alt} width={260} height={260} />}
              <span>{product.name}</span>
            </Link>
          ))}
        </HorizontalRail>
      </div>
    </section>
  );
}
