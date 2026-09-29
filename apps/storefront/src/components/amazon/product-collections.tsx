import Link from 'next/link';
import { ReactNode } from 'react';
import { ProductCollection } from '@/features/home/catalog-mock';
import { ProductCard } from './product-card';
import { HorizontalRail } from './horizontal-rail';

/** `leading` is an optional card rendered first (e.g. the user's real orders). */
export function ProductCollections({
  collections,
  leading,
}: {
  collections: ProductCollection[];
  leading?: ReactNode;
}) {
  return (
    <HorizontalRail label="Seleções de produtos" className="az-collections">
      {leading}
      {collections.map((collection) => (
        <section key={collection.id} className="az-collection" aria-label={collection.title}>
          <div className="az-collection__head">
            <h2>{collection.title}</h2>
            <Link href="/products" aria-label={`Ver mais: ${collection.title}`}>
              <span aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="az-collection__grid">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      ))}
    </HorizontalRail>
  );
}
