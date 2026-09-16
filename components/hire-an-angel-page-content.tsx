"use client"

import { useState } from "react"
import Link from "next/link"
import { PERSONAS, type Persona, type PersonaId } from "@/lib/personas"
import { PersonaPhoneDemo } from "@/components/persona-phone-demo"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// Act Angel's own multi-channel concept (already used on the homepage's "always on / reachable
// everywhere" section) — reused here as the second picker in LiveDemoSection below.
const CHANNELS = ["Call", "Chat", "Email", "SMS", "Web"]

// Phone glyph for the live-preview card's incoming-bar affordance below — redrawn small here
// rather than importing persona-phone-demo's internal (unexported) copy of the same mark.
const PHONE_GLYPH_PATH =
  "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"

/**
 * "Live Preview" section — same broad idea as 11x.ai's "Talk to Julian, live" card (a photo with
 * an incoming-call affordance on one side, a scenario/voice picker and CTA on the other), rebuilt
 * in Act Angel's own palette/typography and wired to real product data instead of copied wording:
 * the "Scenario" pills are each persona's actual use cases (lib/personas.ts), the second picker
 * is Act Angel's own channel list (Call/Chat/Email/SMS/Web, already used on the homepage) rather
 * than voice accents, and the CTA scrolls to the real phone demo already on this page instead of
 * promising a live WebRTC call the site doesn't have.
 */
// Shared Scenario/Channel pill style — a light-purple fill (not a solid one) for the selected
// pill, plus a hover lift/press animation, matching 11x.ai's own scenario/voice picker: on
// 11x the pill shifts slightly upward on hover rather than growing, so this uses a translateY
// instead of a scale.
function pillClass(active: boolean) {
  return `px-4 py-2 rounded-full text-[12.5px] font-medium border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
    active
      ? "bg-[#EDE9F7] border-[#5D4387]/30 text-[#5D4387]"
      : "border-black/15 text-black/60 hover:border-[#5D4387]/30 hover:bg-[#5D4387]/[0.05] hover:text-[#5D4387]"
  }`
}

function LiveDemoSection({ persona }: { persona: Persona }) {
  const [scenario, setScenario] = useState(0)
  const [channel, setChannel] = useState(0)

  return (
    <section id="live-preview" className="mt-24 scroll-mt-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-stretch">
        {/* No aspect-square: with items-stretch on the grid above, this column's height now
            just fills the row (matching the text column's height) instead of a fixed 1:1 ratio,
            so the card reads as a portrait panel. min-h-[420px] only matters below md, where
            each column is its own row (no sibling height to stretch to). */}
        <div className="relative w-full max-w-[420px] min-h-[420px] mx-auto md:mx-0 rounded-3xl overflow-hidden border border-black/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]">
          {/* Standing in for the mp4 the 11x.ai reference plays here — there's no per-persona
              video, so a slow, continuous Ken Burns zoom/pan on the still photo (defined in
              globals.css) is what gives it that "alive"/video feel instead of a flat static
              image. object-cover's overflow is what the animation zooms into, clipped by the
              card's own overflow-hidden above. */}
          <img
            src={persona.avatar}
            alt={persona.contact}
            className="w-full h-full object-cover animate-[live-preview-motion_9s_ease-in-out_infinite]"
          />

          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-white">
              {persona.contact} · {persona.label}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[11px] font-medium text-white">Live</span>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-black/55 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={persona.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-white/60">Incoming</p>
                <p className="text-[13px] font-medium text-white truncate">{persona.contact}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Decline — decorative (matches the phone-demo's own red/rotated-glyph decline
                  button), not wired to anything since there's no real call to hang up on. */}
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF3B30]" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ transform: "rotate(135deg)" }}>
                  <path d={PHONE_GLYPH_PATH} />
                </svg>
              </span>
              {/* Accept — the actual link to the on-page demo. The animate-ping ring behind it
                  is the "wavy" pulse 11x.ai uses on its own live-call accept button, signalling
                  an incoming call waiting to be answered. */}
              <a
                href="#demo"
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#34C759] hover:bg-[#2FB350] transition-colors"
              >
                <span className="absolute inset-0 rounded-full bg-[#34C759] animate-[ping-sm_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" aria-hidden="true" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" className="relative">
                  <path d={PHONE_GLYPH_PATH} />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#EDE9F7] text-[#5D4387] text-[11px] font-semibold uppercase tracking-widest">
            Live Preview
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
            See a {persona.label} handle it, live.
          </h2>
          <p className="mt-4 text-[15px] text-black/55 leading-relaxed max-w-md">
            Pick a scenario and a channel, then watch {persona.contact} — your {persona.label} —
            take it from first message to next step.
          </p>

          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40">Scenario</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.useCases!.map((uc, i) => (
                <button
                  key={uc}
                  type="button"
                  onClick={() => setScenario(i)}
                  className={pillClass(i === scenario)}
                >
                  {uc}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40">Channel</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CHANNELS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannel(i)}
                  className={pillClass(i === channel)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="#demo"
              className="px-7 py-3.5 bg-[#111] text-white text-[12px] font-semibold uppercase tracking-wide rounded-full hover:bg-black/80 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Watch {persona.label} Live
            </a>
            <Link
              href="/get-started"
              className="text-[13px] font-semibold text-[#111] hover:text-[#5D4387] transition-colors"
            >
              {persona.ctaHireLabel} →
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-black/40">Runs an interactive preview right here on this page.</p>
        </div>
      </div>
    </section>
  )
}

