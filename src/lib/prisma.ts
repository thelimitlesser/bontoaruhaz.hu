import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const prismaClientSingleton = () => {
    let url = process.env.DATABASE_URL;
    
    // In serverless environments, Prisma limits connection_limit to 1 by default, which can cause 
    // timeouts on concurrent lookups in the same function instance (Sentry connection limit: 1).
    // We enforce a slightly higher limit since we use PgBouncer.
    if (url && process.env.NODE_ENV === "production" && !url.includes("connection_limit")) {
        url += (url.includes("?") ? "&" : "?") + "connection_limit=5&pool_timeout=30";
    }

    const client = new PrismaClient({
        datasources: url ? {
            db: {
                url: url,
            },
        } : undefined,
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
