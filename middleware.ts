import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reimplements the trailing-slash redirect that next.config.mjs's trailingSlash: true would
// otherwise apply automatically to every route - but scoped to pages only. app/api/* route
// handlers have no trailing-slash variant, so the automatic version 404s API callers (this is
// what broke the WhatsApp inbound webhook: Twilio posts the no-slash URL, got redirected into
// a dead route). See next.config.mjs's skipTrailingSlashRedirect for the other half of this.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname !== "/" && !pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
