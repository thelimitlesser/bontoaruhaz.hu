import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { SearchResultsContent } from "@/components/search-results-content";
import { Loader2 } from "lucide-react";

export async function generateMetadata({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    try {
        const resolvedParams = await searchParams;
        const query = resolvedParams.query as string | undefined;
        const brand = resolvedParams.brand as string | undefined;

        let title = "Keresési eredmények | Bontóáruház";
        let description = "Keressen minőségi bontott autóalkatrészeket garanciával. Több ezer alkatrész készleten minden autó típushoz.";

        if (query) {
            title = `Találatok a(z) "${query}" kifejezésre | Bontóáruház`;
            description = `Fedezze fel a legjobb bontott autóalkatrész ajánlatokat a(z) "${query}" kifejezésre. 14 napos garancia és gyors házhozszállítás.`;
        } else if (brand) {
            title = `${brand} Bontott Alkatrészek | Bontóáruház`;
            description = `Minőségi bontott ${brand} alkatrészek széles választékban. Motoralkatrészek, karosszéria elemek és egyebek garanciával Seregélyesről.`;
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
            }
        };
    } catch (error) {
        return {
            title: "Alkatrész kereső | Bontóáruház",
            description: "Használja intelligens keresőnket a tökéletes bontott autóalkatrész megtalálásához. 14 napos pénzvisszafizetési garancia minden termékre."
        };
    }
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <Navbar />
            <main className="min-h-[800px] flex flex-col">
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
                    </div>
                }>
                    <SearchResultsContent />
                </Suspense>
            </main>
        </div>
    );
}
