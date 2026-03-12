export const dynamic = "force-dynamic";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InventoryFilters } from "./inventory-filters";
import { brands, getModelsByBrand } from "@/lib/vehicle-data";
import { InventoryTable } from "./inventory-table";

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; make?: string; model?: string; page?: string }>
}) {
    const params = await searchParams;
    const query = params.q || "";
    const make = params.make || "";
    const model = params.model || "";

    // 1. Build Filter inputs
    const where: any = {};

    // Text Search
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { oemNumbers: { contains: query, mode: 'insensitive' } },
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
    const makeOptions = brands
        .filter(b => !b.hidden)
        .map(b => ({ value: b.id, label: b.name }));

    // For models, if a make is selected, provide its models
    const availableModels = make ? getModelsByBrand(make) : [];
    const modelOptions = availableModels.map(m => ({ value: m.id, label: m.name }));


    // 3. Fetch Parts
    const parts = await prisma.part.findMany({
        where,
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            compatibilities: true
        }
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

            {/* Smart Table (Client Component for Actions) */}
            <InventoryTable parts={parts} />

            {/* Pagination Placeholder */}
            <div className="flex justify-center pt-4">
                <p className="text-xs text-gray-500">Megjelenítve: {parts.length} / {totalParts}</p>
            </div>
        </div>
    );
}
