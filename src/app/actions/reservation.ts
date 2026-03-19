'use server';

import { prisma } from "@/lib/prisma";

const RESERVATION_MINUTES = 15;

/**
 * Clean up expired reservations globally
 */
export async function cleanupExpiredReservations() {
    try {
        await prisma.reservation.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        });
    } catch (error) {
        console.error("Error cleaning up expired reservations:", error);
    }
}

/**
 * Attempts to reserve a part.
 */
export async function reservePart(partId: string, sessionId: string, requestedQuantity: number = 1) {
    // 1. Clean up expired ones first to free up stock
    await cleanupExpiredReservations();

    // 2. Fetch the part and its active reservations
    const part = await prisma.part.findUnique({
        where: { id: partId },
        include: {
            reservations: {
                where: { expiresAt: { gt: new Date() } }
            }
        }
    });

    if (!part) {
        return { success: false, error: "Alkatrész nem található." };
    }

    // 3. Check available stock
    // Sum the quantities of all active reservations EXCEPT the one for this session (if it exists)
    const reservationsByOthers = part.reservations.filter(r => r.sessionId !== sessionId);
    const sumOthers = reservationsByOthers.reduce((acc, r) => acc + r.quantity, 0);
    const availableForThisUser = part.stock - sumOthers;

    if (availableForThisUser < requestedQuantity) {
        if (availableForThisUser <= 0) {
            return { success: false, error: "Ezt a terméket más(ok) már a kosarukba tették (Ideiglenesen foglalt)." };
        } else {
            return { success: false, error: `Sajnos csak ${availableForThisUser} db érhető el ebből a termékből.` };
        }
    }

    // 4. Create or update reservation
    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

    try {
        const existing = await prisma.reservation.findFirst({
            where: { partId, sessionId }
        });

        if (existing) {
            await prisma.reservation.update({
                where: { id: existing.id },
                data: { 
                    expiresAt,
                    quantity: requestedQuantity 
                }
            });
        } else {
            await prisma.reservation.create({
                data: { 
                    partId, 
                    sessionId, 
                    expiresAt,
                    quantity: requestedQuantity
                }
            });
        }

        return { success: true, expiresAt };
    } catch (error) {
        console.error("Reservation Error:", error);
        return { success: false, error: "Szerverhiba történt a foglalás során." };
    }
}

/**
 * Releases a reservation when removed from cart
 */
export async function releaseReservation(partId: string, sessionId: string) {
    try {
        const existing = await prisma.reservation.findFirst({
            where: { partId, sessionId }
        });
        if (existing) {
            await prisma.reservation.delete({
                where: { id: existing.id }
            });
        }
        return { success: true };
    } catch (error) {
        // It might not exist or already be deleted, which is fine
        return { success: false };
    }
}

/**
 * Keeps all reservations for a session alive (extends expiration)
 */
export async function refreshSessionReservations(sessionId: string) {
    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
    try {
        await prisma.reservation.updateMany({
            where: { 
                sessionId, 
                expiresAt: { gt: new Date() } // Only update active ones
            },
            data: { expiresAt }
        });
        return { success: true, expiresAt };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Validates if the given part IDs are still reserved by the session
 */
export async function validateCartReservations(partIds: string[], sessionId: string) {
    if (!partIds.length) return true;

    // Clean up expired first to be accurate
    await cleanupExpiredReservations();

    const activeReservations = await prisma.reservation.findMany({
        where: {
            sessionId: sessionId,
            expiresAt: { gt: new Date() },
            partId: { in: partIds }
        }
    });

    return activeReservations.length === partIds.length;
}
