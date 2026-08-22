import { redirect } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { PageContainer } from '@/components/page-container';
import { getServerSession } from '@/features/auth/server-session';

/**
 * Not wrapped in FeatureRoute: the authenticated shell belongs to the
 * `authentication` feature, which is the vertical slice that must always work.
 * The `account` feature covers profile management, which is not built yet.
 */
export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <PageContainer eyebrow="Signed in" title={session.user.displayName} narrow>
      <Card title="Your details">
        <dl style={{ margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
          <div>
            <dt className="eyebrow">Email</dt>
            <dd style={{ margin: 0 }}>{session.user.email}</dd>
          </div>
          <div>
            <dt className="eyebrow">Member since</dt>
            <dd style={{ margin: 0 }}>
              {new Date(session.user.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Session expires</dt>
            <dd style={{ margin: 0 }}>{new Date(session.expiresAt).toLocaleString('en-GB')}</dd>
          </div>
        </dl>
      </Card>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <Card title="Profile management">
          <p style={{ color: 'var(--ink-muted)' }}>
            Changing your name, email or password arrives with the account feature.
          </p>
          <Badge tone="pending">Not built yet</Badge>
        </Card>
      </div>
    </PageContainer>
  );
}
