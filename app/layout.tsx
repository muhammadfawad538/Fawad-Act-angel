import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Courier_Prime } from 'next/font/google'
import { AnalyticsGate } from '@/components/analytics-gate'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const _ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });

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
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <CookieConsent />
        {/* Was an unconditional <Analytics />, which loaded before the visitor was asked.
            The gate mounts it only once analytics consent is actually granted. */}
        <AnalyticsGate />
      </body>
    </html>
  )
}
