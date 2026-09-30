import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { CustomerServiceBar } from '@/features/help/help-center';
import type { SlotContent } from './customer-blocks';
import { CustomerArticle } from './customer-article';
import type { CustomerPage } from './customer-page-content';
import './customer-pages.css';

// Same Amazon Ember stand-in as /help (see features/sell/fonts/OFL.txt); the
// variable name matches so the shared customer-service bar renders identically.
const customerFont = localFont({
  src: '../sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-help',
  display: 'swap',
});

/** Full page: Amazon header, customer-service bar, article and footer. */
export function CustomerPageLayout({ page, slots }: { page: CustomerPage; slots?: SlotContent }) {
  return (
    <div className={`amazon-customer-page ${customerFont.variable}`} id="top">
      <AmazonHeader />
      {/* Marks "Suporte para dispositivos e serviços digitais" on /content-and-devices. */}
      <CustomerServiceBar currentHref={page.href} />
      <CustomerArticle page={page} slots={slots} />
      <AmazonFooter />
    </div>
  );
}
