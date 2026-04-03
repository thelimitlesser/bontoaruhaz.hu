"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { recordSearch } from "@/app/actions/analytics";

export function InventoryFilters({
    makes,
    models,
    partItems
}: {
    makes: { value: string; label: string }[];
    models: { value: string; label: string; group?: string }[];
    partItems: { value: string; label: string }[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");
    const [selectedMake, setSelectedMake] = useState(searchParams.get("make")?.toString() || "");
    const [selectedModel, setSelectedModel] = useState(searchParams.get("model")?.toString() || "");
    const [selectedPartItem, setSelectedPartItem] = useState(searchParams.get("partItem")?.toString() || "");

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
                newParams.delete("model");
                newParams.delete("partItem");
            }

            if (selectedModel) {
                newParams.set("model", selectedModel);
            } else {
                newParams.delete("model");
                newParams.delete("partItem");
            }

            if (selectedPartItem) {
                newParams.set("partItem", selectedPartItem);
            } else {
                newParams.delete("partItem");
            }

            // Always reset to page 1 when filtering
            if (newParams.toString() !== currentParams.toString()) {
                newParams.set("page", "1");
                startTransition(() => {
                    router.replace(`/admin/inventory?${newParams.toString()}`, { scroll: false });
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, selectedMake, selectedModel, selectedPartItem, router, searchParams]);

    return (
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex flex-col gap-4">
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keresés cikkszám, referencia vagy név alapján..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 placeholder-gray-500 font-medium transition-colors" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="w-full">
                    <SearchableSelect
                        placeholder="Minden Márka"
                        options={makes}
                        value={selectedMake}
                        onChange={(val) => {
                            setSelectedMake(val);
                            setSelectedModel("");
                            setSelectedPartItem("");
                        }}
                    />
                </div>
                <div className="w-full">
                    <SearchableSelect
                        placeholder="Minden Modell"
                        disabled={!selectedMake}
                        options={models}
                        value={selectedModel}
                        onChange={(val) => {
                            setSelectedModel(val);
                            setSelectedPartItem("");
                        }}
                    />
                </div>
                <div className="w-full">
                    <SearchableSelect
                        placeholder="Minden Alkatrész"
                        options={partItems}
                        value={selectedPartItem}
                        onChange={setSelectedPartItem}
                    />
                </div>
            </div>
        </div>
    );
}
