import Image from 'next/image';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import { GlyphKind, ProductGlyph } from './product-glyph';

export function ProductImage({ image, glyph }: { image?: ProductPhoto; glyph?: GlyphKind }) {
  return image ? (
    <Image src={image.src} alt={image.alt} width={240} height={240} className="az-product-photo" />
  ) : glyph ? (
    <ProductGlyph kind={glyph} />
  ) : (
    <span className="az-product-no-photo" role="img" aria-label="Imagem do produto indisponível">
      <svg
        viewBox="0 0 48 48"
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="6" y="9" width="36" height="30" rx="3" />
        <circle cx="17" cy="19" r="3" />
        <path d="m8 35 10-10 7 7 6-6 9 9" />
      </svg>
      <span>Imagem indisponível</span>
    </span>
  );
}
