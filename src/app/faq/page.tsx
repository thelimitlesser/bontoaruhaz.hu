"use client";

import { HelpCircle, Truck, ShieldCheck, CreditCard, Settings, Box, Search, Globe, Mail, ChevronDown, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { 
            category: "Szállítás és Átvétel",
            questions: [
                { 
                    q: "Mennyi a szállítási idő?", 
                    a: "A Pannon XP futárszolgálattal általában a rendelés leadásától számított 1-3 munkanapon belül megérkezik a csomag. Célunk a lehető leggyorsabb kiszolgálás, így a raktáron lévő termékeket általában 24-48 órán belül átadjuk a futárnak.",
                    icon: <Truck className="w-5 h-5" />
                },
                { 
                    q: "Személyesen is átvehetem a rendelésemet?", 
                    a: "Igen, telephelyünkön (8111 Seregélyes-Jánosmajor) ingyenesen átvehető minden megrendelt alkatrész. Kérjük, várd meg az értesítő e-mailt, amiben jelezzük, hogy az alkatrész készen áll az átvételre!",
                    icon: <MapPin className="w-5 h-5" />
                }
            ]
        },
        {
            category: "Garancia és Visszaküldés",
            questions: [
                { 
                    q: "Van garancia a használt alkatrészekre?", 
                    a: "Igen, minden nálunk vásárolt alkatrészre 2 hét (14 nap) beépítési garanciát vállalunk. Ha a szakszerű beszerelés során kiderül, hogy a termék hibás, visszavesszük és visszatérítjük a teljes vételárat.",
                    icon: <ShieldCheck className="w-5 h-5" />
                },
                { 
                    q: "Mi a teendő, ha nem jó az alkatrész?", 
                    a: "Vegye fel velünk a kapcsolatot a +36 70 612 1277-es számon vagy az info@bontoaruhaz.hu e-mail címen. A terméket 14 napon belül, sértetlen védőjelzésekkel (festés, matrica) tudjuk visszavenni. Utánvéttel feladott csomagot nem áll módunkban átvenni.",
                    icon: <Box className="w-5 h-5" />
                }
            ]
        },
        {
            category: "Fizetés és Számlázás",
            questions: [
                { 
                    q: "Milyen fizetési módok közül választhatok?", 
                    a: "Fizethetsz biztonságos bankkártyás fizetéssel a Stripe rendszerén keresztül, utánvéttel a futárnál (készpénz vagy kártya), illetve személyes átvétel esetén készpénzzel vagy kártyával a helyszínen.",
                    icon: <CreditCard className="w-5 h-5" />
                },
                { 
                    q: "Kapok számlát a vásárlásról? Céges számla kérhető?", 
                    a: "Igen, minden vásárlásról elektronikus számlát állítunk ki, amit e-mailben küldünk el. A pénztár oldalon lehetőség van céges számla igénylésére is az adószám megadásával. Invoicunkat a Billingo rendszere állítja ki.",
                    icon: <Mail className="w-5 h-5" />
                }
            ]
        },
        {
            category: "Termékinformációk",
            questions: [
                { 
                    q: "Honnan származnak az alkatrészek?", 
                    a: "Minden alkatrészünk saját bontásból származik. Bevizsgált, szakszerűen kiszerelt és fedett helyen tárolt termékeket értékesítünk.",
                    icon: <Search className="w-5 h-5" />
                },
                { 
                    q: "Valódi fotók vannak az oldalon?", 
                    a: "Igen, minden egyes termékünket egyedileg fotózzuk le, így pontosan azt az alkatrészt kapja meg, amit a képeken lát. Nem használunk katalógusképeket vagy illusztrációkat.",
                    icon: <Box className="w-5 h-5" />
                },
                { 
                    q: "Hogyan tudok keresni a webshopban?", 
                    a: "Kereshetsz az autó márkája és modellje alapján a főoldali választóval, vagy ha tudod a gyári számot, a felső keresőmezőbe beírva azonnal megtalálhatod a pontos alkatrészt.",
                    icon: <Search className="w-5 h-5" />
                }
            ]
        }
    ];

    // Flatten for simple indexing
    const allFaqs = faqs.flatMap(cat => cat.questions);

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold mb-4">
                        <HelpCircle className="w-3.5 h-3.5" />
                        ÜGYFÉLSZOLGÁLAT
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                        Gyakori Kérdések
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Összegyűjtöttük a legfontosabb válaszokat a szállításról, garanciáról és termékeinkről, hogy megkönnyítsük a vásárlást.
                    </p>
                </header>

                <div className="space-y-10">
                    {faqs.map((category, catIdx) => (
                        <div key={catIdx} className="space-y-4">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-widest pl-2 border-l-4 border-[var(--color-primary)]">
                                {category.category}
                            </h2>
                            <div className="space-y-3">
                                {category.questions.map((faq, qIdx) => {
                                    // Calculate global index
                                    let globalIdx = qIdx;
                                    for(let i=0; i<catIdx; i++) globalIdx += faqs[i].questions.length;

                                    const isOpen = openIndex === globalIdx;

                                    return (
                                        <div 
                                            key={qIdx} 
                                            className={`glass-panel rounded-2xl border transition-all duration-300 ${isOpen ? 'border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/5' : 'border-border hover:border-gray-400'}`}
                                        >
                                            <button 
                                                onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                                                className="w-full text-left p-6 flex items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-[var(--color-primary)] text-white' : 'bg-foreground/5 text-muted'}`}>
                                                        {faq.icon}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">{faq.q}</h3>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''}`} />
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="px-6 pb-6 pt-0 ml-14">
                                                    <p className="text-muted leading-relaxed text-base font-medium">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-3xl p-8 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">Nem találta meg a választ?</h3>
                    <p className="text-muted mb-6">Keressen minket bizalommal, kollégáink szívesen segítenek!</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="tel:+36706121277" className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:scale-105 transition-all">
                            <Phone className="w-5 h-5" /> +36 70 612 1277
                        </a>
                        <a href="mailto:info@bontoaruhaz.hu" className="flex items-center gap-2 px-6 py-3 bg-white border border-border text-foreground font-bold rounded-xl hover:bg-gray-50 transition-all">
                            <Mail className="w-5 h-5 text-[var(--color-primary)]" /> info@bontoaruhaz.hu
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
