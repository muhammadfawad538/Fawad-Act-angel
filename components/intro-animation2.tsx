"use client"

import { useEffect, useState } from "react"

// Words rendered as separate animated letter groups, joined by a fixed (non-animated) gap —
// keeps spaces out of the stagger/sizing math instead of treating them as empty letter slots.
const WORDS = ["Act", "Angel", "AI"]
const REAL_LETTERS = WORDS.join("").length // 10 — drives font size and stagger timing

const LETTER_IN_STAGGER  = 90    // ms between each letter appearing
const LETTER_IN_DUR      = 700   // duration of each letter appear transition
const HOLD_DURATION      = 300   // hold fully visible before exit
const LETTERS_IN_TOTAL   = LETTER_IN_STAGGER * (REAL_LETTERS - 1) + LETTER_IN_DUR + HOLD_DURATION

const LETTER_OUT_STAGGER = 55    // ms between each letter disappearing
const LETTER_OUT_DUR     = 450   // duration of each letter fade out
const LETTERS_OUT_TOTAL  = LETTER_OUT_STAGGER * (REAL_LETTERS - 1) + LETTER_OUT_DUR

// ── Icon-cluster phase — plays after the wordmark, before the curtain lifts ──────
const ICONS_START        = LETTERS_IN_TOTAL + LETTERS_OUT_TOTAL
const ICON_STAGGER       = 90    // ms between each icon popping out
const ICON_CYCLE_DUR     = 1500  // one icon's full pop-out → hold → collect-back, via CSS keyframes
const ICON_COUNT         = 6
const ICONS_TOTAL        = ICON_STAGGER * (ICON_COUNT - 1) + ICON_CYCLE_DUR

const CURTAIN_DELAY      = ICONS_START + ICONS_TOTAL + 100
const CURTAIN_DURATION   = 1300  // matches the CSS transition on the curtain div
const ANIM_TOTAL         = CURTAIN_DELAY + CURTAIN_DURATION + 400

// Exported: moment the curtain finishes retracting — when the bg is fully visible
export const INTRO_DURATION_MS = CURTAIN_DELAY + CURTAIN_DURATION
// Exported: ms before curtain fully done to start hero animations (overlap for smoothness)
export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150

type Phase = "idle" | "in" | "out" | "icons" | "done"

