"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { getRevenueStats, getRevenueDetails } from "@/app/actions/analytics";
import { RevenueDetailsModal } from "./RevenueDetailsModal";

interface Stats {
    today: { revenue: number; count: number };
    week: { revenue: number; count: number };
    month: { revenue: number; count: number };
    year: { revenue: number; count: number };
}

export function DashboardRevenue({ initialStats }: { initialStats: Stats }) {
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
    const [stats, setStats] = useState(initialStats);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [detailsOrders, setDetailsOrders] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePeriodChange = async (newPeriod: 'today' | 'week' | 'month' | 'year') => {
        setPeriod(newPeriod);
        // Stats are already in initialStats for now, but in a real app we might fetch them
    };

    const handleOpenDetails = async () => {
        setIsLoadingDetails(true);
        setIsDetailsOpen(true);
        const res = await getRevenueDetails(period);
        if (res.success) {
            setDetailsOrders(res.orders);
        }
        setIsLoadingDetails(false);
    };

    const periodLabels = {
        today: 'Mai nap',
        week: 'Heti összes',
        month: 'Havi összes',
        year: 'Éves összes'
    };

    const currentRevenue = stats[period].revenue;
    const currentCount = stats[period].count;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
                    Bevételi Áttekintés
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                    {(['today', 'week', 'month', 'year'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {p === 'today' ? 'Napi' : p === 'week' ? 'Heti' : p === 'month' ? 'Havi' : 'Éves'}
                        </button>
                    ))}
                </div>
            </div>

            <div 
                onClick={handleOpenDetails}
                className="group cursor-pointer bg-white border border-gray-200 rounded-3xl p-8 relative overflow-hidden hover:shadow-2xl hover:shadow-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 transition-all duration-500"
            >
                {/* Background Decoration */}
                <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 group-hover:bg-[var(--color-primary)]/5 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {periodLabels[period]}
                                </p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">
                                    {isMounted ? currentRevenue.toLocaleString('hu-HU') : "---"} Ft
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                {isMounted ? currentCount : "---"} kifizetett rendelés
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-[var(--color-primary)] font-black uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform duration-300">
                        {isLoadingDetails ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tranzakciók listázása'}
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>

                {/* Progress-like indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 overflow-hidden">
                   <div className="h-full bg-[var(--color-primary)]/20 w-1/3 group-hover:w-full transition-all duration-1000" />
                </div>
            </div>

            <RevenueDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                orders={detailsOrders}
                periodLabel={periodLabels[period]}
                totalRevenue={currentRevenue}
            />
        </div>
    );
}
