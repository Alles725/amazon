import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const RequestContextStore = {
  run<T>(context: RequestContext, fn: () => T): T {
    return storage.run(context, fn);
  },
  get(): RequestContext | undefined {
    return storage.getStore();
  },
  requestId(): string {
    return storage.getStore()?.requestId ?? 'no-request-context';
  },
  setUserId(userId: string): void {
    const store = storage.getStore();
    if (store) store.userId = userId;
  },
};