// 6 icons around the center hub. Positions (tx/ty, px at the 360px container basis) are not
// a uniform ring — they're measured directly from the reference animation via pixel-color
// clustering on captured frames (https://aiactangel.netlify.app/), which uses a deliberately
// asymmetric/organic scatter (radius varies ~140-360px, angles irregular), not evenly-spaced
// angles at a fixed radius like an earlier version of this component used.
const ICONS: { tx: number; ty: number; path: React.ReactNode }[] = [
  { tx: -56.9, ty: -49.5, path: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> }, // chat
  { tx: -44.9, ty: -112.0, path: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /> }, // phone
  { tx: -15.7, ty: -164.7, path: <path d="M20 6 9 17l-5-5" /> }, // check
  { tx: 5.1, ty: -107.8, path: <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" /> }, // star
  { tx: 37.5, ty: -91.6, path: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> }, // calendar
  { tx: 41.2, ty: -48.6, path: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></> }, // clock
]

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [curtainUp, setCurtainUp] = useState(false)
  // Separate from `phase` on purpose: the icon cluster must unmount the moment its own
  // fly-out/collect cycle finishes, not linger until `phase` becomes "done" (which was only
  // set at ANIM_TOTAL — well after the curtain had already revealed the homepage underneath).
  const [showIcons, setShowIcons] = useState(false)

  useEffect(() => {
    // Tiny delay so the browser has painted before we start transitioning
    const t0 = setTimeout(() => setPhase("in"), 80)
    const t1 = setTimeout(() => setPhase("out"), LETTERS_IN_TOTAL)
    const t2 = setTimeout(() => { setPhase("icons"); setShowIcons(true) }, ICONS_START)
    const t2b = setTimeout(() => setShowIcons(false), ICONS_START + ICONS_TOTAL)
    const t3 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t4 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    const t5 = setTimeout(() => setPhase("done"), ANIM_TOTAL)

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t2b); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onDone])

  if (phase === "done") return null

  // Running index across real letters only (spaces don't consume a slot) — drives stagger delay
  let letterIndex = 0

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">

      {/* Self-contained keyframes for the icon cluster — kept local to this component (rather
          than relying on globals.css) so the file can be dropped into any project unmodified.
          icon-orbit: pop out from the hub's center to its (--tx, --ty) offset, hold, then
          collect back into the hub and fade — matching the reference's "throw out, absorb
          back in" motion rather than a simple pop-in-place. */}
      <style>{`
        @keyframes icon-orbit {
          0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          14%  { opacity: 1; }
          22%  { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 1; }
          78%  { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        @keyframes hub-fade {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          10%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          85%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
        }
      `}</style>

      {/* Gradient curtain — retracts upward, revealing mountains from bottom */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
          background: "#f5f4f1",
        }}
      />

      {/* ACT ANGEL AI letters */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="flex items-baseline">
          {WORDS.map((word, wi) => (
            <div
              key={wi}
              className="flex"
              style={{
                gap: "0.06em",
                // Fixed, non-animated word gap — computed from the same vw-based formula as letter size,
                // since `em` here would otherwise resolve against the ambient body font-size, not the huge letter size.
                marginLeft: wi === 0 ? 0 : `calc((100vw - 64px) / ${REAL_LETTERS} * 0.35)`,
              }}
            >
              {word.split("").map((letter, li) => {
                const i = letterIndex++
                const inDelay  = i * LETTER_IN_STAGGER
                const outDelay = i * LETTER_OUT_STAGGER

                // idle → invisible starting position
                const isIdle = phase === "idle"
                const isIn   = phase === "in"
                const isOut  = phase === "out" || phase === "icons"

                const opacity    = isIdle ? 0 : isIn ? 1 : 0
                const blur       = isIdle ? 36 : isIn ? 0 : 24
                const translateY = isIdle ? 48 : isIn ? 0 : -20

                const transition = isOut
                  ? `opacity ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms,
                     filter  ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms,
                     transform ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms`
                  : isIn
                  ? `opacity ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms,
                     filter  ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms,
                     transform ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms`
                  : "none"

                return (
                  <span
                    key={li}
                    className="font-sans font-bold text-[#111] leading-none select-none uppercase"
                    style={{
                      fontSize: `calc((100vw - 64px) / ${REAL_LETTERS})`,
                      letterSpacing: "0.05em",
                      opacity,
                      filter: `blur(${blur}px)`,
                      transform: `translateY(${translateY}px)`,
                      transition,
                      willChange: "opacity, filter, transform",
                    }}
                  >
                    {letter}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Icon cluster — plays once, after the wordmark fades, before the curtain lifts.
          Icons animate FROM the hub's center OUT to their orbit position, hold, then animate
          BACK into the hub (collect), matching the reference: they're thrown out then absorbed
          back into the logo, not popped in place. Per-icon travel distance is passed as CSS
          custom properties (--tx/--ty) into a single shared @keyframes defined above. */}
      {showIcons && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: "min(70vw, 360px)", aspectRatio: "1" }}>
            {/* Center hub — stays put while icons orbit out from and back into it, then fades
                out itself in sync with the icons so nothing lingers once the cycle ends. */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full bg-white flex items-center justify-center"
              style={{
                width: "22%",
                aspectRatio: "1",
                boxShadow: "0 18px 36px -10px rgba(17,24,39,0.25), 0 0 0 8px rgba(17,24,39,0.03)",
                animation: `hub-fade ${ICONS_TOTAL}ms ease-out both`,
              }}
            >
              <img src="/icon2.png" alt="" className="w-[46%] h-[46%] object-contain" />
            </div>

            {ICONS.map((icon, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full flex items-center justify-center"
                style={{
                  width: "17%",
                  aspectRatio: "1",
                  background: "#6b7280",
                  boxShadow: "0 10px 20px -8px rgba(17,24,39,0.3)",
                  animation: `icon-orbit ${ICON_CYCLE_DUR}ms cubic-bezier(0.4,0,0.2,1) ${i * ICON_STAGGER}ms both`,
                  ["--tx" as string]: `${icon.tx}px`,
                  ["--ty" as string]: `${icon.ty}px`,
                } as React.CSSProperties}
              >
                <svg width="46%" height="46%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {icon.path}
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
