import { randomUUID } from 'node:crypto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  AddressInput,
  CheckoutPricing,
  CheckoutQuote,
  DEMO_CARD,
  ErrorCode,
  OrderPaymentCard,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
  isCardExpired,
} from '@amazon-mvp/api-contract';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { Prisma } from '@amazon-mvp/database';
import { API_CONFIG } from '../../config/api-config';
import { PrismaService } from '../../common/prisma.service';
import { ApiError } from '../../common/api-error';
import { CART_API, CartApi } from '../cart/cart.api';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import {
  USER_ADDRESSES_API,
  USER_PAYMENT_CARDS_API,
  UserAddressesApi,
  UserPaymentCardsApi,
} from '../users/users.api';
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
    @Inject(USER_PAYMENT_CARDS_API) private readonly cards: UserPaymentCardsApi,
    @Inject(API_CONFIG) config: ApiConfig,
  ) {
    const { pixDiscountPercent, maxInstallments, minInstallmentMinor } = config.checkout;
    this.checkoutPricing = { pixDiscountPercent, maxInstallments, minInstallmentMinor };
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
        const paymentCard = await this.paymentCard(userId, input, tx);
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
        const installments = paymentCard ? (input.installments ?? 1) : null;
        if (
          installments !== null &&
          !quote.installmentOptions.some((o) => o.count === installments)
        )
          throw invalidPayment('Número de parcelas indisponível para este total.');
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
            paymentCard: paymentCard
              ? { brand: paymentCard.brand, last4: paymentCard.last4 }
              : undefined,
            installments,
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
  /** Card snapshot for SIMULATED_CARD (a saved card or the demo Visa); null for Pix. */
  private async paymentCard(
    userId: string,
    input: PlaceOrderRequest,
    tx: Prisma.TransactionClient,
  ): Promise<OrderPaymentCard | null> {
    if (input.paymentMethod !== 'SIMULATED_CARD') {
      if (input.cardId !== undefined || input.installments !== undefined)
        throw invalidPayment('Pix não aceita cartão nem parcelamento.');
      return null;
    }
    if (input.cardId === undefined) return { ...DEMO_CARD };
    const card = await this.cards.findCard(userId, input.cardId, tx);
    if (!card) throw ApiError.notFound('Payment card');
    if (isCardExpired(card)) throw invalidPayment('O cartão selecionado está vencido.');
    return { brand: card.brand, last4: card.last4 };
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
const invalidPayment = (message: string) =>
  new ApiError(ErrorCode.PAYMENT_INVALID, message, HttpStatus.BAD_REQUEST);

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
    paymentCard: order.paymentCard as unknown as OrderPaymentCard | null,
    installments: order.installments,
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
