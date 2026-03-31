'use server';

import { stripe } from "@/lib/stripe";

export async function createPaymentIntent(amount: number) {
    if (!amount || amount < 1) {
        throw new Error("Érvénytelen összeg");
    }

    // Existing check for stripe
    if (!stripe) {
        console.error("Stripe initialization failed: stripe object is null. Check STRIPE_SECRET_KEY.");
        throw new Error("Stripe beállítások hiányoznak a szerveren. Kérjük add meg a STRIPE_SECRET_KEY-t a Vercelen!");
    }

    try {
        console.log("Creating Stripe PaymentIntent for amount (raw):", amount);
        // Multiply by 100 because Stripe seems to be treating HUF as a 2-decimal currency in this account
        const stripeAmount = Math.round(amount * 100);
        console.log("Stripe Amount (after *100):", stripeAmount);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount, 
            currency: 'huf',
            // manual capture means we only authorize the funds
            capture_method: 'manual',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error: any) {
        console.error("DEBUG - Stripe PaymentIntent Error Details:", {
            message: error.message,
            code: error.code,
            type: error.type,
            stack: error.stack
        });
        
        if (error.type === 'StripeAuthenticationError') {
            throw new Error("Stripe hitelesítési hiba. Kérjük ellenőrizd a STRIPE_SECRET_KEY-t a Vercelen!");
        }
        
        throw new Error(`Stripe hiba: ${error.message || "Hiba történt a fizetés indítása közben."}`);
    }
}
