const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for parts with originalPrice...");
    const parts = await prisma.part.findMany({
        where: {
            originalPrice: {
                not: null,
                gt: 0
            }
        },
        select: {
            id: true,
            name: true,
            priceGross: true,
            originalPrice: true
        },
        take: 10
    });

    if (parts.length === 0) {
        console.log("No parts found with a sale price (originalPrice > 0).");
        // Check a few parts anyway to see their structure
        const lastParts = await prisma.part.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, originalPrice: true }
        });
        console.log("Structure of last 5 added parts:", JSON.stringify(lastParts, null, 2));
    } else {
        console.log(`Found ${parts.length} parts with sale price:`);
        console.log(JSON.stringify(parts, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
