'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { HELP_CATEGORIES, HelpTopicCard } from './help-content';

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Every card once, even when it is listed under several categories. */
const ALL_CARDS = Array.from(
  new Map(HELP_CATEGORIES.flatMap((c) => c.cards).map((card) => [card.title, card])).values(),
);

export function searchHelpTopics(query: string): HelpTopicCard[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return ALL_CARDS.filter((card) => {
    const haystack = normalize(`${card.title} ${card.body}`);
    return terms.every((term) => haystack.includes(term));
  });
}

/** Help-library search plus the "Todos os tópicos de ajuda" tabbed list. */
export function HelpTopics() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(HELP_CATEGORIES[0].id);
  const baseId = useId();
  const searching = query.trim().length > 0;
  const results = searching ? searchHelpTopics(query) : [];
  const active = HELP_CATEGORIES.find((c) => c.id === activeId) ?? HELP_CATEGORIES[0];

  return (
    <section className="az-help__library" aria-label="Biblioteca de ajuda">
      <div className="az-help__inner">
        <h2 className="az-help__section-title">Pesquisar na nossa biblioteca de ajuda</h2>
        <form className="az-help__search" role="search" onSubmit={(e) => e.preventDefault()}>
          <SearchIcon />
          <label htmlFor={`${baseId}-q`} className="visually-hidden">
            Pesquisar na nossa biblioteca de ajuda
          </label>
          <input
            id={`${baseId}-q`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite algo como “pergunta sobre uma cobrança”"
            autoComplete="off"
          />
        </form>

        {searching ? (
          <div className="az-help__results" aria-live="polite">
            <h2 className="az-help__section-title">
              {results.length
                ? `Resultados para “${query.trim()}”`
                : `Nenhum resultado para “${query.trim()}”`}
            </h2>
            {results.length ? (
              <CardGrid cards={results} />
            ) : (
              <p className="az-help__empty">
                Tente outras palavras ou navegue pelos tópicos de ajuda.
              </p>
            )}
          </div>
        ) : (
          <div id="az-help-topics" className="az-help__topics">
            <h2 className="az-help__section-title">Todos os tópicos de ajuda</h2>
            <div className="az-help__topics-layout">
              <div className="az-help__tabs" role="tablist" aria-orientation="vertical">
                {HELP_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${category.id}`}
                    aria-controls={`${baseId}-panel`}
                    aria-selected={category.id === active.id}
                    tabIndex={category.id === active.id ? 0 : -1}
                    className="az-help__tab"
                    onClick={() => setActiveId(category.id)}
                    onKeyDown={(event) => {
                      const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
                      if (!step) return;
                      event.preventDefault();
                      const index = HELP_CATEGORIES.indexOf(category);
                      const next =
                        HELP_CATEGORIES[
                          (index + step + HELP_CATEGORIES.length) % HELP_CATEGORIES.length
                        ];
                      setActiveId(next.id);
                      document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <div
                id={`${baseId}-panel`}
                role="tabpanel"
                aria-labelledby={`${baseId}-tab-${active.id}`}
              >
                <CardGrid cards={active.cards} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CardGrid({ cards }: { cards: HelpTopicCard[] }) {
  return (
    <ul className="az-help__cards">
      {cards.map((card) => (
        <li key={card.title}>
          <Link href={card.href} className="az-help__card">
            <span className="az-help__card-title">{card.title}</span>
            <span className="az-help__card-body">{card.body}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" strokeLinecap="round" />
    </svg>
  );
}
