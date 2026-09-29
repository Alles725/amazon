import { PrismaClient } from '@prisma/client';
import { seedDemoOrders } from './demo-orders';

const email = process.env.DEMO_ORDER_EMAIL;
if (!email) {
  console.error('Set DEMO_ORDER_EMAIL to the e-mail of the account that owns the demo orders.');
  process.exit(1);
}

const prisma = new PrismaClient();
seedDemoOrders(prisma, email)
  .then((created) => console.log(`Demo orders: ${created} created; existing orders preserved.`))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
