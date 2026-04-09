export const dynamic = "force-dynamic";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/app/actions/user";
import { AdminSidebar } from "@/components/admin/admin-nav";



export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    try {
        const dbUser = await ensureUserExists();

        if (!dbUser) {
            console.log("AdminLayout: No user session found. Redirecting to login.");
            redirect("/login");
        }

        console.log(`AdminLayout: Logged in as ${dbUser.email} (${dbUser.role})`);

        if (dbUser.role !== 'ADMIN') {
            console.warn(`AdminLayout: Unauthorized access attempt by ${dbUser.email}`);
            // Redirect to home if not admin
            redirect("/");
        }

        return (
            <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-900 font-sans pt-16 lg:pt-0">
                <AdminSidebar user={{ fullName: dbUser.fullName, email: dbUser.email }} />

                {/* Main Content */}
                <main className="flex-1 lg:pl-72 bg-gray-50 p-4 sm:p-8">
                    {children}
                </main>
            </div>
        );
    } catch (error) {
        console.error("ADMIN_LAYOUT_ERROR: Critical failure in admin shell:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
                    <h1 className="text-xl font-bold text-red-600 mb-4">Hiba az Admin felület betöltésekor</h1>
                    <p className="text-gray-500 mb-6">Az adatbázis vagy a bejelentkezési rendszer átmenetileg nem elérhető.</p>
                    <Link href="/" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold">Vissza a főoldalra</Link>
                </div>
            </div>
        );
    }
}

// NavLink is now handled inside AdminSidebar as a client component

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
            <span className="w-5 h-5">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
