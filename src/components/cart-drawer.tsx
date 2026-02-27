"use client";

import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
    const { items, removeItem, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    // Prevent scrolling when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0c0c16] border-l border-white/10 z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
                        Kosár
                        <span className="text-sm font-normal text-gray-500 ml-2">({items.length} termék)</span>
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
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
                                className="text-[var(--color-primary)] font-bold hover:underline"
                            >
                                Vásárlás folytatása
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                                {/* Image */}
                                <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0 relative">
                                    {/* Using standard img for reliability with mock data quirks */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
                                            {item.brand} {item.model} {item.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 font-mono">{item.sku}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-[var(--color-primary)] font-bold text-sm flex items-center gap-2">
                                            <span className="text-gray-400 text-xs font-normal bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{item.quantityInCart} db</span>
                                            <span>{item.price.toLocaleString("hu-HU")} Ft</span>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                            title="Törlés"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between text-gray-400">
                                <span>Részösszeg</span>
                                <span>{totalPrice.toLocaleString("hu-HU")} Ft</span>
                            </div>
                            <div className="flex items-center justify-between text-white text-lg font-bold">
                                <span>Összesen</span>
                                <span>{totalPrice.toLocaleString("hu-HU")} Ft</span>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                A szállítási költség a következő lépésben kerül kiszámításra.
                            </p>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="w-full block bg-[var(--color-primary)] hover:bg-orange-600 text-white text-center font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[var(--color-primary)]/20"
                        >
                            TOVÁBB A PÉNZTÁRHOZ
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
