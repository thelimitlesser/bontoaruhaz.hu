export const dynamic = "force-dynamic";
'use client';

import { createStorageLocation } from"@/app/actions/inventory";
import Link from"next/link";
import { ArrowLeft, Save, Box } from"lucide-react";

export default function NewLocationPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/inventory" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Új Raktárhely</h1>
                    <p className="text-gray-400">Polc vagy doboz rögzítése</p>
                </div>
            </div>

            <form action={createStorageLocation} className="space-y-8 max-w-2xl">
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-[var(--color-primary)]" />
                        Hely Adatai
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Megnevezés / Kód *</label>
                        <input name="name" type="text" required placeholder="pl. A-SOR-01-POLC vagy DOBOZ-12" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors uppercase font-bold" />
                        <p className="text-xs text-gray-500">Javaslat: SOR-OSZLOP-POLC formátum a könnyű tájékozódáshoz.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Leírás (Opcionális)</label>
                        <input name="description" type="text" placeholder="pl. Motorikus alkatrészek, Generátorok" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="submit" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-900/20">
                        <Save className="w-5 h-5" />
                        Hely Létrehozása
                    </button>
                </div>
            </form>
        </div>
    );
}
