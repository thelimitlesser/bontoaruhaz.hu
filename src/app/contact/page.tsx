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
                <div className={"p-4 rounded-xl flex items-center gap-3" + (message.type ==="success" ?"bg-emerald-50 text-emerald-600 border border-emerald-200" :"bg-red-50 text-red-600 border border-red-200")}>
                    {message.type ==="success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}
            <div>
                <label className="block text-sm text-muted mb-2 font-medium">Neved</label>
                <input name="name" type="text" required className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
                <label className="block text-sm text-muted mb-2 font-medium">Email címed</label>
                <input name="email" type="email" required className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
                <label className="block text-sm text-muted mb-2 font-medium">Tárgy</label>
                <input name="subject" type="text" defaultValue={defaultSubject} required className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
                <label className="block text-sm text-muted mb-2 font-medium">Üzenet</label>
                <textarea name="message" rows={4} required className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Küldés folyamatban...
                    </>
                ) :"Küldés"}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-32 px-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-black text-foreground mb-8">Kapcsolat</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Info */}
                <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-muted text-sm">Hívj minket</p>
                            <p className="text-foreground font-bold text-lg">+36 70 612 1277</p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-muted text-sm">Írj nekünk</p>
                            <p className="text-foreground font-bold text-lg">info@bontoaruhaz.hu</p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-muted text-sm">Központ</p>
                            <p className="text-foreground font-bold text-lg">8111 Seregélyes-Jánosmajor</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card p-8 rounded-2xl">
                    <Suspense fallback={<div className="p-8 text-center text-muted flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Űrlap betöltése...</div>}>
                        <ContactForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
