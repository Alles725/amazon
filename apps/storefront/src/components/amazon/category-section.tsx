import Link from 'next/link';
import { ProductGlyph } from './product-glyph';
import { Category } from '@/features/home/catalog-mock';

export function CategorySection({ title, categories }: { title: string; categories: Category[] }) {
  return (
    <section className="az-section" aria-label={title}>
      <div className="az-section__head">
        <h2 className="az-section__title">{title}</h2>
      </div>
      <div className="az-categories">
        {categories.map((category) => (
          <Link key={category.id} href="/products" className="az-category">
            <div className="az-category__image">
              <ProductGlyph kind={category.glyph} />
            </div>
            <span className="az-category__name">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
