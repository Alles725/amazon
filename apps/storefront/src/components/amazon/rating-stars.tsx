export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="az-rating" aria-label={`${rating} de 5 estrelas, ${reviewCount} avaliações`}>
      <span className="az-rating__stars" style={{ ['--fill' as string]: `${(rounded / 5) * 100}%` }}>
        ★★★★★
      </span>
      <span className="az-rating__count">{reviewCount.toLocaleString('pt-BR')}</span>
    </div>
  );
}
