"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="relative inline-flex items-center justify-center p-2 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/50"
                aria-label="Theme toggle loading"
            >
                <span className="sr-only">Loading theme</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative inline-flex items-center justify-center p-2 w-10 h-10 rounded-full transition-all duration-300
                 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 
                 text-foreground/80 hover:text-foreground
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[var(--color-secondary)] absolute" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
