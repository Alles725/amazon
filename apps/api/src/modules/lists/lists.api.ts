import { ListDetails, ListSummary } from '@amazon-mvp/api-contract';

export const LISTS_API = 'LISTS_API';

/** Lists owns `lists` and `list_items`. Product data comes from CATALOG_API;
 * every operation is scoped to the owning user (another user's list is a 404). */
export interface ListsApi {
  /** Creates the default "Lista de desejos" on first use. Default list first. */
  getLists(userId: string): Promise<ListSummary[]>;
  createList(userId: string, name: string): Promise<ListSummary>;
  getList(userId: string, listId: string): Promise<ListDetails>;
  renameList(userId: string, listId: string, name: string): Promise<ListSummary>;
  /** The default list cannot be deleted. */
  deleteList(userId: string, listId: string): Promise<void>;
  /** Idempotent: adding a product that is already on the list is not an error. */
  addItem(userId: string, listId: string, productId: string): Promise<ListDetails>;
  removeItem(userId: string, listId: string, productId: string): Promise<ListDetails>;
}
