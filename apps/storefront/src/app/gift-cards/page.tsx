import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function GiftCardsPage() {
  return (
    <FeatureRoute routeKey="giftCards" title="Vales-presente">
      <GiftCardsContent />
    </FeatureRoute>
  );
}

/** Informational: no gift-card ledger exists, so no balance is shown at all. */
async function GiftCardsContent() {
  await requireAccountSession('/gift-cards');

  return (
    <AccountShell title="Vales-presente">
      <AcademicNotice>
        <p>
          <strong>Vales-presente não estão disponíveis nesta loja acadêmica.</strong>
        </p>
        <p>
          Não é possível comprar, resgatar ou usar códigos de vale-presente aqui. Por isso esta
          página não oferece campo de resgate nem exibe saldo.
        </p>
      </AcademicNotice>
      <EmptyPanel heading="Saldo do vale-presente" message="Você não tem vales-presente." />
      <EmptyPanel
        heading="Resgatar um vale-presente"
        message="O resgate de códigos não está disponível."
      >
        <p className="az-acct-muted">Nenhum código pode ser aplicado à sua conta nesta loja.</p>
      </EmptyPanel>
      <EmptyPanel
        heading="Atividade do vale-presente"
        message="Nenhuma atividade de vale-presente."
      />
    </AccountShell>
  );
}
