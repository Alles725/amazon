import { ReactNode } from 'react';

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'live' | 'pending';
  children: ReactNode;
}) {
  const modifier = tone === 'neutral' ? '' : ` badge--${tone}`;
  return <span className={`badge${modifier}`}>{children}</span>;
}
