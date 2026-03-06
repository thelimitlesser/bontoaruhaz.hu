'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Force rebuild after prisma generate

export async function updateUserRole(userId: string, newRole: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });
    revalidatePath('/admin/users');
}

export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Be kell jelentkezned a profilod módosításához.");
    }

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const zipCode = formData.get('zipCode') as string;
    const city = formData.get('city') as string;
    const address = formData.get('address') as string;

    // Update or Create Prisma User record
    await (prisma.user as any).upsert({
        where: { id: user.id },
        update: {
            fullName,
            phoneNumber: phone,
            shippingAddress: `${zipCode} ${city}, ${address}`
        },
        create: {
            id: user.id,
            email: user.email!,
            fullName,
            phoneNumber: phone,
            shippingAddress: `${zipCode} ${city}, ${address}`
        }
    });

    // Update Supabase Metadata
    await supabase.auth.updateUser({
        data: { full_name: fullName }
    });

    revalidatePath('/profile/settings');
    revalidatePath('/profile');
    return { success: true };
}

export async function promoteToAdmin(email: string) {
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    });

    revalidatePath('/');
    revalidatePath('/admin/users');
    return { success: true, user };
}

export async function saveVehicle(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Be kell jelentkezned.");

    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const year = parseInt(formData.get('year') as string);
    const vin = formData.get('vin') as string || null;
    const engineCode = formData.get('engineCode') as string || null;
    const nickname = formData.get('nickname') as string || null;

    await prisma.userVehicle.create({
        data: {
            userId: user.id,
            make,
            model,
            year,
            vin,
            engineCode,
            nickname
        }
    });

    revalidatePath('/garage');
    revalidatePath('/profile');
    return { success: true };
}

export async function ensureUserExists() {
    // Skip during build phase to avoid pre-rendering errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null;
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error("ensureUserExists: Supabase auth error:", authError);
    }
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            throw new Error(`Supabase Auth Error: ${authError.message}`);
        }
        if (!user) {
            return null; // Normal "not logged in" state
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!existingUser) {
            const adminEmails = process.env.ADMIN_EMAILS ?
                process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) :
                ['petierdelyi2005@gmail.com', 'admin@autonexus.com'];

            const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());

            // Create user in Prisma if not present
            const newUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    fullName: user.user_metadata?.full_name || user.user_metadata?.display_name || 'Új Vásárló',
                    role: isAdminEmail ? 'ADMIN' : 'CUSTOMER'
                }
            });
            return newUser;
        }

        return existingUser;
    } catch (error: any) {
        console.error("Error in ensureUserExists:", error);
        throw new Error(error.message || String(error));
    }
}

export async function deleteVehicle(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Be kell jelentkezned.");

    await prisma.userVehicle.delete({
        where: { id, userId: user.id }
    });

    revalidatePath('/garage');
    revalidatePath('/profile');
    return { success: true };
}
export async function syncAndGetUserRole() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (!dbUser) {
            const adminEmails = process.env.ADMIN_EMAILS ?
                process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) :
                ['petierdelyi2005@gmail.com', 'admin@autonexus.com'];

            const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());

            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    fullName: user.user_metadata?.full_name || user.user_metadata?.display_name || 'Új Vásárló',
                    role: isAdminEmail ? 'ADMIN' : 'CUSTOMER'
                }
            });
            return isAdminEmail ? 'ADMIN' : 'CUSTOMER';
        }

        return dbUser.role;
    } catch (e) {
        console.error("Error in syncAndGetUserRole", e);
        return 'CUSTOMER';
    }
}
