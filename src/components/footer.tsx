"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null; // Don't show footer on admin pages
    }

    return (
        <footer className="bg-foreground text-background/80 pt-16 pb-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-background/10 pb-12">

                    {/* Brand Info */}
                    <div className="space-y-4 text-center sm:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tighter text-background group mx-auto sm:mx-0">
                            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src="/logo_orange.png" alt="Logo" className="w-full h-full object-contain" style={{ filter: "drop-shadow(0px 0px 5px rgba(249,115,22,0.6))" }}
                                />
                            </div>
                            <span className="whitespace-nowrap">
                                <span className="text-[var(--color-primary)]">BONTÓ</span>ÁRUHÁZ
                            </span>
                        </Link>
                        <p className="text-sm text-background/60 leading-relaxed max-w-xs mx-auto sm:mx-0">
                            Prémium minőségű bontott autóalkatrészek, megbízható forrásból, garanciával, egyenesen a raktárunkból.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center sm:items-start space-y-1">
                        <h4 className="text-background font-bold uppercase tracking-wider text-sm mb-4 text-center sm:text-left">Információk</h4>
                        <div className="flex flex-col items-center sm:items-start w-full">
                            <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors text-sm py-2 px-2 sm:-ml-2 rounded-lg text-center sm:text-left w-full sm:w-auto">Rólunk</Link>
                            <Link href="/faq" className="hover:text-[var(--color-primary)] transition-colors text-sm py-2 px-2 sm:-ml-2 rounded-lg text-center sm:text-left w-full sm:w-auto">Gyakori Kérdések</Link>
                            <Link href="/warranty" className="hover:text-[var(--color-primary)] transition-colors text-sm py-2 px-2 sm:-ml-2 rounded-lg text-center sm:text-left w-full sm:w-auto">Garancia és Visszaküldés</Link>
                            <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors text-sm py-2 px-2 sm:-ml-2 rounded-lg text-center sm:text-left w-full sm:w-auto">Általános Szerződési Feltételek</Link>
                            <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors text-sm py-2 px-2 sm:-ml-2 rounded-lg text-center sm:text-left w-full sm:w-auto">Adatvédelmi Tájékoztató</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col items-center sm:items-start space-y-4">
                        <h4 className="text-background font-bold uppercase tracking-wider text-sm mb-2">Kapcsolat</h4>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                            <span>+36 70 612 1277</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                            <span>info@bontoaruhaz.hu</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                            <span>2220 Vecsés,<br />Fő út 44.</span>
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-background/40 gap-4 text-center sm:text-left">
                    <p>© {new Date().getFullYear()} BONTÓÁRUHÁZ. Minden jog fenntartva.</p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href="/terms" className="hover:text-background transition-colors py-2 px-3 -my-2 rounded-md">ÁSZF</Link>
                        <Link href="/privacy" className="hover:text-background transition-colors py-2 px-3 -my-2 rounded-md">Adatvédelem</Link>
                        <Link href="/impressum" className="hover:text-background transition-colors py-2 px-3 -my-2 rounded-md">Impresszum</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
