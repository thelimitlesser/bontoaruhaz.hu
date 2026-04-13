const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listRecentProducts() {
  try {
    const products = await prisma.part.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          name: true,
          sku: true,
          productCode: true,
          VehicleBrand: { select: { name: true } },
          VehicleModel: { select: { name: true } },
          bodyType: true
      }
    });
    
    console.log('--- RECENT PRODUCTS ---');
    products.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Name: "${p.name}"`);
      console.log(`Brand: ${p.VehicleBrand?.name}, Model: ${p.VehicleModel?.name}, Body: ${p.bodyType}`);
      console.log(`SKU: ${p.sku}, Ref: ${p.productCode}`);
      console.log('------------------------');
    });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

listRecentProducts();
