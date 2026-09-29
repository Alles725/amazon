import Link from 'next/link';
import { HorizontalRail } from './horizontal-rail';
import { ProductCard } from './product-card';
import type { CatalogItem } from '@amazon-mvp/api-contract';

export function ProductSection({ title, products }: { title: string; products: CatalogItem[] }) {
  if (!products.length) return null;
  return (
    <section className="az-section" aria-label={title}>
      <div className="az-section__head">
        <h2 className="az-section__title">{title}</h2>
        <Link href="/products" className="az-section__more">
          Ver mais <span aria-hidden="true">›</span>
        </Link>
      </div>
      <HorizontalRail label={title} className="az-product-rail">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </HorizontalRail>
    </section>
  );
}
