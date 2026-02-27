export const dynamic = "force-dynamic";
import { Plus, Box } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InventoryFilters } from "./inventory-filters";
import { brands, getModelsByBrand } from "@/lib/vehicle-data";

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: { q?: string; make?: string; model?: string; page?: string }
}) {
    const query = searchParams.q || "";
    const make = searchParams.make || "";
    const model = searchParams.model || "";

    // 1. Build Filter inputs
    const where: any = {};

    // Text Search
    if (query) {
        where.OR = [
            { name: { contains: query } },
            { sku: { contains: query } },
            { oemNumbers: { contains: query } },
        ];
    }

    // YMM Filtering via new brandId and modelId fields
    if (make) {
        where.brandId = make;
    }

    if (model) {
        where.modelId = model;
    }

    // 2. Fetch Dropdown Data from vehicle-data directly based on inventory or just use all
    // To keep it simple and fast, we provide all brands that exist in vehicle-data
    const makeOptions = brands.map(b => ({ value: b.id, label: b.name }));

    // For models, if a make is selected, provide its models
    const availableModels = make ? getModelsByBrand(make) : [];
    const modelOptions = availableModels.map(m => ({ value: m.id, label: m.name }));


    // 3. Fetch Parts
    const parts = await prisma.part.findMany({
        where,
        take: 50,
        orderBy: { createdAt: 'desc' }
    });

    const totalParts = await prisma.part.count({ where });

    return (
        <div className="space-y-6 text-gray-900">
            {/* Header / Command Center */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Készlet & Raktár</h1>
                    <p className="text-gray-500">
                        {totalParts} alkatrész a rendszerben. Keresés cikkszám, név vagy OEM alapján.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products/new" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20">
                        <Plus className="w-5 h-5" />
                        Új Alkatrész
                    </Link>
                </div>
            </div>

            {/* Search & Filter Bar (Client Component) */}
            <InventoryFilters makes={makeOptions} models={modelOptions} />

            {/* Smart Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-20">Kép</th>
                            <th className="px-6 py-4">Alkatrész Info</th>
                            <th className="px-6 py-4">Kompatibilitás</th>
                            <th className="px-6 py-4 text-center">Státusz</th>
                            <th className="px-6 py-4 text-right">Ár (Bruttó)</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {parts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Nincs találat a keresési feltételekre.
                                </td>
                            </tr>
                        ) : (
                            parts.map((part) => (
                                <tr key={part.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                            {part.images ? (
                                                <img
                                                    src={part.images.split(',')[0]}
                                                    alt={part.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Box className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-base text-gray-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                                            {part.name}
                                        </div>
                                        <div className="font-mono text-xs text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded border border-gray-200">
                                            SKU: {part.sku}
                                        </div>
                                        {part.oemNumbers && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                OEM: {part.oemNumbers}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {part.brandId ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {(brands.find(b => b.id === part.brandId))?.name || part.brandId}{' '}
                                                    {part.modelId ? (getModelsByBrand(part.brandId).find(m => m.id === part.modelId))?.name || part.modelId : ''}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Nincs adat</span>
                                        )}
                                        {part.tecdocKTypes && (
                                            <div className="mt-1 text-[10px] text-gray-500 max-w-[150px] truncate">
                                                {part.tecdocKTypes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {part.stock > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Készleten ({part.stock})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                Kifogyott
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-gray-900 text-lg">
                                            {part.priceGross.toLocaleString()} Ft
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Nettó: {part.priceNet.toLocaleString()} Ft
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/products/${part.id}`} className="text-sm font-medium text-[var(--color-primary)] hover:underline transition-all">
                                            Részletek &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex justify-center pt-4">
                <p className="text-xs text-gray-500">Megjelenítve: {parts.length} / {totalParts}</p>
            </div>
        </div>
    );
}
