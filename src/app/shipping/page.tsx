export const dynamic = "force-dynamic";
import { Truck, MapPin,Clock, Info, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function ShippingPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 flex items-center gap-3">
                        <Truck className="w-8 h-8 text-[var(--color-primary)]" />
                        Szállítási Információk
                    </h1>
                    <p className="text-muted text-sm border-l-2 border-[var(--color-primary)] pl-3">
                        Házhozszállítás és személyes átvétel részletei
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl prose prose-neutral max-w-none text-foreground/80 font-[family-name:var(--font-geist-sans)]">

                <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-4 rounded-xl flex items-start gap-4 mb-8">
                    <Info className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="m-0 text-sm font-medium">
                        A BONTÓÁRUHÁZ célja, hogy a kiválasztott alkatrészeket a lehető leggyorsabban és legbiztonságosabban juttassuk el Hozzád. Jelenleg kétféle átvételi módot kínálunk vásárlóinknak.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="w-6 h-6 text-[var(--color-primary)]" />
                            <h3 className="text-lg font-bold m-0 text-foreground">Házhozszállítás</h3>
                        </div>
                        <p className="text-sm leading-relaxed mb-4">
                            Megbízható partnerünk, a <strong>Pannon XP</strong> futárszolgálat végzi a kiszállítást az ország egész területén.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Clock className="w-4 h-4" />
                            <span>1-3 munkanap</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                            <h3 className="text-lg font-bold m-0 text-foreground">Személyes átvétel</h3>
                        </div>
                        <p className="text-sm leading-relaxed mb-4">
                            Rendelésedet ingyenesen átveheted központi telephelyünkön, előre egyeztetett időpontban.
                        </p>
                        <div className="text-sm text-foreground/70 italic">
                            8111 Seregélyes-Jánosmajor
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-4">1. Házhozszállítás részletei</h2>
                <p>
                    A küldemények feldolgozása a rendelés beérkezése után azonnal megkezdődik. Amint a futárszolgálat átveszi a csomagot, e-mailben értesítünk a várható érkezésről és a nyomon követési azonosítóról.
                </p>
                <ul>
                    <li>A futár a csomag átadása előtt általában telefonon vagy SMS-ben egyeztet.</li>
                    <li>Kérjük, átvételkor ellenőrizd a csomag sértetlenségét!</li>
                    <li>Sérült csomagolás esetén vetess fel jegyzőkönyvet a futárral.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Szállítási díjak</h2>
                <p>
                    A szállítási költség a megrendelt alkatrészek <strong>súlyától és térfogatától</strong> függ. Webáruházunk intelligens rendszere a kosárban lévő termékek adatai alapján automatikusan kiszámítja a legkedvezőbb szállítási díjat.
                </p>
                <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-[var(--color-primary)] text-sm">
                    A pontos szállítási költséget a <strong>Pénztár</strong> folyamat során, a szállítási adatok megadása után láthatod, még a fizetés és a rendelés véglegesítése előtt.
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Csomagkövetés</h2>
                <p>
                    Minden házhoz szállítással kért rendeléshez egyedi azonosítót biztosítunk. Ezzel a Pannon XP weboldalán keresztül folyamatosan nyomon követheted, merre jár a csomagod.
                </p>
                <div className="flex items-center gap-3 p-4 bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/20">
                    <PackageSearch className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium">A csomagszámot a feladás napján küldjük el e-mailben.</span>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/terms" className="text-sm text-muted hover:text-foreground transition-colors underline">
                        Általános Szerződési Feltételek
                    </Link>
                    <Link href="/contact" className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                        Kérdésem van a szállítással kapcsolatban
                    </Link>
                </div>
            </div>
        </div>
    );
}
