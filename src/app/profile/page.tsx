import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ensureUserExists } from "@/app/actions/user";
import { LogoutButton } from "./LogoutButton";

export default async function ProfilePage() {
    const dbUser = await ensureUserExists();

    if (!dbUser) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                        Fiók Kezelése
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Üdvözöljük, <span className="text-[var(--color-primary)] font-bold">{dbUser.fullName || dbUser.email}</span>!
                    </p>
                </header>

                <div className="flex flex-col gap-6">
                    {/* Personal Data Button */}
                    <Link
                        href="/profile/settings"
                        className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-[var(--color-primary)] transition-all flex items-center gap-6"
                    >
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-all">
                            <User className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                Személyes Adatok
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Név, telefonszám és cím módosítása
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Logout Button */}
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
