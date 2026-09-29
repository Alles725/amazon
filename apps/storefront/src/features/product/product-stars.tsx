import { formatRating } from './product-rules';

/** Five stars filled to the rating (half-star steps), with an accessible label. */
export function ProductStars({ rating, className = '' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={`az-pdp-stars ${className}`}
      role="img"
      aria-label={`${formatRating(rating)} de 5 estrelas`}
      style={{ ['--fill' as string]: `${(rounded / 5) * 100}%` }}
    >
      <span aria-hidden="true">★★★★★</span>
    </span>
  );
}
