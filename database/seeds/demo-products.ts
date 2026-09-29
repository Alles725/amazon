import { PrismaClient } from '@prisma/client';
import products from '../../config/demo-products.json';
import content from '../../config/demo-product-content.json';
import categories from '../../config/demo-categories.json';

/** Fixture values replaced in config/demo-products.json. A record still holding
 * exactly these values was never edited by a merchant, so it is upgraded in place;
 * any other value means someone changed it and the record is left alone. */
const RETIRED_FIXTURES: Record<string, { sku: string; name: string; priceMinor: number }> = {
  p6: { sku: 'DEMO-p6', name: 'Controle Sem Fio para Console, Preto', priceMinor: 32900 },
};

/** Taxonomy for the demo records. Parents are listed before children. Existing
 * categories keep their names; a missing parent link is filled in. */
async function seedDemoCategories(prisma: PrismaClient) {
  const ids = new Map<string, string>();
  for (const category of categories as Array<{ slug: string; name: string; parent?: string }>) {
    const parentId = category.parent ? ids.get(category.parent) : undefined;
    if (category.parent && !parentId)
      throw new Error(`Category ${category.slug} lists unknown parent ${category.parent}`);
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { slug: category.slug, name: category.name, parentId },
    });
    if (parentId && !saved.parentId)
      await prisma.category.update({ where: { id: saved.id }, data: { parentId } });
    ids.set(category.slug, saved.id);
  }
  return ids;
}

/** Explicit demo inventory, never a fallback for missing real stock.
 * Empty upsert updates keep existing merchant edits and inventory untouched;
 * only absent data (description, category links) is filled in. */
export async function seedDemoProducts(prisma: PrismaClient) {
  const categoryIds = await seedDemoCategories(prisma);
  for (const product of products) {
    const extra = content.find((item) => item.id === product.id && item.sku === product.sku);
    const saved = await prisma.product.upsert({
      where: { slug: product.id },
      update: {},
      create: {
        sku: product.sku,
        slug: product.id,
        name: product.name,
        description: extra?.description ?? null,
        priceMinor: product.priceMinor,
        currency: 'BRL',
        inventory: { create: { quantity: product.inventoryQuantity } },
      },
    });

    const retired = RETIRED_FIXTURES[product.id];
    const upgrade =
      retired &&
      saved.sku === retired.sku &&
      saved.name === retired.name &&
      saved.priceMinor === retired.priceMinor;
    if (upgrade || (extra?.description && !saved.description))
      await prisma.product.update({
        where: { id: saved.id },
        data: {
          ...(upgrade ? { name: product.name, priceMinor: product.priceMinor } : {}),
          ...(extra?.description && !saved.description ? { description: extra.description } : {}),
        },
      });

    for (const slug of extra?.categories ?? []) {
      const categoryId = categoryIds.get(slug);
      if (!categoryId) throw new Error(`Product ${product.id} lists unknown category ${slug}`);
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: saved.id, categoryId } },
        update: {},
        create: { productId: saved.id, categoryId },
      });
    }
  }
}
