import Link from 'next/link';
import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function RefundsPage() {
  return (
    <FeatureRoute routeKey="refunds" title="Reembolsos Boleto/Pix">
      <RefundsContent />
    </FeatureRoute>
  );
}

/** Informational: checkout payments are simulated, so nothing is ever refunded. */
async function RefundsContent() {
  await requireAccountSession('/refunds');

  return (
    <AccountShell title="Reembolsos Boleto/Pix">
      <AcademicNotice>
        <p>
          <strong>Reembolsos não são processados nesta loja acadêmica.</strong>
        </p>
        <p>
          Os pagamentos do checkout (cartão ou Pix) são simulados: nenhum dinheiro é cobrado e, por
          isso, nenhum valor é devolvido. Boleto não é oferecido.
        </p>
      </AcademicNotice>
      <EmptyPanel
        heading="Saldo de reembolsos"
        message="Você não tem reembolsos de Boleto ou Pix."
      />
      <EmptyPanel heading="Histórico de reembolsos" message="Nenhum reembolso foi solicitado.">
        <p className="az-acct-muted">
          Para ver o que você comprou, acesse <Link href="/orders">Seus pedidos</Link>.
        </p>
      </EmptyPanel>
    </AccountShell>
  );
}
