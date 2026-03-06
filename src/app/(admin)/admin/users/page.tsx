export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Mail, Shield, User as UserIcon, Search, Users as UsersIcon, ShieldCheck, UserCheck } from "lucide-react";
import { RoleUpdater } from "./role-updater";
import { ensureUserExists } from "@/app/actions/user";

export default async function UsersPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    // Proactively sync the current user if they are missing from Prisma
    await ensureUserExists();

    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";

    const users = await prisma.user.findMany({
        where: query ? {
            OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        } : {},
        orderBy: [
            { role: 'asc' },
            { createdAt: 'desc' }
        ]
    });

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const partnerCount = users.filter(u => u.role === 'PARTNER').length;

    return (
        <div className="space-y-8 text-gray-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Felhasználók</h1>
                    <p className="text-gray-500 mt-2 font-medium">Kezeld a jogosultságokat és lásd át a regisztrált tagokat.</p>
                </div>

                <div className="relative max-w-sm w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <form action="/admin/users" method="get">
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Keresés név vagy e-mail..."
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all font-semibold shadow-sm"
                        />
                    </form>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Összes Felhasználó", value: totalUsers, icon: UsersIcon, color: "blue" },
                    { label: "Adminisztrátorok", value: adminCount, icon: ShieldCheck, color: "red" },
                    { label: "Partnerek", value: partnerCount, icon: UserCheck, color: "emerald" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-500 bg-${stat.color}-500`} />
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-600`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 shadow-xl shadow-gray-200/20 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Felhasználó</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Jogosultság</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Regisztrált</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Művelet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="font-bold">Nem található felhasználó</p>
                                            <p className="text-xs uppercase tracking-tight">Próbálkozz más keresőszóval</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black relative overflow-hidden group-hover:border-[var(--color-primary)]/30 transition-colors">
                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5 opacity-40" />}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{user.fullName || 'Névtelen'}</div>
                                                    <div className="text-xs flex items-center gap-1.5 text-gray-500 font-semibold italic mt-0.5">
                                                        <Mail className="w-3 h-3 text-[var(--color-primary)]/60" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-600 border-red-500/20 shadow-sm shadow-red-500/5' :
                                                user.role === 'PARTNER' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Kezdés</div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <RoleUpdater userId={user.id} currentRole={user.role} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
