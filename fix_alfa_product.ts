import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Keresünk minden olyan terméket, aminek 'ajto' a subcategoryId-ja
  const products = await prisma.part.findMany({
    where: { subcategoryId: 'ajto' }
  });

  console.log(`Found ${products.length} products with slug 'ajto'.`);

  for (const product of products) {
    await prisma.part.update({
      where: { id: product.id },
      // Az 'ajto' ID-ja a 'subcat-karosszeria-elem-100'
      data: { subcategoryId: 'subcat-karosszeria-elem-100' }
    });
    console.log(`Updated product ${product.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
