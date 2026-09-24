import Link from 'next/link';
import { ProductCollection } from '@/features/home/catalog-mock';
import { ProductCard } from './product-card';
import { HorizontalRail } from './horizontal-rail';

export function ProductCollections({ collections }: { collections: ProductCollection[] }) {
  return (
    <HorizontalRail label="Seleções de produtos" className="az-collections">
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
