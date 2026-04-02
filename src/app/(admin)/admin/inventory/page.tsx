export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InventoryFilters } from "./inventory-filters";
import { InventoryTable } from "./inventory-table";
import { getBrands, getCategories, getAllPartItems } from "@/app/actions/catalog";

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
            { productCode: { contains: query, mode: 'insensitive' } },
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


    // 2. Fetch Dropdown Data from DB
    const [dbBrands, dbCategories, dbPartItems, dbSubcategories, allModels] = await Promise.all([
        getBrands(),
        getCategories(),
        getAllPartItems(),
        prisma.partSubcategory.findMany(),
        prisma.vehicleModel.findMany()
    ]);

    const makeOptions = dbBrands
        .map(b => ({ value: b.id, label: b.name }));

    // For models, if a make is selected, provide its models
    const availableModels = make ? allModels.filter(m => m.brandId === make) : [];
    const modelOptions = availableModels.map(m => ({ 
        value: m.id, 
        label: m.name,
        group: m.series || 'Egyéb'
    }));


    // 3. Pagination logic
    const pageSize = 50;
    const page = parseInt(params.page || "1");
    const skip = (page - 1) * pageSize;

    // 4. Fetch Parts
    const [parts, totalParts] = await Promise.all([
        prisma.part.findMany({
            where,
            take: pageSize,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            include: {
                compatibilities: true
            }
        }),
        prisma.part.count({ where })
    ]);

    const totalPages = Math.ceil(totalParts / pageSize);

    return (
        <div className="space-y-6 text-gray-900">
            {/* Header / Command Center */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Készlet & Raktár</h1>
                    <p className="text-gray-500">
                        {totalParts} alkatrész a rendszerben. Keresés cikkszám, név vagy referencia alapján.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/inventory/new" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20">
                        <Plus className="w-5 h-5" />
                        Új Alkatrész
                    </Link>
                </div>
            </div>

            {/* Search & Filter Bar (Client Component) */}
            <InventoryFilters makes={makeOptions} models={modelOptions} />

            {/* Smart Table (Client Component for Actions) */}
            <InventoryTable 
                parts={parts} 
                brands={dbBrands}
                models={allModels}
                categories={dbCategories}
                subcategories={dbSubcategories}
                partItems={dbPartItems}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                        {page > 1 && (
                            <Link 
                                href={`/admin/inventory?page=${page - 1}${query ? `&q=${query}` : ''}${make ? `&make=${make}` : ''}${model ? `&model=${model}` : ''}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Előző
                            </Link>
                        )}
                        <span className="px-4 py-2 text-sm font-bold bg-foreground/5 rounded-lg">
                            {page} / {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link 
                                href={`/admin/inventory?page=${page + 1}${query ? `&q=${query}` : ''}${make ? `&make=${make}` : ''}${model ? `&model=${model}` : ''}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Következő
                            </Link>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Összesen {totalParts} tétel • Oldalanként 50 találat
                    </p>
                </div>
            )}
            
            {totalPages <= 1 && (
                <div className="flex justify-center pt-4">
                    <p className="text-xs text-gray-500">Megjelenítve: {parts.length} / {totalParts}</p>
                </div>
            )}
        </div>
    );
}
