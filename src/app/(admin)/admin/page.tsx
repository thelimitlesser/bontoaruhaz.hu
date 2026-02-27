import { prisma } from "@/lib/prisma"; // Need to check if lib/prisma exists, likely need to create it
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";


async function getStats() {
    // 1. Basic Counts
    const products = await prisma.part.count();
    const orders = await prisma.order.count();
    const users = await prisma.user.count();

    // 2. Revenue Calculation
    const paidOrders = await prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } }, // Assuming non-cancelled are valid sales for now
        select: { totalAmount: true }
    });
    const revenue = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // 3. Trending Searches (Demand Sensing)
    const trendingSearches = await prisma.searchLog.findMany({
        orderBy: { count: 'desc' },
        take: 5
    });

    // 4. Top Selling Parts
    // Prisma doesn't support complex aggregations with relations easily in one query for this
    // We'll fetch order items and aggregate in memory for this prototype (assuming low volume)
    // For high volume, would use raw query: SELECT partId, SUM(quantity) ... GROUP BY partId
    const orderItems = await prisma.orderItem.findMany({
        include: { part: true },
        take: 100 // Last 100 items analysis
    });

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
        orders,
        users,
        revenue,
        trendingSearches,
        topSellers
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8 text-gray-900">
            <h1 className="text-3xl font-bold tracking-tight">Vezérlőpult</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Összes Bevétel" value={`${stats.revenue.toLocaleString()} Ft`} icon={<DollarSign className="w-6 h-6 text-green-500" />} />
                <StatCard title="Aktív Rendelések" value={stats.orders.toString()} icon={<ShoppingCart className="w-6 h-6 text-blue-500" />} />
                <StatCard title="Raktárkészlet" value={`${stats.products} db`} icon={<Package className="w-6 h-6 text-orange-500" />} />
                <StatCard title="Regisztrált Felhasználók" value={stats.users.toString()} icon={<Users className="w-6 h-6 text-purple-500" />} />
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
                                        <div className="font-medium text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
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

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                {icon}
            </div>
        </div>
    )
}
