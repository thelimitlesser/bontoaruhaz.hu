"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
    id: string;
    totalAmount: number;
    createdAt: Date | string;
    paymentMethod: string;
    user?: {
        fullName: string | null;
        email: string;
    } | null;
}

interface RevenueDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: OrderDetail[];
    periodLabel: string;
    totalRevenue: number;
}

export function RevenueDetailsModal({ isOpen, onClose, orders, periodLabel, totalRevenue }: RevenueDetailsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col pt-safe"
                    >
                        {/* Header */}
                        <div className="px-6 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
                                    </div>
                                    Befizetések: {periodLabel}
                                </h3>
                                <p className="text-gray-500 mt-1 font-medium italic">
                                    Összesen {orders.length} db sikeres tranzakció
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-gray-200 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Summary Bar */}
                        <div className="px-6 py-4 bg-[var(--color-primary)] text-white flex items-center justify-between shadow-inner">
                            <span className="font-bold uppercase tracking-widest text-xs opacity-80">Időszaki Összesített Bevétel</span>
                            <span className="text-2xl font-black">{totalRevenue.toLocaleString('hu-HU')} Ft</span>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-0">
                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="font-medium">Nincs kifizetett rendelés ebben az időszakban.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 block max-w-[70%]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                            order.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                            {order.paymentMethod === 'CARD' ? 'Kártyás' : 'Utánvét'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium lowercase">
                                                        <User className="w-3 h-3" />
                                                        {order.user?.fullName || order.user?.email || "Vendég Vásárló"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(order.createdAt).toLocaleString('hu-HU')}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <div className="text-lg font-black text-gray-900 tracking-tight">
                                                        {order.totalAmount.toLocaleString('hu-HU')} Ft
                                                    </div>
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Részletek <ArrowUpRight className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
