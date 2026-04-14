export const dynamic = "force-dynamic";
import { ShieldAlert, Info } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-[var(--color-primary)]" />
                        Adatvédelmi Tájékoztató
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
                        A BONTÓÁRUHÁZ kiemelten fontosnak tartja az Ügyfelei személyes adatainak védelmét. Jelen tájékoztató az Európai Unió Általános Adatvédelmi Rendelete (GDPR) és a hazai jogszabályok alapján készült, és részletezi, hogyan kezeljük az adataidat vásárlás és regisztráció során.
                    </p>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Az Adatkezelő adatai</h2>
                <ul className="list-none space-y-2 p-6 sm:p-8 bg-muted/5 rounded-2xl border border-border m-0">
                    <li><strong className="text-foreground">Cégnév:</strong> Nardai Mónika E.V.</li>
                    <li><strong className="text-foreground">Székhely:</strong> 8111 Seregélyes-Jánosmajor</li>
                    <li><strong className="text-foreground">Adószám:</strong> 53061937-1-33</li>
                    <li><strong className="text-foreground">Nyilvántartási szám:</strong> 55807986</li>
                    <li><strong className="text-foreground">E-mail:</strong> info@bontoaruhaz.hu</li>
                    <li><strong className="text-foreground">Telefon:</strong> +36 70 612 1277</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Kezelt adatok köre, célja és jogalapja</h2>

                <h3 className="text-lg font-bold text-foreground mt-6 mb-3">2.1. Regisztráció és fiókkezelés</h3>
                <p><strong>Kezelt adatok:</strong> Név, e-mail cím, jelszó (titkosítva).</p>
                <p><strong>Cél:</strong> Felhasználói fiók létrehozása, egyszerűbb későbbi vásárlás biztosítása.</p>
                <p><strong>Jogalap:</strong> Az érintett hozzájárulása (GDPR 6. cikk (1) bek. a) pont).</p>

                <h3 className="text-lg font-bold text-foreground mt-6 mb-3">2.2. Rendelés leadása és teljesítése</h3>
                <p><strong>Kezelt adatok:</strong> Név, szállítási cím, telefonszám, számlázási név és cím, cég esetén adószám.</p>
                <p><strong>Cél:</strong> A szerződés (vásárlás) létrejötte, a termék kiszállítása (futárszolgálatnak történő átadás), és a számviteli bizonylat kiállítása.</p>
                <p><strong>Jogalap:</strong> Szerződés teljesítése (GDPR 6. cikk (1) bek. b) pont), valamint jogi kötelezettség teljesítése a számlázás tekintetében (GDPR 6. cikk (1) bek. c) pont).</p>

                <h3 className="text-lg font-bold text-foreground mt-6 mb-3">2.3. Kapcsolatfelvétel</h3>
                <p><strong>Kezelt adatok:</strong> Név, e-mail cím, üzenet tárgya és tartalma.</p>
                <p><strong>Cél:</strong> A beérkező megkeresések, ügyfélszolgálati kérdések (pl. alkatrész egyeztetés) megválaszolása.</p>
                <p><strong>Jogalap:</strong> Az adatkezelő jogos érdeke (GDPR 6. cikk (1) bek. f) pont).</p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Adattovábbítás, adatfeldolgozók</h2>
                <p>Annak érdekében, hogy a megrendelt termékeket eljuttassuk Hozzád, és a rendszereink működjenek, az alábbi partnereink felé továbbítjuk a szükséges adatokat:</p>
                <ul>
                    <li><strong>Futárszolgálat:</strong> Pannon XP Kft. (Szállítási név, cím, telefonszám átadás)– a csomag kézbesítéséhez.</li>
                    <li><strong>Tárhelyszolgáltató / Adatbázis:</strong> Vercel Inc., Supabase (Szerver és adatbázis biztosítása).</li>
                    <li><strong>Fizetési szolgáltató:</strong> Stripe (Online bankkártyás fizetés esetén a tranzakció lebonyolítása - a kártyaadatokat a BONTÓÁRUHÁZ nem látja és nem tárolja).</li>
                    <li><strong>Számlázó rendszer:</strong> Billingo (Szabályszerű számla kiállítása céljából).</li>
                    <li><strong>E-mail küldő rendszer:</strong> Resend (Rendszerüzenetek, visszaigazolások kiküldése).</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Adatok megőrzési ideje</h2>
                <p>
                    A számlákat a számviteli törvény előírása alapján a kiállítástól számított legalább 8 évig őrizzük meg. A regisztrált fiók adatait a felhasználó törlési kérelméig őrizzük meg.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Érintettek (Vásárlók) jogai</h2>
                <p>A GDPR alapján a felhasználók (érintettek) jogosultak:</p>
                <ul>
                    <li>Tájékoztatást kérni személyes adataik kezeléséről.</li>
                    <li>Kérni a pontatlan adatok helyesbítését.</li>
                    <li>Kérni adataik törlését, ha annak jogszabályi akadálya nincs (pl. adózási kötelezettség).</li>
                    <li>Tiltakozni a személyes adataik kezelése ellen.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Jogorvoslat</h2>
                <p>
                    Amennyiben úgy érzed, hogy a BONTÓÁRUHÁZ megsértette az adatkezelésre vonatkozó törvényi előírásokat, kérjük, első lépésben vedd fel velünk a kapcsolatot az <strong>info@bontoaruhaz.hu</strong> e-mail címen. Panaszoddal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) is fordulhatsz (naih.hu).
                </p>

                <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                    <Link href="/terms" className="text-[var(--color-primary)] font-bold hover:underline">
                        Elolvasom az Általános Szerződési Feltételeket (ÁSZF) is
                    </Link>
                </div>
            </div>
        </div>
    );
}
