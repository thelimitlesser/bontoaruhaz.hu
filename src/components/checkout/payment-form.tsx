"use client";

import { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, AlertCircle, Truck, ShoppingBag } from "lucide-react";
import { createOrder, createPendingOrder } from "@/app/actions/order";
import { validateCartReservations } from "@/app/actions/reservation";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
    formData: any;
    totalAmount: number;
    shippingMethod: string;
    paymentMethodOverride?: 'COD' | 'CARD';
    isFormValid?: boolean;
    isCompany?: boolean;
    billingSameAsShipping?: boolean;
    clientSecret?: string;
}

export function PaymentForm(props: PaymentFormProps) {
    if (props.paymentMethodOverride === 'COD') {
        return <CODPaymentForm {...props} />;
    }
    return <StripePaymentForm {...props} />;
}

function StripePaymentForm({ formData, totalAmount, shippingMethod, isCompany, billingSameAsShipping, clientSecret }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { items, clearCart } = useCart();
    const router = useRouter();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!stripe || !elements || !clientSecret) return;

        setIsLoading(true);
        setMessage(null);

        const sessionId = localStorage.getItem("bontoaruhaz-session-id");
        
        // 1. Pre-payment reservation validation
        if (sessionId) {
            const partIds = items.map(item => item.id);
            const isValid = await validateCartReservations(partIds, sessionId);
            if (!isValid) {
                setMessage("Egy vagy több termék foglalási ideje lejárt és időközben megvásárolták. Kérjük, frissítsd az oldalt!");
                setIsLoading(false);
                return;
            }
        }

        // 2. We extract the paymentIntent ID from clientSecret
        const paymentIntentId = clientSecret.split('_secret_')[0];

        // 3. Create the pending order in the database FIRST
        // This ensures that even if Stripe redirects the user to their bank for 3D Secure,
        // we have a record of the order waiting for payment.
        try {
            await createPendingOrder({
                items,
                customerData: formData,
                totalAmount,
                shippingMethod: shippingMethod,
                paymentMethod: 'CARD',
                stripePaymentIntentId: paymentIntentId,
                sessionId: sessionId || undefined,
                isCompany,
                billingSameAsShipping
            });
        } catch (err: any) {
            console.error("Order pre-creation error:", err);
            setMessage("Hiba a rendelés előkészítésekor. Kérjük próbáld újra.");
            setIsLoading(false);
            return;
        }

        // 4. Confirm the payment with Stripe
        // We set redirect: "always" so that conventional payments and 3DS payments BOTH 
        // return via the success URL, where the backend finalizeStripeOrder action will run.
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: "always",
        });

        // This point is only reached if there is an immediate error during processing 
        // (e.g., card declined, validation error).
        if (error) {
            setMessage(error.message || "Ismeretlen hiba történt a fizetés során.");
            setIsLoading(false);
            return;
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                
                <button
                    disabled={isLoading || !stripe || !elements}
                    className="w-full mt-8 bg-[var(--color-primary)] hover:bg-orange-600 disabled:bg-orange-600/50 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
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

function CODPaymentForm({ formData, totalAmount, shippingMethod, isFormValid, isCompany, billingSameAsShipping }: PaymentFormProps) {
    const { items, clearCart } = useCart();
    const router = useRouter();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        // Pre-payment reservation validation
        const sessionId = localStorage.getItem("bontoaruhaz-session-id");
        if (sessionId) {
            const partIds = items.map(item => item.id);
            const isValid = await validateCartReservations(partIds, sessionId);
            if (!isValid) {
                setMessage("Egy vagy több termék foglalási ideje lejárt és időközben megvásárolták, vagy kikerült a kosaradból. Kérjük, frissítsd az oldalt!");
                setIsLoading(false);
                return;
            }
        }

        try {
            await createOrder({
                items,
                customerData: formData,
                totalAmount,
                shippingMethod: shippingMethod,
                paymentMethod: 'COD',
                sessionId: sessionId || undefined,
                isCompany,
                billingSameAsShipping
            });

            router.push("/checkout/success");
        } catch (err: any) {
            console.error("Order creation error:", err);
            setMessage("Hiba történt a rendelés mentése közben. Kérjük próbáld újra!");
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="space-y-6">
                <button
                    disabled={isLoading || !isFormValid}
                    className="w-full mt-8 bg-[var(--color-primary)] hover:bg-orange-600 disabled:bg-orange-600/50 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (shippingMethod === 'PICKUP' ? <ShoppingBag className="w-5 h-5" /> : <Truck className="w-5 h-5" />)}
                    RENDELÉS LEADÁSA
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
