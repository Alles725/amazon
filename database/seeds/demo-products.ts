import { PrismaClient } from '@prisma/client';
import products from '../../config/demo-products.json';

/** Explicit demo inventory, never a fallback for missing real stock.
 * Empty upsert updates keep existing merchant edits and inventory untouched. */
export async function seedDemoProducts(prisma: PrismaClient) {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.id },
      update: {},
      create: {
        sku: product.sku,
        slug: product.id,
        name: product.name,
        priceMinor: product.priceMinor,
        currency: 'BRL',
        inventory: { create: { quantity: product.inventoryQuantity } },
      },
    });
  }
}
