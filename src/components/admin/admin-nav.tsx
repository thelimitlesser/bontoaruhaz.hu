"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, RotateCcw, Menu, X, ChevronRight, Database } from "lucide-react";

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function NavLink({ href, icon, label, onClick }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-orange-500/20" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
        >
            <span className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {icon}
            </span>
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
        </Link>
    );
}

interface AdminNavProps {
    user: {
        fullName: string | null;
        email: string;
    };
}

export function AdminSidebar({ user }: AdminNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[100] flex items-center justify-between px-4 shadow-sm">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo_orange.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-black text-lg tracking-tighter">
                        <span className="text-[var(--color-primary)]">BONTÓ</span>ÁRUHÁZ
                    </span>
                </Link>
                <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300" onClick={closeMenu}
                />
            )}

            {/* Sidebar container */}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-[100] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Logo & Close (Mobile) */}
                <div className="p-6 h-20 flex items-center justify-between border-b border-gray-50">
                    <Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
                        <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <img src="/logo_orange.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                            <span className="text-[var(--color-primary)]">BONTÓ</span>ÁRUHÁZ
                        </span>
                    </Link>
                    <button onClick={closeMenu} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <div className="pb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">
                        Menü
                    </div>
                    <NavLink href="/admin" icon={<LayoutDashboard />} label="Áttekintés" onClick={closeMenu} />
                    <NavLink href="/admin/inventory" icon={<Package />} label="Készlet & Raktár" onClick={closeMenu} />
                    <NavLink href="/admin/orders" icon={<ShoppingCart />} label="Rendelések" onClick={closeMenu} />
                    <NavLink href="/admin/returns" icon={<RotateCcw />} label="Visszáru (RMA)" onClick={closeMenu} />

                    <div className="pt-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">
                        Rendszer
                    </div>
                    <NavLink href="/admin/users" icon={<Users />} label="Felhasználók" onClick={closeMenu} />
                    <NavLink href="/admin/dictionary" icon={<Database />} label="Szótárak (Márkák, Kategóriák)" onClick={closeMenu} />
                </nav>

                {/* User Profile Area */}
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-gray-900 truncate leading-none mb-1">{user.fullName || 'Adminisztrátor'}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tight">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
