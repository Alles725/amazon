import Link from 'next/link';
import { ReactNode } from 'react';
import { CatalogItem } from '@amazon-mvp/api-contract';
import { ProductImage } from './product-image';
import { productPresentation } from '@/features/product/product-presentation';
import { RatingStars } from './rating-stars';
import type { RatedCatalogItem } from '@/features/product/reviews/ratings';
import { discountPercent, formatBRL, Product } from '@/features/home/catalog-mock';

export function ProductCard({
  product,
  compact = false,
  action,
  freeDelivery = false,
}: {
  /** Ratings come only from the reviews API (a RatedCatalogItem's `rating`). */
  product: Product | CatalogItem | RatedCatalogItem;
  compact?: boolean;
  action?: ReactNode;
  /** Checkout charges no shipping, so "Entrega GRÁTIS" is always true when shown. */
  freeDelivery?: boolean;
}) {
  const catalog = 'priceMinor' in product ? product : null;
  const presentation = catalog ? productPresentation(catalog) : null;
  const mock = 'price' in product ? product : null;
  const price = catalog ? catalog.priceMinor / 100 : (mock?.price ?? 0);
  const oldPrice =
    mock?.oldPrice ?? (presentation?.oldPriceMinor ? presentation.oldPriceMinor / 100 : undefined);
  const discount = mock
    ? discountPercent(mock)
    : oldPrice
      ? Math.round((1 - price / oldPrice) * 100)
      : undefined;
  const rating = catalog ? (catalog as RatedCatalogItem).rating : undefined;
  const parts = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: catalog?.currency ?? 'BRL',
  }).formatToParts(price);
  const integer = parts
    .filter((part) => part.type === 'integer' || part.type === 'group')
    .map((part) => part.value)
    .join('');
  const fraction = parts.find((part) => part.type === 'fraction')?.value;

  const content = (
    <>
      <div className="az-card__image">
        <ProductImage
          image={mock?.image ?? presentation?.images[0]}
          glyph={mock?.glyph ?? presentation?.glyph}
        />
      </div>
      <div className="az-card__deal">
        {discount && (
          <>
            <span className="az-card__discount">{discount}% off</span>
            <span className="az-card__deal-label">Oferta</span>
          </>
        )}
      </div>
      <p className="az-card__name">{product.name}</p>
      {rating && <RatingStars rating={rating.average} reviewCount={rating.count} />}
      <div
        className="az-card__price"
        aria-label={`Preço atual: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: catalog?.currency ?? 'BRL' }).format(price)}`}
      >
        <span className="az-card__currency" aria-hidden="true">
          {parts.find((part) => part.type === 'currency')?.value}
        </span>
        <span className="az-card__price-main" aria-hidden="true">
          {integer}
        </span>
        <span className="az-card__cents" aria-hidden="true">
          {fraction}
        </span>
      </div>
      {oldPrice && (
        <span className="az-card__old-price">
          De: <del>{formatBRL(oldPrice)}</del>
        </span>
      )}
      {freeDelivery && catalog?.inStock && (
        <span className="az-card__delivery">
          Entrega <strong>GRÁTIS</strong>
        </span>
      )}
      {mock?.badge && <span className="az-card__badge">{mock?.badge}</span>}
    </>
  );
  const className = `az-card${compact ? ' az-card--compact' : ''}`;
  // Cards with an extra action (e.g. the cart's "Adicionar") need a wrapper so the
  // button is not nested inside the link; plain cards are one link, as on the Home.
  return catalog && action ? (
    <article className={className} aria-label={product.name}>
      <Link href={`/products/${catalog.id}`} className="az-card__detail-link" title={product.name}>
        {content}
      </Link>
      {action}
    </article>
  ) : (
    <Link
      href={`/products/${catalog ? catalog.id : product.id}`}
      className={className}
      title={product.name}
    >
      {content}
    </Link>
  );
}
