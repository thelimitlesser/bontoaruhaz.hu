"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export function OrderSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(searchParams.toString());
            const newParams = new URLSearchParams(searchParams.toString());

            if (query) {
                newParams.set("q", query);
            } else {
                newParams.delete("q");
            }

            // Always reset to page 1 when searching
            if (newParams.toString() !== currentParams.toString()) {
                newParams.set("page", "1");
                startTransition(() => {
                    router.replace(`/admin/orders?${newParams.toString()}`, { scroll: false });
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, router, searchParams]);

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className={`w-4 h-4 ${query ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Név, e-mail vagy rendelésszám..." 
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm text-gray-900 dark:text-white placeholder-gray-500 font-medium transition-all shadow-sm"
            />
            {query && (
                <button 
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            {isPending && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
