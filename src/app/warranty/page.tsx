export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { ShieldCheck, Info } from"lucide-react";
import Link from"next/link";

export default function WarrantyPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
                        Garancia és Visszaküldés
                    </h1>
                    <p className="text-muted text-sm border-l-2 border-[var(--color-primary)] pl-3">
                        Visszatérítési szabályzat és garanciális feltételek
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl prose prose-neutral max-w-none text-foreground/80 font-[family-name:var(--font-geist-sans)]">

                <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-4 rounded-xl flex items-start gap-4 mb-8">
                    <Info className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <p className="m-0 text-sm font-bold mb-1">
                            A legfontosabb tudnivaló:
                        </p>
                        <p className="m-0 text-sm font-medium">
                            Cégünk által forgalmazott alkatrészekre 2 hét beépítési garanciát vállalunk. Amennyiben az alkatrész hibásnak bizonyul, a vételárat visszatérítjük.
                        </p>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. 2 Hét Beépítési Garancia</h2>
                <p>
                    Cégünk által forgalmazott alkatrészekre <strong>2 hét beépítési garanciát</strong> vállalunk. Amennyiben a megrendelt vagy átvett termékről a beszerelés során bebizonyosodik, hogy az alkatrész hibás, 2 héten belül visszavesszük azt és a vételárat visszatérítjük.
                </p>

                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-6 text-red-700">
                    <p className="m-0 font-bold mb-2">Téves rendelés (Kivétel)</p>
                    <p className="m-0 text-sm">
                        A beépítési garancia <strong>nem vonatkozik a téves rendelésekre, vásárlásokra</strong>, azaz azokra az esetekre, amikor a vevő nem a megfelelő alkatrészt rendelte meg. Ilyen esetekben a termék árának és a szállítás költségeinek megtérítésére nincs lehetőség, a kompatibilitás ellenőrzése a Vásárló felelőssége.
                    </p>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Visszaküldés folyamata és szállítási költség</h2>
                <p>
                    Kérjük, amennyiben az alkatrész hibás, vedd fel velünk a kapcsolatot a probléma egyeztetése céljából, majd küldd vissza a terméket címünkre (2220 Vecsés, Fő út 44.).
                </p>
                <p>
                    <strong>Amennyiben a hibás termék megrendelése házhoz szállítással történt, úgy cégünk a termék visszaküldésének költségét is megtéríti.</strong> Ennek feltétele a hiba igazolása és az előzetes egyeztetés ügyfélszolgálatunkkal. Utánvéttel (portósan) feladott csomagokat azonban semmilyen esetben sem áll módunkban átvenni!
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. A garancia érvényesítésének feltételei</h2>
                <p>
                    A bontott alkatrészek visszavételének és a vételár visszatérítésének további feltételei:
                </p>
                <ul>
                    <li>A terméken elhelyezett cégünk által használt <strong>védőjelzések, plombák (festés, matrica) sértetlensége</strong>. Ezen azonosítók megbontása, rongálása esetén a garancia azonnal érvényét veszti. (Ezzel védekezünk a megbontott, vagy alkatrészeiben kicserélt hibás darabok visszaküldése ellen).</li>
                    <li>Az alkatrészt az általunk átadott/kiszállított állapotban kell visszaküldeni, hiánytalanul (beleértve a rajta hagyott kiegészítőket is).</li>
                    <li>Szakszerű beépítés igazolása: Szükség esetén kérhetjük a szakszerviz számláját, amely bizonyítja, hogy az alkatrészt szakember építette be és a hiba nem a helytelen szerelésből adódott.</li>
                </ul>

                <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                    <Link href="/contact" className="text-[var(--color-primary)] font-bold hover:underline">
                        Kérdésem van a garanciával kapcsolatban
                    </Link>
                </div>
            </div>
        </div>
    );
}
