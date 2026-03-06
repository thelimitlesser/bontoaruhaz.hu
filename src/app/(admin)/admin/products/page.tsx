export const dynamic ="force-dynamic";
import { Plus } from"lucide-react";
import Link from"next/link";
import { prisma } from"@/lib/prisma";

export default async function ProductsPage() {
    const parts = await prisma.part.findMany({
        take: 20,
        orderBy: { createdAt:'desc' }
    });

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Termékek</h1>
                    <p className="text-gray-500">Raktárkészlet kezelése</p>
                </div>
                <Link href="/admin/products/new" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" />
                    Új Termék
                </Link>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Kép</th>
                            <th className="px-6 py-4">Megnevezés</th>
                            <th className="px-6 py-4">Cikkszám (SKU)</th>
                            <th className="px-6 py-4">Ár (Bruttó)</th>
                            <th className="px-6 py-4">Készlet</th>
                            <th className="px-6 py-4 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {parts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Nincs megjeleníthető termék.
                                </td>
                            </tr>
                        ) : (
                            parts.map((part) => (
                                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xs">
                                            IMG
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{part.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{part.sku}</td>
                                    <td className="px-6 py-4">{part.priceGross} Ft</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">{part.stock} db</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[var(--color-primary)] hover:underline">Szerkesztés</button>
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
