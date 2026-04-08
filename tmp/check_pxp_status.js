const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
    const orders = await prisma.order.findMany({
        where: {
            trackingNumber: { not: null },
            status: 'PROCESSING'
        },
        select: {
            id: true,
            createdAt: true,
            trackingNumber: true,
            status: true
        }
    });

    console.log('Orders pending manifest (PROCESSING with tracking number):');
    console.log(JSON.stringify(orders, null, 2));
    
    const manifestedCount = await prisma.pxpManifest.count();
    console.log('Total manifests in database:', manifestedCount);
}

checkOrders();
