import { prisma } from"@/lib/prisma";
import Link from"next/link";
import { ArrowLeft, User, MapPin, Package, CreditCard, Truck } from"lucide-react";
import { OrderStatusUpdater } from"./status-updater";
import { PaymentStatusUpdater } from"./payment-status-updater";
import { ApproveOrderButton } from"./approve-button";

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
                        <h1 className="text-3xl font-bold tracking-tight">Rendelés <span className="text-[var(--color-primary)]">#{order.id?.slice(0, 8)}</span></h1>
                        <p className="text-gray-500 dark:text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleString('hu-HU') : 'Nincs dátum'}</p>
                    </div>
                </div>
                <div className="md:ml-auto">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <PaymentStatusUpdater orderId={order.id} currentPaymentStatus={order.paymentStatus ||'PENDING'} />
                <ApproveOrderButton orderId={order.id} status={order.status} />
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
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 overflow-hidden border border-gray-200 dark:border-gray-700 font-bold">
                                            {(() => {
                                                if (!item.part?.images) return "Nincs kép";
                                                try {
                                                    const imgs = JSON.parse(item.part.images);
                                                    return <img src={imgs[0]} alt={item.part.name} className="w-full h-full object-cover" />;
                                                } catch (e) {
                                                    return "Nincs kép";
                                                }
                                            })()}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{item.part?.name || 'Ismeretlen termék'}</p>
                                            <p className="text-sm font-medium text-[var(--color-primary)]">
                                                {item.part?.VehicleBrand?.name} {item.part?.VehicleModel?.name}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded font-mono text-gray-500 dark:text-gray-400">
                                                    SKU: {item.part?.sku || 'N/A'}
                                                </span>
                                                {item.part?.PartCategory && (
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-bold">
                                                        {item.part.PartCategory.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 dark:border-white/5 pt-2 sm:pt-0">
                                        <p className="font-black text-lg text-gray-900 dark:text-white">{item.priceAtTime.toLocaleString('hu-HU')} Ft</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.quantity} db</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Végösszeg</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{order.totalAmount.toLocaleString('hu-HU')} Ft</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                            <User className="w-4 h-4 text-[var(--color-primary)]" />
                            Vásárló Adatai
                        </h2>
                        <div className="space-y-1">
                            <p className="text-gray-900 dark:text-white font-bold">{order.user?.fullName ||'Vendég'}</p>
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
                                {isPickup ?'Személyes átvétel' :'Házhozszállítás'}
                            </div>
                            {!isPickup && shipping ? (
                                <div className="space-y-1 text-gray-600 dark:text-gray-300 font-medium">
                                    <p className="text-gray-900 dark:text-white font-bold">{shipping.name || (shipping.firstName +' ' + shipping.lastName)}</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                        <div>
                                            <p>{shipping?.zip || shipping?.postalCode} {shipping?.city}</p>
                                            <p>{shipping?.street || shipping?.address}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic py-2">Vevő bejön érte a telephelyre.</p>
                            )}
                        </div>
                    </div>

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
        </div>
    );
}
