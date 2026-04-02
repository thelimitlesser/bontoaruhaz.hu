"use client";

import { useState } from "react";
import { ChevronDown, Phone, Mail, Clock } from "lucide-react";

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<string | null>("0-0");

    const faqs = [
        { 
            category: "Szállítás és Átvétel",
            id: "shipping",
            questions: [
                { 
                    q: "Mennyi a szállítási idő?", 
                    a: "A Pannon XP futárszolgálattal általában a rendelés leadásától számított 1-3 munkanapon belül megérkezik a csomag. Célunk a lehető leggyorsabb kiszolgálás, így a raktáron lévő termékeket általában 24-48 órán belül átadjuk a futárnak."
                },
                { 
                    q: "Személyesen is átvehetem a rendelésemet?", 
                    a: "Igen, telephelyünkön (8111 Seregélyes-Jánosmajor) ingyenesen átvehető minden megrendelt alkatrész. Kérjük, várd meg az értesítő e-mailt, amiben jelezzük, hogy az alkatrész készen áll az átvételre!"
                }
            ]
        },
        {
            category: "Garancia és Visszaküldés",
            id: "warranty",
            questions: [
                { 
                    q: "Van garancia a használt alkatrészekre?", 
                    a: "Igen, minden nálunk vásárolt alkatrészre 2 hét (14 nap) beépítési garanciát vállalunk. Ha a szakszerű beszerelés során kiderül, hogy a termék hibás, visszavesszük és visszatérítjük a teljes vételárat."
                },
                { 
                    q: "Mi a teendő, ha nem jó az alkatrész?", 
                    a: "Vegye fel velünk a kapcsolatot a +36 70 612 1277-es számon vagy az info@bontoaruhaz.hu e-mail címen. A terméket 14 napon belül, sértetlen védőjelzésekkel (festés, matrica) tudjuk visszavenni. Utánvéttel feladott csomagot nem áll módunkban átvenni."
                }
            ]
        },
        {
            category: "Fizetés és Számlázás",
            id: "payment",
            questions: [
                { 
                    q: "Milyen fizetési módok közül választhatok?", 
                    a: "Fizethetsz biztonságos bankkártyás fizetéssel a Stripe rendszerén keresztül, utánvéttel a futárnál (készpénz vagy kártya), illetve személyes átvétel esetén készpénzzel vagy kártyával a helyszínen."
                },
                { 
                    q: "Kapok számlát a vásárlásról? Céges számla kérhető?", 
                    a: "Igen, minden vásárlásról elektronikus számlát állítunk ki, amit e-mailben küldünk el. A pénztár oldalon lehetőség van céges számla igénylésére is az adószám megadásával. Invoicunkat a Billingo rendszere állítja ki."
                }
            ]
        },
        {
            category: "Termékinformációk",
            id: "products",
            questions: [
                { 
                    q: "Honnan származnak az alkatrészek?", 
                    a: "Minden alkatrészünk saját bontásból származik. Bevizsgált, szakszerűen kiszerelt és fedett helyen tárolt termékeket értékesítünk."
                },
                { 
                    q: "Valódi fotók vannak az oldalon?", 
                    a: "Igen, minden egyes termékünket egyedileg fotózzuk le, így pontosan azt az alkatrészt kapja meg, amit a képeken lát. Nem használunk katalógusképeket vagy illusztrációkat."
                },
                { 
                    q: "Hogyan tudok keresni a webshopban?", 
                    a: "Kereshetsz az autó márkája és modellje alapján a főoldali választóval, vagy ha tudod a gyári számot, a felső keresőmezőbe beírva azonnal megtalálhatod a pontos alkatrészt."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-white">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100/50 text-orange-600 text-xs font-bold mb-6 tracking-wider">
                        ÜGYFÉLSZOLGÁLAT
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Gyakori Kérdések
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Összegyűjtöttük a legfontosabb válaszokat a szállításról, garanciáról és termékeinkről, hogy megkönnyítsük a vásárlást.
                    </p>
                </header>

                <div className="space-y-12">
                    {faqs.map((category, catIdx) => (
                        <div key={catIdx} className="space-y-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest pl-4 border-l-4 border-orange-500">
                                {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((faq, qIdx) => {
                                    const uniqueId = `${catIdx}-${qIdx}`;
                                    const isOpen = openIndex === uniqueId;

                                    return (
                                        <div 
                                            key={qIdx} 
                                            className={`rounded-xl border border-gray-200 overflow-hidden transition-all ${isOpen ? 'ring-1 ring-orange-500 border-orange-500 shadow-sm' : 'hover:border-gray-300'}`}
                                        >
                                            <button 
                                                onClick={() => setOpenIndex(isOpen ? null : uniqueId)}
                                                className={`w-full text-left p-5 flex items-center justify-between gap-4 transition-colors ${isOpen ? 'bg-orange-50/30' : 'bg-gray-50/50'}`}
                                            >
                                                <h3 className={`text-lg font-bold ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>{faq.q}</h3>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
                                            </button>
                                            {isOpen && (
                                                <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                                    <p className="text-gray-600 leading-relaxed text-base font-medium">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer section with Opening Hours as requested */}
                <div className="mt-20 pt-12 border-t border-gray-100 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nem találta meg a választ?</h3>
                    <p className="text-gray-500 mb-8">Keressen minket bizalommal, kollégáink szívesen segítenek!</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
                            <Clock className="w-6 h-6 text-orange-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nyitvatartás</p>
                                <p className="text-gray-900 font-bold">H-P: 8:00 - 17:00</p>
                            </div>
                        </div>
                        <a href="tel:+36706121277" className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 hover:border-orange-200 transition-colors">
                            <Phone className="w-6 h-6 text-orange-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Telefonszám</p>
                                <p className="text-gray-900 font-bold">+36 70 612 1277</p>
                            </div>
                        </a>
                        <a href="mailto:info@bontoaruhaz.hu" className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 hover:border-orange-200 transition-colors">
                            <Mail className="w-6 h-6 text-orange-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email cím</p>
                                <p className="text-gray-900 font-bold">info@bontoaruhaz.hu</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
