import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.pathname;
    
    // Check if the route is an auth-protected route
    const isAdminRoute = url.startsWith('/admin') || url.startsWith('/api/admin');
    const isProtectedUserRoute = url.startsWith('/profile') || url.startsWith('/garage');

    // Only run Supabase session check for protected routes to save CPU
    if (isAdminRoute || isProtectedUserRoute) {
        let response = NextResponse.next({ request: { headers: request.headers } });

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
        );

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Protect Admin Routes
        if (isAdminRoute) {
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const envAdminEmails = process.env.ADMIN_EMAILS ? 
                process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
            
            const fallbackAdminEmails = ['petierdelyi2005@gmail.com', 'admin@bontoaruhaz.hu', 'erdelyi.peter@antigravity.ai', 'jtomi.auto@gmail.com'];
            
            const adminEmails = Array.from(new Set([...envAdminEmails, ...fallbackAdminEmails]));

            if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
                console.warn(`Middleware: Unauthorized admin access attempt by ${user.email}`);
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        // 2. Protect User Auth Routes
        if (isProtectedUserRoute) {
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        return response;
    }
    
    // For all public routes (homepage, products, feeds), return immediately without touching Supabase session
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/profile/:path*',
        '/garage/:path*',
    ],
}
