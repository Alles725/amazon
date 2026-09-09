import { formatBRL } from '@/features/home/catalog-mock';
import { GlyphKind, ProductGlyph } from './product-glyph';

interface FeaturedItem {
  glyph: GlyphKind;
  label: string;
  price: number;
}

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  background: string;
  featured: FeaturedItem[];
}

/** Flat campaign colors, not gradients — matches how Amazon's own seasonal
 * banners use a single solid backdrop behind the promo copy. */
const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'Semana do consumidor',
    title: 'Ofertas em eletrônicos e casa inteligente',
    cta: 'Compre agora',
    background: '#0f4c46',
    featured: [
      { glyph: 'echo', label: 'Echo Dot', price: 279 },
      { glyph: 'airfryer', label: 'Air Fryer 4L', price: 259 },
    ],
  },
  {
    id: 'slide-2',
    eyebrow: 'Amazon Moda',
    title: 'Até 40% off em tênis e acessórios',
    cta: 'Ver ofertas',
    background: '#8a4413',
    featured: [
      { glyph: 'sneaker', label: 'Tênis esportivo', price: 159.9 },
      { glyph: 'backpack', label: 'Mochila notebook', price: 129.9 },
    ],
  },
  {
    id: 'slide-3',
    eyebrow: 'Amazon Devices',
    title: 'Echo Dot e Kindle com desconto especial',
    cta: 'Conferir',
    background: '#232f3e',
    featured: [
      { glyph: 'echo', label: 'Echo Dot', price: 279 },
      { glyph: 'ereader', label: 'Kindle 11ª geração', price: 449 },
    ],
  },
];

/** Pure CSS scroll-snap carousel: no JS required for the slides or the dots. */
export function HeroBanner() {
  return (
    <div className="az-hero">
      <a href="#slide-3" className="az-hero__arrow az-hero__arrow--prev" aria-label="Slide anterior">
        ‹
      </a>
      <div className="az-hero__track">
        {SLIDES.map((slide) => (
          <section
            id={slide.id}
            key={slide.id}
            className="az-hero__slide"
            style={{ background: slide.background }}
            aria-label={slide.title}
          >
            <div className="az-hero__copy">
              <p className="az-hero__eyebrow">{slide.eyebrow}</p>
              <h2 className="az-hero__title">{slide.title}</h2>
              <span className="az-hero__cta">{slide.cta}</span>
            </div>

            <div className="az-hero__featured">
              {slide.featured.map((item) => (
                <div className="az-hero__chip" key={item.label}>
                  <div className="az-hero__chip-image">
                    <ProductGlyph kind={item.glyph} />
                  </div>
                  <p className="az-hero__chip-label">{item.label}</p>
                  <p className="az-hero__chip-price">{formatBRL(item.price)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <a href="#slide-2" className="az-hero__arrow az-hero__arrow--next" aria-label="Próximo slide">
        ›
      </a>
      <div className="az-hero__dots" role="tablist" aria-label="Selecionar slide">
        {SLIDES.map((slide) => (
          <a key={slide.id} href={`#${slide.id}`} className="az-hero__dot" aria-label={slide.title} />
        ))}
      </div>
    </div>
  );
}
