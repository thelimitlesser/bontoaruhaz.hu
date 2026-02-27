import { prisma } from "@/lib/prisma";
import { updateUserRole } from "@/app/actions/user";
import { Mail, Shield, User as UserIcon } from "lucide-react";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Felhasználók</h1>
                    <p className="text-gray-500">Jogosultságok kezelése</p>
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
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user.fullName || 'Névtelen'}</div>
                                            <div className="text-xs flex items-center gap-1 text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                        user.role === 'PARTNER' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50' :
                                            'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                        {user.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <RoleUpdater userId={user.id} currentRole={user.role} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Client component for interaction (must be inline or imported)
// For simplicity in this demo, creating a small inline client component logic is tricky in RSC file.
// I'll create a separate interactive component file for the actions.
import { RoleUpdater } from "./role-updater";
