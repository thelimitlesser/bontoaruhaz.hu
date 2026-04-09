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
        await supabase.auth.getSession(); // Force token refresh/cookie parsing
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            if (authError.message.includes("Auth session missing!")) {
                return null;
            }
            throw new Error(`Supabase Auth Error: ${authError.message}`);
        }
        if (!user) {
            return null; // Normal "not logged in" state
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: user.id }
            });

            if (!existingUser) {
                const envAdminEmails = process.env.ADMIN_EMAILS ?
                    process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
                const fallbackAdminEmails = ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'erdelyi.peter@antigravity.ai', 'jtomi.auto@gmail.com'];
                const adminEmails = Array.from(new Set([...envAdminEmails, ...fallbackAdminEmails]));

                const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());

                // Create user in Prisma if not present
                try {
                    const newUser = await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email!,
                            fullName: user.user_metadata?.full_name || user.user_metadata?.display_name || 'Új Vásárló',
                            role: isAdminEmail ? 'ADMIN' : 'CUSTOMER'
                        }
                    });
                    return newUser;
                } catch (createError) {
                    console.error("ensureUserExists: Failed to create user in DB:", createError);
                    // Fallback: return a mock user object from Supabase data to allow UI to render
                    return {
                        id: user.id,
                        email: user.email!,
                        fullName: user.user_metadata?.full_name || 'Új Vásárló',
                        role: isAdminEmail ? 'ADMIN' : 'CUSTOMER'
                    } as any;
                }
            }

            if (existingUser) {
                // Proactive sync for existing users
                const envAdminEmails = process.env.ADMIN_EMAILS ?
                    process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
                const fallbackAdminEmails = ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'erdelyi.peter@antigravity.ai', 'jtomi.auto@gmail.com'];
                const adminEmails = Array.from(new Set([...envAdminEmails, ...fallbackAdminEmails]));
                
                const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());
                
                if (isAdminEmail && existingUser.role !== 'ADMIN') {
                    console.log(`ensureUserExists: Syncing ADMIN role for existing user ${user.email}`);
                    const updatedUser = await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'ADMIN' }
                    });
                    return updatedUser;
                }
                return existingUser;
            }
        } catch (prismaError) {
            console.error("ensureUserExists: Prisma error during runtime:", prismaError);
            // Return Supabase user data as a fallback to prevent crash
            const envAdminEmails = process.env.ADMIN_EMAILS ?
                process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
            const fallbackAdminEmails = ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'jtomi.auto@gmail.com'];
            const adminEmails = Array.from(new Set([...envAdminEmails, ...fallbackAdminEmails]));
            const isAdmin = user.email && adminEmails.includes(user.email.toLowerCase());
            return {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name || 'Bejelentkezett Felhasználó',
                role: isAdmin ? 'ADMIN' : 'CUSTOMER'
            } as any;
        }
    } catch (error: any) {
        console.error("CRITICAL ERROR in ensureUserExists (General failure):", error);
        return null; 
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
        await supabase.auth.getSession(); // Force token refresh/cookie parsing
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("syncAndGetUserRole: No user or auth error.", authError);
            return null;
        }

        const envAdminEmails = process.env.ADMIN_EMAILS ?
            process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
        const fallbackAdminEmails = ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'erdelyi.peter@antigravity.ai', 'jtomi.auto@gmail.com'];
        const adminEmails = Array.from(new Set([...envAdminEmails, ...fallbackAdminEmails]));

        const isAdminEmail = user.email && adminEmails.includes(user.email.toLowerCase());

        try {
            let dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { role: true }
            });

            if (!dbUser) {
                try {
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email!,
                            fullName: user.user_metadata?.full_name || user.user_metadata?.display_name || 'Új Vásárló',
                            role: isAdminEmail ? 'ADMIN' : 'CUSTOMER'
                        }
                    });
                } catch (createError) {
                    console.error("syncAndGetUserRole: Failed to auto-create user in fallback:", createError);
                }
                return isAdminEmail ? 'ADMIN' : 'CUSTOMER';
            }

            // Proactive sync: If email is in admin list but role is not ADMIN, update it
            if (isAdminEmail && dbUser.role !== 'ADMIN') {
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'ADMIN' }
                    });
                } catch (updateError) {
                    console.error("syncAndGetUserRole: Failed to sync ADMIN role to DB:", updateError);
                }
                return 'ADMIN';
            }

            return dbUser.role;
        } catch (prismaError) {
            console.error("syncAndGetUserRole: Database unreachable, falling back to email check:", prismaError);
            return isAdminEmail ? 'ADMIN' : 'CUSTOMER';
        }
    } catch (e) {
        console.error("Error in syncAndGetUserRole general block", e);
        return 'CUSTOMER';
    }
}
