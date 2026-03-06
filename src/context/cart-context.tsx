"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from"react";
import { Product } from"@/lib/mock-data";

export interface CartItem extends Product {
    quantityInCart: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
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

    // Load from LocalStorage on mount
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("autonexus-cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
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

    const addItem = (product: Product) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantityInCart: item.quantityInCart + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantityInCart: 1 }];
        });
        setIsCartOpen(true); // Open cart when adding
    };

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
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
