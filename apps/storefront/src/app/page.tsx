import Link from 'next/link';
import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { FeatureRoute } from '@/config/feature-gate';
import { getFeatureRegistry } from '@/config/storefront-config';
import { getServerSession } from '@/features/auth/server-session';

const SECTIONS = [
  { key: 'catalog', href: '/products', name: 'Catalog', note: 'Browse and search products.' },
  { key: 'cart', href: '/cart', name: 'Cart', note: 'Hold items before checkout.' },
  { key: 'checkout', href: '/checkout', name: 'Checkout', note: 'Place an order from the cart.' },
  { key: 'orders', href: '/orders', name: 'Orders', note: 'Past orders and their contents.' },
];

export default async function HomePage() {
  const registry = getFeatureRegistry();
  const session = await getServerSession();

  return (
    <FeatureRoute routeKey="home" title="Home">
      <main className="page">
        <p className="eyebrow">Modular monolith · MVP skeleton</p>
        <h1 style={{ fontSize: 'var(--step-4)', maxWidth: '18ch' }}>
          The plumbing works. The shop does not — yet.
        </h1>
        <p className="lede" style={{ marginTop: 'var(--space-6)' }}>
          Accounts and sessions run end to end through the Ingress, the API and PostgreSQL.
          Everything else is a boundary waiting for its iteration.
        </p>

        <div className="state__actions" style={{ marginTop: 'var(--space-8)' }}>
          {session ? (
            <Link className="button button--primary" href="/account">
              Go to your account
            </Link>
          ) : (
            <>
              <Link className="button button--primary" href="/register">
                Create an account
              </Link>
              <Link className="button button--secondary" href="/login">
                Sign in
              </Link>
            </>
          )}
        </div>

        <section style={{ marginTop: 'var(--space-12)' }}>
          <p className="eyebrow">Sections</p>
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
            }}
          >
            {SECTIONS.map((section) => {
              const live = registry.isEnabled(section.key);
              return (
                <Card key={section.key} title={section.name}>
                  <p style={{ color: 'var(--ink-muted)' }}>{section.note}</p>
                  <Badge tone={live ? 'live' : 'pending'}>{live ? 'Live' : 'Not built yet'}</Badge>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </FeatureRoute>
  );
}
