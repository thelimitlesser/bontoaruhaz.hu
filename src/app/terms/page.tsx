export const dynamic = "force-dynamic";
import { FileText, Info } from "lucide-react";
import Link from "next/link";

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
                        Utolsó frissítés: 2026. 04. 14.
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
                    <li><strong className="text-foreground">Cégnév:</strong> Nardai Mónika E.V.</li>
                    <li><strong className="text-foreground">Székhely:</strong> 2220 Vecsés, Fő út 44.</li>
                    <li><strong className="text-foreground">Telephely:</strong> 8111 Seregélyes-Jánosmajor</li>
                    <li><strong className="text-foreground">Adószám:</strong> 53061937-1-33</li>
                    <li><strong className="text-foreground">Nyilvántartási szám:</strong> 55807986</li>
                    <li><strong className="text-foreground">E-mail cím:</strong> info@bontoaruhaz.hu</li>
                    <li><strong className="text-foreground">Telefonszám:</strong> +36 70 612 1277</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Alapvető rendelkezések</h2>
                <p>
                    A jelen ÁSZF-ben nem szabályozott kérdésekre, valamint jelen ÁSZF értelmezésére a magyar jog az irányadó, különös tekintettel a Polgári Törvénykönyvről szóló 2013. évi V. törvény („Ptk.”) és az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény vonatkozó rendelkezéseire.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Termékinformációk és Garanciák</h2>
                <p>
                    A webáruházban forgalmazott termékek többsége használt, bontott gépjármű-alkatrész. Szolgáltató az alábbi speciális feltételeket biztosítja:
                </p>
                <ul>
                    <li>A termékfotók minden esetben az adott, eladásra kínált termékről készült <strong>valós fényképek</strong>.</li>
                    <li>Minden alkatrész többlépcsős minőségellenőrzésen esik át. Amennyiben egy alkatrészen esztétikai vagy egyéb hiba található, azt a termék leírásában minden esetben külön feltüntetjük.</li>
                    <li>A termékek adatlapján minden esetben feltüntetjük a gyári cikkszámokat és a kompatibilitási információkat (milyen gépjárművekbe építhető be az alkatrész).</li>
                    <li>Használt alkatrész vásárlása esetén a Vásárló tudomásul veszi, hogy a várható élettartam eltérhet egy új alkatrészétől.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Vásárlás menete, árak</h2>
                <p>
                    A megjelenített árak forintban értendő bruttó árak. A Szolgáltató <strong>alanyi adómentes (AAM)</strong> státuszú, így a termékeket áfa-mentesen értékesíti (ÁFA tartalom: 0%). Az árak nem tartalmazzák a házhoz szállítás díját.
                </p>
                <p><strong>A vásárlás menete:</strong></p>
                <ol className="list-decimal pl-6 space-y-2 mb-6 text-sm">
                    <li><strong>Termék kiválasztása:</strong> A kereső vagy a kategóriák segítségével kiválasztott alkatrész kosárba helyezése.</li>
                    <li><strong>Pénztár:</strong> A szállítási és számlázási (szükség esetén adószámos) adatok megadása.</li>
                    <li><strong>Bankkártyás fizetés (Stripe):</strong> A fizetés indításakor a Vásárló bankja az összeget **csak zárolja (authorization)**. A pénz ekkor még nem kerül levonásra, csak foglalva marad a tranzakció részére.</li>
                    <li><strong>Minőségellenőrzés:</strong> A rendelés beérkezése után kollégáink elvégzik az alkatrész végső minőségellenőrzését (valós állapot és cikkszám egyeztetés).</li>
                    <li><strong>Jóváhagyás és Levonás (Capture):</strong> Amennyiben a termék megfelel, a Szolgáltató jóváhagyja a rendelést, és a tényleges **levonás (capture)** csak ekkor történik meg.</li>
                    <li><strong>Visszaigazolás:</strong> A rendszer e-mailben értesíti a Vásárlót a rendelés rögzítéséről, majd a jóváhagyásról és a szállítás indításáról.</li>
                </ol>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Szállítás és átvétel</h2>
                <p>
                    A kiszállítást a Pannon XP futárszolgálat végzi, vagy lehetőség van személyes átvételre a telephelyünkön (8111 Seregélyes-Jánosmajor). A szállítási feltételekről részletes tájékoztatást a <Link href="/shipping" className="text-[var(--color-primary)] underline">szállítási információs</Link> oldalon talál.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Elállási jog szabályozása</h2>
                <p>
                    A távollevők között kötött szerződésekről szóló kormányrendelet alapján az elállási jog gyakorlása az alábbiak szerint alakul:
                </p>
                <ul className="space-y-4">
                    <li>
                        <strong>Fogyasztókra (magánszemélyekre) vonatkozó szabályok:</strong> A fogyasztónak minősülő Vásárló 14 napon belül indokolás nélkül elállhat a szerződéstől. Az elállási jog a termék átvételétől számít. A visszaszállítás költsége a Vásárlót terheli.
                    </li>
                    <li>
                        <strong>Üzleti vásárlókra (cégekre, egyéni vállalkozókra) vonatkozó szabályok:</strong> A Ptk. és a vonatkozó kormányrendelet alapján az **indokolás nélküli elállási jog kizárólag a fogyasztókat illeti meg**. Gazdasági társaságokat, adószámmal rendelkező üzleti vásárlókat elállási jog nem illeti meg. Számukra kizárólag a beépítési garancia (7. pont) keretein belül, bizonyított hiba esetén biztosítunk visszavételt.
                    </li>
                    <li>
                        <strong>Téves rendelés:</strong> A kompatibilitás ellenőrzése (cikkszám, évjárat, fotó alapján) minden esetben a Vásárló felelőssége. Téves rendelés (nem kompatibilis alkatrész választása) önmagában nem alap az elállásra üzleti vásárlók esetén.
                    </li>
                    <li>
                        <strong>Védőjelzések:</strong> Bármilyen elállás vagy visszaküldés feltétele a terméken elhelyezett cégjelzések, plombák és és jelölőfestések sértetlensége.
                    </li>
                </ul>
                <p className="text-xs text-muted mt-4 italic">
                    Részletes szabályok a <Link href="/warranty" className="text-[var(--color-primary)] underline">Garancia és Visszaküldés</Link> oldalon találhatók.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">7. Garancia és Szavatosság</h2>
                <p>
                    Bontott alkatrészeinkre <strong>2 hét beépítési garanciát</strong> vállalunk. Amennyiben az alkatrész hibásnak bizonyul, a vételárat visszatérítjük. A törvény által előírt szavatossági idő használt termékek esetén 1 év.
                </p>
                <p>
                    A garancia feltétele a terméken elhelyezett <strong>védőjelzések (festés, plomba, matrica) sértetlensége</strong>. A jelölések eltávolítása vagy megsértése a garancia azonnali elvesztését vonja maga után.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">8. Panaszkezelés</h2>
                <p>
                    Az Ügyfél a termékkel vagy a Szolgáltató tevékenységével kapcsolatos kifogásait az 1. pontban megadott elérhetőségeken (e-mailben vagy telefonon) terjesztheti elő. Panaszát a beérkezést követő 30 napon belül megvizsgáljuk és megválaszoljuk.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">9. Jogorvoslat, Békéltető Testület</h2>
                <p>
                    Fogyasztói jogvita esetén a Vásárló a lakóhelye vagy tartózkodási helye szerint illetékes békéltető testülethez fordulhat. A Szolgáltató székhelye szerint illetékes testület:
                </p>
                <div className="bg-muted/30 p-4 rounded-xl text-sm italic">
                    <strong>Fejér Vármegyei Békéltető Testület</strong><br />
                    Cím: 8000 Székesfehérvár, Hosszúsétatér 4-6.<br />
                    E-mail: bekeltetes@fmkik.hu<br />
                    Honlap: www.bekeltetesfejer.hu
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">10. Egyéb rendelkezések</h2>
                <p>
                    Az online vitarendezéshez használható platform elérhető az alábbi linken: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">Online Vitarendezési Platform</a>.
                </p>
                <p>
                    Személyes adatai kezeléséről a <Link href="/privacy" className="text-[var(--color-primary)] underline">Adatkezelési Tájékoztatóban</Link> olvashat.
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
