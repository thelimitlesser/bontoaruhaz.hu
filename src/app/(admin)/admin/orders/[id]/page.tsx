export const dynamic = "force-dynamic";
import { prisma } from"@/lib/prisma";
import Link from"next/link";
import { ArrowLeft, User, MapPin, Package, CreditCard, Truck } from"lucide-react";
import { OrderStatusUpdater } from"./status-updater";
import { PaymentStatusUpdater } from"./payment-status-updater";
import { ApproveOrderButton } from"./approve-button";
import { OrderItemDetails } from "./order-item-details";
import { ShipmentTracker } from "./ShipmentTracker";
import { OrderTimeline } from "./OrderTimeline";
import { FileText, ClipboardCheck, ExternalLink, Check } from "lucide-react";
import { CancelOrderButton } from "./cancel-button";
import { MarkAsPickedUpButton } from "./picked-up-button";
import { IssueInvoiceButton } from "./issue-invoice-button";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const orderRaw = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    part: {
                        include: {
                            VehicleBrand: true,
                            VehicleModel: true,
                            PartCategory: true,
                            PartSubcategory: true
                        }
                    }
                }
            }
        }
    });

    if (!orderRaw) return <div>Rendelés nem található</div>;
    const order = orderRaw as any; // Cast to any temporarily to allow TS to compile until prisma generate is run

    // Parse JSON addresses safely
    let shipping: any = null;
    try {
        shipping = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
    } catch (e) {
        console.error("Error parsing shipping address:", e);
    }
    const isPickup = order.shippingMethod === 'PICKUP';
    const isCOD = order.paymentMethod === 'COD';

    return (
        <div className="space-y-6 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors border border-gray-200 dark:border-white/10">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rendelés <span className="text-white bg-[var(--color-primary)] px-3 py-1 rounded-xl shadow-lg shadow-[var(--color-primary)]/20 ml-2 uppercase font-black text-2xl">#{order.id?.slice(0, 8)}</span></h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nincs dátum'}
                        </p>
                    </div>
                </div>
                <div className="md:ml-auto flex flex-col md:flex-row items-end md:items-center gap-3">
                    <CancelOrderButton orderId={order.id} status={order.status} />
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm overflow-hidden mb-6">
                <OrderTimeline 
                    status={order.status} 
                    paymentStatus={order.paymentStatus} 
                    paymentMethod={order.paymentMethod}
                    invoiceId={order.invoiceId}
                    trackingNumber={order.trackingNumber}
                    shippingMethod={order.shippingMethod}
                    createdAt={order.createdAt}
                />
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <PaymentStatusUpdater 
                    orderId={order.id} 
                    currentPaymentStatus={order.paymentStatus || 'PENDING'} 
                    orderStatus={order.status || 'PENDING'} 
                    paymentMethod={order.paymentMethod || 'CARD'} 
                    shippingMethod={order.shippingMethod || 'DELIVERY'}
                    trackingNumber={order.trackingNumber}
                />
                <ApproveOrderButton 
                    orderId={order.id} 
                    status={order.status || 'PENDING'} 
                    paymentMethod={order.paymentMethod || 'CARD'} 
                    shippingMethod={order.shippingMethod || 'DELIVERY'} 
                />
                <MarkAsPickedUpButton 
                    orderId={order.id}
                    status={order.status || 'PENDING'}
                    shippingMethod={order.shippingMethod || 'DELIVERY'}
                />
                <IssueInvoiceButton 
                    orderId={order.id}
                    invoiceId={order.invoiceId}
                    shippingMethod={order.shippingMethod || 'DELIVERY'}
                    paymentStatus={order.paymentStatus || 'PENDING'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 font-bold flex items-center gap-2 bg-gray-50 dark:bg-white/5">
                            <Package className="w-5 h-5 text-[var(--color-primary)]" />
                            Megrendelt Tételek
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-white/10">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <OrderItemDetails item={item} />

                                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 dark:border-white/5 pt-2 sm:pt-0">
                                        <p className="font-black text-lg text-gray-900 dark:text-white whitespace-nowrap">{item.priceAtTime.toLocaleString('hu-HU')} Ft</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{item.quantity} db</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Végösszeg</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{order.totalAmount.toLocaleString('hu-HU')} Ft</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Billing Info Moved Left */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                            <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />
                                Számlázási Adatok
                            </h2>
                            <div className="text-sm space-y-1">
                                {(() => {
                                    try {
                                        const billing = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
                                        if (!billing) return <p className="text-gray-500 italic">Nincs számlázási adat.</p>;
                                        return (
                                            <div className="space-y-1 text-gray-600 dark:text-gray-300 font-medium">
                                                <p className="text-gray-900 dark:text-white font-bold">{billing.name || (billing.companyName) || 'Nincs elnevezés'}</p>
                                                <p>{billing.postalCode || 'N/A'} {billing.city || 'N/A'}</p>
                                                <p>{billing.address || 'Nincs utca/házszám'}</p>
                                                <p className="mt-2 text-xs flex items-center gap-2">
                                                    <span className="font-bold text-gray-400 uppercase tracking-tighter w-12 shrink-0 text-[10px]">Email:</span>
                                                    <span className="text-gray-900 dark:text-white">{billing.email || order.user?.email || 'N/A'}</span>
                                                </p>
                                                {billing.taxNumber && (
                                                    <p className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 text-xs flex items-center gap-2">
                                                        <span className="font-bold text-gray-400 uppercase tracking-tighter w-12 shrink-0 text-[10px]">Adószám:</span>
                                                        <span className="text-gray-900 dark:text-white font-bold">{billing.taxNumber}</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    } catch (e) {
                                        return <p className="text-red-500 text-xs italic">Hiba az adatok beolvasásakor.</p>;
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Payment Method Moved Left */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                            <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                                <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />
                                Fizetési Mód
                            </h2>
                            <div className="text-sm">
                                <p className="font-bold text-gray-900 dark:text-white mb-2">{isCOD ? (isPickup ?'Helyszíni fizetés' :'Utánvét') :'Online Bankkártya'}</p>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus ==='PAID' ?'bg-green-100 text-green-700' :'bg-yellow-100 text-yellow-700'}`}>
                                    {order.paymentStatus ==='PAID' ?'💰 Sikeresen kifizetve' :'⏳ Fizetésre vár'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Info & Shipping (Reduced height items) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                            <User className="w-4 h-4 text-[var(--color-primary)]" />
                            Vásárló Adatai
                        </h2>
                        <div className="space-y-1">
                            <p className="text-gray-900 dark:text-white font-bold">
                                {order.user?.fullName || (shipping ? (shipping.name || `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()) : 'Vendég')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                {order.user?.email}
                            </p>
                            {shipping?.phone && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.phone}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Truck className="w-4 h-4 text-[var(--color-primary)]" />
                            Szállítási Mód
                        </h2>
                        <div className="text-sm">
                            <div className={`mb-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${isPickup ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isPickup ? 'Személyes átvétel' : 'Futár (PannonXP)'}
                            </div>
                            {!isPickup && shipping ? (
                                <div className="space-y-1 text-gray-600 dark:text-gray-300 font-medium">
                                    <p className="text-gray-900 dark:text-white font-bold">{shipping.name || (shipping.firstName +' ' + shipping.lastName)}</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                        <div>
                                            <p>{shipping?.zip || shipping?.postalCode || 'N/A'} {shipping?.city || 'N/A'}</p>
                                            <p>{shipping?.street || shipping?.address || 'Nincs megadva'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 space-y-1">
                                        <p className="text-xs flex items-center gap-2">
                                            <span className="font-bold text-gray-400 uppercase tracking-tighter w-12 shrink-0 text-[10px]">Email:</span>
                                            <span className="text-gray-900 dark:text-white">{order.user?.email || shipping.email || 'N/A'}</span>
                                        </p>
                                        <p className="text-xs flex items-center gap-2">
                                            <span className="font-bold text-gray-400 uppercase tracking-tighter w-12 shrink-0 text-[10px]">Tel:</span>
                                            <span className="text-gray-900 dark:text-white">{shipping.phone || order.user?.phoneNumber || 'N/A'}</span>
                                        </p>
                                    </div>
                                    <ShipmentTracker 
                                        orderId={order.id} 
                                        trackingNumber={order.trackingNumber} 
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-500 italic py-2">Vevő bejön érte a telephelyre.</p>
                            )}
                            
                            {/* Shipping Dimensions Summary */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Package className="w-3 h-3" />
                                    Csomag adatai
                                </h3>
                                <div className="space-y-2">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={item.id} className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                            <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate mb-1">
                                                {idx + 1}. {item.part?.name}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-primary)]">
                                                <span className="flex items-center gap-1">
                                                    <Truck className="w-3 h-3" />
                                                    {item.part?.weight || '?'} kg
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span>
                                                    {item.part?.length || 0}x{item.part?.width || 0}x{item.part?.height || 0} cm
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                            Adminisztráció és Dokumentumok
                        </h2>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${order.invoiceId ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">E-Számla (Billingo)</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{order.invoiceId ? `Sorszám: ${order.invoiceId}` : 'Jóváhagyáskor készül el'}</p>
                                    </div>
                                </div>
                                {order.invoiceId && (
                                    <div className="space-y-2">
                                        <div className="w-full py-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-500/20">
                                            <Check className="w-3.5 h-3.5" /> KÉSZ
                                        </div>
                                        {order.invoiceUrl && (
                                            <a 
                                                href={order.invoiceUrl}
                                                target="_blank"
                                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] border border-emerald-400"
                                            >
                                                <ExternalLink className="w-4 h-4" /> SZÁMLA MEGTEKINTÉSE
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${order.trackingNumber ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">Szállítási Címke (PXP)</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 break-all">
                                            {isPickup ? 'Személyes átvétel - nem szükséges' : (order.trackingNumber ? `Csomagszám: ${order.trackingNumber}` : 'Jóváhagyáskor készül el')}
                                        </p>
                                    </div>
                                </div>
                                {order.trackingNumber && (
                                    <a 
                                        href={`/api/admin/shipping/label/${order.trackingNumber}`}
                                        target="_blank"
                                        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] border border-blue-400"
                                    >
                                        <ExternalLink className="w-4 h-4" /> NYOMTATÁS
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
