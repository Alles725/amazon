import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ReactNode } from 'react';
import { FeatureStampStrip, Navigation } from '@/components/navigation';
import { CartProvider } from '@/features/cart/cart-provider';
import { getServerSession } from '@/features/auth/server-session';
import { isFeatureEnabled } from '@/config/feature-gate';
import './globals.css';

export const metadata: Metadata = {
  title: 'MVP Storefront',
  description: 'Skeleton storefront for the modular monolith MVP.',
};

// The session and feature state are read per request, never cached at build time.
export const dynamic = 'force-dynamic';

// The login page, the home page, and the account hub are bare, chrome-free
// screens (each matches Amazon's own UI): no build-state stamp strip, no
// generic site navigation. Each brings its own Amazon-style header/footer
// instead.
const BARE_ROUTES = ['/login', '/', '/account', '/cart'];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get('x-pathname') ?? '';
  const bare = BARE_ROUTES.includes(pathname);

  const cartEnabled = isFeatureEnabled('cart');
  const session = cartEnabled ? await getServerSession() : null;

  return (
    <html lang="en">
      <body>
        <CartProvider
          key={session?.user.id ?? 'guest'}
          userId={session?.user.id ?? null}
          enabled={cartEnabled}
        >
          <a className="visually-hidden" href="#main">
            Skip to content
          </a>
          {!bare && <FeatureStampStrip />}
          {!bare && <Navigation />}
          <div id="main">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
