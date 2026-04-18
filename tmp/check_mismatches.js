const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const compats = await prisma.partCompatibility.findMany({
      include: {
        VehicleModel: {
          include: {
            VehicleBrand: true
          }
        }
      }
    });

    console.log(`Checking ${compats.length} compatibility records for brand mismatches...`);
    let found = false;
    compats.forEach(c => {
      // If the brandId in compatibility doesn't match the brandId of the model it points to
      if (c.brandId !== c.VehicleModel.brandId) {
        console.log(`--- MISMATCH FOUND ---`);
        console.log(`Part ID: ${c.partId}`);
        console.log(`Compat Brand: ${c.brandId}`);
        console.log(`Model Brand: ${c.VehicleModel.brandId} (Model: ${c.VehicleModel.name})`);
        found = true;
      }
    });

    if (!found) {
      console.log('No brand/model mismatches found in PartCompatibility table.');
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
