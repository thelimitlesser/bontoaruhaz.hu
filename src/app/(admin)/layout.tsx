export const dynamic = "force-dynamic";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/app/actions/user";
import { AdminSidebar } from "@/components/admin/admin-nav";



export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const dbUser = await ensureUserExists();

    if (!dbUser) {
        console.log("AdminLayout: No user found from ensureUserExists, redirecting to login");
        redirect("/login");
    }

    console.log(`AdminLayout: Found user ${dbUser.email} with role ${dbUser.role}`);

    if (dbUser.role !== 'ADMIN') {
        console.log(`AdminLayout: Access denied for ${dbUser.email}. Required: ADMIN, Found: ${dbUser.role}`);
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
