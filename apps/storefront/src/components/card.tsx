import { ReactNode } from 'react';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title && <h3 className="card__title">{title}</h3>}
      {children}
    </section>
  );
}
