export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { prisma } from"@/lib/prisma";
import Link from"next/link";
import { Eye, Package, AlertCircle, Clock, RefreshCw } from"lucide-react";
import { BulkSyncButton } from "./bulk-sync-button";
import { SyncTrigger } from "./sync-trigger";
import { getLastPxpSync } from "@/app/actions/shipping";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string, payment?: string, shipping?: string, todo?: string }> }) {
    const params = await searchParams;
    const { status, payment, shipping, todo } = params;

    const where: any = {};
    if (todo === 'true') {
        where.status = {
            in: ['PENDING', 'READY_FOR_PICKUP', 'PROCESSING']
        };
    } else if (status) {
        where.status = status;
    }

    if (payment) where.paymentStatus = payment;
    if (shipping) where.shippingMethod = shipping;

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt:'desc' },
        include: { user: true, items: true }
    });

    // Get last sync time for the auto-trigger
    const syncData = await getLastPxpSync();
    const lastSyncAt = syncData.success && syncData.lastSync ? syncData.lastSync.createdAt : null;

    return (
        <div className="space-y-8 p-1 sm:p-4 text-gray-900 dark:text-gray-100">
            <SyncTrigger lastSyncAt={lastSyncAt} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Rendelések
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Bontóáruház adminisztrációs felület</p>
                </div>
                <div className="flex items-center gap-3">
                    <BulkSyncButton />
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                       <div className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--color-primary)]/20 flex items-center gap-2">
                           <Package className="w-4 h-4" />
                           Találatok: {orders.length}
                       </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 p-4 rounded-2xl flex flex-wrap items-center gap-6 shadow-sm">
                
                {/* TO-DO Section */}
                <div className="flex flex-col gap-1.5 bg-amber-50 dark:bg-amber-500/5 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <label className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 ml-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Teendőink
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <FilterLink label="Minden teendő" value="true" param="todo" active={todo === 'true'} searchParams={params} />
                        <FilterLink label="Összes rendelés" active={!status && !todo} searchParams={params} />
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-100 dark:bg-white/10 hidden lg:block" />

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Rendelés állapota</label>
                    <div className="flex flex-wrap gap-2">
                        <FilterLink label="Függőben" value="PENDING" active={status === 'PENDING'} searchParams={params} />
                        <FilterLink label="Átvehető" value="READY_FOR_PICKUP" active={status === 'READY_FOR_PICKUP'} searchParams={params} />
                        <FilterLink label="Folyamatban" value="PROCESSING" active={status === 'PROCESSING'} searchParams={params} />
                        <FilterLink label="Szállítva" value="SHIPPED" active={status === 'SHIPPED'} searchParams={params} />
                        <FilterLink label="Átvéve" value="DELIVERED" active={status === 'DELIVERED'} searchParams={params} />
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-100 dark:bg-white/10 hidden lg:block" />

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Fizetés</label>
                    <div className="flex flex-wrap gap-2">
                        <FilterLink param="payment" label="Összes" active={!payment} searchParams={params} />
                        <FilterLink param="payment" label="Fizetve" value="PAID" active={payment === 'PAID'} searchParams={params} />
                        <FilterLink param="payment" label="Vár" value="PENDING" active={payment === 'PENDING'} searchParams={params} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Szállítás</label>
                    <div className="flex flex-wrap gap-2">
                        <FilterLink param="shipping" label="Összes" active={!shipping} searchParams={params} />
                        <FilterLink param="shipping" label="Személyes" value="PICKUP" active={shipping === 'PICKUP'} searchParams={params} />
                        <FilterLink param="shipping" label="Futár" value="DELIVERY" active={shipping === 'DELIVERY'} searchParams={params} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400">Rendelés ID</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400">Vásárló</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400">Dátum</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 text-right">Összeg</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400">Szállítás / Fizetés</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400">Állapot</th>
                                <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 text-right">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400 italic">
                                        Nincs a szűrésnek megfelelő rendelés a rendszerben.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => {
                                    let customerName = 'Vendég';
                                    let customerEmail = 'Nincsen email';

                                    try {
                                        const shipping = JSON.parse(order.shippingAddress || '{}');
                                        const billing = JSON.parse(order.billingAddress || '{}');
                                        customerName = order.user?.fullName || shipping.name || billing.name || 'Vendég';
                                        customerEmail = order.user?.email || shipping.email || billing.email || 'Nincsen email';
                                    } catch (e) {
                                        customerName = order.user?.fullName || 'Vendég';
                                        customerEmail = order.user?.email || 'Nincsen email';
                                    }

                                    return (
                                        <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200">
                                            <td className="px-6 py-5">
                                                <div className="font-mono text-[10px] px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md w-fit font-bold text-gray-600 dark:text-gray-300">
                                                    {order.id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white uppercase truncate max-w-[150px]">{customerName}</span>
                                                    <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{customerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-medium text-gray-600 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-base font-black text-gray-900 dark:text-white">
                                                    {order.totalAmount.toLocaleString('hu-HU')} Ft
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight w-fit ${order.shippingMethod === 'PICKUP' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {order.shippingMethod === 'PICKUP' ? '🏢 Személyes' : '🚚 Kiszállítás'}
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight w-fit 
                                                        ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                                                          (order.paymentMethod === 'CARD' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700')}`}>
                                                        {order.paymentStatus === 'PAID' ? '💰 Fizetve' : 
                                                          (order.paymentMethod === 'CARD' ? '💳 Bankkártya' : '⏳ Utánvét')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <StatusBadge status={order.status} />
                                                    {order.status === 'PENDING' && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-400/20 w-fit animate-pulse">
                                                            <Clock className="w-3 h-3" /> JÓVÁHAGYÁSRA VÁR
                                                        </div>
                                                    )}
                                                    {order.status === 'READY_FOR_PICKUP' && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-400/20 w-fit">
                                                            <Package className="w-3 h-3" /> ÁTVÉTELRE VÁR
                                                        </div>
                                                    )}
                                                    {order.status === 'PROCESSING' && order.shippingMethod === 'DELIVERY' && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-400/20 w-fit">
                                                            <Package className="w-3 h-3" /> CSOMAGOLÁS
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link 
                                                    href={`/admin/orders/${order.id}`} 
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-[var(--color-primary)] dark:hover:bg-[var(--color-primary)] hover:text-white rounded-xl transition-all duration-300 text-xs font-bold ring-1 ring-gray-200 dark:ring-white/10 hover:ring-transparent shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Részletek
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FilterLink({ label, value, param = 'status', active, searchParams }: { label: string, value?: string, param?: string, active: boolean, searchParams: any }) {
    // Create new URL search params from existing ones
    const newParams = new URLSearchParams();
    
    // Copy existing params
    Object.entries(searchParams).forEach(([key, val]) => {
        if (val && key !== param) {
            newParams.set(key, val as string);
        }
    });

    // Handle mutual exclusivity between 'status' and 'todo'
    if (param === 'status') {
        newParams.delete('todo');
    } else if (param === 'todo') {
        newParams.delete('status');
    }

    // Set or clear the target parameter
    if (value) {
        newParams.set(param, value);
    } else {
        newParams.delete(param);
    }

    const queryString = newParams.toString();
    const url = queryString ? `?${queryString}` : `/admin/orders`; 
    
    return (
        <Link 
            href={url}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${active 
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm" 
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}
        >
            {label}
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string, text: string, border: string, dot: string }> = {
        PENDING: { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-500", border: "border-yellow-200 dark:border-yellow-500/20", dot: "bg-yellow-400" },
        PAID: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-500", border: "border-blue-200 dark:border-blue-500/20", dot: "bg-blue-400" },
        READY_FOR_PICKUP: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-500", border: "border-orange-200 dark:border-orange-500/20", dot: "bg-orange-400" },
        PROCESSING: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-500", border: "border-purple-200 dark:border-purple-500/20", dot: "bg-purple-400" },
        SHIPPED: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-500", border: "border-indigo-200 dark:border-indigo-500/20", dot: "bg-indigo-400" },
        DELIVERED: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-500", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-400" },
        CANCELLED: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-500", border: "border-red-200 dark:border-red-500/20", dot: "bg-red-400" },
        RETURNED: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-500", border: "border-orange-200 dark:border-orange-500/20", dot: "bg-orange-400" },
    };

    const labels: Record<string, string> = {
        PENDING: "Függőben",
        PAID: "Fizetve",
        READY_FOR_PICKUP: "Átvehető",
        PROCESSING: "Feldolgozás alatt",
        SHIPPED: "Szállítva",
        DELIVERED: "Kézbesítve",
        CANCELLED: "Törölve",
        RETURNED: "Visszaküldve",
    };

    const style = styles[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${style.bg} ${style.text} ${style.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
            {labels[status] || status}
        </span>
    );
}
