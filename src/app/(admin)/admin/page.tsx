import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users } from "lucide-react";
import { MaintenanceTrigger } from "./maintenance-trigger";
import { DashboardRevenue } from "@/components/admin/DashboardRevenue";

async function getStats() {
    // 1. Basic Counts
    let products = 0;
    let users = 0;
    try {
        products = await prisma.part.count();
        users = await prisma.user.count();
    } catch (e) {
        console.error("Error fetching basic counts:", e);
    }

    // 2. Multi-period Revenue
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const periods = [
        { key: 'today', start: startOfToday },
        { key: 'week', start: startOfWeek },
        { key: 'month', start: startOfMonth },
        { key: 'year', start: startOfYear }
    ];

    const revenueStats: any = {};

    for (const p of periods) {
        const orders = await prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: p.start }
            },
            select: { totalAmount: true }
        });
        revenueStats[p.key] = {
            revenue: orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0),
            count: orders.length
        };
    }

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
                name: item.part?.name || "Ismeretlen alkatrész",
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
        revenueStats,
        activeOrdersCount,
        trendingSearches,
        topSellers
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-10 text-gray-900 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900">Vezérlőpult</h1>
                    <p className="text-gray-500 font-medium">Üzleti intelligencia és folyamatkezelés</p>
                </div>
                <MaintenanceTrigger />
            </div>

            {/* Interactive Revenue Section */}
            <DashboardRevenue initialStats={stats.revenueStats} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Aktív Feladatok" 
                    value={stats.activeOrdersCount.toString()}
                    icon={<ShoppingCart className="w-6 h-6" />}
                    color="blue"
                    subtitle="Kiszállításra váró csomagok" />
                <StatCard
                    title="Raktárkészlet" 
                    value={`${stats.products.toLocaleString()} db`}
                    icon={<Package className="w-6 h-6" />}
                    color="orange"
                    subtitle="Összes feltöltött alkatrész"
                />
                <StatCard
                    title="Ügyfelek" 
                    value={stats.users.toLocaleString()}
                    icon={<Users className="w-6 h-6" />}
                    color="purple"
                    subtitle="Regisztrált felhasználók"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demand Sensing Module */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Piaci Igények</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Leggyakoribb keresések</p>
                        </div>
                        <span className="text-[10px] font-black text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full uppercase tracking-tighter">Live Demand</span>
                    </div>

                    {stats.trendingSearches.length === 0 ? (
                        <div className="text-gray-400 text-sm py-12 text-center font-medium italic">Nincs elegendő adat a trendekhez.</div>
                    ) : (
                        <div className="space-y-6">
                            {stats.trendingSearches.map((search, i) => (
                                <div key={search.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-black text-gray-100 group-hover:text-[var(--color-primary)]/10 transition-colors w-8 italic">0{i + 1}</div>
                                        <div className="font-bold text-gray-700 group-hover:text-[var(--color-primary)] transition-colors lowercase tracking-tight">
                                            {search.query}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-black text-gray-900">
                                            {search.count}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Keresés</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Sellers Module */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Sikertermékek</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Legjobban fogyó alkatrészek</p>
                        </div>
                    </div>

                    {stats.topSellers.length === 0 ? (
                        <div className="text-gray-400 text-sm py-12 text-center font-medium italic">Nincs még eladás.</div>
                    ) : (
                        <div className="space-y-6">
                            {stats.topSellers.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-transform group-hover:rotate-6 ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">{item.quantity} db eladva</div>
                                        </div>
                                    </div>
                                    <div className="font-black text-gray-900 tabular-nums">
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
