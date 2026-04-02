export const dynamic = "force-dynamic";
'use client';

import { createDonorVehicle } from"@/app/actions/dismantling";
import Link from"next/link";
import { ArrowLeft, Save, Car } from"lucide-react";

export default function NewDonorPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dismantling" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Új Donor Jármű</h1>
                    <p className="text-gray-400">Adja meg a bontásra szánt autó adatait</p>
                </div>
            </div>

            <form action={createDonorVehicle} className="space-y-8 max-w-4xl">
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                        <Car className="w-5 h-5 text-[var(--color-primary)]" />
                        Jármű Adatai
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Márka *</label>
                            <input name="make" type="text" required placeholder="pl. Audi" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Modell *</label>
                            <input name="model" type="text" required placeholder="pl. A4 B8" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Évjárat *</label>
                            <input name="year" type="number" required placeholder="2015" min="1990" max="2026" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Alvázszám (VIN) *</label>
                            <input name="vin" type="text" required placeholder="WAUZZZ..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono uppercase" />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-4">Technikai Részletek</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Motorkód</label>
                            <input name="engineCode" type="text" placeholder="pl. CAGA" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors uppercase" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Színkód</label>
                            <input name="colorCode" type="text" placeholder="pl. LY9B" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors uppercase" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Futásteljesítmény (km)</label>
                            <input name="mileage" type="number" placeholder="210000" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="submit" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-900/20">
                        <Save className="w-5 h-5" />
                        Jármű Rögzítése
                    </button>
                </div>
            </form>
        </div>
    );
}
