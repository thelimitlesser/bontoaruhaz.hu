export default function WarrantyPage() {
    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-muted uppercase">
                        Garancia
                    </h1>
                    <p className="text-xl text-[var(--color-primary)] font-medium tracking-wide uppercase border-b border-[var(--color-primary)]/20 pb-6 inline-block">
                        Biztonság & Minőség
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-card backdrop-blur-xl border border-border p-8 md:p-12 rounded-2xl space-y-8 shadow-xl">

                        {/* Guarantee Statement */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full"></span>
                                Beépítési Garancia
                            </h2>
                            <p className="text-lg text-foreground leading-relaxed">
                                Cégünk által forgalmazott alkatrészekre <span className="text-foreground font-bold decoration-[var(--color-primary)] decoration-2 underline underline-offset-4">2 hét beépítési garanciát</span> vállalunk. Amennyiben a megrendelt vagy átvett termékről a beszerelés során bebizonyosodik, hogy az alkatrész hibás, <span className="text-foreground font-medium">2 héten belül visszavesszük azt és a vételárat visszatérítjük.</span>
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>

                        {/* Exceptions & Returns */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-muted rounded-full"></span>
                                Kivételek & Visszaküldés
                            </h2>
                            <div className="text-foreground space-y-4 text-base leading-relaxed">
                                <p>
                                    A beépítési garancia <span className="text-red-500 font-medium">nem vonatkozik a téves rendelésekre</span>, vásárlásokra, azaz azokra az esetekre, amikor a vevő nem a megfelelő alkatrészt rendelte meg.
                                </p>
                                <div className="bg-foreground/5 border border-border p-4 rounded-lg">
                                    <p className="text-foreground text-sm">
                                        <span className="text-[var(--color-primary)] font-bold">FONTOS:</span> Amennyiben a hibás termék megrendelése házhoz szállítással történt, úgy cégünk a termék visszaküldésének költségét is megtéríti.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center">
                    <p className="text-sm text-muted uppercase tracking-widest">
                        Bontóáruház © {new Date().getFullYear()}
                    </p>
                </div>

            </div>
        </div>
    );
}
