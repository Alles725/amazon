import { createHash, randomUUID } from 'node:crypto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  AddressInput,
  CartResponse,
  CheckoutQuote,
  ErrorCode,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { PrismaService } from '../../common/prisma.service';
import { ApiError } from '../../common/api-error';
import { CART_API, CartApi } from '../cart/cart.api';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import { USER_ADDRESSES_API, UserAddressesApi } from '../users/users.api';
import { OrdersApi } from './orders.api';

type StoredOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
const conflict = (message: string) =>
  new ApiError(ErrorCode.CART_ITEM_UNAVAILABLE, message, HttpStatus.CONFLICT);

/** Academic checkout: free shipping, no promotion engine, no real charge. */
function quoteCart(cart: CartResponse): CheckoutQuote {
  if (!cart.lines.length) throw conflict('Seu carrinho está vazio.');
  if (
    cart.lines.some(
      (line) =>
        line.product.currency !== cart.currency ||
        !line.product.active ||
        line.quantity > line.product.availableQuantity,
    )
  )
    throw conflict('Revise os produtos e quantidades do carrinho.');
  if (
    !Number.isSafeInteger(cart.subtotalMinor) ||
    cart.subtotalMinor < 0 ||
    cart.subtotalMinor > 2147483647
  )
    throw conflict('O total do carrinho excede o limite permitido.');
  const revision = createHash('sha256')
    .update(
      JSON.stringify([
        cart.id,
        cart.currency,
        [...cart.lines]
          .sort((a, b) => a.productId.localeCompare(b.productId))
          .map((line) => [line.productId, line.quantity, line.unitPriceMinor]),
      ]),
    )
    .digest('hex');
  return {
    cart,
    revision,
    subtotalMinor: cart.subtotalMinor,
    shippingMinor: 0,
    discountMinor: 0,
    totalMinor: cart.subtotalMinor,
    currency: cart.currency,
  };
}

@Injectable()
export class OrdersService implements OrdersApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CART_API) private readonly cart: CartApi,
    @Inject(CATALOG_API) private readonly catalog: CatalogApi,
    @Inject(USER_ADDRESSES_API) private readonly users: UserAddressesApi,
  ) {}

  async quote(userId: string): Promise<CheckoutQuote> {
    return quoteCart(await this.cart.getActiveCart(userId));
  }

  async placeOrderFromCart(userId: string, input: PlaceOrderRequest): Promise<OrderResponse> {
    return this.prisma.$transaction(
      async (tx) => {
        await this.cart.lockForCheckout(userId, tx);
        // Retries (including a lost HTTP response) return the original persisted order.
        const existing = await tx.order.findFirst({
          where: { userId, sourceCartId: input.cartId },
          include: { items: true },
        });
        if (existing) return orderView(existing);
        const address = await this.users.findAddress(userId, input.addressId, tx);
        if (!address) throw ApiError.notFound('Address');
        const items = await this.cart.checkoutItems(userId, input.cartId, tx);
        const products = await this.catalog.consumeForOrder(items, tx);
        const byId = new Map(products.map((p) => [p.id, p]));
        const lines = items.map((item) => {
          const product = byId.get(item.productId)!;
          return {
            ...item,
            product,
            unitPriceMinor: product.priceMinor,
            lineTotalMinor: item.quantity * product.priceMinor,
          };
        });
        const quote = quoteCart({
          id: input.cartId,
          userId,
          lines,
          itemCount: items.reduce((n, i) => n + i.quantity, 0),
          subtotalMinor: lines.reduce((n, i) => n + i.lineTotalMinor, 0),
          currency: products[0].currency,
        });
        if (quote.revision !== input.revision)
          throw conflict(
            'Seu carrinho ou os preços mudaram. Revise o resumo e confirme novamente.',
          );
        const snapshot = {
          recipient: address.recipient,
          postalCode: address.postalCode,
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        } satisfies AddressInput;
        const order = await tx.order.create({
          data: {
            userId,
            sourceCartId: input.cartId,
            orderNumber: `PED-${randomUUID()}`,
            status: 'PENDING',
            subtotalMinor: quote.subtotalMinor,
            shippingMinor: quote.shippingMinor,
            discountMinor: quote.discountMinor,
            totalMinor: quote.totalMinor,
            currency: quote.currency,
            shippingAddress: snapshot,
            paymentMethod: input.paymentMethod,
            items: {
              create: lines.map((line) => ({
                productId: line.productId,
                productName: line.product.name,
                sku: line.product.sku,
                quantity: line.quantity,
                unitPriceMinor: line.unitPriceMinor,
                lineTotalMinor: line.lineTotalMinor,
                currency: line.product.currency,
              })),
            },
          },
          include: { items: true },
        });
        await this.cart.convertForCheckout(userId, input.cartId, tx);
        return orderView(order);
      },
      { maxWait: 10000, timeout: 20000 },
    );
  }
  async listForUser(userId: string) {
    return (
      await this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { placedAt: 'desc' },
        take: 50,
      })
    ).map(orderView);
  }
  async findForUser(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    return order ? orderView(order) : null;
  }
}
function orderView(order: StoredOrder): OrderResponse {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotalMinor: order.subtotalMinor,
    shippingMinor: order.shippingMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    currency: order.currency,
    shippingAddress: order.shippingAddress as unknown as AddressInput | null,
    paymentMethod: order.paymentMethod as SimulatedPayment | null,
    placedAt: order.placedAt.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    deliveryNote: order.deliveryNote,
    lines: order.items.map(
      ({ productId, productName, sku, quantity, unitPriceMinor, lineTotalMinor, currency }) => ({
        productId,
        productName,
        sku,
        quantity,
        unitPriceMinor,
        lineTotalMinor,
        currency,
      }),
    ),
  };
}
