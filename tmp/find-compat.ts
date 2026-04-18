import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const compat = await prisma.partCompatibility.findFirst({
    include: {
      part: true,
      brand: true,
      model: true
    }
  });

  if (compat) {
    console.log('--- FOUND COMPATIBILITY ---');
    console.log('Part ID:', compat.partId);
    console.log('Part Name:', compat.part.name);
    console.log('Brand ID:', compat.brandId);
    console.log('Brand Name:', compat.brand.name);
    console.log('Model ID:', compat.modelId);
    console.log('Model Name:', compat.model.name);
    console.log('--- SUCCESS ---');
  } else {
    console.log('No compatibility found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
