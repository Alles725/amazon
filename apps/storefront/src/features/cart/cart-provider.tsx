'use client';

import { CartResponse } from '@amazon-mvp/api-contract';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { cartClient, CartRequestError } from './cart-client';

type CartStatus = 'guest' | 'loading' | 'ready' | 'error';
interface CartState {
  cart: CartResponse | null;
  status: CartStatus;
  pending: boolean;
  error: string | null;
  notice: string;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}
const CartContext = createContext<CartState | null>(null);

export function CartProvider({
  children,
  userId,
  enabled,
}: {
  children: ReactNode;
  userId: string | null;
  enabled: boolean;
}) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [status, setStatus] = useState<CartStatus>(enabled && userId ? 'loading' : 'guest');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const version = useRef(0);
  const busy = useRef(false);
  const refreshQueued = useRef(false);
  const mounted = useRef(true);
  const channel = useRef<BroadcastChannel | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reportError = useCallback((reason: unknown) => {
    if (reason instanceof CartRequestError && reason.status === 401) {
      setCart(null);
      setStatus('guest');
      setError('Sua sessão expirou. Entre na sua conta para acessar o carrinho.');
    } else {
      setError(
        reason instanceof CartRequestError
          ? reason.message
          : 'Não foi possível conectar. Tente novamente.',
      );
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !userId) return;
    if (busy.current) {
      refreshQueued.current = true;
      return;
    }
    const current = ++version.current;
    try {
      const result = await cartClient.get();
      if (!mounted.current || current !== version.current) return;
      setCart(result);
      setStatus('ready');
      setError(null);
    } catch (reason) {
      if (!mounted.current || current !== version.current) return;
      setStatus('error');
      reportError(reason);
    }
  }, [enabled, userId, reportError]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);
  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    if (typeof BroadcastChannel !== 'undefined' && enabled && userId) {
      channel.current = new BroadcastChannel('storefront-cart');
      channel.current.onmessage = () => void refresh();
    }
    return () => {
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
      channel.current?.close();
      channel.current = null;
    };
  }, [enabled, userId, refresh]);

  async function mutate(operation: () => Promise<CartResponse>, message: string) {
    if (busy.current || status === 'guest' || !enabled) return;
    busy.current = true;
    setPending(true);
    setError(null);
    setNotice('');
    const current = ++version.current;
    try {
      const result = await operation();
      if (!mounted.current || current !== version.current) return;
      setCart(result);
      setStatus('ready');
      setNotice(message);
      channel.current?.postMessage('changed');
    } catch (reason) {
      if (mounted.current && current === version.current) reportError(reason);
    } finally {
      busy.current = false;
      if (mounted.current) {
        setPending(false);
        if (refreshQueued.current) {
          refreshQueued.current = false;
          void refresh();
        }
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        status,
        pending,
        error,
        notice,
        refresh,
        add: (productId) =>
          mutate(
            () => cartClient.add({ productId, quantity: 1 }),
            'Produto adicionado ao carrinho.',
          ),
        update: (id, quantity) =>
          mutate(() => cartClient.update(id, quantity), 'Quantidade atualizada.'),
        remove: (id) => mutate(() => cartClient.remove(id), 'Produto removido do carrinho.'),
        clear: () => mutate(cartClient.clear, 'Seu carrinho foi esvaziado.'),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('CartProvider is required');
  return value;
}
