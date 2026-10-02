import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  AddressInput,
  CheckoutPricing,
  CheckoutQuote,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { Prisma } from '@amazon-mvp/database';
import { API_CONFIG } from '../../config/api-config';
import { PrismaService } from '../../common/prisma.service';
import { ApiError } from '../../common/api-error';
import { CART_API, CartApi } from '../cart/cart.api';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import { USER_ADDRESSES_API, UserAddressesApi } from '../users/users.api';
import { conflict, quoteCart } from './checkout-quote';
import { OrdersApi } from './orders.api';

type StoredOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;

@Injectable()
export class OrdersService implements OrdersApi {
  private readonly checkoutPricing: CheckoutPricing;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CART_API) private readonly cart: CartApi,
    @Inject(CATALOG_API) private readonly catalog: CatalogApi,
    @Inject(USER_ADDRESSES_API) private readonly users: UserAddressesApi,
    @Inject(API_CONFIG) config: ApiConfig,
  ) {
    this.checkoutPricing = { pixDiscountPercent: config.checkout.pixDiscountPercent };
  }

  pricing(): CheckoutPricing {
    return { ...this.checkoutPricing };
  }

  async quote(
    userId: string,
    paymentMethod: SimulatedPayment = 'SIMULATED_CARD',
  ): Promise<CheckoutQuote> {
    return quoteCart(await this.cart.getActiveCart(userId), paymentMethod, this.checkoutPricing);
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
        // Totals and the discount are recomputed here from locked catalog prices and
        // the server's own rate; nothing monetary is taken from the request.
        const quote = quoteCart(
          {
            id: input.cartId,
            userId,
            lines,
            itemCount: items.reduce((n, i) => n + i.quantity, 0),
            subtotalMinor: lines.reduce((n, i) => n + i.lineTotalMinor, 0),
            currency: products[0].currency,
          },
          input.paymentMethod,
          this.checkoutPricing,
        );
        if (quote.revision !== input.revision)
          throw conflict(
            'Seu carrinho, os preços ou a forma de pagamento mudaram. Revise o resumo e confirme novamente.',
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
          phone: address.phone,
          deliveryInstructions: address.deliveryInstructions,
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
  async hasPurchased(userId: string, productId: string) {
    const line = await this.prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: { not: 'CANCELLED' } } },
      select: { id: true },
    });
    return line !== null;
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
