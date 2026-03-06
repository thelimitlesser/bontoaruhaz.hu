"use client";

import { updateUserRole } from"@/app/actions/user";
import { useTransition } from"react";

export function RoleUpdater({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        startTransition(async () => {
            await updateUserRole(userId, newRole);
        });
    };

    return (
        <select
            disabled={isPending}
            defaultValue={currentRole}
            onChange={handleRoleChange}
            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--color-primary)] cursor-pointer" >
            <option value="CUSTOMER">Vásárló</option>
            <option value="PARTNER">Partner (Eladó)</option>
            <option value="ADMIN">Adminisztrátor</option>
        </select>
    );
}
