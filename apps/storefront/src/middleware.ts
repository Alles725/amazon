import { NextRequest, NextResponse } from 'next/server';

// The login page renders full-bleed with no site chrome (matches Amazon's own
// sign-in screen). Server Components can't read the current path directly, so
// forward it as a header the root layout can check.
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
