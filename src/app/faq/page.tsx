import { HelpCircle } from"lucide-react";

export default function FaqPage() {
    const faqs = [
        { q:"Mennyi a szállítási idő?", a:"Általában 1-2 munkanap a raktáron lévő termékek esetén." },
        { q:"Van garancia a használt alkatrészekre?", a:"Igen, minden nálunk vásárolt használt alkatrészre minimum 15 nap beépítési garanciát vállalunk." },
        { q:"Hogyan fizethetek?", a:"Fizethetsz bankkártyával (SimplePay), utánvéttel vagy előre utalással." },
    ];

    return (
        <div className="min-h-screen pt-32 px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-foreground mb-8 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-[var(--color-primary)]" />
                Gyakori Kérdések
            </h1>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="glass-panel p-6 rounded-xl hover:border-[var(--color-primary)] transition-colors group">
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-[var(--color-primary)] transition-colors">{faq.q}</h3>
                        <p className="text-muted">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
