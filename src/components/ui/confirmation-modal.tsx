"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'success' | 'warning';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Megerősítés",
    cancelText = "Mégse",
    variant = 'primary'
}: ConfirmationModalProps) {
    
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const variants = {
        primary: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            bg: "bg-blue-50",
            button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
            border: "border-blue-100"
        },
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            bg: "bg-red-50",
            button: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
            border: "border-red-100"
        },
        success: {
            icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
            bg: "bg-emerald-50",
            button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
            border: "border-emerald-100"
        },
        warning: {
            icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
            bg: "bg-amber-50",
            button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
            border: "border-amber-100"
        }
    };

    const currentVariant = variants[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
                    >
                        {/* Header with Icon */}
                        <div className={`p-8 ${currentVariant.bg} dark:bg-opacity-10 flex flex-col items-center text-center gap-4`}>
                            <div className={`p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border ${currentVariant.border} dark:border-white/5`}>
                                {currentVariant.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                {title}
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed text-center">
                                {description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-6 py-3.5 ${currentVariant.button} text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg`}
                            >
                                {confirmText}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
