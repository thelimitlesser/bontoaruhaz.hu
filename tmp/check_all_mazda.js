const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllMazdaCompats() {
  try {
    const compats = await prisma.partCompatibility.findMany({
      where: {
        OR: [
          { brandId: { contains: 'mazda', mode: 'insensitive' } },
          { VehicleModel: { brandId: { contains: 'mazda', mode: 'insensitive' } } }
        ]
      },
      include: {
        part: {
          select: { id: true, name: true, productCode: true, sku: true }
        },
        VehicleModel: {
          include: {
            VehicleBrand: true
          }
        }
      }
    });

    console.log(`Found ${compats.length} Mazda compatibility records.`);
    compats.forEach(c => {
      console.log(`- Product: [${c.part.productCode}] ${c.part.name}`);
      console.log(`  Compat: ${c.VehicleModel.VehicleBrand.name} ${c.VehicleModel.name}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllMazdaCompats();
