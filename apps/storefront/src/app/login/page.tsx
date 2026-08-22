import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';
import { AuthForm } from '@/features/auth/auth-form';
import { getServerSession } from '@/features/auth/server-session';

export default async function LoginPage() {
  if (await getServerSession()) redirect('/account');

  return (
    <FeatureRoute routeKey="login" title="Sign in">
      <PageContainer eyebrow="Account" title="Sign in" narrow>
        <AuthForm mode="login" />
        <p style={{ marginTop: 'var(--space-6)', color: 'var(--ink-muted)' }}>
          No account yet? <Link href="/register">Create one</Link>.
        </p>
      </PageContainer>
    </FeatureRoute>
  );
}
