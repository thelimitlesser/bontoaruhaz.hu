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
export async function getRevenueStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();
    
    // Budapest time adjustments would be better but let's stick to UTC/Local for simplicity unless specific issues arise
    if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
        // Last 7 days
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: startDate }
            },
            select: { totalAmount: true }
        });

        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        return { success: true, revenue: totalRevenue, count: orders.length };
    } catch (error) {
        console.error("Failed to get revenue stats:", error);
        return { success: false, revenue: 0, count: 0 };
    }
}

export async function getRevenueDetails(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: startDate }
            },
            include: {
                user: {
                    select: { fullName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, orders };
    } catch (error) {
        console.error("Failed to get revenue details:", error);
        return { success: false, orders: [] };
    }
}
