export const dynamic ="force-dynamic";
import { Plus, Box } from"lucide-react";
import Link from"next/link";
import { prisma } from"@/lib/prisma";

export default async function InventoryPage() {
    const locations = await prisma.storageLocation.findMany({
        orderBy: { name:'asc' }
    });

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Raktárhelyek</h1>
                    <p className="text-gray-500">Polcok, sorok és ládák kezelése</p>
                </div>
                <Link href="/admin/inventory/new" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" />
                    Új Hely Felvétele
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {locations.map((loc) => (
                    <div key={loc.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 group hover:border-[var(--color-primary)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                                <Box className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black text-gray-900">{loc.name}</span>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">
                            {loc.description ||'Nincs leírás'}
                        </p>

                    </div>
                ))}
            </div>

            {locations.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    Még nincs létrehozva raktárhely.
                </div>
            )}
        </div>
    );
}
