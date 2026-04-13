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
            data-testid="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`w-full min-h-[4rem] px-4 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg ${
                isDisabled 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-[var(--color-primary)] hover:bg-orange-600 shadow-[var(--color-primary)]/20 text-lg"
            }`} >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span className={`${isDisabled ? 'text-[13px]' : 'text-lg'} text-center leading-tight uppercase`}>
                {buttonText}
            </span>
        </button>
    );
}
