import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Attempting to create a test order...");
        const order = await prisma.order.create({
            data: {
                totalAmount: 1000,
                shippingCost: 0,
                shippingAddress: "test",
                billingAddress: "test",
                shippingMethod: "DELIVERY",
                paymentMethod: "CARD",
                isCompany: false,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                items: {
                    create: [
                        {
                            partId: "any-id", // This might fail P2003 but we want to see VALIDATION error
                            quantity: 1,
                            priceAtTime: 1000,
                            productName: "Test Product"
                        }
                    ]
                }
            }
        });
        console.log("Order created successfully:", order.id);
    } catch (error: any) {
        console.error("PRISMA ERROR TYPE:", error.constructor.name);
        console.error("FULL ERROR MESSAGE:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
