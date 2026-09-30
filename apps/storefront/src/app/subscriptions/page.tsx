import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function SubscriptionsPage() {
  return (
    <FeatureRoute routeKey="subscriptions" title="Inscrições e assinaturas">
      <SubscriptionsContent />
    </FeatureRoute>
  );
}

/** Informational: no digital products or memberships are sold here. */
async function SubscriptionsContent() {
  await requireAccountSession('/subscriptions');

  return (
    <AccountShell title="Inscrições e assinaturas">
      <AcademicNotice>
        <p>
          <strong>Assinaturas digitais não estão disponíveis nesta loja acadêmica.</strong>
        </p>
        <p>
          Esta loja vende apenas produtos físicos do catálogo. Não há serviços digitais, canais ou
          assinaturas recorrentes para gerenciar ou cancelar.
        </p>
      </AcademicNotice>
      <EmptyPanel heading="Assinaturas ativas" message="Você não tem assinaturas digitais." />
      <EmptyPanel heading="Assinaturas inativas" message="Nenhuma assinatura encerrada." />
    </AccountShell>
  );
}
