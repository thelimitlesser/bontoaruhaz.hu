"use client";

import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    progress?: number;
}

export function LoadingOverlay({ isVisible, message = "Mentés folyamatban...", progress }: LoadingOverlayProps) {
    const hasProgress = typeof progress === 'number';

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
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-16 h-16 text-orange-600 animate-spin relative z-10" />
                            {hasProgress && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <span className="text-[10px] font-black text-orange-900 bg-white/80 rounded-full px-1.5 py-0.5 shadow-sm">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">{message}</h3>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: hasProgress ? `${progress}%` : "100%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Ez eltarthat egy kis ideig a képek feldolgozása miatt. Kérjük ne zárja be az ablakot!</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
