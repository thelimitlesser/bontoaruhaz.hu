const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const p = await prisma.part.findFirst({
      where: { productCode: "1061" },
      include: {
        VehicleBrand: true,
        VehicleModel: true
      }
    });

    if (p) {
      console.log('--- Product 1061 ---');
      console.log(`Name: ${p.name}`);
      console.log(`Brand: ${p.VehicleBrand?.name} (ID: ${p.brandId})`);
      console.log(`Model: ${p.VehicleModel?.name} (ID: ${p.modelId})`);
    } else {
      console.log('Not found');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
