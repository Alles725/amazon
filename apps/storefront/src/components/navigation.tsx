import 'server-only';
import Link from 'next/link';
import { getFeatureRegistry } from '@/config/storefront-config';
import { SessionActions } from '@/features/auth/session-actions';
import { getServerSession } from '@/features/auth/server-session';

interface NavLink {
  href: string;
  label: string;
  routeKey: string;
}

const LINKS: NavLink[] = [
  { href: '/products', label: 'Products', routeKey: 'products' },
  { href: '/cart', label: 'Cart', routeKey: 'cart' },
  { href: '/orders', label: 'Orders', routeKey: 'orders' },
  { href: '/account', label: 'Account', routeKey: 'account' },
];

export async function Navigation() {
  const registry = getFeatureRegistry();
  const session = await getServerSession();

  // A `not-found` route is hidden entirely; a `coming-soon` route stays visible
  // but is marked, so the nav tells the truth about what works.
  const visible = LINKS.map((link) => ({ ...link, state: registry.routeState(link.routeKey) })).filter(
    (link) => link.state !== 'not-found',
  );

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav__inner">
        <Link className="nav__brand" href="/">
          MVP Storefront
        </Link>
        <div className="nav__links">
          {visible.map((link) => (
            <Link
              key={link.href}
              className={`nav__link${link.state === 'coming-soon' ? ' nav__link--muted' : ''}`}
              href={link.href}
            >
              {link.label}
              {link.state === 'coming-soon' && <span className="visually-hidden"> (not built yet)</span>}
            </Link>
          ))}
          <SessionActions user={session?.user ?? null} />
        </div>
      </div>
    </nav>
  );
}

/**
 * Signature element: a build-state stamp strip. This skeleton is flag-driven, so
 * "what is actually switched on" is the single most useful thing to surface.
 */
export function FeatureStampStrip() {
  const registry = getFeatureRegistry();
  const features = Object.entries(registry.snapshot().features);

  return (
    <div className="stamp-strip">
      <div className="stamp-strip__inner">
        <span>Build state</span>
        {features.map(([name, feature]) => (
          <span key={name} className={`stamp${feature.enabled ? ' stamp--on' : ''}`}>
            {name} {feature.enabled ? 'on' : 'off'}
          </span>
        ))}
      </div>
    </div>
  );
}
