import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { finalizeStripeOrder } from "@/app/actions/order";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    if (!stripe) {
        console.error("Webhook Error: Stripe is not initialized");
        return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log("Stripe Webhook Event Received:", event.type);

    // Handle the event
    switch (event.type) {
        case "payment_intent.amount_capturable_updated":
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as any;
            console.log(`Payment confirmed for Intent: ${paymentIntent.id}. Status: ${paymentIntent.status}`);
            
            try {
                // Finalize the order in our database
                // (finalizeStripeOrder is idempotent, so it's safe if already called from UI)
                await finalizeStripeOrder(paymentIntent.id);
                console.log(`Order finalized for Intent: ${paymentIntent.id}`);
            } catch (error) {
                console.error(`Error finalizing order from webhook:`, error);
                // Return 500 so Stripe retries later if it was a transient DB error
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
            break;
            
        case "payment_intent.payment_failed":
            const failedIntent = event.data.object as any;
            console.error(`Payment failed for Intent: ${failedIntent.id}. Error: ${failedIntent.last_payment_error?.message}`);
            // We could potentially update the order status to FAILED here
            break;

        default:
            console.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
