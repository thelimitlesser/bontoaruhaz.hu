"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
    updateQuantity: (productId: string, newQuantity: number) => Promise<boolean>;
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
        let currentSessionId = localStorage.getItem("bontoaruhaz-session-id");
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
            localStorage.setItem("bontoaruhaz-session-id", currentSessionId);
        }
        // Sync with cookie for SSR
        document.cookie = `bontoaruhaz-session-id=${currentSessionId}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        setSessionId(currentSessionId);

        const savedCart = localStorage.getItem("bontoaruhaz-cart");
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
                    console.log("Certain items have expired and were removed from the cart.");
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
            localStorage.setItem("bontoaruhaz-cart", JSON.stringify(items));
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
                    // Silent update to avoid disrupting checkout flow
                    console.log("One or more items have expired and were removed from the cart.");
                    return activeItems;
                }
                return prev;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [items, isMounted]);


    const addItem = useCallback(async (product: Product): Promise<boolean> => {
        if (!sessionId) return false;

        const existing = items.find(i => i.id === product.id);
        const newQuantity = (existing?.quantityInCart || 0) + 1;

        // Check against product stock
        if (newQuantity > product.quantity) {
            alert(`Sajnos ebből a termékből csak ${product.quantity} db érhető el.`);
            return false;
        }

        // Try server-side reservation
        const res = await reservePart(product.id, sessionId, newQuantity);
        
        if (!res.success || !res.expiresAt) {
            alert(res.error || "Hiba történt a foglalás során.");
            return false;
        }

        const expiresAt = new Date(res.expiresAt).getTime();

        setItems((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantityInCart: newQuantity, reservedUntil: expiresAt }
                        : item
                );
            }
            return [...prev, { ...product, quantityInCart: 1, reservedUntil: expiresAt }];
        });
        
        setIsCartOpen(true);
        return true;
    }, [sessionId, items]);

    const updateQuantity = useCallback(async (productId: string, newQuantity: number): Promise<boolean> => {
        if (!sessionId) return false;

        const item = items.find(i => i.id === productId);
        if (!item) return false;

        if (newQuantity <= 0) {
            // Because removeItem is not initialized before this point, we just do it manually here or we wait for removeItem to be defined
            // To simplify, we'll just handle it inline or use state directly
            if (sessionId) {
                releaseReservation(productId, sessionId).catch(console.error);
            }
            setItems((prev) => prev.filter((item) => item.id !== productId));
            return true;
        }

        if (newQuantity > item.quantity) {
            alert(`Sajnos ebből a termékből csak ${item.quantity} db érhető el.`);
            return false;
        }

        // Try server-side update
        const res = await reservePart(productId, sessionId, newQuantity);
        if (!res.success || !res.expiresAt) {
            alert(res.error || "Hiba történt a foglalás módosítása során.");
            return false;
        }

        const expiresAt = new Date(res.expiresAt).getTime();

        setItems(prev => prev.map(i => 
            i.id === productId 
                ? { ...i, quantityInCart: newQuantity, reservedUntil: expiresAt }
                : i
        ));

        return true;
    }, [sessionId, items]);

    const removeItem = useCallback(async (productId: string) => {
        if (sessionId) {
            // Fire and forget server-side release
            releaseReservation(productId, sessionId).catch(console.error);
        }
        setItems((prev) => prev.filter((item) => item.id !== productId));
    }, [sessionId]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

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
                updateQuantity,
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
