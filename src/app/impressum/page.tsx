import { Building2, Info, Server } from"lucide-react";

export default function ImpressumPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
                        Impresszum
                    </h1>
                    <p className="text-muted text-sm border-l-2 border-[var(--color-primary)] pl-3">
                        Jogi közlemény és szolgáltatói adatok
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl prose prose-neutral max-w-none text-foreground/80 font-[family-name:var(--font-geist-sans)]">

                <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-4 rounded-xl flex items-start gap-4 mb-8">
                    <Info className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="m-0 text-sm font-medium">
                        Az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény alapján a BONTÓÁRUHÁZ üzemeltetője az alábbi adatokat teszi közzé.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Üzemeltető adatai */}
                    <div>
                        <h2 className="text-xl font-bold text-foreground mt-4 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
                            A Szolgáltató adatai
                        </h2>
                        <ul className="list-none space-y-3 p-6 sm:p-8 bg-muted/5 rounded-2xl border border-border m-0">
                            <li><strong className="text-foreground block mb-1">Cégnév:</strong> [CÉGNÉV] (Kérjük, töltse ki)</li>
                            <li><strong className="text-foreground block mb-1">Székhely és telephely:</strong> 2220 Vecsés, Fő út 44.</li>
                            <li><strong className="text-foreground block mb-1">Adószám:</strong> [ADÓSZÁM]</li>
                            <li><strong className="text-foreground block mb-1">Cégjegyzékszám:</strong> [CÉGJEGYZÉKSZÁM]</li>
                            <li><strong className="text-foreground block mb-1">Nyilvántartó bíróság:</strong> [BÍRÓSÁG NEVE]</li>
                            <li><strong className="text-foreground block mb-1">Kamarai tagság:</strong> [KAMARA NEVE]</li>
                            <li><strong className="text-foreground block mb-1">Elektronikus elérhetőség:</strong> info@bontoaruhaz.hu</li>
                            <li><strong className="text-foreground block mb-1">Telefonos elérhetőség:</strong> +36 70 612 1277</li>
                            <li><strong className="text-foreground block mb-1">Adatvédelmi nyilvántartási szám:</strong> [NAIH SZÁM - ha van / N/A]</li>
                        </ul>
                    </div>

                    {/* Tárhelyszolgáltató adatai */}
                    <div>
                        <h2 className="text-xl font-bold text-foreground mt-4 mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-[var(--color-primary)]" />
                            Tárhelyszolgáltató
                        </h2>
                        <ul className="list-none space-y-3 p-6 sm:p-8 bg-muted/5 rounded-2xl border border-border m-0">
                            <li><strong className="text-foreground block mb-1">Cégnév:</strong> Vercel Inc.</li>
                            <li><strong className="text-foreground block mb-1">Székhely:</strong> 440 N Barranca Ave #4133 Covina, CA 91723</li>
                            <li><strong className="text-foreground block mb-1">E-mail:</strong> privacy@vercel.com</li>
                            <li><strong className="text-foreground block mb-1">Weboldal:</strong> https://vercel.com</li>
                            <li className="pt-4 border-t border-border mt-4"><strong className="text-foreground block mb-1">Adatbázis szolgáltató:</strong> Supabase Inc.</li>
                            <li><strong className="text-foreground block mb-1">Székhely:</strong> 970 1st St Unit 3A, San Francisco, CA 94110</li>
                            <li><strong className="text-foreground block mb-1">Weboldal:</strong> https://supabase.com</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Szerzői Jogok</h2>
                <p>
                    A weboldalon található minden képi és szöveges tartalom, illetve azok elrendezése szerzői jogi védelem alatt áll. Azok bármilyen formában történő felhasználása a BONTÓÁRUHÁZ üzemeltetőjének kifejezett, előzetes írásbeli engedélyével lehetséges.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Felelősségkizárás</h2>
                <p>
                    A weboldalon található információk – beleértve a termékek cikkszámait és kompatibilitási adatait – tájékoztató jellegűek. Annak teljességéért és az esetleges gépelési hibákért a Szolgáltató nem vállal felelősséget. Részletes feltételeket az <a href="/terms" className="text-[var(--color-primary)] font-bold hover:underline">Általános Szerződési Feltételek</a> (ÁSZF) tartalmazzák.
                </p>
            </div>
        </div>
    );
}
