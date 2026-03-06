export const dynamic ="force-dynamic";
import { prisma } from"@/lib/prisma";
import { Mail, Shield, User as UserIcon, Search } from"lucide-react";
import { RoleUpdater } from"./role-updater";
import { ensureUserExists } from"@/app/actions/user";

export default async function UsersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    // Proactively sync the current user if they are missing from Prisma
    await ensureUserExists();

    const query = (await searchParams).q ||"";

    const users = await prisma.user.findMany({
        where: query ? {
            OR: [
                { fullName: { contains: query, mode:'insensitive' } },
                { email: { contains: query, mode:'insensitive' } },
            ]
        } : {},
        orderBy: [
            { role:'asc' }, // ADMIN starts with A, CUSTOMER starts with C."asc" works if we just want A at top.
            { createdAt:'desc' }
        ]
    });

    // Note: Since'ADMIN' <'CUSTOMER' <'PARTNER' alphabetically,'asc' puts ADMIN first.
    // However, if we want strict ADMIN > others regardless of ABC, we could use separate groups, 
    // but Prisma doesn't have a simple"value priority" sort without raw SQL or multiple queries.
    // For now,'asc' on role (ADMIN, CUSTOMER, PARTNER) works well enough as ADMIN is A.

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Felhasználók</h1>
                    <p className="text-gray-500">Jogosultságok kezelése és keresés</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <form action="/admin/users" method="get">
                        <input
                            type="text" name="q" defaultValue={query}
                            placeholder="Keresés név vagy e-mail alapján..." className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium shadow-sm" />
                    </form>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Felhasználó</th>
                            <th className="px-6 py-4">Jogosultság</th>
                            <th className="px-6 py-4">Regisztrált</th>
                            <th className="px-6 py-4 text-right">Művelet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    Nem található a keresésnek megfelelő felhasználó.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.fullName ||'Névtelen'}</div>
                                                <div className="text-xs flex items-center gap-1 text-gray-500">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user.role ==='ADMIN' ?'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm shadow-red-500/5' :
                                            user.role ==='PARTNER' ?'bg-blue-500/10 text-blue-500 border border-blue-500/20' :'bg-gray-100 text-gray-600 border border-gray-200' }`}>
                                            {user.role ==='ADMIN' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <RoleUpdater userId={user.id} currentRole={user.role} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
