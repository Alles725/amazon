import { PrismaClient } from '@prisma/client';
import { seedDemoProducts } from './demo-products';

const prisma = new PrismaClient();
seedDemoProducts(prisma)
  .then(() => console.log('Demo catalog synchronized; existing records preserved.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
