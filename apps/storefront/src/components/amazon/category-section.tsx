import Link from 'next/link';
import { HorizontalRail } from './horizontal-rail';
import { ProductImage } from './product-image';
import { Category } from '@/features/home/catalog-mock';

export function CategorySection({ title, categories }: { title: string; categories: Category[] }) {
  return (
    <section className="az-section az-section--categories" aria-label={title}>
      <div className="az-section__head">
        <h2 className="az-section__title">{title}</h2>
      </div>
      <HorizontalRail label={title} className="az-category-rail">
        {categories.map((category) => (
          <Link key={category.id} href="/products" className="az-category">
            <div className="az-category__image">
              <ProductImage image={category.image} glyph={category.glyph} />
            </div>
            <span className="az-category__name">{category.name}</span>
          </Link>
        ))}
      </HorizontalRail>
    </section>
  );
}
