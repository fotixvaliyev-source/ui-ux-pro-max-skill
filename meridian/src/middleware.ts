import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap first gate: no session cookie means no need to render anything under /app or /onboarding.
 * This only checks that a cookie exists. Every page and server action still verifies the session
 * and circle membership on the server (see src/server/guards.ts).
 */
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
  if (hasSession) return NextResponse.next();
  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/app/:path*", "/onboarding"] };
