import { FeatureRoute } from '@/config/feature-gate';
import { AccountShell, requireAccountSession } from '@/features/account/account-shell';
import { fetchAddresses } from '@/features/account/account-server';
import { AddressesManager } from '@/features/account/addresses-manager';
import { ADD_ADDRESS_HREF, ADD_ADDRESS_PARAM } from '@/features/account/address-routes';

type Props = { searchParams: { [ADD_ADDRESS_PARAM]?: string | string[] } };

export default function AddressesPage({ searchParams }: Props) {
  return (
    <FeatureRoute routeKey="addresses" title="Seus endereços">
      <AddressesContent adding={searchParams[ADD_ADDRESS_PARAM] === '1'} />
    </FeatureRoute>
  );
}

// Separate so the session/address lookups only run when the route is enabled.
async function AddressesContent({ adding }: { adding: boolean }) {
  const session = await requireAccountSession(adding ? ADD_ADDRESS_HREF : '/addresses');
  const addresses = await fetchAddresses();

  return (
    <AccountShell title="Seus endereços" wide>
      {addresses ? (
        <AddressesManager
          initial={addresses}
          name={session.user.displayName}
          startAdding={adding}
        />
      ) : (
        <p className="az-acct-error" role="alert">
          Não foi possível carregar seus endereços agora. Tente novamente em instantes.
        </p>
      )}
    </AccountShell>
  );
}
