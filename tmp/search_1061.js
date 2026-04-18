const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const products = await prisma.part.findMany({
      where: {
        OR: [
          { sku: { contains: '1061' } },
          { productCode: { contains: '1061' } },
          { id: '1061' }
        ]
      },
      include: {
        compatibilities: {
          include: {
            VehicleModel: {
              include: {
                VehicleBrand: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${products.length} products with 1061`);
    products.forEach(p => {
      console.log(`--- ${p.name} (ID: ${p.id}, Code: ${p.productCode}, SKU: ${p.sku}) ---`);
      if (p.compatibilities.length === 0) {
        console.log('No compatibilities');
      } else {
        p.compatibilities.forEach(c => {
          console.log(`- ${c.VehicleModel.VehicleBrand.name} ${c.VehicleModel.name}`);
        });
      }
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
