import Link from 'next/link';
import { ReactNode } from 'react';
import { CatalogItem } from '@amazon-mvp/api-contract';
import { ProductImage } from './product-image';
import { productPresentation } from '@/features/product/product-presentation';
import { RatingStars } from './rating-stars';
import { discountPercent, formatBRL, Product } from '@/features/home/catalog-mock';

export function ProductCard({
  product,
  compact = false,
  action,
}: {
  product: Product | CatalogItem;
  compact?: boolean;
  action?: ReactNode;
}) {
  const catalog = 'priceMinor' in product ? product : null;
  const presentation = catalog ? productPresentation(catalog) : null;
  const mock = 'price' in product ? product : null;
  const price = catalog ? catalog.priceMinor / 100 : (mock?.price ?? 0);
  const discount = mock ? discountPercent(mock) : undefined;
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
        <ProductImage image={mock?.image ?? presentation?.images[0]} glyph={mock?.glyph} />
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
      {mock && <RatingStars rating={mock.rating} reviewCount={mock.reviewCount} />}
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
      {mock?.oldPrice && (
        <span className="az-card__old-price">
          De: <del>{formatBRL(mock?.oldPrice)}</del>
        </span>
      )}
      {mock?.badge && <span className="az-card__badge">{mock?.badge}</span>}
    </>
  );
  const className = `az-card${compact ? ' az-card--compact' : ''}`;
  return catalog ? (
    <article className={className} aria-label={product.name}>
      <Link href={`/products/${catalog.id}`} className="az-card__detail-link" title={product.name}>
        {content}
      </Link>
      {action}
    </article>
  ) : (
    <Link href={`/products/${product.id}`} className={className} title={product.name}>
      {content}
    </Link>
  );
}
