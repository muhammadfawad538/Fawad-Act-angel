"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

// Source has no per-step description, just a number + label — not inventing one.
const STEPS = [
  { num: "01", title: "Answers" },
  { num: "02", title: "Handles it" },
  { num: "03", title: "Reports back" },
]

// The active/inactive card colors below are inline styles (not Tailwind classes), since which
// one applies depends on component state (active === i), not just the theme — dark:/purple:
// variants only ever resolve from a static class list, so there's no way to express "this
// color, but a different one when active AND a third when purple" through them alone. Reading
// the theme directly here and branching the same way the active-state branching already does
// is the same problem the component already had to solve once.
type Theme = "light" | "dark" | "purple"

function cardStyle(theme: Theme, isActive: boolean) {
  const styles = {
    light: {
      bg: isActive ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.7)",
      border: isActive ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)",
      shadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.03)",
      badgeBg: isActive ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
      badgeColor: isActive ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)",
      title: isActive ? "#111" : "#4A4A4A",
    },
    dark: {
      bg: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
      border: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
      shadow: isActive ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.2)",
      badgeBg: isActive ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
      badgeColor: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
      title: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
    },
    purple: {
      bg: isActive ? "rgba(124,92,255,0.25)" : "rgba(255,255,255,0.05)",
      border: isActive ? "rgba(183,156,255,0.35)" : "rgba(183,156,255,0.12)",
      shadow: isActive ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.2)",
      badgeBg: isActive ? "rgba(124,92,255,0.3)" : "rgba(183,156,255,0.1)",
      badgeColor: isActive ? "#F6F4FF" : "rgba(183,156,255,0.6)",
      title: isActive ? "#F6F4FF" : "#ABA6D9",
    },
  } as const
  return styles[theme]
}

export function DevExSection() {
  const [active, setActive] = useState(0)
  const { resolvedTheme } = useTheme()
  // Matches ThemeToggle's own guard: resolvedTheme is undefined until next-themes reads the
  // real value client-side, so this falls back to "light" (matching SSR output) until mounted
  // rather than briefly rendering with an unknown/mismatched theme.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const theme: Theme = mounted && (resolvedTheme === "dark" || resolvedTheme === "purple")
    ? resolvedTheme
    : "light"

  function selectStep(i: number) {
    if (i === active) return
    setActive(i)
  }

  // Auto-advance every 3.2s — same interval as the theme's original step selector
  useEffect(() => {
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % STEPS.length)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="how-it-works" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 dark:bg-[#0a0a0a] purple:bg-[#12103C]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-[#111] dark:text-white purple:text-[#F6F4FF]">
            A day on the job
          </h2>
        </div>

        {/* Step selector — horizontal row on large screens, vertical stack on small
            (no code panel to share the section with anymore, so this can use the full width) */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          {STEPS.map((s, i) => {
            const c = cardStyle(theme, active === i)
            return (
            <div key={s.num} className="flex-1 flex items-center gap-3">
              <button
                onClick={() => selectStep(i)}
                className="flex-1 text-left rounded-2xl border transition-all duration-200 p-6"
                style={{
                  background: c.bg,
                  borderColor: c.border,
                  boxShadow: c.shadow,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200"
                    style={{
                      background: c.badgeBg,
                      color: c.badgeColor,
                    }}
                  >
                    {s.num}
                  </div>
                  {/* Weight/color matched to the navbar's menu-item text (NAV_ITEM in
                      mobile-nav.tsx): font-medium at #4A4A4A, darkening to #111 like the
                      nav's hover state — reused here for the active card instead. */}
                  <p
                    className="text-base font-medium transition-colors duration-200"
                    style={{ color: c.title }}
                  >
                    {s.title}
                  </p>
                </div>
              </button>

              {/* Arrow connector — desktop row only, reinforces the sequence like source's chip row */}
              {i < STEPS.length - 1 && (
                <span className="hidden lg:block text-lg text-black/20 dark:text-white/25 purple:text-[#B79CFF]/30 shrink-0" aria-hidden="true">
                  →
                </span>
              )}
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
