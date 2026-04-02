"use client";

import { Navbar } from"@/components/navbar";
import { User, Mail, Phone, MapPin, Save, ChevronLeft, Loader2, CheckCircle2 } from"lucide-react";
import Link from"next/link";
import { useState } from"react";
import { updateUserProfile } from"@/app/actions/user";
import { motion, AnimatePresence } from"framer-motion";

export default function SettingsPage({ user, dbUser }: { user: any, dbUser: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type:'success' |'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                setMessage({ type:'success', text:'Profiladatok sikeresen elmentve!' });
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (error: any) {
            setMessage({ type:'error', text: error.message ||'Hiba történt a mentés során.' });
        } finally {
            setLoading(false);
        }
    };

    // Extract address pieces from shippingAddress (Format:"ZIP City, Address")
    const addressMatch = dbUser?.shippingAddress?.match(/^(\d{4})\s+([^,]+),\s*(.*)$/);
    const zipCode = addressMatch ? addressMatch[1] :"";
    const city = addressMatch ? addressMatch[2] :"";
    const address = addressMatch ? addressMatch[3] : (dbUser?.shippingAddress ||"");

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <Link
                    href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group" >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Vissza a profilomhoz
                </Link>

                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                        Személyes Adatok
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Itt módosíthatod a nevedet, elérhetőségeidet és a szállítási címedet.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height:"auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type ==='success' ?'bg-green-500/10 text-green-500 border border-green-500/20' :'bg-red-500/10 text-red-500 border border-red-500/20' }`}
                            >
                                {message.type ==='success' && <CheckCircle2 className="w-5 h-5" />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Basic Info Section */}
                    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <User className="w-4 h-4 text-[var(--color-primary)]" /> Alapadatok
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Teljes név</label>
                                <input
                                    type="text" name="fullName" defaultValue={user.user_metadata?.full_name || dbUser?.fullName ||""}
                                    placeholder="Kovács János" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-base" required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail cím</label>
                                <div className="relative">
                                    <input
                                        type="email" value={user.email}
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-4 text-gray-400 font-medium cursor-not-allowed text-base" />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Telefonszám</label>
                                <div className="relative">
                                    <input
                                        type="tel" name="phone" defaultValue={dbUser?.phoneNumber ||""}
                                        placeholder="+36 70 612 1277" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-base" />
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Address Section */}
                    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[var(--color-primary)]" /> Szállítási cím
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Irányítószám</label>
                                <input
                                    type="text" name="zipCode" defaultValue={zipCode}
                                    placeholder="1234" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-base" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Város</label>
                                <input
                                    type="text" name="city" defaultValue={city}
                                    placeholder="Budapest" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-base" />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Utca, házszám, emelet</label>
                                <input
                                    type="text" name="address" defaultValue={address}
                                    placeholder="Kovács utca 12, 2. emelet 4." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-base" />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit" disabled={loading}
                            className="bg-[var(--color-primary)] text-white font-bold px-10 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-[var(--color-primary)]/20 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed" >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            )}
                            {loading ?"Mentés folyamatban..." :"Változtatások mentése"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
