"use client";

import { useTransition, useState } from "react";
import { issueManualInvoice } from "@/app/actions/order";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface IssueInvoiceButtonProps {
    orderId: string;
    invoiceId?: string | null;
    shippingMethod: string;
    paymentStatus: string;
}

export function IssueInvoiceButton({ orderId, invoiceId, shippingMethod, paymentStatus }: IssueInvoiceButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Only show for PICKUP orders that don't have an invoice yet
    // Or generally any order that is PAID but has no invoice (for flexibility)
    if (invoiceId) return null;
    
    // User specifically wants this for Personal Pickup
    // But we can show it for any COD order that was marked as PAID but not invoiced
    if (shippingMethod !== 'PICKUP' && paymentStatus !== 'PAID') return null;

    const handleConfirm = () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await issueManualInvoice(orderId);
                if (res.success) {
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                } else {
                    setError(res.error || "Hiba történt a számlázás során.");
                }
            } catch (err: any) {
                setError(err.message || "Ismeretlen hiba történt.");
            }
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isPending || success}
                className={`flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg ${
                    success 
                    ? "bg-emerald-500 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                }`}
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />)}
                {success ? "SZÁMLA KIÁLLÍTVA" : "SZÁMLA KIÁLLÍTÁSA"}
            </button>
            
            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                variant="primary"
                title="Számla kiállítása"
                description="Biztosan kiállítod a számlát? A rendszer generálja a Billingo számlát és kiküldi az ügyfélnek."
                confirmText="Számla kiállítása"
            />
            
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </div>
            )}
        </div>
    );
}
