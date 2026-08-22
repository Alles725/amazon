import { ReactNode } from 'react';

export function PageContainer({
  eyebrow,
  title,
  lede,
  narrow = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  narrow?: boolean;
  children?: ReactNode;
}) {
  return (
    <main className={`page${narrow ? ' page--narrow' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lede && <p className="lede" style={{ marginTop: 'var(--space-3)' }}>{lede}</p>}
      <div style={{ marginTop: 'var(--space-8)' }}>{children}</div>
    </main>
  );
}
