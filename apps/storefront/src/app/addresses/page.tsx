import { FeatureRoute } from '@/config/feature-gate';
import { AccountShell, requireAccountSession } from '@/features/account/account-shell';
import { fetchAddresses } from '@/features/account/account-server';
import { AddressesManager } from '@/features/account/addresses-manager';

export default function AddressesPage() {
  return (
    <FeatureRoute routeKey="addresses" title="Seus endereços">
      <AddressesContent />
    </FeatureRoute>
  );
}

// Separate so the session/address lookups only run when the route is enabled.
async function AddressesContent() {
  const session = await requireAccountSession('/addresses');
  const addresses = await fetchAddresses();

  return (
    <AccountShell title="Seus endereços" wide>
      {addresses ? (
        <AddressesManager initial={addresses} name={session.user.displayName} />
      ) : (
        <p className="az-acct-error" role="alert">
          Não foi possível carregar seus endereços agora. Tente novamente em instantes.
        </p>
      )}
    </AccountShell>
  );
}
