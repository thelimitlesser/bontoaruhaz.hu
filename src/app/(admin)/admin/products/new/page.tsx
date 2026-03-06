"use client";

import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Új Termék Feltöltése</h1>
                    <p className="text-gray-500">Adja meg az alkatrész részleteit</p>
                </div>
            </div>

            <ProductForm onSuccess={() => router.push('/admin/inventory')} />
        </div>
    );
}
