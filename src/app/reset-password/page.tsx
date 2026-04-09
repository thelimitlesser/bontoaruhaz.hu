"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, Loader2, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePasswordAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMessage({ type: 'error', text: "Érvénytelen vagy lejárt visszaállító link. Kérj egy újat!" });
            }
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await updatePasswordAction(formData);
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: "Siker! A jelszavad megváltozott. Most már bejelentkezhetsz az új jelszavaddal."
                });
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setMessage({ type: 'error', text: result.error || "Hiba történt." });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Hiba történt a művelet során." });
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <div className="pt-40 pb-20 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md" >
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                                Új jelszó megadása
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Kérjük, add meg az új jelszavadat. Legalább 6 karakter hosszú legyen.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            {(!message || message.type !== 'success') && (
                                <>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Új jelszó</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="password" name="password" required minLength={6}
                                                    placeholder="••••••••" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Jelszó megerősítése</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="password" name="confirmPassword" required minLength={6}
                                                    placeholder="••••••••" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium" 
                                                />
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
                                                Jelszó mentése
                                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
