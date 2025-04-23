import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userToken = request.cookies.get('next-auth.session-token')?.value;

    const pathname = new URL(request.url).pathname;
    console.log('pathname', pathname);
    if (userToken && pathname === '/api/auth/signin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (userToken && pathname === '') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }


    const protectedRoutes = ['/moods', '/pixels', '/dashboard', '/diary', '/events'];
    if (
        !userToken &&
        protectedRoutes.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
}

export const config = {
    // matcher: [
    //     '/moods/:path*',
    //     '/pixels/:path*',
    //     '/dashboard/:path*',
    //     '/diary/:path*',
    //     '/api/auth/signin',
    //   ],
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
