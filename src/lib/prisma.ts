import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    // Diagnosztika: Próbáljunk meg csatlakozni az indulásnál
    if (process.env.NODE_ENV === "production") {
        client.$connect()
            .then(() => console.log("PRISMA: Database connection successful!"))
            .catch((err) => console.error("PRISMA: CRITICAL CONNECTION ERROR:", err.message));
    }

    return client;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
