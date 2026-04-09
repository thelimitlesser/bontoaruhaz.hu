import { prisma } from "../src/lib/prisma";
import { cleanupOldOrders } from "../src/app/actions/order";

async function test() {
    console.log("Setting up test data...");
    
    // 1. Create a Very Old Delivered Order (40 days ago)
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    const testOrder = await prisma.order.create({
        data: {
            status: 'DELIVERED',
            totalAmount: 100,
            shippingAddress: 'Test',
            billingAddress: 'Test',
            createdAt: fortyDaysAgo,
            updatedAt: fortyDaysAgo,
            items: {
                create: {
                    partId: 'a2c066aa-07f9-4271-a075-23d4517de168', // existing part
                    quantity: 1,
                    priceAtTime: 100
                }
            }
        }
    });

    console.log(`Created test order: ${testOrder.id} from ${fortyDaysAgo.toISOString()}`);

    // 2. Run Cleanup
    const result = await cleanupOldOrders();
    console.log("Cleanup Result:", result);

    // 3. Verify
    const found = await prisma.order.findUnique({
        where: { id: testOrder.id }
    });

    if (!found) {
        console.log("SUCCESS: Test order was correctly deleted.");
    } else {
        console.error("FAILURE: Test order still exists!");
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());
