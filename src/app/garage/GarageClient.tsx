"use client";

import { Navbar } from"@/components/navbar";
import { Car, Plus, Trash2, ChevronLeft, Loader2, AlertCircle, CheckCircle2, Info } from"lucide-react";
import Link from"next/link";
import { useState } from"react";
import { saveVehicle, deleteVehicle } from"@/app/actions/user";
import { motion, AnimatePresence } from"framer-motion";

export default function GarageClient({ vehicles: initialVehicles }: { vehicles: any[] }) {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type:'success' |'error', text: string } | null>(null);

    const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await saveVehicle(formData);
            if (result.success) {
                setMessage({ type:'success', text:'Jármű sikeresen hozzáadva!' });
                setIsAdding(false);
                // In a real app we might want to refetch or use the returned object
                // For now, let's just reload or trust revalidatePath (which needs a refresh or router.refresh)
                window.location.reload();
            }
        } catch (error: any) {
            setMessage({ type:'error', text: error.message ||'Hiba történt a mentés során.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Biztosan törölni szeretnéd ezt a járművet?")) return;

        try {
            const result = await deleteVehicle(id);
            if (result.success) {
                setVehicles(vehicles.filter(v => v.id !== id));
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                <Link
                    href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group" >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Vissza a profilomhoz
                </Link>

                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                            Saját Garázs
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Mentsd el autóidat, hogy egy kattintással szűrhess a hozzájuk való alkatrészekre.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-[var(--color-primary)] text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-[var(--color-primary)]/20 flex items-center gap-2 group" >
                        <Plus className={`w-5 h-5 transition-transform ${isAdding ?'rotate-45' :''}`} />
                        {isAdding ?"Mégse" :"Új autó hozzáadása"}
                    </button>
                </header>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height:"auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm mb-8 ${message.type ==='success' ?'bg-green-500/10 text-green-500 border border-green-500/20' :'bg-red-500/10 text-red-500 border border-red-500/20' }`}
                        >
                            {message.type ==='success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {isAdding ? (
                        <motion.section
                            key="add-form" initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mb-12" >
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <Car className="w-5 h-5 text-[var(--color-primary)]" /> Jármű adatai
                            </h3>

                            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Márka *</label>
                                    <input
                                        type="text" name="make" placeholder="pl. BMW" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Modell *</label>
                                    <input
                                        type="text" name="model" placeholder="pl. 3-as sorozat (E90)" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Évjárat *</label>
                                    <input
                                        type="number" name="year" placeholder="pl. 2008" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Motorkód (opcionális)</label>
                                    <input
                                        type="text" name="engineCode" placeholder="pl. N47D20A" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Alvázszám (opcionális)</label>
                                    <input
                                        type="text" name="vin" placeholder="17 karakteres VIN" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Becenév (opcionális)</label>
                                    <input
                                        type="text" name="nickname" placeholder="pl. Fehér Villám" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-4">
                                    <button
                                        type="submit" disabled={loading}
                                        className="bg-[var(--color-primary)] text-white font-black px-12 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-[var(--color-primary)]/20 flex items-center gap-3 disabled:opacity-50" >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Car className="w-5 h-5" />}
                                        {loading ?"Mentés..." :"Jármű mentése"}
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    ) : null}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.length === 0 && !isAdding ? (
                        <div className="md:col-span-2 text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Car className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Még nincs mentett autód</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                Adj hozzá egy járművet a profilodhoz, hogy legközelebb még gyorsabban megtaláld a hozzá való alkatrészeket.
                            </p>
                        </div>
                    ) : (
                        vehicles.map((v) => (
                            <motion.div
                                key={v.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-[var(--color-primary)] transition-all flex flex-col gap-6" >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                                            <Car className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                                {v.nickname ||`${v.make} ${v.model}`}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                                                {v.year} • {v.make} {v.model}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Törlés" >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Motorkód</p>
                                        <p className="text-sm font-bold text-gray-700">{v.engineCode ||"—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alvázszám</p>
                                        <p className="text-sm font-bold text-gray-700">{v.vin ?`${v.vin.slice(0, 4)}...${v.vin.slice(-4)}` :"—"}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/search?make=${v.make}&model=${v.model}&year=${v.year}`}
                                    className="w-full bg-gray-50 text-gray-600 font-bold py-3 rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all text-center text-sm" >
                                    Alkatrészek keresése ehhez az autóhoz
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>

                <footer className="mt-16 p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Tipp a gyorsabb kereséshez</h4>
                        <p className="text-sm text-blue-800/70 font-medium">
                            Ha elmented az autód alvázszámát és motorkódját, munkatársaink sokkal pontosabban tudják ellenőrizni a kiválasztott alkatrész kompatibilitását a rendelésed feldolgozásakor.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
