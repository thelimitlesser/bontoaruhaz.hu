import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { User, Package, Settings, Car, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ensureUserExists } from "@/app/actions/user";
import { cookies } from "next/headers";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map(c => c.name).join(', ');

    let dbUser;
    let errorMsg = null;

    try {
        dbUser = await ensureUserExists();
    } catch (e: any) {
        errorMsg = e.message || String(e);
    }

    if (!dbUser) {
        // If it's a Prisma connection error, we render it
        return (
            <div className="min-h-screen pt-40 text-center font-bold px-4">
                <h2 className="text-red-500 text-2xl">Server Error Loading Profile</h2>
                <p className="text-red-400 mt-2">{errorMsg || "ensureUserExists returned null."}</p>
                <div className="mt-8 text-left bg-gray-100 p-4 rounded-xl overflow-x-auto text-black text-sm">
                    <strong>Server Received Cookies:</strong> <br />
                    {cookieNames || "NO COOKIES RECEIVED!"}
                </div>
            </div>
        );
    }

    // Fetch counts from Prisma
    const [orderCount, vehicleCount] = await Promise.all([
        prisma.order.count({ where: { userId: dbUser.id } }),
        prisma.userVehicle.count({ where: { userId: dbUser.id } })
    ]);

    const menuItems = [
        { icon: Package, label: "Vásárlásaim", href: "/orders", desc: "Korábbi rendelések és számlák" },
        { icon: Car, label: "Saját Garázs", href: "/garage", desc: "Mentett járműveid gyors kezelése" },
        { icon: User, label: "Személyes Adatok", href: "/profile/settings", desc: "Név, telefonszám és címek" },
        { icon: Settings, label: "Beállítások", href: "/settings", desc: "Értesítések és fiók kezelés" },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                        Fiók Kezelése
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Üdvözöljük, <span className="text-[var(--color-primary)] font-bold">{dbUser.fullName || dbUser.email}</span>!
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-[var(--color-primary)] transition-all flex items-center gap-6" >
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-all">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                    {item.label}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {item.desc}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>

                {/* Account Summary Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-3xl">
                        <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Rendelések száma</p>
                        <p className="text-3xl font-black text-gray-900">{orderCount}</p>
                    </div>
                    <div className="p-6 bg-white border border-gray-200 rounded-3xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mentett autók</p>
                        <p className="text-3xl font-black text-gray-900">{vehicleCount}</p>
                    </div>
                    <div className="p-6 bg-white border border-gray-200 rounded-3xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hűségpontok</p>
                        <p className="text-3xl font-black text-gray-900">0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
