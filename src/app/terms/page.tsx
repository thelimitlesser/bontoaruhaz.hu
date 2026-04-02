export const dynamic = "force-dynamic";
import { FileText, Info } from"lucide-react";
import Link from"next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                        Általános Szerződési Feltételek
                    </h1>
                    <p className="text-muted text-sm border-l-2 border-[var(--color-primary)] pl-3">
                        Utolsó frissítés: 2026. 04. 02.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl prose prose-neutral max-w-none text-foreground/80 font-[family-name:var(--font-geist-sans)]">

                <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-4 rounded-xl flex items-start gap-4 mb-8">
                    <Info className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="m-0 text-sm font-medium">
                        Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) tartalmazzák a BONTÓÁRUHÁZ weboldalon (a továbbiakban: Weboldal) elérhető szolgáltatások igénybevételének, valamint a termékek megvásárlásának feltételeit. Kérjük, figyelmesen olvassa el, mielőtt rendelést adna le!
                    </p>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Szolgáltató adatai</h2>
                <ul className="list-none space-y-2 p-6 sm:p-8 bg-muted/5 rounded-2xl border border-border m-0">
                    <li><strong className="text-foreground">Cégnév:</strong> [CÉGNÉV] (Kérjük, töltse ki hivatalos adataival)</li>
                    <li><strong className="text-foreground">Székhely:</strong> 8111 Seregélyes-Jánosmajor</li>
                    <li><strong className="text-foreground">Adószám:</strong> [ADÓSZÁM]</li>
                    <li><strong className="text-foreground">Cégjegyzékszám:</strong> [CÉGJEGYZÉKSZÁM]</li>
                    <li><strong className="text-foreground">E-mail cím:</strong> info@bontoaruhaz.hu</li>
                    <li><strong className="text-foreground">Telefonszám:</strong> +36 70 612 1277</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Alapvető rendelkezések</h2>
                <p>
                    A jelen ÁSZF-ben nem szabályozott kérdésekre, valamint jelen ÁSZF értelmezésére a magyar jog az irányadó, különös tekintettel a Polgári Törvénykönyvről szóló 2013. évi V. törvény („Ptk.”) és az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény vonatkozó rendelkezéseire. A vonatkozó jogszabályok kötelező rendelkezései a felekre külön kikötés nélkül is irányadók.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Bontott alkatrészekre vonatkozó speciális feltételek</h2>
                <p>
                    A webáruházban forgalmazott termékek döntő többsége használt, bontott gépjármű-alkatrész. Ennek megfelelően:
                </p>
                <ul>
                    <li>Az alkatrészek állapota a használtságból eredően változó lehet, esztétikai hibák, karcok, felületi sérülések előfordulhatnak.</li>
                    <li>A termékfotók minden esetben illusztrációk, ha az adott terméklapon nincs külön jelezve, hogy a kép a konkrét, eladó darabról készült.</li>
                    <li>Az Ügyfél tudomásul veszi, hogy használt alkatrész vásárlása esetén a várható élettartam nem azonos egy új gyári alkatrészével.</li>
                    <li>A kompatibilitás (alkatrészek beszerelhetősége egy adott járműbe) ellenőrzése minden esetben a Vásárló felelőssége. Gyári cikkszámokat tájékoztató jelleggel biztosítunk.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Vásárlás menete, árak</h2>
                <p>
                    A megjelenített árak forintban értendők, tartalmazzák a törvényben előírt áfát (vagy különbözeti adózás szerinti értékesítés hatálya alá esnek, melyet a számla tartalmaz). Az árak nem tartalmazzák a házhoz szállítás díját.
                </p>
                <p>
                    A Weboldalon leadott rendelés elektronikus úton megkötött szerződésnek minősül, amelyre a távollevők között kötött szerződésekre vonatkozó jogszabályok irányadóak. A rendelés leadása fizetési kötelezettséget von maga után.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Szállítás és átvétel</h2>
                    A megrendelt termékek kiszállítását a Pannon XP futárszolgálat végzi, vagy lehetőség van személyes átvételre telephelyünkön (8111 Seregélyes-Jánosmajor). A szállítási díj a termék súlyától és térfogatától függően változhat, melyről a Pénztár folyamat során a rendszer pontos tájékoztatást ad.

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Elállási jog (14 napos visszavétel)</h2>
                <p>
                    A fogyasztónak minősülő Vásárló (tehát nem cégként, adószámmal vásárló személy) a 45/2014. (II. 26.) Korm. rendelet értelmében 14 napon belül indokolás nélkül elállhat a szerződéstől.
                </p>
                <p>Tudnivalók az elállásról:</p>
                <ul>
                    <li>Az elállási jog a termék átvételének napjától számított 14 napig gyakorolható.</li>
                    <li>A visszaküldés költsége minden esetben a Vásárlót terheli (utánvétes csomagot nem áll módunkban átvenni).</li>
                    <li>Elektromos alkatrészek, vezérlőegységek esetében (ha a védőplomba/jelölés megsérül), valamint már beépített alkatrészek esetén az elállási jog csak korlátozottan, értékcsökkenés felszámításával gyakorolható.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">7. Garancia, szavatosság (A bontott alkatrészek esetén)</h2>
                <p>
                    A használt (bontott) alkatrészekre a törvényben előírt kötelező szavatossági idő: <strong>1 év</strong>. Fogyasztói szerződés esetén az átadástól számított 6 hónapon belül felismert hiba esetén vélelmezni kell, hogy a hiba oka már a teljesítéskor megvolt (kivéve, ha ez a dolog természetével - pl. kopóalkatrész - vagy a hiba jellegével összeegyeztethetetlen).
                </p>
                <p>
                    Saját beszerelésből (szakképzetlen személy általi beépítés), helytelen használatból, illetve a jármű típusához nem illő alkatrész erőltetéséből származó károkért garanciát nem vállalunk. Garanciális igény érvényesítéséhez ajánlott a szakszervizben történő beszerelés igazolása (számla).
                </p>

                <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                    <Link href="/contact" className="text-[var(--color-primary)] font-bold hover:underline">
                        Kérdésem van, kapcsolatba lépek az ügyfélszolgálattal
                    </Link>
                </div>
            </div>
        </div>
    );
}
