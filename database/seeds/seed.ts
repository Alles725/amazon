import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'books', name: 'Books' },
  { slug: 'home-kitchen', name: 'Home & Kitchen' },
];

const products = [
  {
    sku: 'ELEC-0001',
    slug: 'usb-c-charger-65w',
    name: '65W USB-C Charger',
    description: 'Compact GaN charger with two USB-C ports.',
    priceMinor: 24990,
    categories: ['electronics'],
    quantity: 120,
  },
  {
    sku: 'ELEC-0002',
    slug: 'wireless-mouse-quiet',
    name: 'Quiet Wireless Mouse',
    description: 'Silent-click mouse with a 12-month battery.',
    priceMinor: 13500,
    categories: ['electronics'],
    quantity: 64,
  },
  {
    sku: 'BOOK-0001',
    slug: 'designing-data-intensive-systems',
    name: 'Designing Data-Intensive Systems',
    description: 'Reference on storage, replication and consistency.',
    priceMinor: 18900,
    categories: ['books'],
    quantity: 30,
  },
  {
    sku: 'HOME-0001',
    slug: 'pour-over-coffee-kettle',
    name: 'Pour-Over Coffee Kettle',
    description: 'Gooseneck kettle, 1L, variable temperature.',
    priceMinor: 32900,
    categories: ['home-kitchen', 'electronics'],
    quantity: 18,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const product of products) {
    const { categories: categorySlugs, quantity, ...data } = product;

    const saved = await prisma.product.upsert({
      where: { sku: data.sku },
      update: data,
      create: data,
    });

    await prisma.inventory.upsert({
      where: { productId: saved.id },
      update: { quantity },
      create: { productId: saved.id, quantity },
    });

    for (const slug of categorySlugs) {
      const category = await prisma.category.findUniqueOrThrow({ where: { slug } });
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: saved.id, categoryId: category.id } },
        update: {},
        create: { productId: saved.id, categoryId: category.id },
      });
    }
  }

  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);
  console.log(`seed complete: ${categoryCount} categories, ${productCount} products`);
}

main()
  .catch((error) => {
    console.error('seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
