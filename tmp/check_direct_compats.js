const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const compats = await prisma.partCompatibility.findMany({
      where: {
        partId: "2407a614-4aaa-437e-a10c-311a92a38ddf"
      },
      include: {
        VehicleModel: {
          include: {
            VehicleBrand: true
          }
        }
      }
    });

    console.log(`Found ${compats.length} compatibility records for Part ID: 2407a614-4aaa-437e-a10c-311a92a38ddf`);
    compats.forEach(c => {
      console.log(`- ${c.VehicleModel.VehicleBrand.name} ${c.VehicleModel.name}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
