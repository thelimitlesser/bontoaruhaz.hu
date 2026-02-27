"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { recordSearch } from "@/app/actions/analytics";

export function InventoryFilters({
    makes,
    models
}: {
    makes: { value: string; label: string }[];
    models: { value: string; label: string }[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");
    const [selectedMake, setSelectedMake] = useState(searchParams.get("make")?.toString() || "");
    const [selectedModel, setSelectedModel] = useState(searchParams.get("model")?.toString() || "");

    // Quick debounce implementation if hook doesn't exist
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set("q", query);
                // Log the search for demand sensing
                if (query.length > 2) {
                    recordSearch(query);
                }
            } else {
                params.delete("q");
            }
            if (selectedMake) {
                params.set("make", selectedMake);
            } else {
                params.delete("make");
            }
            if (selectedModel) {
                params.set("model", selectedModel);
            } else {
                params.delete("model");
            }

            startTransition(() => {
                router.replace(`/admin/inventory?${params.toString()}`);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [query, selectedMake, selectedModel, router, searchParams]);

    return (
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keresés... (Pl. Generátor, 03L903023F, Audi A4)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 placeholder-gray-500 font-medium transition-colors"
                />
            </div>
            <div className="flex gap-4">
                <select
                    value={selectedMake}
                    onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedModel(""); // Reset model when make changes
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-[var(--color-primary)] w-40"
                >
                    <option value="">Minden Márka</option>
                    {makes.map(make => (
                        <option key={make.value} value={make.value}>{make.label}</option>
                    ))}
                </select>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-[var(--color-primary)] w-40"
                >
                    <option value="">Minden Modell</option>
                    {models.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
