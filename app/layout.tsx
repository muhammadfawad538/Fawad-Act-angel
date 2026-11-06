import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans, Inter } from 'next/font/google'
import { Courier_Prime } from 'next/font/google'
import { AnalyticsGate } from '@/components/analytics-gate'
import { CookieConsent } from '@/components/cookie-consent'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeFromQuery } from '@/components/theme-from-query'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const _ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });
// AAA-UI-DM-WEB-001: the approved persona-page tab design specifies Inter, not Geist —
// registered the same way as the fonts above (no .variable/.className applied here; next/font
// still makes the family available by name globally, same as how IBM Plex Sans is referenced
// elsewhere via a plain fontFamily string).
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Without this, Next.js can't resolve relative image paths (openGraph.images /
  // twitter.images below) to an absolute URL and silently falls back to
  // 'http://localhost:3000' — which is exactly what shipped to production and is unreachable
  // by any external crawler (Slack, etc.), confirmed live at www.actangel.ai before this fix.
  metadataBase: new URL('https://www.actangel.ai'),
  title: 'AI That Acts. Work Gets Done - with What You Already Have.',
  description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
  keywords: ['AI sales agent', 'AI customer service', 'AI employee', 'AI specialist', 'sales automation', 'conversational AI'],
  authors: [{ name: 'Act Angel AI' }],
  openGraph: {
    title: 'AI That Acts. Work Gets Done - with What You Already Have.',
    description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
    type: 'website',
    url: 'https://actangel.ai',
    siteName: 'Act Angel AI',
    // Without an explicit og:image, link-preview crawlers (Slack, etc.) fell back to scraping
    // a square favicon/app-icon asset and stretching it into the preview card's wide slot,
    // rendering cropped and off-brand (AAA-UI-LW-001). This file is sized close enough to the
    // 1200x630 OG standard (1733x907, same ~1.91:1 ratio) that platforms scale it cleanly.
    images: [{ url: '/large_logo.png', width: 1733, height: 907, alt: 'Act Angel AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI That Acts. Work Gets Done - with What You Already Have.',
    description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
    images: ['/large_logo.png'],
  },
  // All generated from public/icon.png (the Act Angel mark). The previous light/dark
  // 32x32 pair were leftovers from the template — still the old blue logo — and because
  // they were listed first, they were what browsers actually rendered in the tab.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {/* attribute="class" toggles the matching class (.dark / .purple) on <html> — the
            mechanism globals.css's @custom-variant dark/purple (&:is(.x *)) already expect, so
            dark:/purple: utilities just work once added. Three themes, not the usual two: light
            plus two distinct dark variants (a conventional black one and a brand-purple one)
            for the client to choose between. enableSystem is off: this is a demo toggle, not a
            real OS-preference-following feature yet, so it should start deterministically on
            light rather than silently differing by visitor. suppressHydrationWarning above is
            required by next-themes — it sets the class via an inline script before React
            hydrates, which would otherwise be flagged as a mismatch. */}
        <ThemeProvider attribute="class" themes={["light", "dark", "purple"]} defaultTheme="light" enableSystem={false}>
          {/* Reads ?theme=purple (etc.) from the URL and applies it on load — lets the client
              share a link that opens the site already in a specific theme. */}
          <ThemeFromQuery />
          {children}
          <CookieConsent />
          {/* Was an unconditional <Analytics />, which loaded before the visitor was asked.
              The gate mounts it only once analytics consent is actually granted. */}
          <AnalyticsGate />
        </ThemeProvider>
      </body>
    </html>
  )
}
