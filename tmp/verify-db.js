const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const partCount = await prisma.part.count();
    const brandCount = await prisma.vehicleBrand.count();
    const modelCount = await prisma.vehicleModel.count();
    console.log('--- DATABASE INTEGRITY CHECK ---');
    console.log(`Termékek (Parts): ${partCount}`);
    console.log(`Márkák (Brands): ${brandCount}`);
    console.log(`Modellek (Models): ${modelCount}`);
    console.log('--------------------------------');
    if (partCount > 0) {
      console.log('Az adatok épek és sértetlenek.');
    }
  } catch (e) {
    console.error('Error connecting to DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
