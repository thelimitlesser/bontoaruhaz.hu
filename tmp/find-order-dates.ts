import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const orders = await prisma.order.findMany({ select: { id: true, createdAt: true }, where: { id: { in: ['71e46d6f-0e89-489d-9b53-80aa93a3ded3', '93e3b61b-a3d4-48dc-8c5d-a69e413a694e', 'b84ea82e-d1da-4ab8-9698-ba31d25d7583'] }} });
    console.log(orders);
}
main().finally(() => prisma.$disconnect());
