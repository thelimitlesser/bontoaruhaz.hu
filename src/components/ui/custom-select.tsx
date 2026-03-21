"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    label?: string;
    theme?: "light" | "dark";
}

export function CustomSelect({ value, onChange, options, label, theme = "light" }: CustomSelectProps) {
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

    return (
        <div className="relative w-full" ref={containerRef}>
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
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 origin-top">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={clsx(
                                "w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group",
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
            )}
        </div>
    );
}
