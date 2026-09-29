import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute } from '@/config/feature-gate';
import { SellLanding } from '@/features/sell/sell-landing';

// Inter Tight (SIL OFL) stands in for Amazon Ember Display, which the
// reference page uses but is not licensed for redistribution.
const sellFont = localFont({
  src: '../../features/sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-sell',
  display: 'swap',
});

export default function SellPage() {
  return (
    <FeatureRoute routeKey="sell" title="Venda na Amazon">
      <div className={`amazon-sell-page ${sellFont.variable}`} id="top">
        <AmazonHeader currentHref="/sell" />
        <SellLanding />
        <AmazonFooter />
      </div>
    </FeatureRoute>
  );
}
