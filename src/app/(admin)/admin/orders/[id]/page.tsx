import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Package, CreditCard } from "lucide-react";
import { OrderStatusUpdater } from "./status-updater";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true, items: { include: { part: true } } }
    });

    if (!order) return <div>Rendelés nem található</div>;

    // Parse JSON addresses safely
    const shipping = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rendelés #{order.id.slice(0, 8)}</h1>
                    <p className="text-gray-400">{new Date(order.createdAt).toLocaleString('hu-HU')}</p>
                </div>
                <div className="ml-auto">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-[var(--color-primary)]" />
                            Megrendelt Tételek
                        </div>
                        <div className="divide-y divide-white/10">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-500">IMG</div>
                                        <div>
                                            <p className="font-medium text-white">{item.part.name}</p>
                                            <p className="text-sm text-gray-500 font-mono">{item.part.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">{item.priceAtTime.toLocaleString()} Ft</p>
                                        <p className="text-sm text-gray-500">{item.quantity} db</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                            <span className="text-gray-400">Végösszeg</span>
                            <span className="text-2xl font-black text-white">{order.totalAmount.toLocaleString()} Ft</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
                        <h2 className="font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Vásárló Adatai
                        </h2>
                        <div>
                            <p className="text-white font-medium">{order.user?.fullName || 'Vendég'}</p>
                            <p className="text-sm text-gray-400">{order.user?.email}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
                        <h2 className="font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            Szállítási Cím
                        </h2>
                        <div className="text-sm text-gray-300">
                            <p>{shipping?.name}</p>
                            <p>{shipping?.zip} {shipping?.city}</p>
                            <p>{shipping?.street}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
                        <h2 className="font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            Fizetési Mód
                        </h2>
                        <div className="text-sm text-gray-300">
                            <p>Utánvét</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
