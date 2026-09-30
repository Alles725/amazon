import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { isFeatureEnabled } from '@/config/feature-gate';
import { CorporateBody } from './corporate-body';
import { getCorporatePage } from './corporate-content';
import type { CorporatePageKey } from './corporate-routes';
import './corporate.css';

// Same Amazon Ember stand-in as /sell and /help (see features/sell/fonts/OFL.txt).
const corporateFont = localFont({
  src: '../sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-corp',
  display: 'swap',
});

const SITE = 'Amazon.com.br';

/** Page metadata; left to the root layout while the page's flag is off. */
export function corporateMetadata(key: CorporatePageKey): Metadata {
  if (!isFeatureEnabled(key)) return {};
  const page = getCorporatePage(key);
  return {
    title: `${page.title} | ${SITE}`,
    description: page.description,
    openGraph: { title: page.title, description: page.description },
  };
}

/** Full page (Amazon header + corporate body + footer). Render inside FeatureRoute. */
export function CorporatePageShell({ pageKey }: { pageKey: CorporatePageKey }) {
  const page = getCorporatePage(pageKey);
  return (
    <div className={`amazon-corp-page ${corporateFont.variable}`} id="top">
      <AmazonHeader />
      <CorporateBody page={page} />
      <AmazonFooter />
    </div>
  );
}
