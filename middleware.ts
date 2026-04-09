import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.pathname;
    
    // 1. Refresh session
    let response = await updateSession(request)

    // 2. Protect Admin Routes
    if (url.startsWith('/admin') || url.startsWith('/api/admin')) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        response = NextResponse.next({ request: { headers: request.headers } })
                        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        // If not logged in, go to login
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Fast path admin check using environment variable if no DB role is in JWT yet
        const adminEmails = process.env.ADMIN_EMAILS ? 
            process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
            ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'erdelyi.peter@antigravity.ai', 'jtomi.auto@gmail.com'];

        if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
            console.warn(`Middleware: Unauthorized admin access attempt by ${user.email}`);
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 3. Protect Auth-only routes (Profile, Garage, Checkout)
    if (url.startsWith('/profile') || url.startsWith('/garage') || url.startsWith('/checkout')) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        response = NextResponse.next({ request: { headers: request.headers } })
                        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                    },
                },
            }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }
    
    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
