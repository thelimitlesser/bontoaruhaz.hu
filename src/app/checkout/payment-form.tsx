"use client";

import { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { createOrder } from "@/app/actions/order";
import { validateCartReservations } from "@/app/actions/reservation";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
    formData: any;
    totalAmount: number;
    shippingMethod: string;
}

export function PaymentForm({ formData, totalAmount, shippingMethod }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { items, clearCart } = useCart();
    const router = useRouter();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        // Pre-payment reservation validation
        const sessionId = localStorage.getItem("autonexus-session-id");
        if (sessionId) {
            const partIds = items.map(item => item.id);
            const isValid = await validateCartReservations(partIds, sessionId);
            if (!isValid) {
                setMessage("Egy vagy több termék foglalási ideje lejárt és időközben megvásárolták, vagy kikerült a kosaradból. Kérjük, frissítsd az oldalt!");
                setIsLoading(false);
                return;
            }
        }

        // Confirm the payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "requires_capture") {
            // Payment authorized! Now create the order in our DB
            try {
                await createOrder({
                    items,
                    customerData: formData,
                    totalAmount,
                    shippingMethod: shippingMethod,
                    paymentMethod: 'CARD',
                    stripePaymentIntentId: paymentIntent.id,
                    sessionId: sessionId || undefined
                });

                clearCart();
                router.push("/checkout/success");
            } catch (err: any) {
                console.error("Order creation error:", err);
                setMessage("A fizetés sikeres volt, de a rendelés mentése közben hiba történt. Kérjük vedd fel velünk a kapcsolatot!");
            }
        } else {
            setMessage("A fizetés állapota váratlan: " + (paymentIntent?.status || "ismeretlen"));
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full mt-8 bg-[var(--color-primary)] hover:bg-orange-600 disabled:bg-orange-600/50 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CreditCard className="w-5 h-5" />
                    )}
                    RENDELÉS LEADÁSA ÉS FIZETÉS
                </button>

                {message && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 p-4 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4" />
                        {message}
                    </div>
                )}
            </div>
        </form>
    );
}
