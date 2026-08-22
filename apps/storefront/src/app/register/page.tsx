import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/page-container';
import { FeatureRoute } from '@/config/feature-gate';
import { AuthForm } from '@/features/auth/auth-form';
import { getServerSession } from '@/features/auth/server-session';

export default async function RegisterPage() {
  if (await getServerSession()) redirect('/account');

  return (
    <FeatureRoute routeKey="register" title="Create account">
      <PageContainer
        eyebrow="Account"
        title="Create an account"
        lede="Your password is hashed with Argon2id and never stored in plain text."
        narrow
      >
        <AuthForm mode="register" />
        <p style={{ marginTop: 'var(--space-6)', color: 'var(--ink-muted)' }}>
          Already registered? <Link href="/login">Sign in</Link>.
        </p>
      </PageContainer>
    </FeatureRoute>
  );
}
