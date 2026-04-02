export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { createClient } from"@/lib/supabase/server";
import { prisma } from"@/lib/prisma";
import { redirect } from"next/navigation";
import GarageClient from"./GarageClient";

export default async function GaragePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/garage");
    }

    // Fetch user's vehicles from Prisma
    const vehicles = await prisma.userVehicle.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            nickname:'asc' }
    });

    return <GarageClient vehicles={vehicles} />;
}
