import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { LegalArticle } from './legal-article';
import type { LegalDocument } from './legal-types';
import './legal.css';

// Same Amazon Ember stand-in as /help (see features/sell/fonts/OFL.txt).
const legalFont = localFont({
  src: '../sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-help',
  display: 'swap',
});

export function legalPageMetadata(doc: LegalDocument): Metadata {
  return { title: `${doc.title} | Amazon.com.br`, description: doc.summary };
}

/** Full page: Amazon header, legal article and footer. */
export function LegalPageLayout({ doc }: { doc: LegalDocument }) {
  return (
    <div className={`amazon-legal-page ${legalFont.variable}`} id="top">
      <AmazonHeader />
      <LegalArticle doc={doc} />
      <AmazonFooter />
    </div>
  );
}
