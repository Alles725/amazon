import Link from 'next/link';
import { FeatureRoute } from '@/config/feature-gate';
import { AccountShell, requireAccountSession } from '@/features/account/account-shell';
import { SecuritySettings } from '@/features/account/security-settings';

export default function SecurityPage() {
  return (
    <FeatureRoute routeKey="security" title="Acesso e segurança">
      <SecurityContent />
    </FeatureRoute>
  );
}

async function SecurityContent() {
  const session = await requireAccountSession('/security');

  return (
    <AccountShell title="Acesso e segurança">
      <SecuritySettings user={session.user} />
      <Link href="/account" className="az-acct-button az-acct-button--primary az-acct-done">
        Concluído
      </Link>
    </AccountShell>
  );
}
