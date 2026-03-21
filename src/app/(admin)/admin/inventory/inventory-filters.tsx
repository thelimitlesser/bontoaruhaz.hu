"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { recordSearch } from "@/app/actions/analytics";

export function InventoryFilters({
    makes,
    models
}: {
    makes: { value: string; label: string }[];
    models: { value: string; label: string; group?: string }[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");
    const [selectedMake, setSelectedMake] = useState(searchParams.get("make")?.toString() || "");
    const [selectedModel, setSelectedModel] = useState(searchParams.get("model")?.toString() || "");

    // Memoize the current params to avoid infinite loops
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(searchParams.toString());
            const newParams = new URLSearchParams(searchParams.toString());

            if (query) {
                newParams.set("q", query);
                // Log the search for demand sensing
                if (query.length > 2) {
                    recordSearch(query);
                }
            } else {
                newParams.delete("q");
            }

            if (selectedMake) {
                newParams.set("make", selectedMake);
            } else {
                newParams.delete("make");
            }

            if (selectedModel) {
                newParams.set("model", selectedModel);
            } else {
                newParams.delete("model");
            }

            // Only navigate if parameters actually changed to avoid infinite RSC loops
            if (newParams.toString() !== currentParams.toString()) {
                startTransition(() => {
                    router.replace(`/admin/inventory?${newParams.toString()}`, { scroll: false });
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, selectedMake, selectedModel, router, searchParams]);

    return (
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keresés... (Pl. Generátor, 03L903023F, Audi A4)" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 placeholder-gray-500 font-medium transition-colors" />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
                <div className="min-w-[180px] flex-1 md:flex-none">
                    <SearchableSelect
                        placeholder="Minden Márka"
                        options={makes}
                        value={selectedMake}
                        onChange={(val) => {
                            setSelectedMake(val);
                            setSelectedModel("");
                        }}
                    />
                </div>
                <div className="min-w-[180px] flex-1 md:flex-none">
                    <SearchableSelect
                        placeholder="Minden Modell"
                        disabled={!selectedMake}
                        options={models}
                        value={selectedModel}
                        onChange={setSelectedModel}
                    />
                </div>
            </div>
        </div>
    );
}
