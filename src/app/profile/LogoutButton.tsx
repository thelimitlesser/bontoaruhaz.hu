"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <button
            onClick={handleSignOut}
            className="group p-6 bg-white border border-red-100 rounded-3xl hover:border-red-500 hover:bg-red-500/5 transition-all flex items-center gap-6 w-full text-left"
        >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all">
                <LogOut className="w-7 h-7" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    Kijelentkezés
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                    Biztonságos kilépés a fiókból
                </p>
            </div>
        </button>
    );
}
