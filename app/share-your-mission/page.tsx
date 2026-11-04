import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShareYourMissionForm } from "@/components/share-your-mission-form"

export const metadata: Metadata = {
  title: "Share Your Mission — Act Angel AI",
  description:
    "Tell us about your nonprofit's mission so Act Angel AI can understand your organization, verify its standing, and see where Hope Angel could serve.",
}

// Previously embedded inline on the Hope Angel page (scrolling to #share-your-mission instead
// of navigating away) — now its own route, so every "Share Your Mission" CTA (Hope Angel's
// hero/closing CTAs, the floating widget) links here directly instead. Content/layout carried
// over unchanged from that embedded section.
export default function ShareYourMissionPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] dark:bg-[#0a0a0a] dark:text-white purple:bg-[#12103C] purple:text-[#F6F4FF] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 pt-28 md:pt-32 pb-24">
        <main className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-center">
            Share Your Mission
          </h1>

          <div className="mt-10 rounded-3xl bg-[#EDE9F7] dark:bg-white/[0.03] purple:bg-[#7C5CFF]/[0.06] p-8 md:p-12">
            <div className="grid [@media(min-width:1280px)]:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10 md:gap-14 items-start">
              <div className="[@media(min-width:1280px)]:sticky [@media(min-width:1280px)]:top-28">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Tell us about the good you do.
                </h2>
                <p className="mt-4 text-[15px] text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed">
                  A few details help Act Angel AI understand your
                  organization, verify its standing, and see where Hope
                  Angel could serve. Please share public links where
                  possible; we can request further evidence during
                  review.
                </p>
                <ol className="mt-6 flex flex-col gap-1.5 text-[13px] text-black/45 dark:text-white/50 purple:text-[#ABA6D9] border-l-2 border-[#5D4387]/30 dark:border-white/20 purple:border-[#7C5CFF]/40 pl-4">
                  <li className="font-bold text-[#111] dark:text-white purple:text-[#F6F4FF]">
                    1. Share your NPO details
                  </li>
                  <li>2. AAA reviews your organization</li>
                  <li>3. Explore an Angel if you wish</li>
                </ol>
              </div>
              <div className="bg-white border border-black/[0.08] dark:bg-white/[0.06] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 rounded-2xl p-6 md:p-8">
                <ShareYourMissionForm />
              </div>
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
