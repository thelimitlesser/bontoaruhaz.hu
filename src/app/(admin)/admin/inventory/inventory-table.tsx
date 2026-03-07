"use client";

import { useState } from "react";
import { Box, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { brands, getModelsByBrand } from "@/lib/vehicle-data";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct } from "@/app/actions/product";

interface InventoryTableProps {
    parts: any[];
}

export function InventoryTable({ parts }: InventoryTableProps) {
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deletingProductId) return;
        setIsDeleting(true);
        try {
            await deleteProduct(deletingProductId);
            setDeletingProductId(null);
        } catch (error) {
            alert("Hiba történt a törlés során!");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[1000px] lg:min-w-full">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-20">Kép</th>
                                <th className="px-6 py-4">Alkatrész Info</th>
                                <th className="px-6 py-4">Kompatibilitás</th>
                                <th className="px-6 py-4 text-center">Státusz</th>
                                <th className="px-6 py-4 text-right">Ár (Bruttó)</th>
                                <th className="px-6 py-4 text-right">Műveletek</th>
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
                                                        className="w-full h-full object-contain p-1 bg-white" />
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
                                                Gyári SKU: {part.sku}
                                            </div>
                                            {part.productCode && (
                                                <div className="font-mono text-xs text-orange-700 bg-orange-100 inline-block px-2 py-1 rounded border border-orange-200 ml-2">
                                                    Belső: {part.productCode}
                                                </div>
                                            )}
                                            {part.oemNumbers && (
                                                <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                                                    OEM: {part.oemNumbers}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {part.isUniversal ? (
                                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                    Univerzális
                                                </span>
                                            ) : part.brandId ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {(brands.find(b => b.id === part.brandId))?.name || part.brandId}{''}
                                                        {part.modelId ? (getModelsByBrand(part.brandId).find(m => m.id === part.modelId))?.name || part.modelId : ''}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Nincs adat</span>
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
                                                {part.priceGross.toLocaleString('hu-HU')} Ft
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Nettó: {part.priceNet.toLocaleString('hu-HU')} Ft
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingProduct(part)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Szerkesztés" >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingProductId(part.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Törlés" >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Termék Szerkesztése</h3>
                                <p className="text-sm text-gray-500">{editingProduct.name} (SKU: {editingProduct.sku})</p>
                            </div>
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100" >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <ProductForm
                                initialData={editingProduct}
                                onSuccess={() => setEditingProduct(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProductId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Biztosan törlöd?</h3>
                            <p className="text-gray-500 mb-8">
                                Ez a művelet nem vonható vissza. Az alkatrész minden adata véglegesen törlődik a rendszerből.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletingProductId(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50" >
                                    Mégse
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2" >
                                    {isDeleting ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                    Törlés
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
