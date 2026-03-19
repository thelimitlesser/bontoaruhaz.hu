"use client";

import { X, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function CountdownTimer({ expiresAt }: { expiresAt: number }) {
    const [timeLeft, setTimeLeft] = useState(expiresAt - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(expiresAt - Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (timeLeft <= 0) return <span className="text-red-500 font-bold">Lejárt</span>;

    const minutes = Math.floor((timeLeft / 1000) / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <span className={`${minutes < 3 ? 'text-red-500 animate-pulse' : 'text-orange-500'} font-bold tabular-nums`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
    );
}


export function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    // Prevent scrolling when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow ="hidden";
        } else {
            document.body.style.overflow ="unset";
        }
        return () => {
            document.body.style.overflow ="unset";
        };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[65]" onClick={() => setIsCartOpen(false)}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x:"100%" }}
                        animate={{ x: 0 }}
                        exit={{ x:"100%" }}
                        transition={{ type:"spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[full] sm:w-[450px] bg-background/90 backdrop-blur-2xl border-l border-border z-[70] flex flex-col shadow-2xl overflow-hidden" >
                        {/* Header */}
                        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-border bg-background/20 backdrop-blur-md">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                                <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
                                Kosár
                                <span className="text-sm font-normal text-muted tracking-normal normal-case ml-2">({items.length} termék)</span>
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 rounded-full hover:bg-foreground/5 transition-colors" >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                        <ShoppingBag className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 font-medium">A kosarad jelenleg üres.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-[var(--color-primary)] font-bold hover:underline" >
                                        Vásárlás folytatása
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group relative bg-muted/5 p-3 rounded-xl border border-border hover:bg-muted/10 transition-colors">
                                        {/* Timer Badge */}
                                        {item.reservedUntil && (
                                            <div className="absolute -top-2.5 -right-2 bg-background shadow-md text-[10px] px-2 py-0.5 rounded-full border border-border flex items-center gap-1.5 z-10">
                                                ⏱ <CountdownTimer expiresAt={item.reservedUntil} />
                                            </div>
                                        )}
                                        {/* Image */}
                                        <div className="w-20 h-20 bg-white rounded-lg border border-border overflow-hidden shrink-0 relative">
                                            {/* Using standard img for reliability with mock data quirks */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="text-foreground font-medium text-xs sm:text-sm leading-tight line-clamp-2">
                                                    {item.brand} {item.model} {item.name}
                                                </h3>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-mono">{item.sku}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex items-center bg-muted/20 border border-border rounded-lg overflow-hidden h-8 sm:h-9">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantityInCart - 1)}
                                                                className="px-2 sm:px-3 hover:bg-[var(--color-primary)]/10 text-muted hover:text-[var(--color-primary)] transition-colors h-full flex items-center justify-center border-r border-border"
                                                            >
                                                                <Minus className="w-3 h-3 h-4" />
                                                            </button>
                                                            <div className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-foreground min-w-[32px] sm:min-w-[40px] text-center bg-background/40">
                                                                {item.quantityInCart}
                                                            </div>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantityInCart + 1)}
                                                                disabled={item.quantityInCart >= item.quantity}
                                                                className={`px-2 sm:px-3 h-full flex items-center justify-center transition-colors ${
                                                                    item.quantityInCart >= item.quantity 
                                                                    ? "text-muted/30 cursor-not-allowed bg-muted/5" 
                                                                    : "hover:bg-[var(--color-primary)]/10 text-muted hover:text-[var(--color-primary)]"
                                                                }`}
                                                            >
                                                                <Plus className="w-3 h-3 h-4" />
                                                            </button>
                                                        </div>
                                                        {item.quantityInCart >= item.quantity && (
                                                            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-tighter">MAX</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[var(--color-primary)] font-bold text-xs sm:text-sm">
                                                        {item.price.toLocaleString("hu-HU")} Ft
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg" title="Törlés" >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-border bg-muted/5">
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-muted">
                                        <span>Részösszeg</span>
                                        <span>{totalPrice.toLocaleString("hu-HU")} Ft</span>
                                    </div>
                                    <div className="flex items-center justify-between text-foreground text-lg font-bold">
                                        <span>Összesen</span>
                                        <span>{totalPrice.toLocaleString("hu-HU")} Ft</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        A szállítási költség a következő lépésben kerül kiszámításra.
                                    </p>
                                </div>

                                <Link
                                    href="/checkout" onClick={() => setIsCartOpen(false)}
                                    className="w-full block bg-[var(--color-primary)] hover:bg-orange-600 text-white text-center font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[var(--color-primary)]/20" >
                                    TOVÁBB A PÉNZTÁRHOZ
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
