'use client';
import { ReactNode, useState } from 'react';

/** On phones the filter column collapses behind a "Filtros" button; from 768px up it is
 * always visible and the button is hidden (see browse.css). */
export function FiltersToggle({ active, children }: { active: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="az-browse-filters">
      <button
        type="button"
        className="az-browse-filters__toggle"
        aria-expanded={open}
        aria-controls="az-browse-filters-panel"
        onClick={() => setOpen((value) => !value)}
      >
        Filtros{active > 0 ? ` (${active})` : ''}
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      <div
        id="az-browse-filters-panel"
        className={`az-browse-filters__panel${open ? ' is-open' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
