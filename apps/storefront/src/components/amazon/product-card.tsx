import Link from 'next/link';
import { ProductGlyph } from './product-glyph';
import { RatingStars } from './rating-stars';
import { discountPercent, formatBRL, Product } from '@/features/home/catalog-mock';

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product);

  return (
    <Link href={`/products/${product.id}`} className="az-card">
      <div className="az-card__image">
        <ProductGlyph kind={product.glyph} />
      </div>
      <p className="az-card__name">{product.name}</p>
      <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      <div className="az-card__price">
        {discount && <span className="az-card__discount">-{discount}%</span>}
        <span className="az-card__price-main">{formatBRL(product.price)}</span>
      </div>
      {product.oldPrice && <span className="az-card__old-price">{formatBRL(product.oldPrice)}</span>}
      {product.badge && <span className="az-card__badge">{product.badge}</span>}
    </Link>
  );
}
