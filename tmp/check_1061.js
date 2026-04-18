const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct1061() {
  try {
    const product = await prisma.part.findUnique({
      where: { id: 1061 },
      include: {
        compatibilities: {
          include: {
            brand: true,
            model: true,
            generation: true
          }
        }
      }
    });

    if (!product) {
      console.log('Product 1061 not found');
      return;
    }

    console.log('Product 1061:', product.name);
    console.log('Brand/Model from main table:', product.brandId, product.modelId);
    console.log('Compatibilities:');
    product.compatibilities.forEach(c => {
      console.log(`- Brand: ${c.brand.name}, Model: ${c.model.name}, Gen: ${c.generation?.name || 'N/A'}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct1061();
