"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/lib/mock-data";
import { reservePart, releaseReservation } from "@/app/actions/reservation";

export interface CartItem extends Product {
    quantityInCart: number;
    reservedUntil?: number; // timestamp
}

interface CartContextType {
    items: CartItem[];
    sessionId: string | null;
    addItem: (product: Product) => Promise<boolean>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Initialize session and load cart
    useEffect(() => {
        setIsMounted(true);
        let currentSessionId = localStorage.getItem("autonexus-session-id");
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem("autonexus-session-id", currentSessionId);
        }
        setSessionId(currentSessionId);

        const savedCart = localStorage.getItem("autonexus-cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Filter out expired items immediately on load
                const now = Date.now();
                const activeItems = parsed.filter((item: CartItem) => {
                    if (!item.reservedUntil) return true; // Legacy items
                    return item.reservedUntil > now;
                });
                
                if (activeItems.length !== parsed.length) {
                    // Some items expired
                    alert("Bizonyos termékek foglalási ideje lejárt, így törlődtek a kosaradból.");
                }
                setItems(activeItems);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("autonexus-cart", JSON.stringify(items));
        }
    }, [items, isMounted]);

    // Timer to automatically remove expired reservations from the cart UI
    useEffect(() => {
        if (!isMounted || items.length === 0) return;

        const interval = setInterval(() => {
            const now = Date.now();
            let hasExpired = false;
            
            setItems(prev => {
                const activeItems = prev.filter(item => {
                    if (!item.reservedUntil) return true;
                    if (item.reservedUntil <= now) {
                        hasExpired = true;
                        return false;
                    }
                    return true;
                });
                
                if (hasExpired) {
                    // Optional: could trigger a softer toast here
                    alert("Egy vagy több termék foglalási ideje lejárt, kikerültek a kosaradból.");
                    return activeItems;
                }
                return prev;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [items, isMounted]);


    const addItem = async (product: Product): Promise<boolean> => {
        if (!sessionId) return false;

        // Try server-side reservation first
        const res = await reservePart(product.id, sessionId);
        
        if (!res.success || !res.expiresAt) {
            alert(res.error || "Hiba történt a foglalás során.");
            return false;
        }

        const expiresAt = new Date(res.expiresAt).getTime();

        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantityInCart: item.quantityInCart + 1, reservedUntil: expiresAt }
                        : item
                );
            }
            return [...prev, { ...product, quantityInCart: 1, reservedUntil: expiresAt }];
        });
        
        setIsCartOpen(true);
        return true;
    };

    const removeItem = async (productId: string) => {
        if (sessionId) {
            // Fire and forget server-side release
            releaseReservation(productId, sessionId).catch(console.error);
        }
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        // We could theoretically loop through and release all, but checkout also clears cart
        // so we'll leave actual release to the backend logic in checkout/cleanup
        setItems([]);
    };

    const totalPrice = items.reduce(
        (total, item) => total + item.price * item.quantityInCart,
        0
    );

    const totalItems = items.reduce(
        (total, item) => total + item.quantityInCart,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                sessionId,
                addItem,
                removeItem,
                clearCart,
                totalPrice,
                totalItems,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
