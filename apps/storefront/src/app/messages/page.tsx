import Link from 'next/link';
import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function MessagesPage() {
  return (
    <FeatureRoute routeKey="messages" title="Suas mensagens">
      <MessagesContent />
    </FeatureRoute>
  );
}

/** Informational: the store sends no notifications and has no seller messaging. */
async function MessagesContent() {
  await requireAccountSession('/messages');

  return (
    <AccountShell title="Suas mensagens">
      <AcademicNotice>
        <p>
          <strong>A central de mensagens não está disponível nesta loja acadêmica.</strong>
        </p>
        <p>
          Esta loja não envia notificações nem tem troca de mensagens com vendedores ou
          compradores. O andamento de cada compra aparece em{' '}
          <Link href="/orders">Seus pedidos</Link>.
        </p>
      </AcademicNotice>
      <EmptyPanel heading="Mensagens da Amazon" message="Nenhuma mensagem." />
      <EmptyPanel heading="Mensagens de vendedores" message="Nenhuma mensagem." />
      <EmptyPanel heading="Mensagens de compradores" message="Nenhuma mensagem." />
    </AccountShell>
  );
}
