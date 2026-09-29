import Image from 'next/image';
import {
  BENEFIT_CARDS,
  FAQ,
  HERO_STATS,
  SELL_LINKS,
  STORY_STATS,
  SellStat,
} from './sell-content';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** "Venda na Amazon" landing body — everything between the header and the footer. */
export function SellLanding() {
  return (
    <main className="az-sell">
      <section className="az-sell__band" aria-labelledby="az-sell-title">
        <div className="az-sell__inner az-sell__hero">
          <div className="az-sell__hero-copy">
            <h1 id="az-sell-title" className="az-sell__hero-title">
              Venda até <br />
              R$ 500 mil com <br />
              comissão ZERO*
            </h1>
            <a
              href={SELL_LINKS.signUp}
              className="az-sell__button az-sell__button--primary"
              {...external}
            >
              Comece a vender
            </a>
            <p className="az-sell__fineprint">
              *Campanha válida para novas contas CNPJ, com coleta no estado de São Paulo e usando
              qualquer logística da Amazon.{' '}
              <a href={SELL_LINKS.terms} {...external}>
                Consulte os Termos e Condições
              </a>
            </p>
          </div>
          <div className="az-sell__hero-media">
            <Image
              src="/images/sell/hero-seller.png"
              alt="Tatá Werneck segurando caixa de entrega da Amazon com logo sorriso em fundo laranja"
              width={505}
              height={752}
              priority
              sizes="(max-width: 760px) 90vw, 400px"
            />
          </div>
        </div>
      </section>

      <section className="az-sell__inner az-sell__stats-block" aria-label="A Amazon em números">
        <StatRow stats={HERO_STATS} />
        <p className="az-sell__stats-source">*Dados internos Amazon, 2022</p>
      </section>

      <section className="az-sell__inner az-sell__story" aria-label="História de sucesso">
        <blockquote className="az-sell__quote">
          <QuoteIcon />
          <p>
            Poder falar “Estou na Amazon” significa que este produto é confiável. Então, as
            pessoas começaram a comprar muito mais da gente através do site da Amazon do que do
            nosso próprio site.
          </p>
          <footer>
            <cite>
              <strong>Flavia e Fabiana</strong>
              <span>Co-fundadoras, Tons de Preta</span>
            </cite>
          </footer>
        </blockquote>
        <a
          href={SELL_LINKS.story}
          className="az-sell__button az-sell__button--outline"
          {...external}
        >
          Conheça sua história <PlayIcon />
        </a>
        <a href={SELL_LINKS.moreStories} className="az-sell__more-stories" {...external}>
          Veja mais histórias de sucesso <ArrowIcon />
        </a>
      </section>

      <section className="az-sell__inner az-sell__stats-block az-sell__stats-block--story" aria-label="Vendas na Amazon">
        <StatRow stats={STORY_STATS} />
      </section>

      <section className="az-sell__band az-sell__benefits" aria-labelledby="az-sell-benefits-title">
        <div className="az-sell__inner">
          <h2 id="az-sell-benefits-title" className="az-sell__section-title">
            Precisa de mais motivos para vender online com a Amazon?
          </h2>
          <div className="az-sell__cards">
            {BENEFIT_CARDS.map((card) => {
              const List = card.bullets ? 'ul' : 'div';
              const Item = card.bullets ? 'li' : 'p';
              return (
                <article key={card.title} className="az-sell__card">
                  <div className="az-sell__card-media">
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      sizes="(max-width: 900px) 92vw, 380px"
                    />
                  </div>
                  <div className="az-sell__card-body">
                    <h3 className="az-sell__card-title">{card.title}</h3>
                    <List className="az-sell__card-text">
                      {card.items.map((item, index) => (
                        <Item key={index}>{item}</Item>
                      ))}
                    </List>
                    <a
                      href={card.href}
                      className="az-sell__button az-sell__button--dark"
                      {...external}
                    >
                      Saiba mais
                    </a>
                    <p className="az-sell__card-terms">Aplicam-se termos e condições</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="az-sell__inner az-sell__faq" aria-labelledby="az-sell-faq-title">
        <h2 id="az-sell-faq-title" className="az-sell__section-title">
          Perguntas Frequentes
        </h2>
        <div className="az-sell__faq-list">
          {FAQ.map((entry) => (
            <details key={entry.question} className="az-sell__faq-item">
              <summary>
                <span>{entry.question}</span>
                <PlusIcon />
              </summary>
              <div className="az-sell__faq-answer">
                {entry.answer.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="az-sell__inner az-sell__cta" aria-labelledby="az-sell-cta-title">
        <div className="az-sell__cta-copy">
          <h2 id="az-sell-cta-title" className="az-sell__cta-title">
            Mensalidade GRÁTIS <br />
            por 1 ano!
          </h2>
          <p className="az-sell__cta-text">
            Aproveite todos os benefícios de vender na Amazon com{' '}
            <strong>mensalidade GRÁTIS por 12 meses.</strong>
          </p>
          <a
            href={SELL_LINKS.signUp}
            className="az-sell__button az-sell__button--primary"
            {...external}
          >
            Cadastre-se
          </a>
        </div>
        <div className="az-sell__cta-media">
          <Image
            src="/images/sell/cta-doorstep.webp"
            alt="Caixas da Amazon entregues na porta de casa"
            fill
            sizes="(max-width: 900px) 92vw, 460px"
          />
        </div>
      </section>
    </main>
  );
}

function StatRow({ stats }: { stats: SellStat[] }) {
  return (
    <ul className="az-sell__stats">
      {stats.map((stat) => (
        <li key={stat.value} className="az-sell__stat">
          <strong className="az-sell__stat-value">{stat.value}</strong>
          <span className="az-sell__stat-label">{stat.label}</span>
        </li>
      ))}
    </ul>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 60 48" width="60" height="48" aria-hidden="true" className="az-sell__quote-icon">
      <path
        fill="currentColor"
        d="M25.6 3.4C15.4 7.6 9 15.6 9 25.5c0 .6 0 1.2.1 1.8A10.5 10.5 0 1 1 1 38c-.7-2-1-4.3-1-6.8C0 17.4 8.3 6.4 22.8 0l2.8 3.4Zm33 0C48.4 7.6 42 15.6 42 25.5c0 .6 0 1.2.1 1.8A10.5 10.5 0 1 1 34 38c-.7-2-1-4.3-1-6.8C33 17.4 41.3 6.4 55.8 0l2.8 3.4Z"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 6.4v7.2l5.6-3.6Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M3 10h13m-5-5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="az-sell__plus">
      <path d="M2 10h16" stroke="currentColor" strokeWidth="1.8" />
      <path className="az-sell__plus-v" d="M10 2v16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
