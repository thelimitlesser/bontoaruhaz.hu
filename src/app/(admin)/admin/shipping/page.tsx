export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from "react";
import { Printer, Download, Truck, Package, CheckCircle2, AlertCircle, FileText, ArrowRight, Loader2, X } from "lucide-react";
import { closePxpDay, getManifestHistory, getManifestPdf, getBulkShippingLabels } from "@/app/actions/shipping";
import { motion, AnimatePresence } from "framer-motion";
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [manifestResult, setManifestResult] = useState<{ count: number; pdfBase64: string } | null>(null);

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

    const triggerDownload = (pdfBase64: string, filename: string) => {
        try {
            const byteCharacters = atob(pdfBase64.replace(/\s/g, ''));
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup with delay to avoid issues in some browsers
            setTimeout(() => URL.revokeObjectURL(url), 100);
            return true;
        } catch (err) {
            console.error("Download trigger error:", err);
            return false;
        }
    };

    const handleManifest = async () => {
        setShowConfirmModal(false);
        setIsClosing(true);
        setMessage(null);
        setManifestResult(null);
        
        try {
            const result = await closePxpDay();
            if (result.success) {
                setManifestResult({ 
                    count: result.count || 0, 
                    pdfBase64: result.pdfBase64 || '' 
                });
                
                // Attempt auto-download
                if (result.pdfBase64) {
                    triggerDownload(
                        result.pdfBase64, 
                        `PXP_Gyujtolista_${new Date().toISOString().split('T')[0]}.pdf`
                    );
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
                triggerDownload(
                    res.pdfBase64, 
                    `PXP_Gyujtolista_${new Date(dateStr).toISOString().split('T')[0]}.pdf`
                );
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
                triggerDownload(
                    res.pdfBase64, 
                    `PXP_Osszes_Cimke_${new Date().toISOString().split('T')[0]}.pdf`
                );
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
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isClosing || isPrinting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                            NAPI ZÁRÁS INDÍTÁSA ({orders.length})
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Printer className="w-6 h-6" />
                                </div>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">Biztosan lezárod a napot?</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    Ez a folyamat összesíti a mai <span className="font-bold text-blue-600">{orders.length} db</span> csomagot, és elküldi a PannonXP-nek. Ezután generálódik a gyűjtőlista.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleManifest}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    IGEN, ZÁRÁS INDÍTÁSA
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold transition-all"
                                >
                                    MÉGSEM
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {manifestResult && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">Sikeres napi zárás!</h3>
                                <p className="text-gray-500">
                                    <span className="font-bold text-emerald-600">{manifestResult.count} db</span> rendelés állapota "Kiszállítás alatt"-ra váltott.
                                </p>
                            </div>
                            
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-800 text-sm flex items-start gap-3 text-left">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>A gyűjtőlista letöltése elindult. Ha nem látod a letöltést, kattints az alábbi gombra!</p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={() => triggerDownload(manifestResult.pdfBase64, `PXP_Gyujtolista_${new Date().toISOString().split('T')[0]}.pdf`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Download className="w-5 h-5" />
                                    PDF LETÖLTÉSE ÚJRA
                                </button>
                                <button
                                    onClick={() => setManifestResult(null)}
                                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold transition-all"
                                >
                                    RENDBEN
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {isClosing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-white/80 backdrop-blur-md cursor-wait"
                    >
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">Napi zárás folyamatban...</h3>
                                <p className="text-gray-500 font-medium">Kapcsolódás a PannonXP szerveréhez. Kérjük ne zárd be az ablakot!</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
