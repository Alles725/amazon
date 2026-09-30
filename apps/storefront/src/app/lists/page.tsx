import { redirect } from 'next/navigation';
import { FeatureRoute } from '@/config/feature-gate';
import { AccountShell, requireAccountSession } from '@/features/account/account-shell';
import { fetchList, fetchLists } from '@/features/account/account-server';
import { listHref } from '@/features/account/account-presentation';
import { ListsView } from '@/features/account/lists-view';

type Props = { searchParams: { list?: string | string[] } };

export default function ListsPage({ searchParams }: Props) {
  return (
    <FeatureRoute routeKey="lists" title="Suas listas">
      <ListsContent searchParams={searchParams} />
    </FeatureRoute>
  );
}

async function ListsContent({ searchParams }: Props) {
  const requested = typeof searchParams.list === 'string' ? searchParams.list : undefined;
  await requireAccountSession(requested ? listHref(requested) : '/lists');
  // Also creates the default "Lista de desejos" on the first visit.
  const lists = await fetchLists();
  const selectedId = requested ?? lists?.[0]?.id;
  const selected = lists && selectedId ? await fetchList(selectedId) : null;
  // A list that was deleted (or belongs to someone else) falls back to the default.
  if (selected === 'not-found') redirect('/lists');

  return (
    <AccountShell title="Suas listas" wide>
      {lists && selected ? (
        <ListsView key={selected.id} lists={lists} initial={selected} />
      ) : (
        <p className="az-acct-error" role="alert">
          Não foi possível carregar suas listas agora. Tente novamente em instantes.
        </p>
      )}
    </AccountShell>
  );
}
