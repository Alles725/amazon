import Image from 'next/image';
import Link from 'next/link';
import { ProductStars } from '../product-stars';
import { formatRating, formatReviewDate } from '../product-rules';
import type { CustomerReview, ProductReviews } from './product-reviews';
import { CustomerMedia, ReviewFeedback } from './review-interactions';

const STAR_LABELS = ['5 estrelas', '4 estrelas', '3 estrelas', '2 estrelas', '1 estrela'];

export function CustomerReviews({
  reviews,
  writeReviewHref,
}: {
  reviews: ProductReviews;
  writeReviewHref: string;
}) {
  const { summary, media } = reviews;
  return (
    <section
      className="az-pdp-section az-pdp-reviews"
      id="customer-reviews"
      aria-labelledby="customer-reviews-title"
    >
      <div className="az-pdp-reviews__summary">
        <h2 id="customer-reviews-title">Avaliações de clientes</h2>
        {summary ? (
          <>
            <p className="az-pdp-reviews__average">
              <ProductStars rating={summary.average} className="az-pdp-stars--large" />
              <span>{formatRating(summary.average)} de 5</span>
            </p>
            <p className="az-pdp-muted">
              {summary.count.toLocaleString('pt-BR')}{' '}
              {summary.count === 1 ? 'avaliação global' : 'avaliações globais'}
            </p>
            {summary.distribution && (
              <table className="az-pdp-histogram">
                <caption className="visually-hidden">
                  Distribuição das avaliações por estrelas
                </caption>
                <tbody>
                  {summary.distribution.map((percent, index) => (
                    <tr key={STAR_LABELS[index]}>
                      <th scope="row">{STAR_LABELS[index]}</th>
                      <td>
                        <span
                          className="az-pdp-histogram__bar"
                          role="img"
                          aria-label={`${percent}% das avaliações têm ${STAR_LABELS[index]}`}
                        >
                          <span style={{ width: `${percent}%` }} />
                        </span>
                      </td>
                      <td className="az-pdp-histogram__percent">{percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p className="az-pdp-muted">Ainda não há avaliações de clientes para este produto.</p>
        )}
        <details className="az-pdp-reviews__how">
          <summary>Como as avaliações e classificações de clientes funcionam</summary>
          <p>
            As avaliações de clientes, incluindo as classificações por estrelas de produtos, ajudam
            os clientes a saber mais sobre o produto e decidir se ele é o produto certo para eles.
            Para calcular a classificação geral por estrelas e a distribuição percentual por
            estrela, é considerado se a avaliação é de uma compra verificada.
          </p>
        </details>
        <hr />
        <h3>Avalie este produto</h3>
        <p>Compartilhe seus pensamentos com outros clientes</p>
        <Link className="az-pdp-pill az-pdp-pill--wide" href={writeReviewHref}>
          Escreva uma avaliação
        </Link>
      </div>

      <div className="az-pdp-reviews__content">
        {media.length > 0 && <CustomerMedia media={media} />}
        <h3 className="az-pdp-reviews__top">Melhores avaliações do Brasil</h3>
        {reviews.reviews.length > 0 ? (
          <ul className="az-pdp-review-list">
            {reviews.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
        ) : (
          <p className="az-pdp-muted">Nenhuma avaliação escrita para exibir.</p>
        )}
      </div>
    </section>
  );
}

function helpfulText(count: number) {
  if (count === 0) return null;
  return count === 1 ? 'Uma pessoa achou isso útil' : `${count} pessoas acharam isso útil`;
}

export function ReviewItem({ review }: { review: CustomerReview }) {
  const helpful = helpfulText(review.helpfulCount);
  return (
    <li className="az-pdp-review">
      <p className="az-pdp-review__author">
        <span className="az-pdp-review__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="9" r="4" fill="currentColor" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="currentColor" />
          </svg>
        </span>
        {review.author}
      </p>
      <p className="az-pdp-review__headline">
        <ProductStars rating={review.rating} />
        <strong>{review.title}</strong>
      </p>
      <p className="az-pdp-muted">
        Avaliado no {review.country} em {formatReviewDate(review.date)}
      </p>
      <p className="az-pdp-review__meta">
        {review.variant.map((option) => (
          <span key={option.name}>
            {option.name}: {option.value}
          </span>
        ))}
        {review.verified && <span className="az-pdp-review__verified">Compra verificada</span>}
      </p>
      <p className="az-pdp-review__body">{review.body}</p>
      {review.images && review.images.length > 0 && (
        <div className="az-pdp-review__images">
          {review.images.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} width={88} height={88} />
          ))}
        </div>
      )}
      {helpful && <p className="az-pdp-muted">{helpful}</p>}
      <ReviewFeedback />
    </li>
  );
}
