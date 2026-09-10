import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ReactNode } from 'react';
import { FeatureStampStrip, Navigation } from '@/components/navigation';
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
const BARE_ROUTES = ['/login', '/', '/account'];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get('x-pathname') ?? '';
  const bare = BARE_ROUTES.includes(pathname);

  return (
    <html lang="en">
      <body>
        <a className="visually-hidden" href="#main">
          Skip to content
        </a>
        {!bare && <FeatureStampStrip />}
        {!bare && <Navigation />}
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
