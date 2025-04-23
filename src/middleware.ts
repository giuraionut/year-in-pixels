import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userToken = request.cookies.get('next-auth.session-token')?.value;

    const pathname = new URL(request.url).pathname;
    console.log('pathname',pathname);
    if (userToken && pathname === '/api/auth/signin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (userToken && pathname === '') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }


    const protectedRoutes = ['/moods', '/pixels', '/dashboard', '/diary'];
    if (!userToken && protectedRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/moods', '/pixels', '/dashboard', '/diary', '/api/auth/signin'],
};
