import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { FeatureStampStrip, Navigation } from '@/components/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'MVP Storefront',
  description: 'Skeleton storefront for the modular monolith MVP.',
};

// The session and feature state are read per request, never cached at build time.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="visually-hidden" href="#main">
          Skip to content
        </a>
        <FeatureStampStrip />
        <Navigation />
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
