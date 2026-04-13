"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Mail, MapPin, User, Minus, Plus, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./payment-form";
import { createPaymentIntent, updatePaymentIntent } from "@/app/actions/payment";
import { calculateShippingPriceForItems, ShippingCalculationResult } from "@/lib/shipping/pxp-rates";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Feature toggle for corporate invoice - Set to true to show the option again
const SHOW_CORPORATE_INVOICE = false;

export default function CheckoutView() {
    const { items, totalPrice, totalItems, updateQuantity } = useCart();
    const router = useRouter();

    // Basic form state
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        companyName: "",
        taxNumber: "",
        billingPostalCode: "",
        billingCity: "",
        billingAddress: ""
    });

    const [isCompany, setIsCompany] = useState(false);
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const [shippingData, setShippingData] = useState<ShippingCalculationResult>({ finalCost: 0, originalTotal: 0, savings: 0, totalQuantity: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            setShippingData(calculateShippingPriceForItems(items));
        } else {
            setShippingData({ finalCost: 0, originalTotal: 0, savings: 0, totalQuantity: 0 });
        }
    }, [items]);

    const shippingCost = shippingData.finalCost;
    const grandTotal = totalPrice + (shippingMethod === 'delivery' ? shippingCost : 0);

    const validateTaxNumber = (tax: string) => /^\d{8}-\d{1}-\d{2}$/.test(tax);

    // Form validity check (computed every render)
    const isCurrentlyValid = !!(
        formData.lastName && 
        formData.firstName && 
        formData.email && 
        formData.phone && 
        formData.postalCode && 
        formData.city && 
        formData.address &&
        (!isCompany || (formData.companyName && formData.taxNumber && validateTaxNumber(formData.taxNumber))) &&
        (billingSameAsShipping || (formData.billingPostalCode && formData.billingCity && formData.billingAddress))
    );

    const [lastIntentAmount, setLastIntentAmount] = useState(0);
    const [isFetchingSecret, setIsFetchingSecret] = useState(false);
    const [paymentIntentError, setPaymentIntentError] = useState<string | null>(null);
    const syncInFlight = useRef(false);

    // Automatically switch to COD if Pickup is selected
    useEffect(() => {
        if (shippingMethod === 'pickup') {
            setPaymentMethod('cod');
        }
    }, [shippingMethod]);

    // Fetch or Update PaymentIntent when the form becomes valid OR when the total changes
    useEffect(() => {
        // Stripe is only for delivery
        const shouldSync = shippingMethod === 'delivery' && isCurrentlyValid && grandTotal > 0 && paymentMethod === 'card';
        
        if (shouldSync && !isFetchingSecret && !syncInFlight.current) {
            // If we have an ID AND amount is the same, do nothing
            if (paymentIntentId && Math.abs(grandTotal - lastIntentAmount) < 1) return;

            const syncSecret = async () => {
                if (syncInFlight.current) return;
                syncInFlight.current = true;
                
                setIsFetchingSecret(true);
                setPaymentIntentError(null);
                try {
                    console.log(paymentIntentId ? "UPDATING" : "FETCHING", "PAYMENT INTENT for amount:", grandTotal);
                    
                    const res = paymentIntentId 
                        ? await updatePaymentIntent(paymentIntentId, grandTotal)
                        : await createPaymentIntent(grandTotal);

                    if (res.error) throw new Error(res.error);
                    
                    if (res.clientSecret) {
                        setClientSecret(res.clientSecret);
                        setPaymentIntentId(res.paymentIntentId || null);
                        setLastIntentAmount(grandTotal);
                    }
                } catch (err: any) {
                    console.error("Failed to sync client secret:", err);
                    setPaymentIntentError(err.message || "Hiba történt a fizetés előkészítésekor.");
                } finally {
                    setIsFetchingSecret(false);
                    syncInFlight.current = false;
                }
            };
            
            const timer = setTimeout(syncSecret, 800); 
            return () => {
                clearTimeout(timer);
                // We DON'T reset syncInFlight here because the async task might still be running
            };
        }
    }, [isCurrentlyValid, grandTotal, paymentMethod, paymentIntentId, lastIntentAmount, isFetchingSecret, shippingMethod]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!mounted) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
                <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Pénztár töltése...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-muted/5 rounded-full flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 text-muted" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">A kosarad üres</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Nincs termék a kosaradban. Nézz körbe kínálatunkban!
                </p>
                <Link href="/" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                    Vásárlás folytatása
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 relative z-0">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-xs sm:text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Vissza
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pénztár</h1>
                    <div className="w-12 sm:w-24" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: Forms */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Contact Info */}
                        <section className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <User className="w-5 h-5 text-[var(--color-primary)]" />
                                Kapcsolattartás
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Vezetéknév</label>
                                        <input
                                            type="text" name="lastName" value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Kovács" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Keresztnév</label>
                                        <input
                                            type="text" name="firstName" value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="János" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Email cím</label>
                                    <input
                                        type="email" name="email" value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="janos.kovacs@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Telefonszám</label>
                                    <input
                                        type="tel" name="phone" value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="+36 70 612 1277" />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Info */}
                        <section className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                                Szállítási adatok
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/3 space-y-2">
                                        <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Irányítószám</label>
                                        <input
                                            type="text" name="postalCode" value={formData.postalCode}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="1052" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Város</label>
                                        <input
                                            type="text" name="city" value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Budapest" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Utca, házszám</label>
                                    <input
                                        type="text" name="address" value={formData.address}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Petőfi Sándor utca 12." />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Method */}
                        <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[var(--color-primary)]" />
                                Szállítási mód
                            </h2>
                            <div className="space-y-4">
                                <div
                                    onClick={() => setShippingMethod('delivery')}
                                    className={`relative border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${shippingMethod === 'delivery' ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)]" : "bg-muted/5 border-border hover:border-muted"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod === 'delivery' ? "border-[var(--color-primary)]" : "border-muted"}`}>
                                            {shippingMethod === 'delivery' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold text-sm">Pannon XP Futárszolgálat</h4>
                                            <p className="text-muted text-xs leading-relaxed">Kiszállítás 1-3 munkanap alatt</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0 pl-8 sm:pl-0">
                                        <div className="text-foreground font-bold text-sm">
                                            {shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : "Még nem elérhető"}
                                        </div>
                                        {shippingMethod === 'delivery' && shippingData.savings > 0 && (
                                            <div className="text-[10px] text-emerald-500 font-bold animate-in fade-in slide-in-from-right-2">
                                                -{shippingData.savings.toLocaleString('hu-HU')} Ft csomagkedvezmény
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    onClick={() => setShippingMethod('pickup')}
                                    className={`relative border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${shippingMethod === 'pickup' ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)]" : "bg-muted/5 border-border hover:border-muted"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod === 'pickup' ? "border-[var(--color-primary)]" : "border-muted"}`}>
                                            {shippingMethod === 'pickup' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold text-sm">Személyes átvétel</h4>
                                            <p className="text-muted text-xs">8111 Seregélyes-Jánosmajor</p>
                                        </div>
                                    </div>
                                    <span className="text-[var(--color-primary)] font-bold text-sm shrink-0 pl-8 sm:pl-0">Ingyenes</span>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                                Fizetési mód
                            </h2>
                            <div className="space-y-4">
                                <div
                                    onClick={() => {
                                        if (shippingMethod !== 'pickup') {
                                            setPaymentMethod('card');
                                        }
                                    }}
                                    className={`relative border rounded-xl p-4 flex items-center justify-between transition-all ${
                                        shippingMethod === 'pickup' 
                                        ? "bg-gray-100/50 border-gray-200 opacity-50 cursor-not-allowed" 
                                        : (paymentMethod === 'card' 
                                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)] cursor-pointer" 
                                            : "bg-muted/5 border-border hover:border-muted cursor-pointer")
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? "border-[var(--color-primary)]" : "border-muted"}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold text-sm">Bankkártyás fizetés (Stripe)</h4>
                                            <p className="text-muted text-xs">
                                                {shippingMethod === 'pickup' ? "Személyes átvételkor nem elérhető" : "Biztonságos online fizetés"}
                                            </p>
                                        </div>
                                    </div>
                                    <CreditCard className="w-5 h-5 text-muted" />
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`relative border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'cod' ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)]" : "bg-muted/5 border-border hover:border-muted"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? "border-[var(--color-primary)]" : "border-muted"}`}>
                                            {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold text-sm">
                                                {shippingMethod === 'pickup' ? "Helyszíni fizetés" : "Utánvét"}
                                            </h4>
                                            <p className="text-muted text-xs">
                                                {shippingMethod === 'pickup' 
                                                    ? "Fizetés az átvételi ponton (készpénz vagy kártya)" 
                                                    : "Fizetés a futárnál (készpénz vagy kártya)"}
                                            </p>
                                        </div>
                                    </div>
                                    {shippingMethod === 'pickup' ? <ShoppingBag className="w-5 h-5 text-muted" /> : <Truck className="w-5 h-5 text-muted" />}
                                </div>
                            </div>
                        </section>

                        {/* Billing Info */}
                        <section className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                                Számlázási adatok
                            </h2>

                            <div className="space-y-6">
                                {SHOW_CORPORATE_INVOICE && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox" id="isCompany" checked={isCompany}
                                            onChange={(e) => setIsCompany(e.target.checked)}
                                            className="w-5 h-5 rounded border-border bg-muted/5 text-[var(--color-primary)]" />
                                        <label htmlFor="isCompany" className="text-foreground text-sm cursor-pointer select-none">
                                            Céges számlát kérek
                                        </label>
                                    </div>
                                )}

                                {isCompany && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8 border-l-2 border-[var(--color-primary)]/20 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Cégnév</label>
                                            <input
                                                type="text" name="companyName" value={formData.companyName}
                                                onChange={handleChange}
                                                className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)]" placeholder="Minta Kft." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Adószám</label>
                                            <input
                                                type="text" name="taxNumber" value={formData.taxNumber}
                                                onChange={handleChange}
                                                className={`w-full bg-muted/5 border rounded-lg px-4 py-3 text-foreground focus:outline-none transition-colors ${formData.taxNumber && !validateTaxNumber(formData.taxNumber) ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-[var(--color-primary)]'}`} placeholder="12345678-2-42" />
                                            {formData.taxNumber && !validateTaxNumber(formData.taxNumber) && (
                                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">Helytelen formátum! (Példa: 12345678-2-42)</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox" id="billingSameAsShipping" checked={billingSameAsShipping}
                                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                        className="w-5 h-5 rounded border-border bg-muted/5 text-[var(--color-primary)]" />
                                    <label htmlFor="billingSameAsShipping" className="text-foreground text-sm cursor-pointer select-none">
                                        A számlázási cím megegyezik a szállítási címmel
                                    </label>
                                </div>

                                {!billingSameAsShipping && (
                                    <div className="space-y-4 pl-8 border-l-2 border-border animate-in fade-in slide-in-from-top-2">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-full md:w-1/3 space-y-2">
                                                <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Irányítószám</label>
                                                <input
                                                    type="text" name="billingPostalCode" value={formData.billingPostalCode}
                                                    onChange={handleChange}
                                                    className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)]" placeholder="1052" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Város</label>
                                                <input
                                                    type="text" name="billingCity" value={formData.billingCity}
                                                    onChange={handleChange}
                                                    className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)]" placeholder="Budapest" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground ml-1 mb-1 block">Utca, házszám</label>
                                            <input
                                                type="text" name="billingAddress" value={formData.billingAddress}
                                                onChange={handleChange}
                                                className="w-full bg-muted/5 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)]" placeholder="Petőfi Sándor utca 12." />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Stripe Form) */}
                    <div className="lg:col-span-5">
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 sticky top-28 shadow-2xl overflow-hidden">
                            <h2 className="text-xl font-bold text-foreground mb-6">Rendelés összesítése</h2>

                            {/* Items List */}
                            <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 border-b border-border last:border-0">
                                        <div className="w-14 h-14 bg-muted/5 rounded-lg border border-border overflow-hidden shrink-0 relative">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-foreground text-xs font-bold line-clamp-1">{item.name}</h4>
                                            <p className="text-muted text-[10px] font-mono mt-0.5">{item.sku}</p>
                                            
                                            {/* Quantity Selector in Checkout */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center bg-muted/10 border border-border rounded-md overflow-hidden h-7">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantityInCart - 1)}
                                                        className="px-1.5 hover:bg-[var(--color-primary)]/10 text-muted transition-colors h-full flex items-center justify-center border-r border-border"
                                                    >
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <div className="px-2 text-[10px] font-bold text-foreground min-w-[24px] text-center">
                                                        {item.quantityInCart}
                                                    </div>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantityInCart + 1)}
                                                        disabled={item.quantityInCart >= item.quantity}
                                                        className={`px-1.5 h-full flex items-center justify-center transition-colors ${
                                                            item.quantityInCart >= item.quantity 
                                                            ? "text-muted/30 cursor-not-allowed" 
                                                            : "hover:bg-[var(--color-primary)]/10 text-muted"
                                                        }`}
                                                    >
                                                        <Plus className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                                {item.quantityInCart >= item.quantity && (
                                                    <span className="text-[8px] text-orange-500 font-bold uppercase tracking-tighter">MAX</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            <div className="text-foreground font-bold text-xs">
                                                {(item.price * item.quantityInCart).toLocaleString('hu-HU')} Ft
                                            </div>
                                            {item.shippingPrice && shippingMethod === 'delivery' && (
                                                <div className="text-[10px] text-blue-500 font-medium mt-1">
                                                    + { (item.shippingPrice * item.quantityInCart).toLocaleString('hu-HU') } Ft
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-4 border-t border-border mb-8">
                                <div className="flex items-center justify-between text-muted text-sm">
                                    <span>Részösszeg</span>
                                    <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                                </div>
                                <div className="flex items-center justify-between text-muted text-sm">
                                    <span>{shippingMethod === 'delivery' ? "Szállítás (Pannon XP)" : "Személyes átvétel"}</span>
                                    <div className="text-right">
                                        <div className="font-bold text-foreground">
                                            {shippingMethod === 'delivery' ? (shippingCost === 0 ? "Ingyenes" : `${shippingCost.toLocaleString('hu-HU')} Ft`) : "Ingyenes"}
                                        </div>
                                        {shippingMethod === 'delivery' && shippingData.savings > 0 && (
                                            <div className="text-[10px] text-emerald-500 font-bold">
                                                Csomagkedvezmény: -{shippingData.savings.toLocaleString('hu-HU')} Ft
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-foreground text-xl font-black pt-4 border-t border-border">
                                    <span>Végösszeg</span>
                                    <span className="text-[var(--color-primary)]">{grandTotal.toLocaleString('hu-HU')} Ft</span>
                                </div>
                            </div>

                            {/* Stripe Payment Form */}
                            {paymentMethod === 'card' ? (
                                clientSecret ? (
                                    <div className="space-y-6">
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <PaymentForm 
                                                formData={formData} 
                                                totalAmount={grandTotal} 
                                                shippingCost={shippingMethod === 'delivery' ? shippingCost : 0}
                                                shippingMethod={shippingMethod === 'delivery' ? 'PANNON_XP' : 'PICKUP'} 
                                                isCompany={isCompany}
                                                billingSameAsShipping={billingSameAsShipping}
                                                clientSecret={clientSecret}
                                            />
                                        </Elements>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <button
                                            disabled
                                            className="w-full bg-muted text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isFetchingSecret ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                            {isFetchingSecret ? "FIZETÉS ELŐKÉSZÍTÉSE..." : "TÖLTSD KI AZ ADATOKAT A FIZETÉSHEZ"}
                                        </button>
                                        
                                        {paymentIntentError && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>{paymentIntentError}</span>
                                            </div>
                                        )}
 
                                        {!isCurrentlyValid && !isFetchingSecret && !paymentIntentError && (
                                            <p className="text-xs text-center text-muted italic">
                                                Kérjük töltsd ki az összes kötelező szállítási mezőt a fizetés megkezdéséhez.
                                            </p>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="space-y-4">
                                    <PaymentForm 
                                        formData={formData} 
                                        totalAmount={grandTotal} 
                                        shippingCost={shippingMethod === 'delivery' ? shippingCost : 0}
                                        shippingMethod={shippingMethod === 'delivery' ? 'PANNON_XP' : 'PICKUP'}
                                        paymentMethodOverride="COD"
                                        isFormValid={isCurrentlyValid}
                                        isCompany={isCompany}
                                        billingSameAsShipping={billingSameAsShipping}
                                    />
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider font-bold">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        SSL Secured
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider font-bold">
                                        <Mail className="w-4 h-4 text-emerald-500" />
                                        E-fatura
                                    </div>
                                </div>
                                <p className="text-muted text-[10px] text-center leading-relaxed">
                                    Biztonságos fizetés a Stripe rendszerén keresztül. <br/>
                                    A kártyaadatokat nem látjuk és nem tároljuk.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