// "Hire a [X] Angel" (filled) — hero only now. Was previously paired with an "Experience an
// Angel" button in both the hero and the closing section; split into two standalone buttons so
// each section can show just the one it needs (hero: hire; closing: experience).
function HireButton({ hireLabel }: { hireLabel?: string }) {
  return (
    <Link
      href="/get-started"
      className="inline-block px-7 py-3.5 bg-[#5D4387] text-white text-[12px] font-semibold uppercase tracking-wide rounded-full hover:bg-[#7168A0] transition-colors"
    >
      {hireLabel}
    </Link>
  )
}

// "Experience an Angel" (outlined) — closing section only now. Scrolls to the Live Preview
// section (not the hero's own phone demo) since that's the page's actual interactive preview.
function ExperienceButton() {
  return (
    <a
      href="#live-preview"
      className="inline-block px-7 py-3.5 border border-black/15 text-[#111] text-[12px] font-semibold uppercase tracking-wide rounded-full hover:border-black/30 hover:bg-black/[0.03] transition-colors"
    >
      Experience an Angel
    </a>
  )
}

/**
 * Shared body for the 4 standalone Hire-an-Angel pages (app/hire-an-angel/<slug>/page.tsx) —
 * each page is a thin wrapper that just picks a personaId, so the layout, persona-switcher
 * row, and phone demo can't drift across the 4 routes. Mirrors the modal's own persona-picker
 * pill grid (components/hire-an-angel-modal.tsx, left intact for later reactivation) but as
 * real links between the 4 pages instead of in-place state.
 *
 * Layout matches requirements/angel_pages.png (colors/light theme) + screenshot1-3.png (full
 * structure — the same design, just a dark-theme variant): left-aligned persona tabs above a
 * breadcrumb, a two-column hero (eyebrow badge/headline/subtext/CTAs/trust line + phone demo
 * with a floating "Business Outcome" card), a 3-column capabilities grid, a full-bleed outcome
 * banner, an FAQ-style explainer, and a closing CTA — all above the site's normal footer.
 * The site's own global nav (SiteHeader) is left untouched — the persona switcher shown
 * embedded in the navbar in those reference shots was intentionally NOT adopted; it lives here
 * instead, left-aligned above the breadcrumb.
 */
