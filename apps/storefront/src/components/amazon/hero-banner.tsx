'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const imagePath = (name: string) => `/images/home/${name}.webp`;

const KITCHEN = [
  { image: 'silver-pot-with-glass-cap', label: 'Panelas' },
  { image: 'hand-blender', label: 'Eletroportáteis' },
  { image: 'black-aluminium-cup', label: 'Canecas' },
  { image: 'microwave-oven', label: 'Para sua cozinha' },
];

const COMPUTERS = [
  { image: 'apple-macbook-pro-14-inch-space-grey', label: 'Notebooks' },
  { image: 'asus-zenbook-pro-dual-screen-laptop', label: 'Tecnologia' },
  { image: 'huawei-matebook-x-pro', label: 'Para trabalhar' },
  { image: 'lenovo-yoga-920', label: 'Para estudar' },
];

const DISCOVER = [
  { image: 'nescafe-coffee', title: 'Para a hora do café', query: 'café' },
  { image: 'hand-blender', title: 'Facilite sua rotina', query: 'cozinha' },
  { image: 'red-lipstick', title: 'Beleza e cuidados', query: 'beleza' },
  { image: 'apple-macbook-pro-14-inch-space-grey', title: 'Explore tecnologia', query: 'notebook' },
  { image: 'silver-pot-with-glass-cap', title: 'Tudo para sua casa', query: 'casa' },
  { image: 'honey-jar', title: 'Encontre novos sabores', query: 'alimentos' },
];

