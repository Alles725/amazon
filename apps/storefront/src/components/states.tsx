import { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Loading / empty / error share one visual shell. Copy follows the rule that an
 * empty screen is an invitation to act and an error says what to do next.
 */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="state" aria-busy="true" aria-live="polite">
      <p className="eyebrow">{label}</p>
      <div className="skeleton-line" style={{ width: '60%' }} />
      <div className="skeleton-line" style={{ width: '85%' }} />
      <div className="skeleton-line" style={{ width: '40%' }} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="state">
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'That request did not go through',
  body,
  action,
}: {
  title?: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="state">
      <p className="eyebrow">404</p>
      <h2 className="state__title">This page is not here</h2>
      <p className="state__body">
        The address may be mistyped, or the section is switched off for this environment.
      </p>
      <div className="state__actions">
        <Link className="button button--secondary" href="/">
          Back to the home page
        </Link>
      </div>
    </div>
  );
}
