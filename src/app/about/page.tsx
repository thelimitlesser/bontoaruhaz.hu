export const dynamic = "force-dynamic";
export default function AboutPage() {
    return (
        <div className="min-h-screen pt-32 px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-foreground mb-8">Rólunk</h1>
            <div className="glass-panel p-8 rounded-2xl space-y-4 text-muted leading-relaxed">
                <p>
                    Az <span className="text-[var(--color-primary)] font-bold">Bontóáruház</span> nem csak egy webáruház. Mi a jövő autóalkatrész-piactere vagyunk.
                </p>
                <p>
                    Küldetésünk, hogy a legmodernebb technológiával kössük össze a vásárlókat a megbízható eladókkal. Nincs többé bizonytalanság, nincs többé rossz alkatrész.
                </p>
                <p>
                    Csapatunk autóipari mérnökökből és szoftverfejlesztőkből áll, akik hisznek abban, hogy az alkatrészvásárlás lehet egyszerű, gyors és élménydús.
                </p>
            </div>
        </div>
    );
}
