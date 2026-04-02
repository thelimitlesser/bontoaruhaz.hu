export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { prisma } from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";
import { redirect } from"next/navigation";
import { revalidatePath } from"next/cache";

export default async function AdminSetupPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const targetEmail ="petierdelyi2005@gmail.com";

    if (!user) {
        // Redirect to login but tell them to come back here
        redirect("/login?next=/admin-setup-special");
    }

    if (user.email !== targetEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-6">
                <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-red-500/30">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Hozzáférés megtagadva</h1>
                    <p className="text-gray-400">Ez az oldal csak a <strong>{targetEmail}</strong> cím számára érhető el.</p>
                </div>
            </div>
        );
    }

    try {
        // UPSERT the user in Prisma to ensure they exist, then set ADMIN role
        await (prisma.user as any).upsert({
            where: { id: user.id },
            update: { role:'ADMIN' },
            create: {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name ||"Admin",
                role:'ADMIN' }
        });

        revalidatePath('/');

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-6 text-center">
                <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-green-500/30 shadow-2xl shadow-green-500/10">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 uppercase tracking-tight">Sikeres előléptetés!</h1>
                    <p className="text-gray-400 font-medium mb-8">
                        Üdvözlünk az adminok között! A <strong>{targetEmail}</strong> cím mostantól Admin jogosultsággal rendelkezik.
                    </p>
                    <a href="/" className="inline-block bg-[var(--color-primary)] text-white font-bold px-10 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                        Ugrás a főoldalra
                    </a>
                </div>
            </div>
        );
    } catch (error: any) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-6">
                <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-red-500/30">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Hiba történt</h1>
                    <p className="text-gray-400">{error.message}</p>
                </div>
            </div>
        );
    }
}
