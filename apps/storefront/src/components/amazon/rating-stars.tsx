export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating * 2) / 2;
  const localizedRating = rating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (
    <div
      className="az-rating"
      role="img"
      aria-label={`${localizedRating} de 5 estrelas, ${reviewCount.toLocaleString('pt-BR')} avaliações`}
    >
      <span className="az-rating__value" aria-hidden="true">
        {localizedRating}
      </span>
      <span
        className="az-rating__stars"
        aria-hidden="true"
        style={{ ['--fill' as string]: `${(rounded / 5) * 100}%` }}
      >
        ★★★★★
      </span>
      <span className="az-rating__count" aria-hidden="true">
        {reviewCount.toLocaleString('pt-BR')}
      </span>
    </div>
  );
}
