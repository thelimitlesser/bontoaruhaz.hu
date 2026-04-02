export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { createClient } from"@/lib/supabase/server";
import { prisma } from"@/lib/prisma";
import { redirect } from"next/navigation";
import SettingsForm from"./SettingsForm";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user details from Prisma
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    return <SettingsForm user={user} dbUser={dbUser} />;
}
