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
  trailingSlash: true,
}

export default nextConfig
