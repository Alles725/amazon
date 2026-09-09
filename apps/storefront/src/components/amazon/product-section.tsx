import Link from 'next/link';
import { ProductCard } from './product-card';
import { Product } from '@/features/home/catalog-mock';

export function ProductSection({ title, products }: { title: string; products: Product[] }) {
  return (
    <section className="az-section" aria-label={title}>
      <div className="az-section__head">
        <h2 className="az-section__title">{title}</h2>
        <Link href="/products" className="az-section__more">
          Ver mais
        </Link>
      </div>
      <div className="az-section__row">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
