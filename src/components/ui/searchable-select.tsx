"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X, Info } from "lucide-react";
import clsx from "clsx";
import { fuzzyMatch, findClosestMatches } from "@/lib/string-similarity";
import { expandQueryWithSynonyms } from "@/utils/query-utils";
import { calculateTechnicalScore } from "@/utils/ranking-utils";

interface Option {
    value: string;
    label: string;
    keywords?: string[]; // Optional keywords for improved searchability
    group?: string; // Optional grouping capability
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    name?: string;
    theme?: "dark" | "light";
    variant?: "default" | "minimal";
    hideAllOption?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Válassz...",
    disabled = false,
    label,
    name,
    theme = "dark",
    variant = "default",
    hideAllOption = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setSearchQuery(""); // Reset search on close
        }
    }, [isOpen]);

    // 1. Filter and 2. Sort by score
    const filteredOptions = useMemo(() => {
        const query = searchQuery;
        if (!query) return options;

        const filtered = options.filter((option) => {
            // Fuzzy match on label/group/keywords
            const labelMatch = fuzzyMatch(option.label, query);
            const keywordMatch = option.keywords?.some(kw => fuzzyMatch(kw, query));
            const groupMatch = option.group && fuzzyMatch(option.group, query);
            if (labelMatch || keywordMatch || groupMatch) return true;

            // Synonym expansion match
            const expandedTerms = expandQueryWithSynonyms(query);
            const synonymMatch = expandedTerms.some(forms => 
                forms.some(form => 
                    option.label.toLowerCase().includes(form.toLowerCase()) ||
                    option.keywords?.some(kw => kw.toLowerCase().includes(form.toLowerCase()))
                )
            );

            return synonymMatch;
        });

        // Add scores and sort
        return filtered.map(option => ({
            ...option,
            score: calculateTechnicalScore(option.label, query)
        })).sort((a, b) => b.score - a.score);
    }, [options, searchQuery]);

    // Closest match logic for "Did you mean" behavior
    const closeMatches = searchQuery.length >= 3 && filteredOptions.length === 0 
        ? findClosestMatches(searchQuery, options.map(o => o.label), 0.5)
        : [];

    const selectedOption = options.find((o) => o.value === value);

    // Grouping the options
    const groupedOptions = filteredOptions.reduce((acc, option) => {
        const groupKey = option.group || 'Egyéb';
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(option);
        return acc;
    }, {} as Record<string, Option[]>);

    const hasGroups = Object.keys(groupedOptions).length > 1 || (Object.keys(groupedOptions).length === 1 && Object.keys(groupedOptions)[0] !== 'Egyéb');


    return (
        <div className={clsx("relative w-full", isOpen && "z-20")} ref={containerRef}>
            {name && <input type="hidden" name={name} value={value} />}
            {label && <label className="block text-xs text-muted mb-1 ml-1">{label}</label>}

            <div className="relative group/select">
                <button
                    type="button" onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={clsx(
                        "w-full text-left flex items-center transition-all outline-none",
                        variant === "minimal" ? "justify-center" : "rounded-lg px-4 py-3 border justify-between",
                        // Base styles by variant
                        variant === "minimal" 
                            ? "bg-transparent border-none px-2 py-3" 
                            : theme === "dark" 
                                ? "bg-foreground/5 border-border" 
                                : "bg-gray-50 border-gray-200",
                        // State styles
                        disabled 
                            ? "opacity-50 cursor-not-allowed text-muted" 
                            : "hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)]",
                        // Text colors by theme
                        !disabled && (theme === "dark" ? "text-foreground" : "text-gray-900"),
                        // Active state
                        isOpen && variant !== "minimal" && "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                    )}
                >
                    <div className={clsx("flex items-center gap-2 min-w-0 px-2", variant === "minimal" ? "justify-center w-full" : "")}>
                        <span className={clsx("truncate font-medium transition-colors",
                            variant === "minimal" && "text-center flex-1",
                            !selectedOption
                                ? (theme === "dark" ? "text-muted" : "text-gray-400")
                                : "text-[var(--color-primary)]"
                        )}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {!selectedOption || isOpen ? (
                            <ChevronDown className={clsx("w-3.5 h-3.5 shrink-0 transition-transform",
                                isOpen && "rotate-180",
                                selectedOption ? "text-[var(--color-primary)]/70" : (theme === "dark" ? "text-muted" : "text-gray-400")
                            )} />
                        ) : (
                            <div className="w-3.5 h-3.5" /> // Spacer for X
                        )}
                    </div>
                </button>

                {/* Clear Button (X) */}
                {selectedOption && !isOpen && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className={clsx(
                            "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-foreground/10 transition-colors z-10",
                            theme === "dark" ? "text-muted hover:text-foreground" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={clsx("absolute z-[100] left-0 right-0 mt-2 border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top",
                    theme === "dark" ? "bg-background/95 backdrop-blur-xl border-border" : "bg-white border-gray-200")}>

                    {/* Search Input */}
                    <div className={clsx("p-2 border-b sticky top-0 z-10", theme === "dark" ? "border-border bg-background/95" : "border-gray-200 bg-white")}>
                        <div className="relative">
                            <Search className={clsx("absolute left-3 top-2.5 w-4 h-4", theme === "dark" ? "text-muted" : "text-gray-400")} />
                            <input
                                ref={inputRef}
                                type="text" className={clsx("w-full border border-transparent rounded-lg pl-9 pr-3 py-2 text-base sm:text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors",
                                    theme === "dark" ? "bg-foreground/5 text-foreground placeholder-muted focus:bg-foreground/10" : "bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-gray-100")}
                                placeholder="Keresés..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className={clsx("min-h-[185px] max-h-[185px] overflow-y-auto scrollbar-thin scrollbar-track-transparent rounded-b-xl flex flex-col", theme === "dark" ? "scrollbar-thumb-foreground/20" : "scrollbar-thumb-gray-200")}>
                        
                        {/* "ALL" / "TOTAL" clear option at the top */}
                        {!searchQuery && !hideAllOption && (
                            <button
                                type="button"
                                className={clsx("w-full text-left px-5 py-3 text-sm font-bold border-b transition-colors shrink-0",
                                    !value 
                                        ? theme === "dark" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                        : theme === "dark" ? "text-muted hover:bg-foreground/5 hover:text-foreground" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                                    theme === "dark" ? "border-border" : "border-gray-100"
                                )}
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                            >
                                {placeholder === "Modell" ? "Minden Modell" : placeholder === "Márka" ? "Minden Márka" : "Összes / Alaphelyzet"}
                            </button>
                        )}
                        {filteredOptions.length === 0 ? (
                            <div className="flex flex-col">
                                <div className={clsx("px-4 py-8 text-center text-sm", theme === "dark" ? "text-muted" : "text-gray-500")}>
                                    Nincs találat.
                                </div>
                                
                                {/* "Did you mean" suggestions */}
                                {closeMatches.length > 0 && (
                                    <div className={clsx("px-4 pb-6", theme === "dark" ? "bg-foreground/5" : "bg-gray-50")}>
                                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                                            <Info className="w-3 h-3" /> Erre gondoltál?
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {closeMatches.slice(0, 3).map((match) => (
                                                <button
                                                    key={match.word}
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchQuery(match.word);
                                                        // We don't close yet, let the user see the match
                                                    }}
                                                    className={clsx(
                                                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                        theme === "dark" 
                                                            ? "bg-foreground/10 border-border text-foreground hover:bg-[var(--color-primary)]/20 hover:border-[var(--color-primary)]" 
                                                            : "bg-white border-gray-200 text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                                    )}
                                                >
                                                    {match.word}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {hasGroups ? (
                                    Object.entries(groupedOptions).map(([group, groupOptions]) => (
                                        <div key={group} className="flex flex-col">
                                            <div className={clsx("sticky top-0 z-10 font-black text-[9px] uppercase tracking-[0.15em] px-4 py-2 opacity-90 backdrop-blur-md border-b",
                                                theme === "dark" ? "bg-background/95 text-muted border-border" : "bg-gray-100 text-gray-500 border-gray-200")}>
                                                {group}
                                            </div>
                                            <ul className="py-1">
                                                {groupOptions.map((option) => (
                                                    <li key={option.value}>
                                                        <button
                                                            type="button" className={clsx("w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between group",
                                                                value === option.value
                                                                    ? theme === "dark" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" : theme === "dark" ? "text-foreground hover:bg-foreground/5 hover:text-[var(--color-primary)]" : "text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]")}
                                                            onClick={() => {
                                                                onChange(option.value);
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            {option.label}
                                                            {value === option.value && <Check className="w-4 h-4" />}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <ul className="py-1">
                                        {filteredOptions.map((option) => (
                                            <li key={option.value}>
                                                <button
                                                    type="button" className={clsx("w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between group",
                                                        value === option.value
                                                            ? theme === "dark" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" : theme === "dark" ? "text-foreground hover:bg-foreground/5 hover:text-[var(--color-primary)]" : "text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]")}
                                                    onClick={() => {
                                                        onChange(option.value);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    {option.label}
                                                    {value === option.value && <Check className="w-4 h-4" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
