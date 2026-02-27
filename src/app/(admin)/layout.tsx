import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Truck, RotateCcw, Box } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // TODO: Add actual auth check here later

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans pt-20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <Link href="/admin" className="-ml-2 flex items-center gap-2 text-2xl font-black tracking-tighter group transition-colors duration-300">
                        <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo_orange.png"
                                alt="Logo"
                                className="w-full h-full object-contain"
                                style={{ filter: "drop-shadow(0px 0px 5px rgba(249,115,22,0.6))" }}
                            />
                        </div>
                        <span className="text-gray-900 group-hover:text-[var(--color-primary)] transition-colors duration-300"><span className="text-[var(--color-primary)]">BONTÓ</span>ADMIN</span>
                    </Link>
                </div>

                <NavLink href="/admin" icon={<LayoutDashboard />} label="Áttekintés" />
                <NavLink href="/admin/inventory" icon={<Package />} label="Készlet & Raktár" />
                <NavLink href="/admin/orders" icon={<ShoppingCart />} label="Rendelések" />
                <NavLink href="/admin/returns" icon={<RotateCcw />} label="Visszáru (RMA)" />

                <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider px-3">
                    Rendszer
                </div>
                <NavLink href="/admin/users" icon={<Users />} label="Felhasználók" />

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-orange-600 flex items-center justify-center text-white font-bold">A</div>
                        <div>
                            <p className="text-sm font-bold">Adminisztrátor</p>
                            <p className="text-xs text-gray-500">admin@autonexus.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
            <span className="w-5 h-5">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
