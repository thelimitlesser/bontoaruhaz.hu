import { ProductForm } from"@/components/admin/product-form";
import Link from"next/link";
import { ArrowLeft } from"lucide-react";
import { prisma } from"@/lib/prisma";

export default async function NewProductPage() {

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Új Termék Feltöltése</h1>
                    <p className="text-gray-400">Adja meg az alkatrész részleteit</p>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
