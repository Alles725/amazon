import Link from 'next/link';
import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function SubscribeAndSavePage() {
  return (
    <FeatureRoute routeKey="subscribeAndSave" title="Programe e Poupe">
      <SubscribeAndSaveContent />
    </FeatureRoute>
  );
}

/** Informational: recurring deliveries are not part of the academic checkout. */
async function SubscribeAndSaveContent() {
  await requireAccountSession('/subscribe-and-save');

  return (
    <AccountShell title="Programe e Poupe">
      <AcademicNotice>
        <p>
          <strong>O Programe e Poupe não está disponível nesta loja acadêmica.</strong>
        </p>
        <p>
          Não há entregas recorrentes nem descontos por assinatura. Para comprar, adicione os
          produtos ao <Link href="/cart">carrinho</Link> e finalize um pedido normalmente.
        </p>
      </AcademicNotice>
      <EmptyPanel heading="Próximas entregas" message="Nenhuma entrega programada." />
      <EmptyPanel
        heading="Suas assinaturas do Programe e Poupe"
        message="Você não tem assinaturas do Programe e Poupe."
      />
    </AccountShell>
  );
}
