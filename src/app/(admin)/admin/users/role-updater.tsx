"use client";

import { updateUserRole } from "@/app/actions/user";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export function RoleUpdater({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        if (newRole === currentRole) return;

        startTransition(async () => {
            await updateUserRole(userId, newRole);
        });
    };

    return (
        <div className="relative inline-block w-full max-w-[160px]">
            <select
                disabled={isPending}
                defaultValue={currentRole}
                onChange={handleRoleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)] transition-all cursor-pointer disabled:opacity-50 appearance-none shadow-sm"
            >
                <option value="CUSTOMER">Vásárló</option>
                <option value="PARTNER">Partner</option>
                <option value="ADMIN">Admin</option>
            </select>
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--color-primary)]" />
                </div>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                {!isPending && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
        </div>
    );
}
