/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js only exposes this site-wide — there's no per-route trailing-slash option in the
  // App Router — so every route now serves at a trailing slash (/behind-the-angels/,
  // /privacy-policy/), not just the one that was asked about. "/" is unaffected either way.
  // With this on, Next 301-redirects the non-slash URL to the slash one automatically.
  //
  // 2026-09-30 REVERT: a middleware.ts was added alongside skipTrailingSlashRedirect: true to
  // scope this redirect to pages only (the API-route 404 problem below), but in production it
  // caused every non-slash page URL to 308-redirect to itself - an infinite loop, confirmed live
  // (curl gave up after 50 redirects on /get-started and /hire-an-angel/hope-angel), taking down
  // every route except "/". Root cause not fully diagnosed before reverting - Next 16's build
  // output flags "middleware" as deprecated in favor of "proxy", so this may not have been
  // executing as written at all. Reverted to plain trailingSlash with no middleware, which is
  // the exact config that was live and working for every page before that fix. This knowingly
  // re-opens the original, smaller problem below - a real fix needs to be built and verified
  // against a preview deployment before going anywhere near production again.
  //
  // ORIGINAL PROBLEM (re-opened by this revert, not solved): the automatic redirect above also
  // fires for app/api/* route handlers, which have no trailing-slash variant at all - the
  // redirect target 404s. This broke the WhatsApp inbound webhook (Twilio POSTs the no-slash
  // URL, got redirected into a dead end) and would break any other API consumer the same way.
  trailingSlash: true,
}

export default nextConfig
