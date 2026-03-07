"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Disc, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getSearchProducts } from "@/app/actions/product";
import Image from "next/image";
import Link from "next/link";

type SearchMode = "ai" | "tire";

export function VehicleSelector() {
    const router = useRouter();

    // AI State
    const [aiQuery, setAiQuery] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    // Typewriter effect state
    const placeholderTexts = ["Pl.: 5G1 941 005", "Pl.: Audi a3 turbó", "Pl.: 2015-ös fekete Golf heteshez bal első LED lámpa", "Pl.: OPR kód alapján keresek...", "Pl.: Generátor VW Passathoz"];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const currentFullText = placeholderTexts[placeholderIndex];

        if (!isDeleting && currentText === currentFullText) {
            // Pause before deleting
            timer = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && currentText === "") {
            // Move to next text and start typing
            setIsDeleting(false);
            setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
            // Small pause before typing next
            timer = setTimeout(() => { }, 300);
        } else {
            // Typing or deleting
            const nextText = isDeleting
                ? currentFullText.substring(0, currentText.length - 1)
                : currentFullText.substring(0, currentText.length + 1);

            const typingSpeed = isDeleting ? 15 : Math.random() * 20 + 30; // Faster typing and deleting

            timer = setTimeout(() => {
                setCurrentText(nextText);
            }, typingSpeed);
        }

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, placeholderIndex]);

    // Autocomplete State
    const [instantResults, setInstantResults] = useState<any[]>([]);
    const [isInstantSearching, setIsInstantSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Instant Search
    useEffect(() => {
        if (aiQuery.trim().length < 3) {
            setInstantResults([]);
            setShowDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsInstantSearching(true);
            try {
                // Request a fast text-based search limited to 4 items
                const results = await getSearchProducts({
                    query: aiQuery.trim(),
                    take: 4
                });
                setInstantResults(results);
                setShowDropdown(results.length > 0);
            } catch (error) {
                console.error("Instant search error:", error);
            } finally {
                setIsInstantSearching(false);
            }
        }, 200); // 200ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [aiQuery]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // AI Search Path
        if (!aiQuery.trim()) return;

        setIsThinking(true);
        try {
            const res = await fetch("/api/ai-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: aiQuery })
            });

            if (!res.ok) throw new Error("API hiba");

            const filters = await res.json();

            // Construct URL parameters
            const params = new URLSearchParams();
            if (filters.sku) params.set("query", filters.sku);
            if (filters.query && !filters.sku) params.set("query", filters.query);

            // Mark that this was an AI search so the results page can show special UI
            params.set("ai_powered", "true");

            // Smart Routing based on AI results
            if (filters.brand && filters.model && filters.category) {
                // We have a full path: Brand -> Model -> Category
                if (filters.subcategory) params.set("subcat", filters.subcategory);
                if (filters.item) params.set("item", filters.item);
                router.push(`/brand/${filters.brand}/${filters.model}/${filters.category}?${params.toString()}`);
            } else if (filters.brand && filters.model) {
                // We have Brand -> Model
                router.push(`/brand/${filters.brand}/${filters.model}?${params.toString()}`);
            } else if (filters.brand) {
                // We only have Brand
                router.push(`/brand/${filters.brand}?${params.toString()}`);
            } else {
                // Fallback to general search if no brand was identified -> Now we alert the user instead of generic page
                alert("Nem találtunk pontos autómárkát a keresésben. Kérjük, írjon be egy autómárkát vagy modellt (pl. BMW E90) a pontosabb eredményekért!");
                setAiQuery(""); // optionally clear
            }

        } catch (error) {
            console.error(error);
            alert("Hiba történt a keresés feldolgozása közben. Kérjük, próbálja újra!");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="w-full max-w-full rounded-2xl shadow-2xl relative bg-white border border-gray-200 transform transition-all hover:shadow-[0_20px_50px_rgba(219,81,60,0.15)] duration-200 overflow-hidden">

            {/* Glowing top border specifically for AI */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-75 animate-pulse rounded-t-2xl" />

            <div className="p-3 sm:p-8 bg-white/90 backdrop-blur-sm rounded-2xl">
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:gap-6">

                    {/* --- AI SEARCH MODE --- */}
                    <div className="w-full relative group">
                        <label className="block text-[10px] sm:text-sm font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                            Kérdezd az Intelligens Keresőt:
                        </label>

                        <div className="relative flex items-center">
                            {/* Sparkle icon inside input */}
                            <div className="absolute left-3 sm:left-4 z-20 text-[var(--color-primary)]/80 animate-pulse pointer-events-none">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            {/* Dynamic placeholder background layer */}
                            {!aiQuery && (
                                <div className="absolute left-9 sm:left-11 right-12 z-20 text-gray-400 text-[12px] sm:text-lg pointer-events-none transition-opacity duration-300 flex items-center h-full pt-[1px]">
                                    <span className="truncate">{currentText}</span>
                                    <span className="animate-pulse ml-[1px] font-light text-gray-400">|</span>
                                </div>
                            )}

                            <input
                                type="text" className={clsx("w-full bg-white border-2 border-[var(--color-primary)]/30 pl-9 sm:pl-11 pr-12 sm:pr-16 py-2 sm:py-4 text-[14px] sm:text-lg text-gray-900 focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner h-[44px] sm:h-[60px] relative z-10",
                                    showDropdown
                                        ? "rounded-t-2xl rounded-b-none border-b-0" : "rounded-xl focus:ring-4 focus:ring-[var(--color-primary)]/10")}
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                onFocus={() => { if (instantResults.length > 0) setShowDropdown(true); }}
                                disabled={isThinking}
                                autoFocus
                                autoComplete="off" />

                            {/* Search Button Inside Input */}
                            <button
                                type="submit" disabled={isThinking || !aiQuery.trim()}
                                className={clsx("absolute right-1 sm:right-2 top-1 sm:top-2 bottom-1 sm:bottom-2 z-20 aspect-square rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                                    aiQuery.trim() && !isThinking
                                        ? "bg-[var(--color-primary)] text-white shadow-md hover:scale-105" : "bg-gray-100 text-gray-400")}
                            >
                                {isThinking ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                            </button>

                            {/* Autocomplete Dropdown */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 w-full mt-0 z-[100] bg-white rounded-b-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-t-[1px] border-[var(--color-primary)]/30 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto" >
                                    {isInstantSearching ? (
                                        <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                                            <span className="text-sm font-medium tracking-tight uppercase">Keresés a raktárkészletben...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Találatok</span>
                                                <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">{instantResults.length} termék</span>
                                            </div>

                                            {instantResults.map((product) => {
                                                const imageUrl = product.images ? product.images.split(',')[0] : 'https://placehold.co/100x100/1a1a1a/cccccc?text=NX';
                                                const yearRange = product.yearFrom || product.yearTo
                                                    ? `${product.yearFrom || '?'} - ${product.yearTo || '?'}` : null;

                                                return (
                                                    <Link
                                                        key={product.id}
                                                        href={`/product/${product.id}`}
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-4 p-4 hover:bg-orange-50/50 transition-all group border-b border-gray-50 last:border-0" >
                                                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[var(--color-primary)]/30 transition-colors">
                                                            <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-1 bg-white" />
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="text-[13px] font-bold text-gray-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
                                                                {product.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[11px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                    {product.cikkszam || product.id.slice(0, 8)}
                                                                </span>
                                                                {yearRange && (
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                        {yearRange}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors shrink-0">
                                                            <Search className="w-3.5 h-3.5" />
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>



                        {/* Explainer text */}
                        <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-3 animate-fade-in leading-relaxed px-2">
                            {isThinking ? "Az AI feldolgozza és kategorizálja a kérésedet..." : "Bármit beírhatsz az autóról vagy alkatrészről, az AI megérti és a megfelelő kategóriába irányít."}
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
