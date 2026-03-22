import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackAndSyncShipment } from '@/app/actions/shipping';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Optional: add a basic authorization check using headers 
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const shippedOrders = await prisma.order.findMany({
            where: {
                status: 'SHIPPED',
                trackingNumber: {
                    not: null,
                    notIn: ['']
                }
            },
            select: {
                id: true,
                trackingNumber: true
            }
        });

        if (shippedOrders.length === 0) {
            return NextResponse.json({ message: 'Nincs szinkronizálandó rendelés.', count: 0 });
        }

        const results = [];
        for (const order of shippedOrders) {
            const result = await trackAndSyncShipment(order.id, order.trackingNumber as string);
            results.push({
                orderId: order.id,
                tracking: order.trackingNumber,
                result
            });
            // Add a small delay to avoid hitting PXP API rate limits too hard
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return NextResponse.json({ 
            message: `Sikeresen lefutott a napi szinkronizáció. Átvizsgált csomagok száma: ${shippedOrders.length}`, 
            results 
        });

    } catch (error: any) {
        console.error('CRON PXP Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
