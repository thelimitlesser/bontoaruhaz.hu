'use server';

import { stripe } from "@/lib/stripe";

export async function createPaymentIntent(amount: number) {
    if (!amount || amount < 1) {
        throw new Error("Érvénytelen összeg");
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Stripe expects amount in smallest currency unit (cents/filler), but for HUF it is the actual amount
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
        console.error("Stripe PaymentIntent Error:", error);
        throw new Error("Hiba történt a fizetés indítása közben.");
    }
}
