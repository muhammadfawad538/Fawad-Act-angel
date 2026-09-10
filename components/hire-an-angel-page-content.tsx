import Link from "next/link"
import { PERSONAS, type PersonaId } from "@/lib/personas"
import { PersonaPhoneDemo } from "@/components/persona-phone-demo"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

/**
 * Shared body for the 4 standalone Hire-an-Angel pages (app/hire-an-angel/<slug>/page.tsx) —
 * each page is a thin wrapper that just picks a personaId, so the layout, persona-switcher
 * row, and phone demo can't drift across the 4 routes. Mirrors the modal's own persona-picker
 * pill grid (components/hire-an-angel-modal.tsx, left intact for later reactivation) but as
 * real links between the 4 pages instead of in-place state.
 */
export function HireAnAngelPageContent({ personaId }: { personaId: PersonaId }) {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]
  // Gates the full landing-page sections below (hero headline through CTA). Personas that
  // haven't had their content doc copy filled in yet (lib/personas.ts) just keep today's
  // minimal H1 + tabs + phone-demo layout instead of rendering half-empty sections — lets the
  // 4 pages be rolled out one at a time instead of all at once.
  const hasLandingContent = !!persona.heroHeadline

  // flex flex-col + flex-1 on the content div below: keeps the footer pinned to the bottom
  // of the screen on short-content pages instead of stranded right after the content.
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <main className="max-w-4xl mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {persona.label}
            </h1>

            {/* Shared tagline across all 4 persona pages, verbatim from the client's content doc
                (requirements/Act_Angel_AI_Hire_an_Angel_Website_Content.pdf) — same line for
                every persona, so it lives here in the shared body rather than per-persona data. */}
            <p className="mt-3 text-base md:text-lg font-medium text-[#111]">
              AI That Acts. Scale Your Business—Not Your Headcount.
            </p>

            {hasLandingContent && (
              <>
                <h2 className="mt-10 text-3xl md:text-4xl font-light tracking-tight leading-[1.1]">
                  {persona.heroHeadline}
                </h2>
                <p className="mt-4 text-[15px] text-black/60 leading-relaxed">
                  {persona.heroSubtext}
                </p>
              </>
            )}

            {/* Real tabs, not the modal's button grid: one shared underline (border-b on the
                row) with each link's own bottom border overlapping it via -mb-px — the classic
                tab-bar trick, so the active tab's underline sits flush on the divider line
                instead of floating below it. */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10 border-b border-black/[0.08]">
              {PERSONAS.map((p) => {
                const active = p.id === personaId
                return (
                  <Link
                    key={p.id}
                    href={`/hire-an-angel/${p.slug}`}
                    aria-current={active ? "page" : undefined}
                    className="pb-3 text-[14px] font-medium border-b-2 -mb-px transition-colors duration-200 hover:text-[#111]"
                    style={{
                      color: active ? "#111111" : "#8A8A8A",
                      borderColor: active ? "#111111" : "transparent",
                    }}
                  >
                    {p.label}
                  </Link>
                )
              })}
            </div>

            <div id="demo" className="flex justify-center mt-10 scroll-mt-24">
              <PersonaPhoneDemo personaId={personaId} active width={340} />
            </div>
          </div>

          {hasLandingContent && (
            <>
              {/* Capabilities — bold lead-in + one-line description each, straight from the
                  content doc. Two columns on larger screens; stacks to one on mobile. */}
              <section className="mt-24">
                <h3 className="text-xs font-medium uppercase tracking-widest text-black/40 text-center">
                  Capabilities
                </h3>
                <div className="mt-8 grid sm:grid-cols-2 gap-x-12 gap-y-8">
                  {persona.capabilities!.map((c) => (
                    <div key={c.title}>
                      <p className="font-medium text-[#111]">{c.title}</p>
                      <p className="mt-1 text-sm text-black/50 leading-relaxed">{c.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Business outcome — a single highlighted callout, not another list. */}
              <section className="mt-20 max-w-2xl mx-auto text-center rounded-2xl border border-black/[0.07] bg-white px-8 py-10">
                <p className="text-xl font-light tracking-tight">{persona.outcomeTitle}</p>
                <p className="mt-3 text-sm text-black/50 leading-relaxed">{persona.outcomeDescription}</p>
              </section>

              {/* Plain-language explainer */}
              <section className="mt-20 max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-light tracking-tight">{persona.whatIsTitle}</h3>
                <p className="mt-4 text-sm text-black/55 leading-relaxed">{persona.whatIsDescription}</p>
              </section>

              {/* Trust/differentiator line — identical wording across all 4 personas, so it's
                  hardcoded here rather than duplicated in each persona's data. */}
              <section className="mt-20 max-w-2xl mx-auto text-center">
                <p className="text-lg font-medium">No bad days. No fear. No greed. Just focus.</p>
                <p className="mt-3 text-sm text-black/50 leading-relaxed">
                  Free from personal worries, emotional ups and downs, or self-interest. Your
                  Virtual AI Employee stays focused on the work and your business goals—24/7.
                </p>
              </section>

              {/* CTA — "Hire a [X] Angel" drives into the real lead-capture flow; "Experience an
                  Angel" jumps back up to the phone demo already on this page rather than opening
                  a separate modal, since the live demo is already right here. */}
              <section className="mt-20 max-w-2xl mx-auto text-center pb-4">
                <p className="text-lg font-medium">{persona.ctaLine}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/get-started"
                    className="px-8 py-3 border border-black/15 text-[#111] text-sm rounded-xl hover:border-black/30 hover:bg-black/[0.03] transition-colors tracking-wide font-medium"
                  >
                    {persona.ctaHireLabel}
                  </Link>
                  <a
                    href="#demo"
                    className="px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium"
                  >
                    Experience an Angel
                  </a>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
