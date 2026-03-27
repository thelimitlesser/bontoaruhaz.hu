"use client";

import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export function LoadingOverlay({ isVisible, message = "Mentés folyamatban..." }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm cursor-wait"
                >
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4 max-w-xs text-center scale-110">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-12 h-12 text-orange-600 animate-spin relative z-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">{message}</h3>
                            <p className="text-sm text-gray-500 font-medium">Ez eltarthat egy kis ideig a képek feldolgozása miatt. Kérjük ne zárja be az ablakot!</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
