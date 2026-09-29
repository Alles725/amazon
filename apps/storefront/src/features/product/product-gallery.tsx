'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/components/amazon/product-image';

export interface GalleryImage {
  src: string;
  alt: string;
}

/** Amazon shows six thumbnails and folds the rest into an "N+" button. */
const VISIBLE_THUMBNAILS = 6;

/** Receives the product's own photos only; with none it shows the shared
 * "Imagem indisponível" placeholder and no thumbnails. */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [viewer, setViewer] = useState(false);
  const [shared, setShared] = useState('');
  const active = images[selected] ?? images[0];
  const overflow = images.length > VISIBLE_THUMBNAILS + 1;
  const thumbnails = overflow ? images.slice(0, VISIBLE_THUMBNAILS) : images;
  const show = (index: number) => setSelected(index);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared('Link copiado');
      }
    } catch {
      // Cancelled share sheet or blocked clipboard: nothing to report.
    }
  }

  return (
    <section className="az-pdp-gallery" aria-label={`Imagens de ${name}`}>
      {images.length > 1 && (
        <div className="az-pdp-thumbs" role="group" aria-label="Escolher imagem do produto">
          {thumbnails.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              aria-pressed={index === selected}
              onClick={() => show(index)}
              onMouseEnter={() => show(index)}
            >
              <Image src={image.src} alt="" width={40} height={40} />
            </button>
          ))}
          {overflow && (
            <button
              type="button"
              className="az-pdp-thumbs__more"
              aria-label={`Ver todas as ${images.length} imagens`}
              onClick={() => setViewer(true)}
            >
              {images.length - VISIBLE_THUMBNAILS}+
            </button>
          )}
        </div>
      )}
      <div className="az-pdp-gallery__stage">
        <button type="button" className="az-pdp-gallery__share" onClick={share}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 3v12M7 8l5-5 5 5M5 13v6h14v-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="visually-hidden">Compartilhar</span>
        </button>
        <span className="az-pdp-gallery__shared" role="status">
          {shared}
        </span>
        {active && !failed.has(active.src) ? (
          <button
            type="button"
            className="az-pdp-gallery__main"
            aria-label={`Ampliar imagem: ${active.alt || name}`}
            onClick={() => setViewer(true)}
          >
            <Image
              src={active.src}
              alt={active.alt || name}
              width={600}
              height={600}
              sizes="(max-width: 600px) 90vw, (max-width: 1100px) 45vw, 560px"
              priority={selected === 0}
              onError={() => setFailed((current) => new Set(current).add(active.src))}
            />
          </button>
        ) : (
          <div className="az-pdp-gallery__main az-pdp-gallery__main--empty">
            <ProductImage />
          </div>
        )}
        {active && !failed.has(active.src) && (
          <p className="az-pdp-gallery__hint">Clique para ver a imagem completa</p>
        )}
      </div>
      {viewer && active && (
        <ImageViewer
          images={images}
          name={name}
          selected={selected}
          onSelect={show}
          onClose={() => setViewer(false)}
        />
      )}
    </section>
  );
}

function ImageViewer({
  images,
  name,
  selected,
  onSelect,
  onClose,
}: {
  images: GalleryImage[];
  name: string;
  selected: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const active = images[selected] ?? images[0];
  // Latest values for the one-time keyboard listener below.
  const latest = useRef({ selected, onSelect, onClose, count: images.length });
  latest.current = { selected, onSelect, onClose, count: images.length };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      const { selected: index, onSelect: select, onClose: dismiss, count } = latest.current;
      if (event.key === 'Escape') dismiss();
      if (event.key === 'ArrowRight') select((index + 1) % count);
      if (event.key === 'ArrowLeft') select((index - 1 + count) % count);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, []);

  return (
    <div className="az-pdp-viewer" role="presentation" onClick={onClose}>
      <div
        className="az-pdp-viewer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Imagens de ${name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={close}
          type="button"
          className="az-pdp-viewer__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
        <div className="az-pdp-viewer__image">
          <Image
            src={active.src}
            alt={active.alt || name}
            width={1000}
            height={1000}
            sizes="80vw"
          />
        </div>
        <div className="az-pdp-viewer__side">
          <p className="az-pdp-viewer__title">{name}</p>
          {images.length > 1 && (
            <div className="az-pdp-viewer__thumbs" role="group" aria-label="Escolher imagem">
              {images.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  aria-label={`Imagem ${index + 1} de ${images.length}`}
                  aria-pressed={index === selected}
                  onClick={() => onSelect(index)}
                >
                  <Image src={image.src} alt="" width={64} height={64} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
