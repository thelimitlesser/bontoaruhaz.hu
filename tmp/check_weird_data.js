const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // 1. Check product by ID "1061"
    const product = await prisma.part.findFirst({
      where: {
        OR: [
          { id: "1061" },
          { productCode: "1061" },
          { sku: "1061" }
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

    if (product) {
      console.log('--- Product Found ---');
      console.log(`ID: ${product.id}, Name: ${product.name}`);
      console.log('Compatibilities:');
      product.compatibilities.forEach(c => {
        console.log(`- Brand: ${c.VehicleModel.VehicleBrand.name}, Model: ${c.VehicleModel.name}`);
      });
    } else {
      console.log('Product 1061 not found by ID/Code/SKU');
    }

    // 2. Look for any Mazda + Fiesta combination
    const weirdCompats = await prisma.partCompatibility.findMany({
      where: {
        VehicleModel: {
          name: { contains: 'Fiesta', mode: 'insensitive' },
          VehicleBrand: {
            name: { contains: 'Mazda', mode: 'insensitive' }
          }
        }
      },
      include: {
        part: true,
        VehicleModel: {
          include: {
            VehicleBrand: true
          }
        }
      }
    });

    if (weirdCompats.length > 0) {
      console.log('--- Weird Compatibilities Found (Mazda + Fiesta) ---');
      weirdCompats.forEach(c => {
        console.log(`Part ID: ${c.partId}, Name: ${c.part.name}`);
        console.log(`- Brand: ${c.VehicleModel.VehicleBrand.name}, Model: ${c.VehicleModel.name}`);
      });
    } else {
      console.log('No Mazda + Fiesta combinations found in compatibilities.');
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
