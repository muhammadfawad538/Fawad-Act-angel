import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MeetYourAngelForm } from "@/components/meet-your-angel-form"

export const metadata: Metadata = {
  title: "Meet Your Angel — Act Angel AI",
  description:
    "Tell us how to reach you and Act Angel will call, WhatsApp, or email you — no presentation, no pressure.",
}

// The same lead-capture flow that used to live only in a popup (components/meet-your-angel-popup.tsx,
// still intact for later reactivation) — every "Get Started" CTA on the site now links here
// instead of opening that modal.
export default function GetStartedPage() {
  // flex-1 + flex flex-col justify-center on the content div: flex-1 keeps the footer pinned
  // to the bottom of the screen on short-content pages, and justify-center distributes the
  // leftover space evenly above/below the form instead of dumping all of it below the form
  // (which otherwise reads as a big empty gap right before the footer).
  // pt-28 is a floor, not a centering input — justify-center can't push content above it, which
  // is what keeps the heading from sliding up under the fixed nav on short-content viewports.
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-28 pb-12">
        <main className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-center">
            Meet Your Angel
          </h1>

          <div className="mt-10 bg-white border border-black/[0.08] rounded-2xl p-6">
            <MeetYourAngelForm />
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
