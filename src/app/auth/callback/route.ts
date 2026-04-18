import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserExists } from '@/app/actions/user'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/'
    
    // Always use the primary production domain for redirects to avoid cookie issues
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

    if (code) {
        const supabase = await createClient()
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!exchangeError) {
            // Ensure the user is synced to Prisma/DB
            try {
                await ensureUserExists()
            } catch (syncError) {
                console.error("User sync error in callback:", syncError)
                // We still proceed even if sync fails, so the user isn't blocked
            }
            
            // Build the absolute redirect URL
            const redirectUrl = new URL(next, origin).toString()
            
            // Return a redirect response
            return NextResponse.redirect(redirectUrl)
        } else {
            console.error("Auth exchange error:", exchangeError.message)
        }
    }

    // If something went wrong, send them to the login page with an error
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
