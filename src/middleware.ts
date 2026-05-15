import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
    '/login',
    '/register',
];

const isPublicRoute = (pathname: string) => {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authToken = request.cookies.get('auth_token')?.value;
    const isAuthenticated = Boolean(authToken);

    // Root is never a real destination — route it to /category (or /login).
    // Doing this at the edge avoids rendering the (home) layout shell while
    // the in-page `redirect()` is in flight, which was producing an empty
    // framed page on the client.
    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = isAuthenticated ? '/category' : '/login';
        return NextResponse.redirect(url);
    }

    if (!isAuthenticated && !isPublicRoute(pathname)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && isPublicRoute(pathname)) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/category';
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};
