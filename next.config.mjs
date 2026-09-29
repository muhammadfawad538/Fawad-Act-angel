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
  // With this on, Next redirects the non-slash URL to the slash one automatically.
  trailingSlash: true,
  // The automatic redirect above also fires for app/api/* route handlers, which have no
  // trailing-slash variant at all - the redirect target 404s. This broke the WhatsApp inbound
  // webhook (Twilio POSTs the no-slash URL, got redirected into a dead end) and would break
  // any other API consumer the same way. skipTrailingSlashRedirect hands the redirect off to
  // proxy.ts, which applies it to pages only and leaves /api/* alone.
  //
  // 2026-09-30: a first attempt at this pairing (via the now-deprecated middleware.ts, see
  // proxy.ts's own comment for the full story) 308-redirected every non-slash page to ITSELF
  // in production and took the whole site down except "/". This is the same flag, now paired
  // with a proxy.ts built from Next's own documented example for this exact use case and
  // tested locally against that same failure scenario before touching production again.
  skipTrailingSlashRedirect: true,
}

export default nextConfig