/** Promotional photography is local and illustrative, independent of the catalog API. */
export function HeroBanner() {
  const campaigns = useRef<HTMLDivElement>(null);
  const discoveries = useRef<HTMLDivElement>(null);

  const [overflow, setOverflow] = useState({ campaigns: false, discoveries: false });

  useEffect(() => {
    const updateOverflow = () =>
      setOverflow({
        campaigns: Boolean(
          campaigns.current && campaigns.current.scrollWidth > campaigns.current.clientWidth + 1,
        ),
        discoveries: Boolean(
          discoveries.current &&
            discoveries.current.scrollWidth > discoveries.current.clientWidth + 1,
        ),
      });
    const observer = new ResizeObserver(updateOverflow);
    if (campaigns.current) observer.observe(campaigns.current);
    if (discoveries.current) observer.observe(discoveries.current);
    updateOverflow();
    return () => observer.disconnect();
  }, []);

  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  function scrollCampaign(direction: number) {
    const track = campaigns.current;
    if (!track) return;
    const distance =
      track.querySelector('article')?.getBoundingClientRect().width ?? track.clientWidth;
    track.scrollBy({ left: direction * (distance + 12), behavior: scrollBehavior() });
  }

  return (
    <section className="az-promotions" aria-label="Destaques e categorias">
      <h1 className="visually-hidden">Encontre produtos para o seu dia a dia</h1>
      <div className="az-promotions__layout">
        <Link href="/products?q=alimentos" className="az-promo az-promo--pantry">
          <span className="az-promo__eyebrow">Seu mercado</span>
          <h2>O essencial da sua despensa, em um só lugar</h2>
          <span className="az-promo__pill">
            Explore alimentos e bebidas <span aria-hidden="true">›</span>
          </span>
          <div className="az-pantry-photos" aria-hidden="true">
            <Image
              className="az-pantry-photos__oil"
              src={imagePath('cooking-oil')}
              alt=""
              width={300}
              height={300}
              priority
            />
            <Image
              className="az-pantry-photos__rice"
              src={imagePath('rice')}
              alt=""
              width={300}
              height={300}
              priority
            />
            <Image
              className="az-pantry-photos__coffee"
              src={imagePath('nescafe-coffee')}
              alt=""
              width={300}
              height={300}
            />
            <Image
              className="az-pantry-photos__honey"
              src={imagePath('honey-jar')}
              alt=""
              width={300}
              height={300}
            />
          </div>
        </Link>

        <div className="az-promotions__right">
          <div
            className="az-campaigns"
            id="home-campaigns"
            ref={campaigns}
            tabIndex={0}
            aria-label="Campanhas: deslize para explorar"
          >
            <article id="slide-1" className="az-promo az-promo--beauty">
              <Link href="/products?q=beleza" className="az-promo__full-link">
                <span className="az-promo__eyebrow">Beleza e cuidados</span>
                <h2>
                  Seu momento
                  <br />
                  de se cuidar
                </h2>
                <p>Descubra seus novos favoritos</p>
                <div className="az-beauty-photos" aria-hidden="true">
                  <Image src={imagePath('red-lipstick')} alt="" width={300} height={300} priority />
                  <Image
                    src={imagePath('eyeshadow-palette-with-mirror')}
                    alt=""
                    width={300}
                    height={300}
                    priority
                  />
                </div>
                <span className="az-promo__text-link">
                  Explore beleza <span aria-hidden="true">›</span>
                </span>
              </Link>
            </article>

            <article id="slide-2" className="az-promo az-promo--kitchen">
              <span className="az-promo__eyebrow">Destaques do momento</span>
              <h2>Escolhas pra você</h2>
              <div className="az-promo__tiles">
                {KITCHEN.map((item) => (
                  <Link href={`/products?q=${encodeURIComponent(item.label)}`} key={item.image}>
                    <Image src={imagePath(item.image)} alt="" width={150} height={150} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/products?department=home" className="az-promo__text-link">
                Veja mais para sua casa <span aria-hidden="true">›</span>
              </Link>
            </article>

            <article id="slide-3" className="az-promo az-promo--devices">
              <h2>Tecnologia para seu dia a dia</h2>
              <p>Trabalho, estudo e diversão</p>
              <div className="az-promo__tiles">
                {COMPUTERS.map((item) => (
                  <Link href="/products?department=electronics" key={item.image}>
                    <Image src={imagePath(item.image)} alt="" width={150} height={150} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/products?department=electronics" className="az-promo__text-link">
                Explore eletrônicos <span aria-hidden="true">›</span>
              </Link>
            </article>

            <article className="az-promo az-promo--home">
              <Link href="/products?department=home" className="az-promo__full-link">
                <span className="az-promo__eyebrow">Inspire-se</span>
                <h2>Novidades para sua cozinha</h2>
                <p>
                  Pequenos detalhes.
                  <br />
                  Novas possibilidades.
                </p>
                <Image
                  className="az-promo__large-image"
                  src={imagePath('silver-pot-with-glass-cap')}
                  alt="Panela com tampa de vidro"
                  width={300}
                  height={300}
                />
                <span className="az-promo__text-link">
                  Confira a seleção <span aria-hidden="true">›</span>
                </span>
              </Link>
            </article>
          </div>
          {overflow.campaigns && (
            <div className="az-campaign-controls" aria-label="Navegar pelas campanhas">
              <button
                type="button"
                aria-label="Campanha anterior"
                aria-controls="home-campaigns"
                onClick={() => scrollCampaign(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próxima campanha"
                aria-controls="home-campaigns"
                onClick={() => scrollCampaign(1)}
              >
                ›
              </button>
            </div>
          )}

          <div className="az-discover-wrap">
            <div
              className="az-discover"
              id="home-discover"
              ref={discoveries}
              tabIndex={0}
              aria-label="Mais categorias para explorar"
            >
              {DISCOVER.map((item) => (
                <Link
                  className="az-discover__card"
                  href={`/products?q=${encodeURIComponent(item.query)}`}
                  key={item.image}
                >
                  <h3>{item.title}</h3>
                  <Image src={imagePath(item.image)} alt="" width={150} height={150} />
                </Link>
              ))}
            </div>
            {overflow.discoveries && (
              <button
                type="button"
                className="az-discover__next"
                aria-label="Mais categorias"
                aria-controls="home-discover"
                onClick={() => {
                  const track = discoveries.current;
                  if (!track) return;
                  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
                  track.scrollTo({
                    left: atEnd ? 0 : track.scrollLeft + track.clientWidth * 0.7,
                    behavior: scrollBehavior(),
                  });
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
