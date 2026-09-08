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

// The login page is a bare, chrome-free screen (matches Amazon's own sign-in
// page): no build-state stamp strip, no site navigation.
const BARE_ROUTES = ['/login'];

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
