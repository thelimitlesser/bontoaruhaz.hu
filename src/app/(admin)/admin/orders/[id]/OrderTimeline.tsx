"use client";

import { Check, Circle, Clock, CreditCard, Package, Truck, CheckCircle2 } from "lucide-react";

interface TimelineStep {
    id: string;
    label: string;
    description?: string;
    status: "complete" | "current" | "upcoming";
    icon: any;
}

interface OrderTimelineProps {
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    invoiceId?: string | null;
    trackingNumber?: string | null;
    createdAt?: Date;
}

export function OrderTimeline({ status, paymentStatus, paymentMethod, invoiceId, trackingNumber, createdAt }: OrderTimelineProps) {
    const isPaid = paymentStatus === "PAID" || paymentStatus === "paid";
    const isProcessed = ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status);
    const isShipped = ["SHIPPED", "DELIVERED"].includes(status);
    const isDelivered = status === "DELIVERED";
    const isCOD = paymentMethod === "COD";

    const steps: TimelineStep[] = [
        {
            id: "received",
            label: "Rendelés leadva",
            description: createdAt ? new Date(createdAt).toLocaleDateString('hu-HU') : undefined,
            status: "complete",
            icon: Clock
        },
        {
            id: "payment",
            label: isCOD ? "Utánvétes" : "Fizetés",
            description: isPaid ? "Sikeres fizetés" : (isCOD ? "Kiszállításkor fizetendő" : "Fizetésre vár"),
            status: isPaid || isCOD ? "complete" : "current",
            icon: CreditCard
        },
        {
            id: "processing",
            label: "Feldolgozás",
            description: invoiceId ? "Számla elkészült" : "Admin jóváhagyásra vár",
            status: isProcessed ? "complete" : (!isPaid && !isCOD ? "upcoming" : "current"),
            icon: Package
        },
        {
            id: "shipping",
            label: "Szállítás",
            description: trackingNumber ? `Feladva: ${trackingNumber}` : "Csomagolás alatt",
            status: isShipped ? "complete" : (!isProcessed ? "upcoming" : "current"),
            icon: Truck
        },
        {
            id: "delivered",
            label: "Kézbesítve",
            description: isDelivered ? "Sikeresen átadva" : "Úton a vevőhöz",
            status: isDelivered ? "complete" : (!isShipped ? "upcoming" : "current"),
            icon: CheckCircle2
        }
    ];

    return (
        <div className="w-full py-6 overflow-x-auto scrollbar-hide">
            <div className="relative flex items-center justify-between px-16 min-w-[600px]">
                {/* Background Line */}
                <div className="absolute left-16 right-16 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200 dark:bg-white/10" />

                {/* Steps */}
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            <div className={`
                                flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                                ${step.status === "complete" 
                                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" 
                                    : step.status === "current"
                                    ? "bg-white dark:bg-zinc-900 border-[var(--color-primary)] text-[var(--color-primary)] animate-pulse"
                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 text-gray-400"}
                            `}>
                                {step.status === "complete" ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div className="absolute top-12 flex flex-col items-center min-w-[120px] text-center">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${step.status !== "upcoming" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                                    {step.label}
                                </span>
                                {step.description && (
                                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="h-10" /> {/* Spacer for the absolute labels */}
        </div>
    );
}
