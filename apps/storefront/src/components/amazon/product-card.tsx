import Link from 'next/link';
import { ProductImage } from './product-image';
import { RatingStars } from './rating-stars';
import { discountPercent, formatBRL, Product } from '@/features/home/catalog-mock';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const discount = discountPercent(product);
  const parts = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).formatToParts(product.price);
  const integer = parts
    .filter((part) => part.type === 'integer' || part.type === 'group')
    .map((part) => part.value)
    .join('');
  const fraction = parts.find((part) => part.type === 'fraction')?.value;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`az-card${compact ? ' az-card--compact' : ''}`}
      title={product.name}
    >
      <div className="az-card__image">
        <ProductImage image={product.image} glyph={product.glyph} />
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
      <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      <div className="az-card__price" aria-label={`Preço atual: ${formatBRL(product.price)}`}>
        <span className="az-card__currency" aria-hidden="true">
          R$
        </span>
        <span className="az-card__price-main" aria-hidden="true">
          {integer}
        </span>
        <span className="az-card__cents" aria-hidden="true">
          {fraction}
        </span>
      </div>
      {product.oldPrice && (
        <span className="az-card__old-price">
          De: <del>{formatBRL(product.oldPrice)}</del>
        </span>
      )}
      {product.badge && <span className="az-card__badge">{product.badge}</span>}
    </Link>
  );
}
