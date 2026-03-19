export const dynamic ="force-dynamic";
import { prisma } from"@/lib/prisma";
import Link from"next/link";
import { Eye, Package } from"lucide-react";

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt:'desc' },
        include: { user: true, items: true }
    });

    return (
        <div className="space-y-8 p-1 sm:p-4 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Rendelések
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Bontóáruház adminisztrációs felület</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                   <div className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--color-primary)]/20 flex items-center gap-2">
                       <Package className="w-4 h-4" />
                       Összesen: {orders.length}
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
                                        Nincs megjeleníthető rendelés a rendszerben.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="font-mono text-[10px] px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md w-fit font-bold text-gray-600 dark:text-gray-300">
                                                {order.id.split('-')[0]}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">{order.user?.fullName ||'Vendég'}</span>
                                                <span className="text-xs text-gray-500">{order.user?.email || 'Nincsen email'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-medium text-gray-600 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-base font-black text-gray-900 dark:text-white">
                                                {order.totalAmount.toLocaleString()} Ft
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight w-fit ${order.shippingMethod === 'PICKUP' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {order.shippingMethod ==='PICKUP' ?'🏢 Személyes' :'🚚 Kiszállítás'}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight w-fit ${order.paymentStatus ==='PAID' ?'bg-emerald-100 text-emerald-700' :'bg-rose-100 text-rose-700'}`}>
                                                    {order.paymentStatus ==='PAID' ?'💰 Fizetve' :'⏳ Utánvét'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={order.status} />
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string, text: string, border: string, dot: string }> = {
        PENDING: { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-500", border: "border-yellow-200 dark:border-yellow-500/20", dot: "bg-yellow-400" },
        PAID: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-500", border: "border-blue-200 dark:border-blue-500/20", dot: "bg-blue-400" },
        PROCESSING: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-500", border: "border-purple-200 dark:border-purple-500/20", dot: "bg-purple-400" },
        SHIPPED: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-500", border: "border-indigo-200 dark:border-indigo-500/20", dot: "bg-indigo-400" },
        DELIVERED: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-500", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-400" },
        CANCELLED: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-500", border: "border-red-200 dark:border-red-500/20", dot: "bg-red-400" },
        RETURNED: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-500", border: "border-orange-200 dark:border-orange-500/20", dot: "bg-orange-400" },
    };

    const labels: Record<string, string> = {
        PENDING: "Függőben",
        PAID: "Fizetve",
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
