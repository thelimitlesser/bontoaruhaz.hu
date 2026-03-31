"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const CheckoutView = dynamic(
  () => import("@/components/checkout/checkout-view"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Pénztár betöltése...</p>
      </div>
    )
  }
);

export default function CheckoutPage() {
  return <CheckoutView />;
}
