'use client';

import { useState, useEffect } from "react";
import { Truck, Package, CheckCircle2, AlertCircle, FileText, Printer, ArrowRight, Loader2, Download } from "lucide-react";
import { closePxpDay, getManifestHistory, getManifestPdf, getBulkShippingLabels } from "@/app/actions/shipping";
import Link from "next/link";

interface ShippingOrder {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    trackingNumber: string;
    shippingAddress: string;
}

export default function ShippingPage() {
    const [orders, setOrders] = useState<ShippingOrder[]>([]);
    const [manifests, setManifests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=PROCESSING');
            const data = await res.json();
            // Filter only those with tracking number
            const readyOrders = data.filter((o: any) => o.trackingNumber);
            setOrders(readyOrders);

            const manifestRes = await getManifestHistory();
            if (manifestRes.success) {
                setManifests(manifestRes.manifests || []);
            }
        } catch (error) {
            console.error("Order fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleManifest = async () => {
        if (!confirm(`Biztosan lezárod a mai napot? Ez összesen ${orders.length} csomagot érint.`)) return;
        
        setIsClosing(true);
        setMessage(null);
        
        try {
            const result = await closePxpDay();
            if (result.success) {
                setMessage({ type: 'success', text: `Sikeres napi zárás! ${result.count} csomag lezárva. Letöltés indítása...` });
                
                // Trigger PDF download
                if (result.pdfBase64) {
                    const byteCharacters = atob(result.pdfBase64.replace(/\s/g, ''));
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `PXP_Gyujtolista_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                
                // Refresh list
                fetchOrders();
            } else {
                setMessage({ type: 'error', text: result.error || "Hiba történt a zárás során." });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsClosing(false);
        }
    };

    const handleDownloadManifest = async (id: string, dateStr: string) => {
        try {
            const res = await getManifestPdf(id);
            if (res.success && res.pdfBase64) {
                const byteCharacters = atob(res.pdfBase64.replace(/\s/g, ''));
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `PXP_Gyujtolista_${new Date(dateStr).toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                setMessage({ type: 'error', text: res.error || "Nem sikerült letölteni a PDF-et." });
            }
        } catch (error: any) {
             setMessage({ type: 'error', text: error.message });
        }
    };

    const handleBulkLabels = async () => {
        const trackingNumbers = orders.map(o => o.trackingNumber).filter(Boolean);
        if (trackingNumbers.length === 0) return;

        setIsPrinting(true);
        try {
            const res = await getBulkShippingLabels(trackingNumbers);
            if (res.success && res.pdfBase64) {
                const byteCharacters = atob(res.pdfBase64.replace(/\s/g, ''));
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `PXP_Osszes_Cimke_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setMessage({ type: 'success', text: "Tömeges címke letöltés sikeres!" });
            } else {
                setMessage({ type: 'error', text: res.error || "Nem sikerült a tömeges címke letöltés." });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsPrinting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Betöltés...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Szállításkezelő</h1>
                    <p className="text-gray-500 mt-1">PannonXP napi zárás és folyamatban lévő szállítások</p>
                </div>

                {orders.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleBulkLabels}
                            disabled={isPrinting || isClosing}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPrinting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5 text-gray-500" />}
                            Címkék Összesítése ({orders.length})
                        </button>

                        <button
                            onClick={handleManifest}
                            disabled={isClosing || isPrinting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                            NAPI ZÁRÁS INDÍTÁSA ({orders.length})
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    message.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Feladásra váró csomagok
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Fuvarlevéllel rendelkezik</span>
                    </h2>

                    {orders.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Nincsenek lezárható csomagok</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">Előbb generálj fuvarlevelet a rendelés részletei oldalon.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 tracking-wider">Rendelés</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 tracking-wider">Címzett</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 tracking-wider">Követési Szám</th>
                                        <th className="px-6 py-4 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => {
                                        const address = JSON.parse(order.shippingAddress);
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm">#{order.id.slice(0, 8)}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-black">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-gray-900">{address.name}</div>
                                                    <div className="text-[10px] text-gray-500">{address.city}, {address.postalCode}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md inline-block">
                                                        {order.trackingNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link 
                                                        href={`/admin/orders/${order.id}`}
                                                        className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-500 group"
                                                    >
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Truck className="w-24 h-24" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Mi az a Napi Zárás?</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            A napi zárás során a rendszer összesíti a már felcímkézett csomagokat, és elküldi a végleges listát a PannonXP-nek. Ezután generálódik a **Gyűjtőlista**, amit ki kell nyomtatnod és átadnod a futárnak.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/60">
                            <AlertCircle className="w-4 h-4" />
                            Zárás után a fuvarlevelek már nem módosíthatók!
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Utolsó gyűjtőlisták
                        </h3>
                        {manifests.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4 italic">Jelenleg nincs korábbi zárási adat.</p>
                        ) : (
                            <div className="space-y-3">
                                {manifests.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{new Date(m.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                            <div className="text-xs text-gray-500">{m.itemCount} csomag</div>
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadManifest(m.id, m.createdAt)}
                                            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="PDF Lekérése"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
