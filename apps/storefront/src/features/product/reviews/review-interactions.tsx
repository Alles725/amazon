'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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

/** There is no reviews backend to store votes, so "Útil" only acknowledges the
 * click in this browser; the persisted helpful count is never changed. */
export function ReviewFeedback() {
  const [thanked, setThanked] = useState(false);
  return (
    <p className="az-pdp-review__actions">
      {thanked ? (
        <span className="az-pdp-review__thanks" role="status">
          Obrigado pelo seu feedback.
        </span>
      ) : (
        <button type="button" className="az-pdp-pill" onClick={() => setThanked(true)}>
          Útil
        </button>
      )}
      <Link href="/help">Relatório</Link>
    </p>
  );
}
