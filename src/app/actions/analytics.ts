"use server";

import { prisma } from"@/lib/prisma";

export async function recordSearch(query: string) {
    if (!query || query.length < 3) return; // Ignore very short queries

    const normalizedQuery = query.toLowerCase().trim();

    try {
        await prisma.searchLog.upsert({
            where: { query: normalizedQuery },
            update: {
                count: { increment: 1 },
                lastSearchedAt: new Date()
            },
            create: {
                query: normalizedQuery,
                count: 1
            }
        });
    } catch (error) {
        console.error("Failed to record search:", error);
        // Fail silently - analytics shouldn't break the user experience
    }
}
