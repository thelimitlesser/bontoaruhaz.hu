import { Target, Zap, Search, Award, Leaf } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4 flex items-center gap-4">
                    <Target className="w-10 h-10 text-[var(--color-primary)]" />
                    Rólunk
                </h1>
                <p className="text-muted text-lg border-l-4 border-[var(--color-primary)] pl-4 max-w-2xl italic">
                    Minőség, szakértelem és fenntarthatóság az autóalkatrészek világában.
                </p>
            </div>

            <div className="space-y-12">
                {/* Kik vagyunk section */}
                <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                    
                    <h2 className="text-2xl font-bold text-foreground mb-6">Kik vagyunk?</h2>
                    <p className="text-muted leading-relaxed text-lg">
                        A <span className="text-[var(--color-primary)] font-bold">Bontóáruház.hu</span> Magyarország egyik legprecízebb online alkatrészáruháza, 
                        ahol több ezer gyári bontott alkatrész azonnali kínálata érhető el. Küldetésünk, hogy az autósok és szerelők számára egyszerűvé, 
                        gyorssá és tévedhetetlenné tegyük az alkatrészbeszerzést – átlátható garanciális feltételekkel és megbízható szakmai háttérrel.
                    </p>
                </section>

                {/* Hogyan dolgozunk section */}
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Hogyan dolgozunk?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-muted/5 border border-border rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group">
                            <Search className="w-8 h-8 text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-foreground mb-2">Villámgyors keresés</h3>
                            <p className="text-sm text-muted">Intelligens keresőmotorunkkal pillanatok alatt megtalálod a pontos típust.</p>
                        </div>
                        <div className="bg-muted/5 border border-border rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group">
                            <Zap className="w-8 h-8 text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-foreground mb-2">Precíz beazonosítás</h3>
                            <p className="text-sm text-muted">Gyári kódok és részletes fotók segítségével segítünk a tévedhetetlen választásban.</p>
                        </div>
                        <div className="bg-muted/5 border border-border rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group">
                            <Award className="w-8 h-8 text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-foreground mb-2">Biztonságos vásárlás</h3>
                            <p className="text-sm text-muted">Minden nálunk vásárolt alkatrészre írásos garanciát vállalunk.</p>
                        </div>
                    </div>
                </section>

                {/* Filozófiánk / Missziónk section */}
                <section className="bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]/20 rounded-3xl p-8 sm:p-10 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <Leaf className="w-6 h-6 text-emerald-500" />
                                Missziónk
                            </h2>
                            <p className="text-muted leading-relaxed">
                                Saját feladatunknak tekintjük a környezettudatos autózást: célunk, hogy minél több kiváló állapotú, gyári alkatrészt 
                                mentsünk meg és adjunk vissza a mindennapi használatba. Amikor a Bontóáruházon keresztül vásárolsz, nemcsak 
                                jelentős összeget takarítasz meg, hanem egy fenntarthatóbb jövőt is támogatsz a körforgásos gazdaság révén.
                            </p>
                        </div>
                        <div className="hidden md:block w-px h-32 bg-border" />
                        <div className="flex-none text-center">
                            <div className="text-4xl font-black text-[var(--color-primary)]">100%</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Ellenőrzött minőség</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
