import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Scopes the trailing-slash redirect to pages only, leaving app/api/* route handlers alone -
// they have no trailing-slash variant, so redirecting them 404s at the destination. This is
// what breaks the WhatsApp inbound webhook (Twilio posts the no-slash URL, follows the
// redirect into a dead end) and would break any other API consumer the same way. Paired with
// skipTrailingSlashRedirect: true in next.config.mjs, which hands this redirect off to proxy
// instead of applying it automatically to every route including /api/*.
//
// 2026-09-30: a prior attempt at this used the deprecated middleware.ts file/export name, and
// built the redirect target via request.nextUrl.clone() then reassigning .pathname. That
// combination 308-redirected every non-slash page URL to ITSELF in production - confirmed
// live (curl gave up after 50 redirects on /get-started and /hire-an-angel/hope-angel), took
// down every route except "/". This version follows Next's own documented proxy.ts example
// for this exact skipTrailingSlashRedirect use case exactly: the proxy.ts file name, the
// `export default function proxy` name, and building the target with `new URL(pathname + '/',
// base)` rather than cloning and mutating. Tested locally against the same failure scenario
// before going anywhere near production again.
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  if (
    !pathname.endsWith("/") &&
    !pathname.match(/((?!\.well-known(?:\/.*)?)(?:[^/]+\/)*[^/]+\.\w+)/)
  ) {
    return NextResponse.redirect(new URL(`${pathname}/`, request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
