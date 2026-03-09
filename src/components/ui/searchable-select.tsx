"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import clsx from "clsx";

interface Option {
    value: string;
    label: string;
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

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.group && option.group.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        <div className="relative" ref={containerRef}>
            {name && <input type="hidden" name={name} value={value} />}
            {label && <label className="block text-xs text-muted mb-1 ml-1">{label}</label>}

            <button
                type="button" onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx("w-full text-left rounded-lg px-4 py-3 flex items-center justify-between transition-all outline-none border", // changed rounded-xl to rounded-lg to match other admin inputs
                    disabled ? "opacity-50 cursor-not-allowed border-transparent text-muted" :
                        theme === "dark" ? "bg-foreground/5 border-border text-foreground hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)]" : "bg-gray-50 border-gray-200 text-gray-900 hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)]",
                    isOpen && "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]")}
            >
                <span className={clsx("block truncate", !selectedOption && (theme === "dark" ? "text-muted" : "text-gray-500"))}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180", theme === "dark" ? "text-muted" : "text-gray-500")} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={clsx("absolute z-50 w-full mt-2 border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top",
                    theme === "dark" ? "bg-background/95 backdrop-blur-xl border-border" : "bg-white border-gray-200")}>

                    {/* Search Input */}
                    <div className={clsx("p-2 border-b sticky top-0 z-10", theme === "dark" ? "border-border bg-background/95" : "border-gray-200 bg-white")}>
                        <div className="relative">
                            <Search className={clsx("absolute left-3 top-2.5 w-4 h-4", theme === "dark" ? "text-muted" : "text-gray-400")} />
                            <input
                                ref={inputRef}
                                type="text" className={clsx("w-full border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors",
                                    theme === "dark" ? "bg-foreground/5 text-foreground placeholder-muted focus:bg-foreground/10" : "bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-gray-100")}
                                placeholder="Keresés..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className={clsx("max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-track-transparent", theme === "dark" ? "scrollbar-thumb-foreground/20" : "scrollbar-thumb-gray-200")}>
                        {filteredOptions.length === 0 ? (
                            <div className={clsx("px-4 py-8 text-center text-sm", theme === "dark" ? "text-muted" : "text-gray-500")}>
                                Nincs találat.
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
                                                            type="button" className={clsx("w-full text-left px-5 py-2 text-sm transition-colors flex items-center justify-between group",
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
                                                    type="button" className={clsx("w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group",
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
