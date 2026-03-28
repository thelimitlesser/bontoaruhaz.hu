import { createClient } from"@/lib/supabase/server";
import { prisma } from"@/lib/prisma";
import { Navbar } from"@/components/navbar";
import { Package, Calendar, CreditCard, ChevronLeft, MapPin, Truck, CheckCircle2 } from"lucide-react";
import Link from"next/link";
import { redirect, notFound } from"next/navigation";
import Image from "next/image";

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
            userId: user.id // Security check: user can only see their own orders
        },
        include: {
            items: {
                include: {
                    part: true
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                <Link
                    href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group" >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Vissza a rendeléseimhez
                </Link>

                <header className="mb-12 flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest rounded-full">
                                #RD-{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status ==='COMPLETED' ?'bg-green-500/10 text-green-500' :'bg-orange-500/10 text-orange-500' }`}>
                                {order.status ==='COMPLETED' ?'Teljesítve' :'Függőben'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                            Rendelés Részletei
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dátum</p>
                        <p className="font-bold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('hu-HU', { year:'numeric', month:'long', day:'numeric' })}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <Package className="w-5 h-5 text-[var(--color-primary)]" />
                                <h2 className="font-bold text-gray-900 uppercase tracking-tight">Rendelt alkatrészek</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
                                            {item.part.images ? (
                                                <Image
                                                    src={item.part.images.split(',')[0]}
                                                    alt={item.part.name}
                                                    fill
                                                    className="object-cover rounded"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{item.part.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cikkszám: {item.part.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-500">{item.quantity} db</p>
                                            <p className="font-black text-gray-900">{item.priceAtTime.toLocaleString()} HUF</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50 flex justify-between items-center text-xl font-black">
                                <span className="text-gray-900 uppercase tracking-tighter">Összesen</span>
                                <span className="text-[var(--color-primary)]">{order.totalAmount.toLocaleString()} HUF</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Status & Address */}
                    <div className="space-y-6">
                        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--color-primary)]" /> Szállítási adatok
                            </h3>
                            <div className="space-y-4 text-sm font-medium">
                                <div>
                                    <p className="text-gray-500 mb-1">Szállítási cím</p>
                                    <p className="text-gray-900 leading-relaxed">{order.shippingAddress ||"Nincs megadva"}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 mb-1">Szállítás módja</p>
                                    <p className="text-gray-900 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-gray-400" /> Kurárszolgálat (GLS)
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[var(--color-primary)]" /> Fizetés
                            </h3>
                            <div className="space-y-4 text-sm font-medium">
                                <div>
                                    <p className="text-gray-500 mb-1">Fizetési mód</p>
                                    <p className="text-gray-900">Utánvét / Bankkártya</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-green-500">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Fizetve</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
