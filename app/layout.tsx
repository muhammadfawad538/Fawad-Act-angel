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
  title: 'AI That Acts. Work Gets Done - with What You Already Have.',
  description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
  keywords: ['AI sales agent', 'AI customer service', 'AI employee', 'sales automation', 'conversational AI'],
  authors: [{ name: 'Act Angel AI' }],
  openGraph: {
    title: 'AI That Acts. Work Gets Done - with What You Already Have.',
    description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
    type: 'website',
    url: 'https://actangel.ai',
    siteName: 'Act Angel AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI That Acts. Work Gets Done - with What You Already Have.',
    description: 'Deploy an AI Workforce of Specialists across your existing systems and channels. Real work gets done—without adding more tools or hires.',
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
