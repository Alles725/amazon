'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/components/amazon/product-image';

export interface GalleryImage {
  src: string;
  alt: string;
}

/** Receives product-owned photos only. The current catalog has no image metadata. */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const active = images[selected] ?? images[0];
  return (
    <section className="az-detail-gallery" aria-label={`Imagens de ${name}`}>
      {images.length > 1 && (
        <div className="az-detail-thumbnails" role="group" aria-label="Escolher imagem do produto">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              aria-pressed={active === image}
              onClick={() => {
                setSelected(index);
                setFailedSource(null);
              }}
            >
              <Image src={image.src} alt="" width={48} height={48} unoptimized />
            </button>
          ))}
        </div>
      )}
      <div
        className={`az-detail-gallery__main${active ? '' : ' az-detail-gallery__main--empty'}`}
        aria-live="polite"
      >
        {active && failedSource !== active.src ? (
          <Image
            src={active.src}
            alt={active.alt || name}
            width={700}
            height={700}
            unoptimized
            onError={() => setFailedSource(active.src)}
          />
        ) : (
          <ProductImage />
        )}
      </div>
    </section>
  );
}
