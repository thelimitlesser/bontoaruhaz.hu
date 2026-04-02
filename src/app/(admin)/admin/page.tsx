export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { DollarSign, Package, ShoppingCart, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { MaintenanceTrigger } from "./maintenance-trigger";

async function getStats(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? (now.getMonth() + 1);
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // 1. Basic Counts
    let products = 0;
    let users = 0;
    try {
        products = await prisma.part.count();
        users = await prisma.user.count();
    } catch (e) {
        console.error("Error fetching basic counts:", e);
    }

    // 2. Revenue Calculation (ONLY PAID orders in the selected month)
    let paidOrders: { totalAmount: number }[] = [];
    try {
        paidOrders = await prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: { totalAmount: true }
        });
    } catch (e) {
        console.error("Error fetching paid orders:", e);
        // Fallback if paymentStatus column doesn't exist yet (though it should)
        try {
            paidOrders = await (prisma.order as any).findMany({
                where: {
                    status: 'PAID',
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: { totalAmount: true }
            });
        } catch (e2) {
            console.error("Fallback revenue calculation failed:", e2);
        }
    }
    const monthlyRevenue = paidOrders.reduce((acc: number, order: any) => acc + order.totalAmount, 0);

    // 3. Active Orders (All time, not completed or cancelled)
    let activeOrdersCount = 0;
    try {
        activeOrdersCount = await prisma.order.count({
            where: {
                status: {
                    notIn: ['DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']
                }
            }
        });
    } catch (e) {
        console.error("Error fetching active orders:", e);
    }

    // 4. Trending Searches
    let trendingSearches: any[] = [];
    try {
        trendingSearches = await prisma.searchLog.findMany({
            orderBy: { count: 'desc' },
            take: 5
        });
    } catch (e) {
        console.error("Error fetching trending searches:", e);
    }

    // 5. Top Selling Parts (All time)
    let orderItems: any[] = [];
    try {
        orderItems = await prisma.orderItem.findMany({
            include: { part: true },
            take: 100
        });
    } catch (e) {
        console.error("Error fetching top sellers:", e);
    }

    const salesByPart: Record<string, { name: string; quantity: number; total: number }> = {};
    orderItems.forEach(item => {
        if (!salesByPart[item.partId]) {
            salesByPart[item.partId] = {
                name: item.part.name,
                quantity: 0,
                total: 0
            };
        }
        salesByPart[item.partId].quantity += item.quantity;
        salesByPart[item.partId].total += item.priceAtTime * item.quantity;
    });

    const topSellers = Object.values(salesByPart)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return {
        products,
        users,
        monthlyRevenue,
        activeOrdersCount,
        trendingSearches,
        topSellers,
        targetMonth,
        targetYear,
        error: products === 0 && users === 0 && monthlyRevenue === 0 ? "Nem sikerült adatokat lekérni az adatbázisból. Kérjük, ellenőrizze a DATABASE_URL beállítást a Vercel-ben!" : null
    };
}

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: Promise<{ m?: string; y?: string }>
}) {
    const sParams = await searchParams;
    const m = sParams.m ? parseInt(sParams.m) : undefined;
    const y = sParams.y ? parseInt(sParams.y) : undefined;

    const stats = await getStats(m, y);

    const monthNames = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];

    return (
        <div className="space-y-8 text-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vezérlőpult</h1>
                    <p className="text-gray-500">Üzleti statisztikák és áttekintés</p>
                </div>

                {stats.error && (
                    <div className="flex-1 max-w-lg bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-red-700 font-bold text-sm">ADATBÁZIS KAPCSOLATI HIBA</p>
                            <p className="text-red-600 text-xs">{stats.error}</p>
                        </div>
                    </div>
                )}

                <MaintenanceTrigger />

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <div className="px-3 py-1.5 text-sm font-bold flex items-center gap-2 text-gray-400 border-r border-gray-100">
                        <Calendar className="w-4 h-4" />
                        IDŐSZAK:
                    </div>
                    <div className="flex gap-1 overflow-x-auto max-w-[300px] md:max-w-none px-2">
                        {[5, 4, 3, 2, 1, 0].map((offset) => {
                            const d = new Date();
                            d.setDate(1); // Mentsük meg a világot a Február 31-től
                            d.setMonth(d.getMonth() - offset);
                            const month = d.getMonth() + 1;
                            const year = d.getFullYear();
                            const isActive = stats.targetMonth === month && stats.targetYear === year;

                            return (
                                <Link
                                    key={`${year}-${month}`}
                                    href={`/admin?m=${month}&y=${year}`}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${isActive
                                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {monthNames[month - 1]}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={`${monthNames[stats.targetMonth - 1]}i Bevétel`}
                    value={`${stats.monthlyRevenue.toLocaleString()} Ft`}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="green"
                    subtitle="Kizárólag a kifizetett rendelések" />
                <StatCard
                    title="Aktív Rendelések" value={stats.activeOrdersCount.toString()}
                    icon={<ShoppingCart className="w-6 h-6" />}
                    color="blue"
                    subtitle="Folyamatban lévő ügyek" />
                <StatCard
                    title="Raktárkészlet" value={`${stats.products} db`}
                    icon={<Package className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    title="Felhasználók" value={stats.users.toString()}
                    icon={<Users className="w-6 h-6" />}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demand Sensing Module */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Piaci Igények (Keresések)</h2>
                        <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded uppercase tracking-wider">Demand Sensing</span>
                    </div>

                    {stats.trendingSearches.length === 0 ? (
                        <div className="text-gray-500 text-sm py-8 text-center">Nincs elegendő adat a trendekhez.</div>
                    ) : (
                        <div className="space-y-4">
                            {stats.trendingSearches.map((search, i) => (
                                <div key={search.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-gray-500 text-sm w-4">#{i + 1}</div>
                                        <div className="font-medium text-gray-900 group-hover:text-[var(--color-primary)] transition-colors lowercase">
                                            {search.query}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-500">
                                        {search.count} keresés
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Sellers Module */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Sikertermékek (Top 5)</h2>

                    {stats.topSellers.length === 0 ? (
                        <div className="text-gray-500 text-sm py-8 text-center">Nincs még eladás.</div>
                    ) : (
                        <div className="space-y-4">
                            {stats.topSellers.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-100 text-gray-500'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.quantity} db eladva</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {item.total.toLocaleString()} Ft
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtitle, color = "blue" }: { title: string, value: string, icon: React.ReactNode, subtitle?: string, color?: 'green' | 'blue' | 'orange' | 'purple' }) {
    const colorClasses = {
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Background Decorative Sparkline */}
            <div className="absolute bottom-0 right-0 w-32 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                    <path
                        d="M0 35 Q 20 10, 40 25 T 80 5 T 100 30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={color === 'green' ? 'text-green-500' : color === 'blue' ? 'text-blue-500' : color === 'orange' ? 'text-orange-500' : 'text-purple-500'}
                    />
                </svg>
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                    <p className="text-2xl font-black mt-2 text-gray-900 tracking-tight">{value}</p>
                    {subtitle && <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl border ${colorClasses[color]} shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
