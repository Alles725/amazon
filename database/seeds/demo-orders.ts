import { PrismaClient } from '@prisma/client';
import orders from '../../config/demo-orders.json';

/** Persists config/demo-orders.json for one EXISTING account (never creates users).
 * Items snapshot the current catalog product exactly like checkout does. Orders
 * whose number already exists are left untouched, so reruns are safe. */
export async function seedDemoOrders(prisma: PrismaClient, email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No account with e-mail ${email}. Register it first.`);

  let created = 0;
  for (const order of orders) {
    if (await prisma.order.findUnique({ where: { orderNumber: order.orderNumber } })) continue;
    const items = await Promise.all(
      order.items.map(async ({ productSlug, quantity }) => {
        const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPriceMinor: product.priceMinor,
          lineTotalMinor: product.priceMinor * quantity,
          currency: product.currency,
        };
      }),
    );
    const subtotalMinor = items.reduce((sum, item) => sum + item.lineTotalMinor, 0);
    await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: order.orderNumber,
        status: order.status as 'FULFILLED',
        placedAt: new Date(order.placedAt),
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
        deliveryNote: order.deliveryNote,
        paymentMethod: order.paymentMethod,
        shippingAddress: { recipient: user.displayName, ...order.shippingAddress },
        subtotalMinor,
        totalMinor: subtotalMinor,
        items: { create: items },
      },
    });
    created++;
  }
  return created;
}
