"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";

interface DuplicateWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        productCode?: string;
        sku?: string;
    };
}

export function DuplicateWarningModal({ isOpen, onClose, product }: DuplicateWarningModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-red-600 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-white/20 relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <AlertTriangle className="w-12 h-12 text-white" />
                            </div>
                            
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">
                                VIGYÁZAT!
                            </h2>
                            <p className="text-red-100 font-bold text-lg mb-8 leading-tight">
                                Ez a termék már fel van töltve az adatbázisba!
                            </p>
                            
                            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 text-left space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-red-200">Megnevezés</label>
                                    <p className="font-bold text-lg leading-tight line-clamp-2">{product.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-red-200 text-xs">Hivatkozási szám</label>
                                        <p className="font-black text-xl">#{product.productCode}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-red-200 text-xs text-right">Cikkszám</label>
                                        <p className="font-black text-xl text-right truncate">{product.sku || 'Nincs'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-white text-red-600 font-black py-4 rounded-2xl text-lg uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
                            >
                                Értem, köszönöm
                            </button>
                            
                            <Link 
                                href={`/admin/inventory?id=${product.id}`}
                                target="_blank"
                                className="mt-4 text-white/70 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Megtekintés külön ablakban
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
