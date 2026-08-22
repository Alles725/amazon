import Link from 'next/link';
import { Badge } from './badge';

/**
 * Rendered by FeatureRoute when a route's feature is off with
 * disabledBehavior: coming-soon. One component, used by every gated route.
 */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <main className="page">
      <p className="eyebrow">Not built yet</p>
      <h1>{title}</h1>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <Badge tone="pending">Feature disabled</Badge>
      </div>
      <p className="lede" style={{ marginTop: 'var(--space-6)' }}>
        {note ??
          'This section is part of the MVP plan but is switched off in this environment. It appears here as soon as the feature flag is turned on.'}
      </p>
      <div className="state__actions">
        <Link className="button button--secondary" href="/">
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
