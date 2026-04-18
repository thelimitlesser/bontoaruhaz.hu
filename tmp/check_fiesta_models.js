const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const models = await prisma.vehicleModel.findMany({
      where: {
        OR: [
          { name: { contains: 'Fiesta', mode: 'insensitive' } },
          { id: { contains: 'fiesta', mode: 'insensitive' } }
        ]
      },
      include: {
        VehicleBrand: true
      }
    });

    console.log(`Found ${models.length} models with 'Fiesta'`);
    models.forEach(m => {
      console.log(`- Model: ${m.name} (ID: ${m.id}), Brand: ${m.VehicleBrand.name} (ID: ${m.brandId})`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
