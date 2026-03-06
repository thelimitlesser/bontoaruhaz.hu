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
        <div className="space-y-6 text-gray-900">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rendelések</h1>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px] lg:min-w-full">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Rendelés ID</th>
                                <th className="px-6 py-4">Vásárló</th>
                                <th className="px-6 py-4">Dátum</th>
                                <th className="px-6 py-4">Összeg</th>
                                <th className="px-6 py-4">Átvétel / Fizetés</th>
                                <th className="px-6 py-4">Rendelés állapota</th>
                                <th className="px-6 py-4 text-right">Részletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Nincs megjeleníthető rendelés.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}...</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">{order.user?.fullName ||'Vendég'}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{order.totalAmount.toLocaleString()} Ft</td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="text-xs font-semibold">
                                                {order.shippingMethod ==='PICKUP' ?'🏢 Személyes' :'🚚 Kiszállítás'}
                                            </div>
                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${order.paymentStatus ==='PAID' ?'bg-green-100 text-green-700' :'bg-yellow-100 text-yellow-700'}`}>
                                                {order.paymentStatus ==='PAID' ?'Fizetve' :'Utánvét / Függőben'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
                                                <Eye className="w-4 h-4" />
                                                Megtekintés
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
    const styles: Record<string, string> = {
        PENDING:"bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
        PAID:"bg-blue-500/20 text-blue-500 border-blue-500/50",
        PROCESSING:"bg-purple-500/20 text-purple-500 border-purple-500/50",
        SHIPPED:"bg-indigo-500/20 text-indigo-500 border-indigo-500/50",
        DELIVERED:"bg-green-500/20 text-green-500 border-green-500/50",
        CANCELLED:"bg-red-500/20 text-red-500 border-red-500/50",
        RETURNED:"bg-orange-500/20 text-orange-500 border-orange-500/50",
    };

    const labels: Record<string, string> = {
        PENDING:"Függőben",
        PAID:"Fizetve",
        PROCESSING:"Feldolgozás alatt",
        SHIPPED:"Szállítva",
        DELIVERED:"Kézbesítve",
        CANCELLED:"Törölve",
        RETURNED:"Visszaküldve",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] ||"bg-gray-100 text-gray-500 border-gray-200"}`}>
            {labels[status] || status}
        </span>
    );
}
