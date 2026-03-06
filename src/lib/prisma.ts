import { PrismaClient } from"@prisma/client";
// Force reload for schema update


const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Force re-initialization once to pick up the new schema fields (phoneNumber, shippingAddress)
if (process.env.NODE_ENV !=="production") {
    (global as any).prisma = undefined;
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ["query"],
    });
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !=="production") globalForPrisma.prisma = prisma;
