import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute } from '@/config/feature-gate';
import { getServerSession } from '@/features/auth/server-session';
import { CustomerServiceBar, HelpCenter } from '@/features/help/help-center';
import { getRecentProducts } from '@/features/help/recent-products';

// Same Amazon Ember stand-in as /sell (see features/sell/fonts/OFL.txt).
const helpFont = localFont({
  src: '../../features/sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-help',
  display: 'swap',
});

export default function HelpPage() {
  return (
    <FeatureRoute routeKey="help" title="Atendimento ao Cliente">
      <HelpPageContent />
    </FeatureRoute>
  );
}

// Separate so the session/orders lookups only run when the route is enabled.
async function HelpPageContent() {
  const session = await getServerSession();
  const firstName = session?.user.displayName.split(' ')[0];
  const products = await getRecentProducts(Boolean(session));

  return (
    <div className={`amazon-help-page ${helpFont.variable}`} id="top">
      <AmazonHeader currentHref="/help" />
      <CustomerServiceBar currentHref="/help" />
      <HelpCenter firstName={firstName} products={products} />
      <AmazonFooter />
    </div>
  );
}
