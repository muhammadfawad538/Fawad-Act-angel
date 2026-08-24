"use client"

import { useState, useEffect } from "react"

// Source has no per-step description, just a number + label — not inventing one.
const STEPS = [
  { num: "01", title: "Answers" },
  { num: "02", title: "Handles it" },
  { num: "03", title: "Reports back" },
]

export function DevExSection() {
  const [active, setActive] = useState(0)

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
    <section id="how-it-works" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            A day on the job
          </h2>
        </div>

        {/* Step selector — horizontal row on large screens, vertical stack on small
            (no code panel to share the section with anymore, so this can use the full width) */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex-1 flex items-center gap-3">
              <button
                onClick={() => selectStep(i)}
                className="flex-1 text-left rounded-2xl border transition-all duration-200 p-6"
                style={{
                  background: active === i ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.7)",
                  borderColor: active === i ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)",
                  boxShadow: active === i
                    ? "0 1px 3px rgba(0,0,0,0.06)"
                    : "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200"
                    style={{
                      background: active === i ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
                      color: active === i ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    {s.num}
                  </div>
                  {/* Weight/color matched to the navbar's menu-item text (NAV_ITEM in
                      mobile-nav.tsx): font-medium at #4A4A4A, darkening to #111 like the
                      nav's hover state — reused here for the active card instead. */}
                  <p
                    className="text-base font-medium transition-colors duration-200"
                    style={{ color: active === i ? "#111" : "#4A4A4A" }}
                  >
                    {s.title}
                  </p>
                </div>
              </button>

              {/* Arrow connector — desktop row only, reinforces the sequence like source's chip row */}
              {i < STEPS.length - 1 && (
                <span className="hidden lg:block text-lg text-black/20 shrink-0" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
