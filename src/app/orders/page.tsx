export const dynamic = "force-dynamic";
import { createClient } from"@/lib/supabase/server";
import { prisma } from"@/lib/prisma";
import { Navbar } from"@/components/navbar";
import { Package, Calendar, CreditCard, ChevronRight, Search } from"lucide-react";
import Link from"next/link";
import { redirect } from"next/navigation";

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch orders from Prisma
    const orders = await prisma.order.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt:'desc' },
        include: {
            items: {
                include: {
                    part: true
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <div className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                            Vásárlásaim
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            Itt nyomon követheted korábbi rendeléseid állapotát.
                        </p>
                    </div>

                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input
                            type="text" placeholder="Rendelésszám keresése..." className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                    </div>
                </header>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Package className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Még nincs rendelésed</h3>
                        <p className="text-gray-500 font-medium mb-8">Úgy tűnik, még nem vásároltál nálunk semmit.</p>
                        <Link
                            href="/" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-[var(--color-primary)]/20" >
                            Böngészés az alkatrészek között
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block group p-6 bg-white border border-gray-200 rounded-3xl hover:border-[var(--color-primary)] transition-all" >
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                                            <Package className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                                Rendelés: #{order.id.slice(0, 8).toUpperCase()}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(order.createdAt).toLocaleDateString('hu-HU')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${order.status ==='COMPLETED' ?'bg-green-500/10 text-green-500' :
                                                        order.status ==='PENDING' ?'bg-orange-500/10 text-orange-500' :'bg-gray-500/10 text-gray-400' }`}>
                                                    {order.status ==='COMPLETED' ?'Teljesítve' :
                                                        order.status ==='PENDING' ?'Függőben' :'Feldolgozás alatt'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Összeg</p>
                                            <p className="text-xl font-black text-gray-900">
                                                {order.totalAmount.toLocaleString()} HUF
                                            </p>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