export function HireAnAngelPageContent({ personaId }: { personaId: PersonaId }) {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]
  // Gates the full landing-page sections below (hero headline through CTA). Personas that
  // haven't had their content doc copy filled in yet (lib/personas.ts) just keep a bare
  // phone-demo fallback instead of rendering half-empty sections.
  const hasLandingContent = !!persona.heroHeadline

  // flex flex-col + flex-1 on the content div below: keeps the footer pinned to the bottom
  // of the screen on short-content pages instead of stranded right after the content.
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 pt-28 md:pt-32 pb-24">
        <main className="max-w-6xl mx-auto">
          {/* Breadcrumb — deliberately quieter than the tab row below it (smaller, lighter,
              no bold/dark "current page" treatment) so it reads as page-hierarchy context, not
              a second nav competing with the tabs. The tabs stay the one bold/dark element in
              this header, so they're unambiguously the primary navigation. */}
          <nav aria-label="Breadcrumb" className="text-[12px] text-black/35 tracking-wide">
            <Link href="/" className="hover:text-black/60 transition-colors">
              Home
            </Link>
            <span className="mx-1.5 text-black/25">›</span>
            <span>Hire an Angel</span>
            <span className="mx-1.5 text-black/25">›</span>
            <span className="text-black/50">{persona.label}</span>
          </nav>

          {/* Persona tab row — left-aligned (not centered, and not embedded in the navbar). One
              shared underline (border-b on the row) with each link's own bottom border
              overlapping it via -mb-px — the classic tab-bar trick, so the active tab's
              underline sits flush on the divider line instead of floating below it. mt-7 (was
              mt-4): more breathing room from the quieter breadcrumb above, so the two don't read
              as one crowded block. */}
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-black/[0.08]">
            {PERSONAS.map((p) => {
              const active = p.id === personaId
              return (
                <Link
                  key={p.id}
                  href={`/hire-an-angel/${p.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`pb-3 text-[14px] font-medium border-b-2 -mb-px transition-colors duration-200 ${
                    active
                      ? "text-[#111] border-[#111]"
                      : "text-[#8A8A8A] border-transparent hover:text-[#111]"
                  }`}
                >
                  {p.label}
                </Link>
              )
            })}
          </div>

          {hasLandingContent ? (
            <>
              {/* Hero — two columns: copy + CTAs + trust line on the left, phone demo + a
                  floating "Business Outcome" card on the right. */}
              <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div>
                  {persona.eyebrow && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#EDE9F7] text-[#5D4387] text-[11px] font-semibold uppercase tracking-widest">
                      {persona.eyebrow}
                    </span>
                  )}
                  <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
                    {persona.heroHeadline}
                  </h1>
                  <p className="mt-5 text-[15px] text-black/55 leading-relaxed max-w-md">
                    {persona.heroSubtext}
                  </p>

                  <div className="mt-8">
                    <HireButton hireLabel={persona.ctaHireLabel} />
                  </div>

                  {/* Trust/differentiator line — identical wording across all 4 personas, so
                      it's hardcoded here rather than duplicated in each persona's data. */}
                  <div className="mt-8 pl-4 border-l-2 border-[#5D4387]/40 max-w-md">
                    <p className="text-[14px] font-semibold text-[#111]">
                      No bad days. No fear. No greed. Just focus.
                    </p>
                    <p className="mt-1.5 text-[13px] text-black/50 leading-relaxed">
                      Free from personal worries, emotional ups and downs, or self-interest. Your
                      Virtual AI Employee stays focused on the work and your business goals—24/7.
                    </p>
                  </div>
                </div>

                {/* sticky: keeps the phone in view as the (usually shorter) left column
                    finishes and the capabilities section begins, matching the reference.
                    width dropped from 300 to 240 (the device scales as a unit, so height drops
                    with it) specifically to close the gap between this column and the shorter
                    text column on the left — at 300 the phone ran noticeably taller than the
                    copy, leaving dead space beneath the text. */}
                <div className="flex flex-col items-center md:items-end md:sticky md:top-28">
                  <div id="demo" className="scroll-mt-24">
                    <PersonaPhoneDemo personaId={personaId} active width={240} />
                  </div>
                  <div className="mt-4 w-full max-w-[240px] rounded-xl border border-black/[0.08] bg-white px-5 py-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5D4387]">
                      Business Outcome
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#111]">{persona.outcomeTitle}</p>
                  </div>
                </div>
              </div>

              {/* Capabilities — 3-column bordered cards with a small icon swatch, bold title
                  and description each, straight from the content doc. */}
              <section className="mt-12">
                <h2 className="text-xs font-medium uppercase tracking-widest text-black/40">
                  Capabilities
                </h2>
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {persona.capabilities!.map((c) => (
                    <div
                      key={c.title}
                      tabIndex={0}
                      className="rounded-2xl border-2 border-black/[0.08] bg-white px-6 py-6 transition-colors cursor-pointer hover:border-[#5D4387] focus:outline-none focus:border-[#5D4387] active:border-[#5D4387]"
                    >
                      {/* Layered icon swatch — light-purple square with a smaller solid-purple
                          square (60% of the outer size, not a circle) centered inside it,
                          matching the design mockup (angelpageslight.vercel.app); previously just
                          a single flat purple square. */}
                      <span className="inline-flex items-center justify-center w-[25px] h-[25px] rounded-md bg-[#EDE9F7]" aria-hidden="true">
                        <span className="w-[40%] h-[40%] rounded-[3px] bg-[#5D4387]" />
                      </span>
                      <p className="mt-4 font-semibold text-[#111]">{c.title}</p>
                      <p className="mt-1.5 text-sm text-black/50 leading-relaxed">{c.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <LiveDemoSection persona={persona} />

              {/* Business outcome — full-bleed gradient banner, reusing the same
                  outcomeTitle/outcomeDescription already teased in the hero's floating card. */}
              <section
                className="mt-8 rounded-2xl px-8 py-10 md:px-12 md:py-12"
                style={{ background: "linear-gradient(135deg, #5D4387, #7168A0)" }}
              >
                <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {persona.outcomeTitle}
                </p>
                <p className="mt-3 text-[15px] text-white/80 leading-relaxed max-w-2xl">
                  {persona.outcomeDescription}
                </p>
              </section>

              {/* Plain-language explainer, tagged as answer-engine/FAQ-schema content per the
                  reference design. */}
              <section className="mt-20 max-w-2xl">
                <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 text-[10px] font-semibold uppercase tracking-widest text-black/45">
                  Structured for Answer Engines · FAQPage Schema
                </span>
                <h2 className="mt-5 text-2xl md:text-3xl font-light tracking-tight">{persona.whatIsTitle}</h2>
                <p className="mt-4 text-sm text-black/55 leading-relaxed">{persona.whatIsDescription}</p>
              </section>

              {/* Closing CTA — "Experience an Angel" only (the hire button already lives in the
                  hero above); this one scrolls down to the Live Preview section. */}
              <section className="mt-20 pb-4">
                <p className="text-xl font-semibold text-[#111]">{persona.ctaLine}</p>
                <div className="mt-6">
                  <ExperienceButton />
                </div>
              </section>
            </>
          ) : (
            <div className="mt-16 flex justify-center">
              <div id="demo" className="scroll-mt-24">
                <PersonaPhoneDemo personaId={personaId} active width={340} />
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
