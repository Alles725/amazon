'use client';

import { ReactNode, useEffect, useId, useRef, useState } from 'react';

/** Keeps the content server-rendered; only scrolling and its controls need JavaScript. */
export function HorizontalRail({
  children,
  label,
  className = '',
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  function updateEdges() {
    const element = track.current;
    if (!element) return;
    const previous = element.scrollLeft > 2;
    const next = element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
    setEdges((current) =>
      current.previous === previous && current.next === next ? current : { previous, next },
    );
  }

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    for (const item of element.children) observer.observe(item);
    updateEdges();
    return () => observer.disconnect();
  }, [children]);

  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    const firstItem = element.firstElementChild?.getBoundingClientRect().width ?? 160;
    element.scrollBy({
      left: direction * Math.max(firstItem, element.clientWidth - firstItem),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  return (
    <div className={`az-rail ${className}`}>
      <div
        className="az-rail__track"
        ref={track}
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateEdges}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            scroll(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
      {(edges.previous || edges.next) && (
        <>
          <button
            type="button"
            className="az-rail__arrow az-rail__arrow--previous"
            aria-label={`Voltar em ${label}`}
            aria-controls={id}
            disabled={!edges.previous}
            onClick={() => scroll(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="az-rail__arrow az-rail__arrow--next"
            aria-label={`Avançar em ${label}`}
            aria-controls={id}
            disabled={!edges.next}
            onClick={() => scroll(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}
    </div>
  );
}
