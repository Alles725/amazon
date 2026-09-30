import { PrismaClient } from '@prisma/client';
import { seedDemoProducts } from './demo-products';
import { seedDemoReviews } from './demo-reviews';

const prisma = new PrismaClient();
seedDemoProducts(prisma)
  .then(() => seedDemoReviews(prisma))
  .then(({ baselines, texts }) =>
    console.log(
      `Demo catalog synchronized (${baselines} demo rating aggregates, ${texts} demo review texts); existing records preserved.`,
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
