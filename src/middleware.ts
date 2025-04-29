import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });


    const pathname = new URL(request.url).pathname;
    if (token && pathname === '/api/auth/signin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (token && pathname === '') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }


    const protectedRoutes = ['/moods', '/pixels', '/dashboard', '/diary', '/events'];
    if (
        !token &&
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
