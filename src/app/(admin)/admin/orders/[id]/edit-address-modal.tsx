"use client";

import { useState } from "react";
import { Edit2, Check, X, MapPin, CreditCard, User, Phone, Mail } from "lucide-react";
import { updateOrderAddressesAction } from "@/app/actions/order";
import { useRouter } from "next/navigation";

interface AddressEditorProps {
    orderId: string;
    initialShipping: any;
    initialBilling: any;
    userEmail?: string;
    userPhone?: string;
}

export function EditOrderAddressModal({
    orderId,
    initialShipping,
    initialBilling,
    userEmail,
    userPhone
}: AddressEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [shipping, setShipping] = useState({
        name: initialShipping?.name || `${initialShipping?.firstName || ''} ${initialShipping?.lastName || ''}`.trim(),
        postalCode: initialShipping?.postalCode || initialShipping?.zip || '',
        city: initialShipping?.city || '',
        address: initialShipping?.address || initialShipping?.street || '',
        phone: initialShipping?.phone || userPhone || '',
        email: initialShipping?.email || userEmail || ''
    });

    const [billing, setBilling] = useState({
        name: initialBilling?.name || initialBilling?.companyName || '',
        postalCode: initialBilling?.postalCode || initialBilling?.zip || '',
        city: initialBilling?.city || '',
        address: initialBilling?.address || initialBilling?.street || '',
        taxNumber: initialBilling?.taxNumber || '',
        email: initialBilling?.email || userEmail || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const res = await updateOrderAddressesAction(orderId, shipping, billing);
        if (res.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            setError(res.error || "Hiba történt a mentés során.");
        }
        setIsLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
                <Edit2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                Adatok Szerkesztése
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Edit2 className="w-5 h-5 text-[var(--color-primary)]" />
                                Címek és Vevő Adatok Módosítása
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shipping Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2">
                                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                                    Szállítási Cím & Kapcsolattartó
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-500 mb-1 font-bold">Név / Cég</label>
                                        <input
                                            type="text"
                                            value={shipping.name}
                                            onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">Irányítószám</label>
                                        <input
                                            type="text"
                                            value={shipping.postalCode}
                                            onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">Település</label>
                                        <input
                                            type="text"
                                            value={shipping.city}
                                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-500 mb-1 font-bold">Utca, házszám, emelet/ajtó</label>
                                        <input
                                            type="text"
                                            value={shipping.address}
                                            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">Telefonszám</label>
                                        <input
                                            type="text"
                                            value={shipping.phone}
                                            onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">E-mail cím</label>
                                        <input
                                            type="email"
                                            value={shipping.email}
                                            onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2">
                                    <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />
                                    Számlázási Cím & Adatok
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-500 mb-1 font-bold">Számlázási Név / Cégnév</label>
                                        <input
                                            type="text"
                                            value={billing.name}
                                            onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">Irányítószám</label>
                                        <input
                                            type="text"
                                            value={billing.postalCode}
                                            onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 mb-1 font-bold">Település</label>
                                        <input
                                            type="text"
                                            value={billing.city}
                                            onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-500 mb-1 font-bold">Utca, házszám</label>
                                        <input
                                            type="text"
                                            value={billing.address}
                                            onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-500 mb-1 font-bold">Adószám (ha cég)</label>
                                        <input
                                            type="text"
                                            value={billing.taxNumber}
                                            onChange={(e) => setBilling({ ...billing, taxNumber: e.target.value })}
                                            placeholder="12345678-1-12"
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
                                >
                                    Mégse
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5 py-2.5 bg-[var(--color-primary)] hover:opacity-90 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    {isLoading ? "Mentés..." : "Módosítások Mentése"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
