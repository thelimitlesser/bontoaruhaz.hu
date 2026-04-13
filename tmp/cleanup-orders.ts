import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Database Cleanup...');

  try {
    // 1. Delete OrderItems first (Foreign Key constraint)
    const orderItems = await prisma.orderItem.deleteMany({});
    console.log(`✅ Deleted ${orderItems.count} OrderItems.`);

    // 2. Delete Orders
    const orders = await prisma.order.deleteMany({});
    console.log(`✅ Deleted ${orders.count} Orders.`);

    // 3. Delete PXP Manifests
    const manifests = await prisma.pxpManifest.deleteMany({});
    console.log(`✅ Deleted ${manifests.count} PXP Manifests.`);

    // 4. Delete PXP Sync Logs
    const syncLogs = await prisma.pxpSyncLog.deleteMany({});
    console.log(`✅ Deleted ${syncLogs.count} PXP Sync Logs.`);

    console.log('✨ Cleanup completed successfully! Inventory (Parts) remained untouched.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
