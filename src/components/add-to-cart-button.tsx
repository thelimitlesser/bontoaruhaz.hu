"use client";

import { ShoppingCart } from"lucide-react";
import { useCart } from"@/context/cart-context";
import { Product } from"@/lib/mock-data";

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem(product);
    };

    return (
        <button
            onClick={handleAddToCart}
            className="w-full h-16 bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg shadow-[var(--color-primary)]/20" >
            <ShoppingCart className="w-5 h-5" />
            KOSÁRBA TESZEM
        </button>
    );
}
