"use client";

import { Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from"lucide-react";
import { useState, Suspense } from"react";
import { sendContactEmail } from"@/app/actions/contact";
import { useSearchParams } from"next/navigation";

function ContactForm() {
    const searchParams = useSearchParams();
    const defaultSubject = searchParams.get("subject") ||"";
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type:"success" |"error"; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await sendContactEmail(formData);
            if (res.error) {
                setMessage({ type:"error", text: res.error });
            } else if (res.success) {
                setMessage({ type:"success", text: res.success });
                const form = document.getElementById("contact-form") as HTMLFormElement;
                if (form) form.reset();
            }
        } catch (error) {
            setMessage({ type:"error", text:"Váratlan hiba történt az elküldés során." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form id="contact-form" action={handleSubmit} className="space-y-4">
            {message && (
                <div className={"p-4 rounded-xl flex items-center gap-3 " + (message.type === "success" ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-300" : "bg-red-50 text-red-700 border-2 border-red-300")}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}
            <div>
                <label className="block text-sm text-gray-800 mb-2 font-bold ml-1">Neved</label>
                <input name="name" type="text" required className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm" />
            </div>
            <div>
                <label className="block text-sm text-gray-800 mb-2 font-bold ml-1">Email címed</label>
                <input name="email" type="email" required className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm" />
            </div>
            <div>
                <label className="block text-sm text-gray-800 mb-2 font-bold ml-1">Tárgy</label>
                <input name="subject" type="text" defaultValue={defaultSubject} required className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm" />
            </div>
            <div>
                <label className="block text-sm text-gray-800 mb-2 font-bold ml-1">Üzenet</label>
                <textarea name="message" rows={4} required className="w-full bg-white dark:bg-zinc-900 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm"></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md">
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Küldés folyamatban...
                    </>
                ) : "Küldés"}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-32 px-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-black text-gray-900 mb-8">Kapcsolat</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Info */}
                <div className="space-y-6">
                    <div className="bg-card border-2 border-gray-300 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Phone className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-gray-600 font-semibold text-sm">Hívj minket</p>
                            <p className="text-gray-900 font-black text-lg">+36 70 612 1277</p>
                        </div>
                    </div>

                    <div className="bg-card border-2 border-gray-300 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-gray-600 font-semibold text-sm">Írj nekünk</p>
                            <p className="text-gray-900 font-black text-lg">bontoaruhaz@gmail.com</p>
                        </div>
                    </div>

                    <div className="bg-card border-2 border-gray-300 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-gray-600 font-semibold text-sm">Központ</p>
                            <p className="text-gray-900 font-black text-lg">8111 Seregélyes-Jánosmajor</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-card border-2 border-gray-300 p-8 rounded-2xl shadow-md">
                    <Suspense fallback={<div className="p-8 text-center text-gray-600 font-bold flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" /> Űrlap betöltése...</div>}>
                        <ContactForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
