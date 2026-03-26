"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart only once when success page is reached
        clearCart();
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 animate-in zoom-in-50 duration-500">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter">
                RENDELÉS <span className="text-emerald-500">SIKERES!</span>
            </h1>
            
            <p className="text-gray-400 mb-12 max-w-md text-lg leading-relaxed">
                Rendelésedet megkaptuk és hamarosan feldolgozzuk. 
                <span className="block mt-2 font-bold text-gray-300">Ellenőrizd az e-mail fiókodat a visszaigazolásért!</span>
            </p>
            
            <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                <Link 
                    href="/garage" 
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all border border-white/10"
                >
                    <ShoppingBag className="w-5 h-5" />
                    MEGRENDELÉSEIM
                </Link>
                
                <Link 
                    href="/" 
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg"
                >
                    VISSZA A FŐOLDALRA
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
