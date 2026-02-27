import { Mail, Phone, MapPin } from "lucide-react";

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
                            <p className="text-foreground font-bold text-lg">+36 1 234 5678</p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-muted text-sm">Írj nekünk</p>
                            <p className="text-foreground font-bold text-lg">info@autonexus.hu</p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-muted text-sm">Központ</p>
                            <p className="text-foreground font-bold text-lg">1117 Budapest, Budafoki út 111.</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card p-8 rounded-2xl">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted mb-2">Neved</label>
                            <input type="text" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-2">Email címed</label>
                            <input type="email" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-2">Üzenet</label>
                            <textarea rows={4} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"></textarea>
                        </div>
                        <button className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors">
                            Küldés
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
