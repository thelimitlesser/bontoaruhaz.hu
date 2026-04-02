export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBrands, getCategories, getAllPartItems } from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Top Navigation */}
            <div className="flex items-center gap-4">
                <Link href="/admin/inventory" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Katalógus Kezelés</h1>
                    <p className="text-gray-400">Új termék hozzáadása a készlethez</p>
                </div>
            </div>

            {/* Modern Contained Form (Matching Edit Modal Style) */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Termék Feltöltése</h3>
                    <p className="text-sm text-gray-500 font-medium">Töltse ki az alábbi mezőket az alkatrész rögzítéséhez</p>
                </div>
                
                <div className="p-8">
                    {/* Fetch data on the server and pass to client component */}
                    {async function() {
                        const brands = await getBrands();
                        const categories = await getCategories();
                        const partItems = await getAllPartItems();
                        const subcategories = await prisma.partSubcategory.findMany();
                        const models = await prisma.vehicleModel.findMany();

                        return (
                            <ProductForm 
                                className="mx-auto" 
                                brands={brands}
                                models={models}
                                categories={categories}
                                subcategories={subcategories}
                                partItems={partItems}
                            />
                        );
                    }()}
                </div>
            </div>
        </div>
    );
}
