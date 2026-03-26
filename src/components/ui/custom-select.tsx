"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

interface Option {
    value: string;
    label: string;
    group?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    label?: string;
    theme?: "light" | "dark";
    className?: string; // Added for flexibility
}

export function CustomSelect({ value, onChange, options, label, theme = "light", className }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    // Grouping the options
    const groupedOptions = options.reduce((acc, option) => {
        const groupKey = option.group || 'Alap';
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(option);
        return acc;
    }, {} as Record<string, Option[]>);

    const hasGroups = Object.keys(groupedOptions).length > 1 || (Object.keys(groupedOptions).length === 1 && Object.keys(groupedOptions)[0] !== 'Alap');

    return (
        <div className={clsx("relative w-full", className)} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all outline-none font-bold",
                    theme === "light" 
                        ? "bg-gray-50 border-gray-200 text-gray-900 hover:border-orange-300" 
                        : "bg-foreground/5 border-border text-foreground",
                    isOpen && "border-orange-500 ring-2 ring-orange-500/10 shadow-sm"
                )}
            >
                <span>{selectedOption?.label || "Válassz..."}</span>
                <ChevronDown className={clsx("w-4 h-4 transition-transform text-gray-400", isOpen && "rotate-180 text-orange-500")} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 origin-top max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {hasGroups ? (
                        Object.entries(groupedOptions).map(([group, groupOptions]) => (
                            <div key={group} className="flex flex-col">
                                <div className="sticky top-0 z-10 font-black text-[9px] uppercase tracking-[0.15em] px-4 py-2 bg-gray-50/95 backdrop-blur-md text-gray-400 border-b border-gray-100">
                                    {group}
                                </div>
                                {groupOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={clsx(
                                            "w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between group",
                                            value === opt.value 
                                                ? "bg-orange-50 text-orange-600 font-bold" 
                                                : "text-gray-700 hover:bg-gray-50 hover:text-orange-500"
                                        )}
                                    >
                                        {opt.label}
                                        {value === opt.value && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        ))
                    ) : (
                        options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between group",
                                    value === opt.value 
                                        ? "bg-orange-50 text-orange-600 font-bold" 
                                        : "text-gray-700 hover:bg-gray-50 hover:text-orange-500"
                                )}
                            >
                                {opt.label}
                                {value === opt.value && <Check className="w-4 h-4" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
