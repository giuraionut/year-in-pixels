import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // 1. Redirect logged-in users away from auth pages
    if (token && (pathname === '/api/auth/signin' || pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Protect private routes
    const protectedRoutes = ['/moods', '/pixels', '/dashboard', '/diary', '/events'];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// 3. IMPORTANT: Only run middleware on the routes that actually need it
export const config = {
    matcher: [
        '/',
        '/api/auth/signin',
        '/moods/:path*',
        '/pixels/:path*',
        '/dashboard/:path*',
        '/diary/:path*',
        '/events/:path*',
    ],
};