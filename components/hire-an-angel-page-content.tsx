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

  // flex flex-col + flex-1 on the content div below: keeps the footer pinned to the bottom
  // of the screen on short-content pages instead of stranded right after the content.
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <main className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            {persona.label}
          </h1>

          {/* Real tabs, not the modal's button grid: one shared underline (border-b on the
              row) with each link's own bottom border overlapping it via -mb-px — the classic
              tab-bar trick, so the active tab's underline sits flush on the divider line
              instead of floating below it. */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-8 border-b border-black/[0.08]">
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

          <div className="flex justify-center mt-10">
            <PersonaPhoneDemo personaId={personaId} active width={340} />
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
