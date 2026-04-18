import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserExists } from '@/app/actions/user'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // Ensure the user is synced to Prisma/DB
            await ensureUserExists()
            
            // Build the redirect URL - ensuring we use the correct origin
            const redirectUrl = new URL(next, origin)
            
            // Return a redirect response
            // Note: In Next.js 15, the cookies set via cookies() in createClient 
            // are automatically handled by the framework in the response.
            return NextResponse.redirect(redirectUrl)
        }
    }

    // If something went wrong, send them to the login page with an error
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
