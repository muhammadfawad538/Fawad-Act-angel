import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Contact — Act Angel AI",
  description: "How to reach Act Angel AI — office address, email, and how to get started.",
}

export default function ContactPage() {
  // flex flex-col + flex-1 on the content div below: without this, a page whose content is
  // shorter than the viewport (like this one) leaves the footer stranded right after the
  // content instead of pinned to the bottom of the screen, with empty background showing
  // underneath it. flex-1 makes the content area absorb the leftover space, which pushes the
  // footer down — while a taller page just scrolls normally, unaffected.
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <main className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Contact
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-black/60">
            Questions about Act Angel AI, or want to talk before you start a trial? Reach us
            directly, or jump straight to meeting your Angel.
          </p>

          <div className="mt-10 flex flex-col gap-2">
            <span className="text-lg text-[#111]">One Boston Place, # 2600, Boston, MA, 02108</span>
            <a
              href="mailto:angel@actangel.com"
              className="text-lg text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
            >
              angel@actangel.com
            </a>
          </div>

          <Link
            href="/get-started"
            className="mt-10 inline-block px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium"
          >
            Meet Your Angel
          </Link>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
