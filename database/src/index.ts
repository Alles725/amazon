/**
 * Single owner of the Prisma client for the whole workspace. Applications depend
 * on this package instead of instantiating their own client, so there is exactly
 * one generated client and one schema.
 */
export { Prisma, PrismaClient, CartStatus, OrderStatus } from '@prisma/client';
export type { User, Session, Product, Category, Cart, CartItem, Order, OrderItem, Inventory } from '@prisma/client';

/** Formats integer minor units for display. Never do money math in floats. */
export function formatMinor(amountMinor: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amountMinor / 100);
}
