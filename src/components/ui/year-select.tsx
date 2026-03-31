"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

interface YearSelectProps {
    value: string;
    onChange: (year: string) => void;
    label?: string;
    placeholder?: string;
    minYear?: number;
    maxYear?: number;
}

export function YearSelect({ 
    value, 
    onChange, 
    label, 
    placeholder = "Válassz évet...",
    minYear = 2000,
    maxYear = 2030
}: YearSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate years array
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (maxYear - i).toString());

    // Filter years based on search
    const filteredYears = years.filter(year => year.includes(searchTerm));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Set search term to current value when opening
    useEffect(() => {
        if (isOpen && !searchTerm && value) {
            setSearchTerm(value);
        }
    }, [isOpen]);

    const handleSelect = (year: string) => {
        onChange(year);
        setSearchTerm("");
        setIsOpen(false);
    };

    return (
        <div className="relative space-y-2" ref={containerRef}>
            {label && <label className="text-sm border-b border-transparent font-medium text-gray-700">{label}</label>}
            
            <div 
                className={clsx(
                    "relative w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-colors cursor-text group",
                    isOpen ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" : "hover:border-gray-300"
                )}
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full bg-transparent px-4 py-3 outline-none text-gray-900 pr-10"
                    placeholder={value || placeholder}
                    value={isOpen ? searchTerm : value}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    // Clear value completely if user deletes everything and clicks away
                    onBlur={(e) => {
                         // Only clear if we're not clicking an option (handled by mouse down on the list item)
                         // This is tricky with pure React state, so relying on the handleClickOutside mostly.
                         // But if they type an invalid year and blur, revert to valid state.
                    }}
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer">
                    <ChevronDown className={clsx("w-5 h-5 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 py-1">
                    {filteredYears.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">Nincs találat</div>
                    ) : (
                        filteredYears.map((year) => (
                            <div
                                key={year}
                                className={clsx(
                                    "px-4 py-2.5 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-900 flex items-center justify-between transition-colors",
                                    value === year ? "bg-orange-100 text-orange-900 font-medium" : "text-gray-700"
                                )}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    handleSelect(year);
                                }}
                            >
                                <span>{year}</span>
                                {value === year && <Check className="w-4 h-4 text-orange-600" />}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
