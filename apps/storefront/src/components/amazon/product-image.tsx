import Image from 'next/image';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import { GlyphKind, ProductGlyph } from './product-glyph';

export function ProductImage({ image, glyph }: { image?: ProductPhoto; glyph: GlyphKind }) {
  return image ? (
    <Image src={image.src} alt={image.alt} width={240} height={240} className="az-product-photo" />
  ) : (
    <ProductGlyph kind={glyph} />
  );
}
