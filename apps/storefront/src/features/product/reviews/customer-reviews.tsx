import Image from 'next/image';
import Link from 'next/link';
import { ProductStars } from '../product-stars';
import { formatRating, formatReviewDate } from '../product-rules';
import type { CustomerReview, ProductReviews, ReviewQuery } from './product-reviews';
import { CustomerMedia, ReviewFeedback } from './review-interactions';
import './reviews.css';

const STAR_LABELS = ['5 estrelas', '4 estrelas', '3 estrelas', '2 estrelas', '1 estrela'];
const starLabel = (stars: number) => STAR_LABELS[5 - stars];

export type ReviewNotice = 'published' | 'updated';

/** Sort, star filter and page live in the product URL, so every state is a plain
 * server-rendered link (works without JavaScript and can be shared). */
function reviewsHref(productPath: string, query: Partial<ReviewQuery>) {
  const params = new URLSearchParams();
  if (query.sort === 'recent') params.set('reviewSort', 'recent');
  if (query.stars) params.set('reviewStars', String(query.stars));
  if (query.page && query.page > 1) params.set('reviewPage', String(query.page));
  const search = params.toString();
  return `${productPath}${search ? `?${search}` : ''}#customer-reviews`;
}

export function CustomerReviews({
  reviews,
  writeReviewHref,
  productPath,
  loginHref,
  notice,
}: {
  reviews: ProductReviews;
  writeReviewHref: string;
  /** /products/<slug>, base of the sort/filter/page links. */
  productPath: string;
  /** Where guests go to sign in before voting. */
  loginHref: string;
  notice?: ReviewNotice;
}) {
  const { summary, media, query, total, pageSize } = reviews;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (change: Partial<ReviewQuery>) =>
    reviewsHref(productPath, { sort: query.sort, stars: query.stars, ...change });
  const heading = query.stars
    ? `Avaliações com ${starLabel(query.stars)}`
    : query.sort === 'recent'
      ? 'Avaliações mais recentes'
      : 'Melhores avaliações do Brasil';
  return (
    <section
      className="az-pdp-section az-pdp-reviews"
      id="customer-reviews"
      aria-labelledby="customer-reviews-title"
    >
      <div className="az-pdp-reviews__summary">
        <h2 id="customer-reviews-title">Avaliações de clientes</h2>
        {notice && (
          <p className="az-review-notice" role="status">
            {notice === 'published'
              ? 'Obrigado! Sua avaliação foi publicada.'
              : 'Sua avaliação foi atualizada.'}
          </p>
        )}
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
                  {summary.distribution.map((percent, index) => {
                    const stars = 5 - index;
                    const active = query.stars === stars;
                    return (
                      <tr key={STAR_LABELS[index]} className={active ? 'az-review-bucket--active' : ''}>
                        <th scope="row">
                          <Link
                            href={link({ stars: active ? undefined : stars, page: 1 })}
                            aria-current={active ? 'true' : undefined}
                            aria-label={
                              active
                                ? `Remover o filtro de ${STAR_LABELS[index]}`
                                : `Ver avaliações com ${STAR_LABELS[index]}`
                            }
                          >
                            {STAR_LABELS[index]}
                          </Link>
                        </th>
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        ) : reviews.unavailable ? (
          <p className="az-pdp-muted" role="status">
            Não foi possível carregar as avaliações agora. Atualize a página para tentar novamente.
          </p>
        ) : (
          <p className="az-pdp-muted">Ainda não há avaliações de clientes para este produto.</p>
        )}
        <details className="az-pdp-reviews__how">
          <summary>Como as avaliações e classificações de clientes funcionam</summary>
          <p>
            As avaliações de clientes, incluindo as classificações por estrelas de produtos, ajudam
            os clientes a saber mais sobre o produto e decidir se ele é o produto certo para eles.
            O selo &quot;Compra verificada&quot; aparece quando quem avaliou tem um pedido deste
            produto na loja. Cada cliente pode avaliar um produto uma vez e editar a própria
            avaliação depois.
          </p>
        </details>
        <hr />
        <h3>{reviews.hasOwnReview ? 'Você avaliou este produto' : 'Avalie este produto'}</h3>
        <p>
          {reviews.hasOwnReview
            ? 'Mudou de ideia? Você pode editar sua avaliação.'
            : summary
              ? 'Compartilhe seus pensamentos com outros clientes'
              : 'Seja o primeiro a compartilhar sua opinião com outros clientes'}
        </p>
        <Link className="az-pdp-pill az-pdp-pill--wide" href={writeReviewHref}>
          {reviews.hasOwnReview ? 'Editar sua avaliação' : 'Escreva uma avaliação'}
        </Link>
      </div>

      <div className="az-pdp-reviews__content">
        {media.length > 0 && <CustomerMedia media={media} />}
        <h3 className="az-pdp-reviews__top">{heading}</h3>
        {(total > 0 || query.stars) && (
          <nav className="az-review-controls" aria-label="Organizar avaliações">
            <span>Classificar por:</span>
            <Link
              href={link({ sort: 'helpful', page: 1 })}
              aria-current={query.sort === 'helpful' ? 'true' : undefined}
            >
              Mais úteis
            </Link>
            <Link
              href={link({ sort: 'recent', page: 1 })}
              aria-current={query.sort === 'recent' ? 'true' : undefined}
            >
              Mais recentes
            </Link>
            {query.stars && (
              <Link href={link({ stars: undefined, page: 1 })} className="az-review-controls__clear">
                Limpar filtro ({starLabel(query.stars)})
              </Link>
            )}
          </nav>
        )}
        {reviews.reviews.length > 0 ? (
          <ul className="az-pdp-review-list">
            {reviews.reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                signedIn={reviews.signedIn}
                loginHref={loginHref}
              />
            ))}
          </ul>
        ) : (
          <p className="az-pdp-muted">
            {query.stars
              ? `Nenhuma avaliação escrita com ${starLabel(query.stars)}.`
              : 'Nenhuma avaliação escrita para exibir.'}
          </p>
        )}
        {pages > 1 && (
          <nav className="az-review-pagination" aria-label="Páginas de avaliações">
            {query.page > 1 && (
              <Link href={link({ page: query.page - 1 })} rel="prev">
                ‹ Anterior
              </Link>
            )}
            <span aria-current="page">
              Página {Math.min(query.page, pages)} de {pages}
            </span>
            {query.page < pages && (
              <Link href={link({ page: query.page + 1 })} rel="next">
                Próxima ›
              </Link>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}

export function ReviewItem({
  review,
  signedIn = false,
  loginHref = '/login',
}: {
  review: CustomerReview;
  signedIn?: boolean;
  loginHref?: string;
}) {
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
        {review.own && <span className="az-review-own">Sua avaliação</span>}
      </p>
      <p className="az-pdp-review__headline">
        <ProductStars rating={review.rating} />
        <strong>{review.title}</strong>
      </p>
      <p className="az-pdp-muted">
        Avaliado no {review.country} em {formatReviewDate(review.date)}
      </p>
      {(review.variant.length > 0 || review.verified) && (
        <p className="az-pdp-review__meta">
          {review.variant.map((option) => (
            <span key={option.name}>
              {option.name}: {option.value}
            </span>
          ))}
          {review.verified && <span className="az-pdp-review__verified">Compra verificada</span>}
        </p>
      )}
      <p className="az-pdp-review__body az-review-body">{review.body}</p>
      {review.images && review.images.length > 0 && (
        <div className="az-pdp-review__images">
          {review.images.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} width={88} height={88} />
          ))}
        </div>
      )}
      <ReviewFeedback
        reviewId={review.id}
        helpfulCount={review.helpfulCount}
        votedHelpful={review.votedHelpful}
        own={review.own}
        signedIn={signedIn}
        loginHref={loginHref}
      />
      {review.editHref && (
        <p>
          <Link className="az-pdp-link" href={review.editHref}>
            Editar sua avaliação
          </Link>
        </p>
      )}
    </li>
  );
}
