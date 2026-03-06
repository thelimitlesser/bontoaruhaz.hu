import { Search, ShoppingCart, Truck, CheckCircle } from"lucide-react";

export default function HowItWorksPage() {
    const steps = [
        { icon: Search, title:"Keresés", desc:"Használd a részletes keresőt vagy az AI segédet." },
        { icon: ShoppingCart, title:"Rendelés", desc:"Tedd kosárba a kiválasztott alkatrészt." },
        { icon: Truck, title:"Szállítás", desc:"Futárunk 24-48 órán belül kiszállítja hozzád." },
        { icon: CheckCircle, title:"Beépítés", desc:"Élvezd az új alkatrészt garanciával." },
    ];

    return (
        <div className="min-h-screen pt-32 px-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-12 text-center">Vásárlás Menete</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {steps.map((step, i) => (
                    <div key={i} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mb-6">
                            <step.icon className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-400">{step.desc}</p>

                        {i < steps.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/10" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
