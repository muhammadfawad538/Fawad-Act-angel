import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Behind the Angels — Act Angel AI",
  description:
    "Act Angel AI is a Boston-headquartered AI company building Virtual AI Employees — combining three decades of enterprise, SaaS and business-process expertise with a new generation of AI-native talent.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.15] text-[#111]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-black/60">{children}</div>
    </section>
  )
}

export default function BehindTheAngelsPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      {/* Same nav + modals as the homepage (app/page.tsx) — not a stripped-down logo-only
          copy, so the dropdown and Get Started button work identically here. */}
      <SiteHeader />

      <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.1] max-w-3xl mx-auto text-center">
          We Don&rsquo;t Build More Software. We Build AI Employees.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-black/55 text-center">
          Scale your business — not your headcount.
        </p>

        <p className="mt-8 text-[15px] leading-relaxed text-black/60 max-w-3xl">
          Act Angel AI is a <strong className="font-medium text-[#111]">Boston-headquartered AI
          company</strong> bringing together industry veterans with three decades of enterprise technology, SaaS, and business process expertise and a new generation of{" "}
          <strong className="font-medium text-[#111]">AI-native talent—fresh, fast, innovative, and agile.</strong>{" "}
          Backed by seasoned investors who know how to build, scale, and win.
        </p>

        <Section title="Where we come from">
          <p>
            At the heart of an innovation ecosystem shaped by{" "}
            <strong className="font-medium text-[#111]">MIT, Harvard, leading researchers,
            startups, and global enterprises</strong>, we unite deep business experience with
            next-generation AI thinking.
          </p>
        </Section>

        <Section title="Software isn't the point — action is">
          <p>Businesses have enough software. <strong className="font-medium text-[#111]">What they need is action.</strong></p>
          <p>
            Our <strong className="font-medium text-[#111]">Virtual AI Employees</strong> understand
            context and take the right action at the right time — without reminders or chasing.
            They work across your existing systems, data, processes, and channels to{" "}
            <strong className="font-medium text-[#111]">engage prospects, serve customers, follow
            up, and get things done.</strong>
          </p>
          <p>
            Always on — <strong className="font-medium text-[#111]">24/7, across time zones, in
            virtually any language</strong>, without shifts, fatigue, bad days, or personal
            downtime.
          </p>
        </Section>

        <Section title="The result">
          <p>
            <strong className="font-medium text-[#111]">More capacity, lower costs, and seamless
            growth without proportional headcount.</strong> Your people focus on judgment,
            creativity, and relationships. Your AI workforce keeps business moving.
          </p>
          <p>
            <strong className="font-medium text-[#111]">We work with the technology you already
            have</strong> — turning your existing systems, data, and processes into autonomous
            action.
          </p>
        </Section>

        <p className="mt-12 text-xl md:text-2xl font-light tracking-tight text-[#111] max-w-3xl">
          Perfect actions. Perfect timing. Lower cost. Limitless scale.
        </p>
      </main>
      </div>

      <SiteFooter />
    </div>
  )
}
