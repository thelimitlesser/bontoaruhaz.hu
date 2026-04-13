export const dynamic = "force-dynamic";
import { prisma } from"@/lib/prisma";
import Link from"next/link";
import { Eye, RotateCcw } from"lucide-react";

export default async function ReturnsPage() {
    const returns = await prisma.order.findMany({
        where: {
            status: { in: ['RETURNED','REFUNDED'] }
        },
        orderBy: { createdAt:'desc' },
        include: { user: true }
    });

    return (
        <div className="space-y-6 text-gray-900">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Visszáru (RMA)</h1>
            <p className="text-gray-500">Visszaküldött rendelések és garanciális ügyek</p>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Rendelés ID</th>
                            <th className="px-6 py-4">Vásárló</th>
                            <th className="px-6 py-4">Dátum</th>
                            <th className="px-6 py-4">Összeg</th>
                            <th className="px-6 py-4">Státusz</th>
                            <th className="px-6 py-4 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {returns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Nincs folyamatban lévő visszáru.
                                </td>
                            </tr>
                        ) : (
                            returns.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}...</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{order.user?.fullName ||'Vendég'}</td>
                                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.totalAmount.toLocaleString('hu-HU')} Ft</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status ==='REFUNDED' ?"bg-green-500/20 text-green-500 border-green-500/50" :"bg-orange-500/20 text-orange-500 border-orange-500/50" }`}>
                                            {order.status ==='REFUNDED' ?'Visszatérítve' :'Visszaküldve'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
                                            <Eye className="w-4 h-4" />
                                            Kezelés
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
