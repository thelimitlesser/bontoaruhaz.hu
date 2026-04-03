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
    searchParams: Promise<{ q?: string; make?: string; model?: string; partItem?: string; page?: string }>
}) {
    const params = await searchParams;
    const query = params.q || "";
    const make = params.make || "";
    const model = params.model || "";
    const partItem = params.partItem || "";

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

    if (make) where.brandId = make;
    if (model) where.modelId = model;
    if (partItem) where.partItemId = partItem;

    // 2. Fetch Dropdown Data (Hierarchical for Filters + Full for Form)
    let makeOptions: any[] = [];
    let modelOptions: any[] = [];
    let partItemOptions: any[] = [];
    
    // Data for Table/Edit Form (Full catalog)
    let fullBrands: any[] = [];
    let fullModels: any[] = [];
    let fullPartItems: any[] = [];
    let dbCategories: any[] = [];
    let dbSubcategories: any[] = [];

    try {
        const [
            fBrands, fModels, fPartItems,
            aBrands, aModels, aPartItems,
            cats, subcats
        ] = await Promise.all([
            // FILTER DATA (Limited to active inventory)
            prisma.vehicleBrand.findMany({
                where: { Part: { some: {} } },
                orderBy: { name: 'asc' }
            }),
            prisma.vehicleModel.findMany({
                where: {
                    AND: [
                        { Part: { some: {} } },
                        make ? { brandId: make } : {}
                    ]
                },
                orderBy: { name: 'asc' }
            }),
            prisma.partItem.findMany({
                where: {
                    AND: [
                        { Part: { some: {} } },
                        make ? { Part: { some: { brandId: make } } } : {},
                        model ? { Part: { some: { modelId: model } } } : {}
                    ]
                },
                orderBy: { name: 'asc' }
            }),
            // FORM DATA (Full Catalog)
            getBrands(),
            prisma.vehicleModel.findMany(),
            getAllPartItems(),
            getCategories(),
            prisma.partSubcategory.findMany()
        ]);

        makeOptions = fBrands.map(b => ({ value: b.id, label: b.name }));
        modelOptions = fModels.map(m => ({ 
            value: m.id, 
            label: m.name,
            group: m.series || 'Egyéb'
        }));
        partItemOptions = fPartItems.map(i => ({ value: i.id, label: i.name }));

        fullBrands = aBrands;
        fullModels = aModels;
        fullPartItems = aPartItems;
        dbCategories = cats;
        dbSubcategories = subcats;

    } catch (e) {
        console.error("InventoryPage: Failed to fetch dropdown data:", e);
    }

    // 3. Pagination logic
    const pageSize = 50;
    const page = parseInt(params.page || "1");
    const skip = (page - 1) * pageSize;

    // 4. Fetch Parts
    let parts: any[] = [];
    let totalParts = 0;

    try {
        const [partsResult, countResult] = await Promise.all([
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
        parts = partsResult;
        totalParts = countResult;
    } catch (e) {
        console.error("InventoryPage: Failed to fetch parts or count:", e);
    }

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
            <InventoryFilters makes={makeOptions} models={modelOptions} partItems={partItemOptions} />

            {/* Smart Table (Client Component for Actions) */}
            <InventoryTable 
                parts={parts} 
                brands={fullBrands}
                models={fullModels}
                categories={dbCategories}
                subcategories={dbSubcategories}
                partItems={fullPartItems}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                        {page > 1 && (
                            <Link 
                                href={`/admin/inventory?page=${page - 1}${query ? `&q=${query}` : ''}${make ? `&make=${make}` : ''}${model ? `&model=${model}` : ''}${partItem ? `&partItem=${partItem}` : ''}`}
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
                                href={`/admin/inventory?page=${page + 1}${query ? `&q=${query}` : ''}${make ? `&make=${make}` : ''}${model ? `&model=${model}` : ''}${partItem ? `&partItem=${partItem}` : ''}`}
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
