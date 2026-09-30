import Link from 'next/link';
import { FeatureRoute } from '@/config/feature-gate';
import {
  AcademicNotice,
  AccountShell,
  EmptyPanel,
  requireAccountSession,
} from '@/features/account/account-shell';

export default function PrimePage() {
  return (
    <FeatureRoute routeKey="prime" title="Sua assinatura Prime">
      <PrimeContent />
    </FeatureRoute>
  );
}

/** Informational: this store sells no memberships, so there is nothing to manage. */
async function PrimeContent() {
  await requireAccountSession('/prime');

  return (
    <AccountShell title="Sua assinatura Prime">
      <AcademicNotice>
        <p>
          <strong>O Amazon Prime não está disponível nesta loja acadêmica.</strong>
        </p>
        <p>
          Aqui não é possível assinar, renovar ou cancelar o Prime, e nenhuma cobrança de assinatura
          é feita. Frete e prazos exibidos nos pedidos seguem as regras do checkout acadêmico.
        </p>
      </AcademicNotice>
      <EmptyPanel heading="Sua assinatura" message="Você não é membro Prime.">
        <p className="az-acct-muted">Não há plano, data de renovação ou forma de pagamento associados.</p>
      </EmptyPanel>
      <EmptyPanel
        heading="Benefícios Prime"
        message="Nenhum benefício Prime está ativo na sua conta."
      />
      <EmptyPanel
        heading="Configurações de pagamento da assinatura"
        message="Nenhuma forma de pagamento está vinculada a uma assinatura."
      >
        <p className="az-acct-muted">
          Consulte o que você já comprou em <Link href="/orders">Seus pedidos</Link>.
        </p>
      </EmptyPanel>
    </AccountShell>
  );
}
