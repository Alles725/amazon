'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isApiErrorBody, REVIEW_ROUTES, type HelpfulVoteResponse } from '@amazon-mvp/api-contract';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import type { ReviewMedia } from './product-reviews';

const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

/** Rail of customer photos/videos; "Veja tudo" expands it into a grid where
 * videos are playable. Only rendered when the product has customer media. */
export function CustomerMedia({ media }: { media: ReviewMedia[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="az-pdp-media">
      <div className="az-pdp-media__header">
        <h3>Fotos e vídeos de clientes</h3>
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Mostrar menos' : 'Veja tudo ›'}
        </button>
      </div>
      {expanded ? (
        <ul className="az-pdp-media__grid">
          {media.map((item) => (
            <li key={item.id}>
              {item.kind === 'video' ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  preload="none"
                  aria-label={item.alt}
                />
              ) : (
                <Image src={item.src} alt={item.alt} width={200} height={200} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <HorizontalRail label="Fotos e vídeos de clientes" className="az-pdp-media__rail">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              className="az-pdp-media__tile"
              aria-label={item.kind === 'video' ? `Vídeo: ${item.alt}` : item.alt}
              onClick={() => setExpanded(true)}
            >
              <Image
                src={item.kind === 'video' ? (item.poster ?? item.src) : item.src}
                alt=""
                width={140}
                height={140}
              />
              {item.kind === 'video' && (
                <>
                  <span className="az-pdp-media__play" aria-hidden="true">
                    ▶
                  </span>
                  {item.durationSeconds !== undefined && (
                    <span className="az-pdp-media__duration">{duration(item.durationSeconds)}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </HorizontalRail>
      )}
    </div>
  );
}

function helpfulText(count: number) {
  if (count <= 0) return null;
  return count === 1 ? 'Uma pessoa achou isso útil' : `${count} pessoas acharam isso útil`;
}

/** "Útil" persists one vote per customer (PUT /reviews/:id/helpful). The count
 * updates optimistically and is replaced by the server's count, or rolled back
 * when the vote fails. Guests are sent to sign in; authors cannot vote their own
 * review. */
export function ReviewFeedback({
  reviewId,
  helpfulCount,
  votedHelpful,
  own,
  signedIn,
  loginHref,
}: {
  reviewId: string;
  helpfulCount: number;
  votedHelpful: boolean;
  own: boolean;
  signedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState(helpfulCount);
  const [voted, setVoted] = useState(votedHelpful);
  const [error, setError] = useState('');
  const text = helpfulText(count);

  const vote = async () => {
    if (!signedIn) {
      router.push(loginHref);
      return;
    }
    setError('');
    setVoted(true);
    setCount((current) => current + 1);
    try {
      const response = await fetch(REVIEW_ROUTES.helpful(reviewId), {
        method: 'PUT',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const payload: unknown = await response.json().catch(() => null);
      if (response.ok) {
        setCount((payload as HelpfulVoteResponse).helpfulCount);
        return;
      }
      setVoted(false);
      setCount(helpfulCount);
      if (response.status === 401) {
        router.push(loginHref);
        return;
      }
      setError(
        isApiErrorBody(payload) && response.status === 403
          ? payload.error.message
          : 'Não foi possível registrar seu voto. Tente novamente.',
      );
    } catch {
      setVoted(false);
      setCount(helpfulCount);
      setError('Não foi possível registrar seu voto. Tente novamente.');
    }
  };

  return (
    <>
      {text && <p className="az-pdp-muted">{text}</p>}
      <p className="az-pdp-review__actions">
        {own ? null : voted ? (
          <span className="az-pdp-review__thanks" role="status">
            Obrigado pelo seu feedback.
          </span>
        ) : (
          <button type="button" className="az-pdp-pill" onClick={() => void vote()}>
            Útil
          </button>
        )}
        <Link href="/help">Relatório</Link>
      </p>
      {error && (
        <p className="az-review-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
