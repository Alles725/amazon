'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { searchHelpTopics } from '@/features/help/help-topics';

const MAX_RESULTS = 6;

/** "Encontrar mais soluções": searches the same help library as /help. */
export function LegalSearch() {
  const [query, setQuery] = useState('');
  const id = useId();
  const searching = query.trim().length > 0;
  const results = searching ? searchHelpTopics(query).slice(0, MAX_RESULTS) : [];

  return (
    <div className="az-legal__search">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={`${id}-q`} className="az-legal__search-label">
          Encontrar mais soluções
        </label>
        <div className="az-legal__search-box">
          <SearchIcon />
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
      </form>
      {searching && (
        <div className="az-legal__search-results" aria-live="polite">
          {results.length ? (
            <ul aria-label="Resultados da pesquisa">
              {results.map((card) => (
                <li key={card.title}>
                  <Link href={card.href}>{card.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Nenhum resultado para “{query.trim()}”. <Link href="/help">Ver todos os tópicos</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="az-legal__search-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" strokeLinecap="round" />
    </svg>
  );
}
