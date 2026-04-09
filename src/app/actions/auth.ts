'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Updates the current user's password.
 */
export async function updatePasswordAction(formData: FormData) {
    const supabase = await createClient();
    
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || password.length < 6) {
        return { success: false, error: "A jelszónak legalább 6 karakternek kell lennie." };
    }

    if (password !== confirmPassword) {
        return { success: false, error: "A két jelszó nem egyezik meg." };
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/profile/settings');
    return { success: true };
}

/**
 * Triggers a password reset email.
 */
export async function forgotPasswordAction(email: string) {
    if (!email) {
        return { success: false, error: "E-mail cím megadása kötelező." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
