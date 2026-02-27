"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Mail, MapPin, User } from "lucide-react";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { items, totalPrice, totalItems } = useCart();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isFormValid = () => {
        const basicValid = formData.lastName && formData.firstName && formData.email && formData.phone && formData.postalCode && formData.city && formData.address;
        const companyValid = !isCompany || (formData.companyName && formData.taxNumber);
        const billingValid = billingSameAsShipping || (formData.billingPostalCode && formData.billingCity && formData.billingAddress);
        return basicValid && companyValid && billingValid;
    };

    const shippingCost = shippingMethod === 'delivery' && totalItems > 0 ? 1990 : 0;
    const grandTotal = totalPrice + shippingCost;

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 text-gray-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">A kosarad üres</h1>
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
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Vissza a vásárláshoz
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Pénztár</h1>
                    <div className="w-24" /> {/* Spacer for centering if needed, or keeping layout balanced */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: Forms */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Contact Info */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <User className="w-5 h-5 text-[var(--color-primary)]" />
                                Kapcsolattartás
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Vezetéknév</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="Kovács"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Keresztnév</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="János"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Email cím</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                        placeholder="janos.kovacs@email.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Telefonszám</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                        placeholder="+36 30 123 4567"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Info */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                                Szállítási adatok
                            </h2>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/3 space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Irányítószám</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="1052"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Város</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="Budapest"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Utca, házszám</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                        placeholder="Petőfi Sándor utca 12. 2. em. 4."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Billing Info */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                                Számlázási adatok
                            </h2>

                            <div className="space-y-6">
                                {/* Company Toggle */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isCompany"
                                        checked={isCompany}
                                        onChange={(e) => setIsCompany(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-600 bg-black/40 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                    />
                                    <label htmlFor="isCompany" className="text-white text-sm cursor-pointer select-none">
                                        Céges számlát kérek (Adószám megadása)
                                    </label>
                                </div>

                                {/* Company Fields */}
                                {isCompany && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8 border-l-2 border-[var(--color-primary)]/20 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Cégnév</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                placeholder="Minta Kft."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Adószám</label>
                                            <input
                                                type="text"
                                                name="taxNumber"
                                                value={formData.taxNumber}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                placeholder="12345678-2-42"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Billing Address Toggle */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="billingSameAsShipping"
                                        checked={billingSameAsShipping}
                                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-600 bg-black/40 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                    />
                                    <label htmlFor="billingSameAsShipping" className="text-white text-sm cursor-pointer select-none">
                                        A számlázási cím megegyezik a szállítási címmel
                                    </label>
                                </div>

                                {/* Separate Billing Address Fields */}
                                {!billingSameAsShipping && (
                                    <div className="space-y-4 pl-8 border-l-2 border-white/10 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-full md:w-1/3 space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Irányítószám</label>
                                                <input
                                                    type="text"
                                                    name="billingPostalCode"
                                                    value={formData.billingPostalCode}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                    placeholder="1052"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Város</label>
                                                <input
                                                    type="text"
                                                    name="billingCity"
                                                    value={formData.billingCity}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                    placeholder="Budapest"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Utca, házszám</label>
                                            <input
                                                type="text"
                                                name="billingAddress"
                                                value={formData.billingAddress}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                placeholder="Petőfi Sándor utca 12. 2. em. 4."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Shipping Method */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[var(--color-primary)]" />
                                Szállítási mód
                            </h2>
                            <div className="space-y-4">
                                {/* Delivery Option */}
                                <div
                                    onClick={() => setShippingMethod('delivery')}
                                    className={`relative border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'delivery'
                                        ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)]"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'delivery' ? "border-[var(--color-primary)]" : "border-gray-500"
                                            }`}>
                                            {shippingMethod === 'delivery' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Pannon XP Futárszolgálat</h4>
                                            <p className="text-gray-400 text-xs">Kiszállítás 1-2 munkanap alatt</p>
                                        </div>
                                    </div>
                                    <span className="text-white font-bold text-sm">1 990 Ft</span>
                                </div>

                                {/* Pickup Option */}
                                <div
                                    onClick={() => setShippingMethod('pickup')}
                                    className={`relative border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'pickup'
                                        ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_rgba(219,81,60,0.3)]"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'pickup' ? "border-[var(--color-primary)]" : "border-gray-500"
                                            }`}>
                                            {shippingMethod === 'pickup' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Személyes átvétel</h4>
                                            <p className="text-gray-400 text-xs">1152 Budapest, Városkapu utca 3.</p>
                                        </div>
                                    </div>
                                    <span className="text-[var(--color-primary)] font-bold text-sm">Ingyenes</span>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 sticky top-28 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Rendelés összesítése</h2>

                            {/* Items List */}
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 border-b border-white/5 last:border-0">
                                        <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0 relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#1a1a1a]">
                                                {item.quantityInCart}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white text-sm font-medium line-clamp-2">{item.name}</h4>
                                            <p className="text-gray-500 text-xs font-mono mt-1">{item.sku}</p>
                                        </div>
                                        <div className="text-white font-bold text-sm">
                                            {(item.price * item.quantityInCart).toLocaleString('hu-HU')} Ft
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between text-gray-400 text-sm">
                                    <span>Részösszeg</span>
                                    <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-400 text-sm">
                                    <span>{shippingMethod === 'delivery' ? "Szállítás (Pannon XP)" : "Személyes átvétel"}</span>
                                    <span>{shippingCost === 0 ? "Ingyenes" : `${shippingCost.toLocaleString('hu-HU')} Ft`}</span>
                                </div>
                                <div className="flex items-center justify-between text-white text-xl font-bold pt-4 border-t border-white/10">
                                    <span>Végösszeg</span>
                                    <span className="text-[var(--color-primary)]">{grandTotal.toLocaleString('hu-HU')} Ft</span>
                                </div>
                                <p className="text-gray-500 text-xs text-center mt-2">Az árak tartalmazzák az ÁFA-t.</p>
                            </div>

                            {/* Submit Button */}
                            <button className="w-full mt-8 bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                FIZETÉS INDÍTÁSA
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Biztonságos SSL fizetés
                                </div>
                                <p className="text-gray-600 text-[10px] text-center px-4">
                                    A fizetés a Stripe titkosított rendszerén keresztül történik. A kártyaadatokat nem tároljuk.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
