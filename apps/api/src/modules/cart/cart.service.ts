import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CartResponse, ErrorCode, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { PrismaService } from '../../common/prisma.service';
import { ApiError } from '../../common/api-error';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import { CartApi } from './cart.api';

type StoredCart = Prisma.CartGetPayload<{ include: { items: true } }>;
class RefreshCatalogSnapshot extends Error {}

@Injectable()
export class CartService implements CartApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_API) private readonly catalog: CatalogApi,
  ) {}

  /** All requests for one account serialize, including its very first insert.
   * This avoids duplicate active carts without modifying the existing schema. */
  private withCart<T>(
    userId: string,
    work: (tx: Prisma.TransactionClient, cart: StoredCart | null) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))::text`;
      const cart = await tx.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      });
      return work(tx, cart);
    });
  }

  private async view(userId: string, cart: StoredCart | null): Promise<CartResponse> {
    const products = await this.catalog.findByIds(cart?.items.map((item) => item.productId) ?? []);
    const byId = new Map(products.map((product) => [product.id, product]));
    const lines = (cart?.items ?? []).map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw ApiError.notFound('Product');
      return {
        productId: item.productId,
        product,
        quantity: item.quantity,
        unitPriceMinor: product.priceMinor,
        lineTotalMinor: product.priceMinor * item.quantity,
      };
    });
    return {
      id: cart?.id ?? null,
      userId,
      lines,
      itemCount: lines.reduce((n, line) => n + line.quantity, 0),
      subtotalMinor: lines.reduce((n, line) => n + line.lineTotalMinor, 0),
      currency: lines[0]?.product.currency ?? 'BRL',
    };
  }

  async getActiveCart(userId: string): Promise<CartResponse> {
    const cart = await this.withCart(userId, async (_tx, current) => current);
    return this.view(userId, cart);
  }

  addItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
    return this.setItem(userId, productId, quantity, true);
  }

  updateQuantity(userId: string, productId: string, quantity: number): Promise<CartResponse> {
    return this.setItem(userId, productId, quantity, false);
  }

  private async setItem(
    userId: string,
    productId: string,
    quantity: number,
    increment: boolean,
  ): Promise<CartResponse> {
    // Catalog calls happen outside the cart transaction: waiting for another
    // pool connection while holding the account lock can exhaust the pool.
    for (let attempt = 0; attempt < 5; attempt++) {
      const ids = await this.prisma.cartItem.findMany({
        where: { cart: { userId, status: 'ACTIVE' } },
        select: { productId: true },
      });
      const products = await this.catalog.findByIds([
        ...new Set([productId, ...ids.map((item) => item.productId)]),
      ]);
      const byId = new Map(products.map((product) => [product.id, product]));
      const product = byId.get(productId);
      if (!product) throw ApiError.notFound('Product');
      try {
        const result = await this.withCart(userId, async (tx, current) => {
          if (current?.items.some((item) => !byId.has(item.productId)))
            throw new RefreshCatalogSnapshot();
          const existing = current?.items.find((item) => item.productId === productId);
          if (!increment && !existing) throw ApiError.notFound('Cart item');
          const target = quantity + (increment ? (existing?.quantity ?? 0) : 0);
          if (
            !Number.isInteger(target) ||
            target < 1 ||
            target > MAX_CART_QUANTITY ||
            (!existing && (current?.items.length ?? 0) >= 100)
          ) {
            throw new ApiError(
              ErrorCode.CART_LIMIT_EXCEEDED,
              'A quantidade deve estar entre 1 e 99; limite de 100 produtos por carrinho.',
              HttpStatus.CONFLICT,
            );
          }
          if (!product.active || target > product.availableQuantity) {
            throw new ApiError(
              ErrorCode.CART_ITEM_UNAVAILABLE,
              'Quantidade indisponível em estoque. Atualize o carrinho e tente novamente.',
              HttpStatus.CONFLICT,
            );
          }
          if (
            current?.items.some((item) => byId.get(item.productId)?.currency !== product.currency)
          ) {
            throw new ApiError(
              ErrorCode.CART_ITEM_UNAVAILABLE,
              'Os produtos do carrinho devem usar a mesma moeda.',
              HttpStatus.CONFLICT,
            );
          }
          const cart =
            current ?? (await tx.cart.create({ data: { userId }, include: { items: true } }));
          await tx.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId } },
            create: { cartId: cart.id, productId, quantity: target },
            update: { quantity: target },
          });
          const updated = await tx.cart.findUniqueOrThrow({
            where: { id: cart.id },
            include: { items: { orderBy: { createdAt: 'asc' } } },
          });
          return updated;
        });
        return this.view(userId, result);
      } catch (error) {
        if (!(error instanceof RefreshCatalogSnapshot)) throw error;
      }
    }
    throw new ApiError(
      ErrorCode.CART_LIMIT_EXCEEDED,
      'O carrinho mudou em outra aba. Atualize e tente novamente.',
      HttpStatus.CONFLICT,
    );
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const result = await this.withCart(userId, async (tx, cart) => {
      if (!cart) return null;
      await tx.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
      return { ...cart, items: cart.items.filter((item) => item.productId !== productId) };
    });
    return this.view(userId, result);
  }

  async clear(userId: string): Promise<CartResponse> {
    const result = await this.withCart(userId, async (tx, cart) => {
      if (!cart) return null;
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return { ...cart, items: [] };
    });
    return this.view(userId, result);
  }

  async markConverted(cartId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) throw ApiError.notFound('Cart');
    await this.withCart(cart.userId, async (tx) => {
      await tx.cart.update({ where: { id: cartId }, data: { status: 'CONVERTED' } });
    });
  }
}
