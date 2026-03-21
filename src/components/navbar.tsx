"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, User, Home, Info, HelpCircle, ShieldCheck, Phone, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { syncAndGetUserRole } from "@/app/actions/user";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const { totalItems, setIsCartOpen } = useCart();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const dbRole = await syncAndGetUserRole();
                    setUser({ ...user, role: dbRole });
                } catch (e) {
                    console.error("Failed to fetch user role", e);
                    setUser(user);
                }
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                try {
                    const dbRole = await syncAndGetUserRole();
                    setUser({ ...session.user, role: dbRole });
                } catch (e) {
                    setUser(session.user);
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsProfileOpen(false);
        window.location.href = "/";
    };

    const links = [
        { href: "/", label: "Főoldal", icon: Home },
        { href: "/about", label: "Rólunk", icon: Info },
        { href: "/faq", label: "GYIK", icon: HelpCircle },
        { href: "/warranty", label: "Garancia", icon: ShieldCheck },
        { href: "/contact", label: "Kapcsolat", icon: Phone },
    ];

    // Do not show the main Navbar in the Admin section
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all font-[family-name:var(--font-geist-sans)] overflow-x-hidden pt-[env(safe-area-inset-top)]">
                <div className="w-full relative px-2 sm:px-6 h-16 sm:h-20 flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="-ml-1 sm:-ml-2 lg:-ml-4 flex items-center gap-1 sm:gap-3 text-sm min-[350px]:text-[17px] sm:text-[28px] font-black tracking-tighter text-foreground z-10 group">
                        <div className="relative w-8 h-8 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Image
                                src="/logo_orange.png" alt="Logo" fill priority unoptimized quality={100} sizes="(max-width: 640px) 32px, 64px" className="object-contain" style={{ imageRendering: 'crisp-edges' }}
                            />
                        </div>
                        <span className="group-hover:text-[var(--color-primary)] transition-colors duration-300 whitespace-nowrap">
                            <span className="text-[var(--color-primary)]">BONTÓ</span>ÁRUHÁZ
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx("text-sm font-bold transition-colors hover:text-[var(--color-primary)]",
                                    pathname === link.href ? "text-foreground" : "text-foreground/85")}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0 sm:gap-4">
                        <button
                            className="relative group p-2 sm:p-3 rounded-full hover:bg-foreground/5 transition-colors" onClick={() => setIsCartOpen(true)}
                            aria-label="Kosár"
                        >
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-muted group-hover:text-foreground transition-colors" />
                            {totalItems > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-[var(--color-primary)] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                className="relative group p-2 sm:p-3 rounded-full hover:bg-foreground/5 transition-colors flex items-center justify-center" 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                aria-label="Profil"
                            >
                                <User className={clsx("w-5 h-5 sm:w-6 sm:h-6 transition-colors", user ? "text-[var(--color-primary)]" : "text-muted group-hover:text-foreground")} />
                            </button>
                        </div>

                        <button
                            className="md:hidden text-foreground hover:text-[var(--color-primary)] p-2 sm:p-3 -mr-1 rounded-full transition-colors" 
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Menü"
                        >
                            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Profile Side Drawer */}
            <AnimatePresence>
                {isProfileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProfileOpen(false)}
                            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[65]" />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 h-screen h-[100dvh] w-full sm:w-[400px] bg-background/90 backdrop-blur-2xl border-l border-border z-[70] flex flex-col shadow-2xl overflow-hidden" >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-border bg-background/20 backdrop-blur-md">
                                <span className="font-bold text-lg uppercase tracking-widest text-foreground">Profil</span>
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="p-2 rounded-full hover:bg-foreground/5 transition-colors" >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                                {!user ? (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="text-lg font-bold text-foreground">Kedves Vásárlónk!</p>
                                            <p className="text-sm text-muted mt-1">Lépj be a fiókodba a vásárláshoz.</p>
                                        </div>
                                        <Link
                                            href="/login" className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-3 sm:py-4 rounded-xl transition-colors flex items-center justify-center" onClick={() => setIsProfileOpen(false)}
                                        >
                                            Bejelentkezés / Regisztráció
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full gap-6">
                                        <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-border">
                                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-3">
                                                <User className="w-6 h-6 text-[var(--color-primary)]" />
                                            </div>
                                            <p className="text-lg font-bold text-foreground">
                                                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-sm text-muted break-all">{user.email}</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Link
                                                href="/profile" className="flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors group" onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white text-[var(--color-primary)] transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-foreground">Profil adatok</span>
                                            </Link>

                                            {(user.app_metadata?.role === 'admin' || user.role === 'ADMIN') && (
                                                <Link
                                                    href="/admin" className="flex items-center gap-3 p-4 rounded-xl hover:bg-red-500/5 transition-colors group" onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-red-500">Admin Panel</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-border">
                                            <button
                                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-500 hover:bg-red-500/10 font-bold transition-colors border border-red-500/20" onClick={handleSignOut}
                                            >
                                                <LogOut className="w-5 h-5" />
                                                Kijelentkezés
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Menu Side Drawer - Outside nav to prevent clipping by backdrop-blur */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 h-screen h-[100dvh] w-[300px] bg-background/60 backdrop-blur-2xl border-l border-border z-[70] md:hidden flex flex-col shadow-2xl overflow-hidden" >
                        {/* Drawer Header */}
                        <div className="h-20 flex items-center justify-between px-6 border-b border-border bg-background/20 backdrop-blur-md">
                            <span className="font-bold text-lg uppercase tracking-widest text-[var(--color-primary)]">Menü</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-foreground/5 transition-colors" >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Menu Links */}
                        <div className="flex flex-col p-4 gap-2 overflow-y-auto mt-2">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx("flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold transition-all duration-200 relative group",
                                        pathname === link.href
                                            ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-sm" : "text-foreground hover:bg-[var(--color-primary)]/5")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                        pathname === link.href
                                            ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" : "bg-foreground/10 text-foreground group-hover:bg-[var(--color-primary)] group-hover:text-white")}>
                                        <link.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">{link.label}</span>
                                </Link>
                            ))}

                            {(user?.app_metadata?.role === 'admin' || user?.role === 'ADMIN') && (
                                <Link
                                    href="/admin"
                                    className={clsx("flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold transition-all duration-200 relative group mt-4 border border-red-500/20 text-red-500 hover:bg-red-500/10",
                                        pathname.startsWith('/admin') ? "bg-red-500/10 shadow-sm" : "")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">Admin Panel</span>
                                </Link>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
