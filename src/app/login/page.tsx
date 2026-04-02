"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isRegistering) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            full_name: fullName,
                            display_name: fullName
                        }
                    },
                });

                if (error) throw error;

                // If email confirmation is DISABLED in Supabase, we get a session immediately
                if (data?.session) {
                    window.location.href = "/";
                    return;
                }

                setMessage({
                    type: 'success',
                    text: "Regisztráció sikeres! Kérjük, ellenőrizd az e-mail fiókodat a visszaigazoláshoz. (Nézd meg a Spam mappát is!)"
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = "/";
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Hiba történt a művelet során." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <main className="pt-40 pb-20 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md" >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                                {isRegistering ? "Fiók létrehozása" : "Üdvözöljük újra!"}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {isRegistering ? "Csatlakozz a minőségi autóalkatrész áruházhoz." : "Jelentkezz be a rendeléseid megtekintéséhez."}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-2xl text-sm font-bold flex gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}
                                    >
                                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : null}
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {isRegistering && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2" >
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Teljes név</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text" required={isRegistering}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Kovács János" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail cím</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email" required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="pelda@email.hu" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Jelszó</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password" required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed" >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isRegistering ? "Regisztráció" : "Bejelentkezés"}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            {!isRegistering && (
                                <button className="text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors">
                                    Elfelejtetted a jelszavad?
                                </button>
                            )}
                            <div className="pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 font-medium">
                                    {isRegistering ? "Már van fiókod?" : "Még nincs fiókod?"}{""}
                                    <button
                                        onClick={() => {
                                            setIsRegistering(!isRegistering);
                                            setMessage(null);
                                        }}
                                        className="text-[var(--color-primary)] font-bold hover:underline" >
                                        {isRegistering ? "Jelentkezz be!" : "Regisztrálj most!"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
