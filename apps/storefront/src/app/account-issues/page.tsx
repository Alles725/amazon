import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { FeatureRoute } from '@/config/feature-gate';
import { AccountIssues } from '@/features/account-issues/account-issues';
import '@/features/account-issues/account-issues.css';

// Same Amazon Ember stand-in as /help (see features/sell/fonts/OFL.txt).
const issuesFont = localFont({
  src: '../../features/sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-help',
  display: 'swap',
});

const TITLE = 'Problemas na conta e de login';

export const metadata: Metadata = {
  title: `${TITLE} | Amazon.com.br`,
  description: 'Ajuda para problemas de senha, criação de conta e verificação em duas etapas.',
};

export default function AccountIssuesPage() {
  return (
    <FeatureRoute routeKey="accountIssues" title={TITLE}>
      <div className={`amazon-issues-page ${issuesFont.variable}`} id="top">
        <AmazonHeader />
        <AccountIssues />
        <AmazonFooter />
      </div>
    </FeatureRoute>
  );
}
