"use client";

import { ShoppingCart } from"lucide-react";
import { useCart } from"@/context/cart-context";
import { Product } from"@/lib/mock-data";

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem, items } = useCart();

    const cartItem = items.find(i => i.id === product.id);
    const inCartQuantity = cartItem?.quantityInCart || 0;
    const isOutOfStock = product.quantity <= 0;
    const isFullInCart = inCartQuantity >= product.quantity;

    const handleAddToCart = () => {
        addItem(product);
    };

    const isDisabled = isOutOfStock || isFullInCart;
    const buttonText = isOutOfStock 
        ? "JELENLEG FOGLALT (MÁS KOSARÁBAN)" 
        : isFullInCart 
            ? "MINDEN ELÉRHETŐ PÉLDÁNY A KOSÁRBAN"
            : "KOSÁRBA TESZEM";

    return (
        <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`w-full h-16 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg ${
                isDisabled 
                ? "bg-slate-400 cursor-not-allowed opacity-70" 
                : "bg-[var(--color-primary)] hover:bg-orange-600 shadow-[var(--color-primary)]/20"
            }`} >
            <ShoppingCart className="w-5 h-5" />
            {buttonText}
        </button>
    );
}
