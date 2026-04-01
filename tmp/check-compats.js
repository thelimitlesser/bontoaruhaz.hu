const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const counts = await prisma.partCompatibility.groupBy({
        by: ['partId'],
        _count: { id: true }
    });
    console.log('--- COMPATIBILITY COUNTS ---');
    counts.sort((a, b) => b._count.id - a._count.id).forEach(c => {
      console.log(`Part ID: ${c.partId}, Count: ${c._count.id}`);
    });
    console.log('----------------------------');
  } catch (e) {
    console.error('Error connecting to DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
