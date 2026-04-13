import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const orders = await prisma.order.findMany({ select: { id: true, trackingNumber: true } });
    console.log(orders.filter(o => o.id.includes('a3ded3') || o.id.includes('a3ded')));
    console.log(orders.filter(o => o.id.includes('93E3B61B') || o.id.includes('93e3b61b')));
    console.log(orders.filter(o => o.id.includes('B84EA82E') || o.id.includes('b84ea82e')));
}
main().finally(() => prisma.$disconnect());
