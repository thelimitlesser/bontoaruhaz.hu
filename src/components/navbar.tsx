"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // Temporary mock states for UI demonstration
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isAdmin, setIsAdmin] = useState(true);

    const pathname = usePathname();
    const { totalItems, setIsCartOpen } = useCart();
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const links = [
        { href: "/", label: "Főoldal" },
        { href: "/about", label: "Rólunk" },
        { href: "/faq", label: "GYIK" },
        { href: "/warranty", label: "Garancia" },
        { href: "/contact", label: "Kapcsolat" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all">
            <div className="w-full relative px-6 h-20 flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="-ml-2 lg:-ml-4 flex items-center gap-3 text-[28px] font-black tracking-tighter text-foreground z-10 group">
                    <div className="relative w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo_orange.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                            style={{ filter: "drop-shadow(0px 0px 5px rgba(249,115,22,0.6))" }}
                        />
                    </div>
                    <span className="group-hover:text-[var(--color-primary)] transition-colors duration-300"><span className="text-[var(--color-primary)]">BONTÓ</span>ÁRUHÁZ</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "text-sm font-medium transition-colors hover:text-[var(--color-primary)]",
                                pathname === link.href ? "text-foreground" : "text-muted"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    <button
                        className="relative group p-2 rounded-full hover:bg-foreground/5 transition-colors"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="w-6 h-6 text-muted group-hover:text-foreground transition-colors" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="relative group p-2 rounded-full hover:bg-foreground/5 transition-colors flex items-center justify-center"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <User className="w-6 h-6 text-muted group-hover:text-foreground transition-colors" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-2 z-50 flex flex-col overflow-hidden">
                                {!isLoggedIn ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-border">
                                            <p className="text-sm font-medium text-foreground">Kedves Vásárlónk!</p>
                                            <p className="text-xs text-muted mt-1">Lépj be a fiókodba a vásárláshoz.</p>
                                        </div>
                                        <button className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-foreground/5 hover:text-[var(--color-primary)] transition-colors text-left" onClick={() => setIsLoggedIn(true)}>Bejelentkezés / Regisztráció</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-4 py-3 border-b border-border">
                                            <p className="text-sm font-bold text-foreground">Kovács János</p>
                                            <p className="text-xs text-muted">janos.kovacs@email.com</p>
                                        </div>
                                        <div className="py-1 flex flex-col">
                                            <Link href="/profile" className="px-4 py-3 sm:py-2 text-sm text-foreground hover:bg-foreground/5 hover:text-[var(--color-primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>Profil adatok</Link>
                                            <Link href="/orders" className="px-4 py-3 sm:py-2 text-sm text-foreground hover:bg-foreground/5 hover:text-[var(--color-primary)] transition-colors" onClick={() => setIsProfileOpen(false)}>Vásárlásaim</Link>
                                        </div>
                                        {isAdmin && (
                                            <div className="border-t border-border py-1 flex flex-col">
                                                <Link href="/admin" className="px-4 py-3 sm:py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                    Admin Panel
                                                </Link>
                                            </div>
                                        )}
                                        <div className="border-t border-border py-1 flex flex-col">
                                            <button className="px-4 py-3 sm:py-2 text-sm text-left text-muted hover:text-red-500 transition-colors" onClick={() => { setIsLoggedIn(false); setIsAdmin(false); setIsProfileOpen(false); }}>Kijelentkezés</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-foreground hover:text-[var(--color-primary)]"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden glass-panel border-t border-border absolute w-full left-0 top-20 flex flex-col p-6 gap-4 bg-background/95 backdrop-blur-xl">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "text-lg font-medium transition-colors hover:text-[var(--color-primary)]",
                                pathname === link.href ? "text-foreground" : "text-muted"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-border w-full my-2" />
                </div>
            )}
        </nav>
    );
}
