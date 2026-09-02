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

type Phase = "idle" | "in" | "out" | "icons" | "done"

// Every value below is read directly off the reference build's live DOM/stylesheet
// (https://aiactangel.netlify.app/) rather than inferred from screenshots — bubble sizes,
// both waypoints, icon glyph sizes and the timing are all verbatim.
//
// Two things earlier guesses got wrong: the stagger IS perfectly uniform (172.5ms), and the
// scattered look comes entirely from the varied bubble SIZES and the irregular waypoint
// coordinates — not from irregular timing. Each bubble also travels to TWO waypoints
// (out, then further out) before collapsing back into the hub.
const BUBBLE_DUR    = 2185   // every bubble shares this duration
const BUBBLE_DELAY0 = 402.5  // first bubble's delay
const BUBBLE_STAGGER = 172.5

interface Bubble {
  size: number      // bubble diameter, px
  glyph: number     // icon size inside it, px
  dx1: number; dy1: number   // first waypoint
  dx2: number; dy2: number   // second, further-out waypoint
  icon: React.ReactNode
}

const BUBBLES: Bubble[] = [
  { size: 67, glyph: 29, dx1: -70, dy1: -180, dx2: -106, dy2: -264,
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /> }, // phone
  { size: 55, glyph: 24, dx1: 62, dy1: -162, dx2: 98, dy2: -246,
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> }, // calendar
  { size: 72, glyph: 38, dx1: -115, dy1: -102, dx2: -175, dy2: -162,
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> }, // chat
  { size: 46, glyph: 20, dx1: 10, dy1: -234, dx2: 19, dy2: -330,
    icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#fff" strokeWidth="1" /> }, // star (filled, unlike the rest)
  { size: 60, glyph: 26, dx1: 115, dy1: -114, dx2: 175, dy2: -186,
    icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> }, // clock
  { size: 50, glyph: 22, dx1: -22, dy1: -270, dx2: -34, dy2: -360,
    icon: <polyline points="20 6 9 17 4 12" strokeWidth="2" /> }, // check
]

// Hub orb timing, also verbatim from the reference.
const ORB_SIZE        = 101
const ORB_IN_DUR      = 575
const ORB_MORPH_DELAY = 3507.5
const ORB_MORPH_DUR   = 690

// Closing line. Its fade-in deliberately overlaps the orb's morph (3507.5-4197.5ms) so the
// orb collapsing and the text arriving read as one handoff rather than two separate beats.
// TEXT_HOLD is measured from the reference: it sits fully visible ~1.6s before the intro ends.
const TEXT_DELAY = 3852.5
const TEXT_DUR   = 690
const TEXT_HOLD  = 1600

// Phase ends when the last thing on screen is done — now the closing line, not the orb.
const ICONS_TOTAL = Math.max(
  BUBBLE_DELAY0 + BUBBLE_STAGGER * (BUBBLES.length - 1) + BUBBLE_DUR,
  ORB_MORPH_DELAY + ORB_MORPH_DUR,
  TEXT_DELAY + TEXT_DUR + TEXT_HOLD,
)

const CURTAIN_DELAY      = ICONS_START + ICONS_TOTAL + 100
const CURTAIN_DURATION   = 1300  // matches the CSS transition on the curtain div
const ANIM_TOTAL         = CURTAIN_DELAY + CURTAIN_DURATION + 400

// Exported: moment the curtain finishes retracting — when the bg is fully visible
export const INTRO_DURATION_MS = CURTAIN_DELAY + CURTAIN_DURATION
// Exported: ms before curtain fully done to start hero animations (overlap for smoothness)
export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150

// The intro plays once per tab session. Without this it replays on every load of "/",
// so returning home from another page (e.g. clicking the logo on the Cookies Policy page)
// would sit through the full ~10s sequence again.
// sessionStorage, not localStorage: a genuinely new visit should still get the intro.
const INTRO_SEEN_KEY = "actangel.intro-seen"

export function hasSeenIntro() {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1"
  } catch {
    // Storage blocked (private mode / cookies off) — just play the intro.
    return false
  }
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1")
  } catch {
    /* nothing to do — the intro will simply play again */
  }
}

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [curtainUp, setCurtainUp] = useState(false)
  // Separate from `phase` on purpose: the icon cluster must unmount the moment its own
  // fly-out/collect cycle finishes, not linger until `phase` becomes "done" (which was only
  // set at ANIM_TOTAL — well after the curtain had already revealed the homepage underneath).
  const [showIcons, setShowIcons] = useState(false)
  // The cluster is laid out in absolute px (to match the reference exactly), so it has to be
  // scaled down as one unit on smaller screens. This can't be done in pure CSS: scale() needs
  // a unitless number, and there's no way to turn 100vw into one. Measured here instead.
  // Starts at 1 so SSR and first paint agree — the effect corrects it before the icons show.
  const [clusterScale, setClusterScale] = useState(1)

  useEffect(() => {
    const CLUSTER_W = 520  // px the cluster needs horizontally at full size
    const CLUSTER_H = 900  // px it needs vertically (reaches ~400px above the hub)
    const measure = () =>
      setClusterScale(Math.min(1, window.innerWidth / CLUSTER_W, window.innerHeight / CLUSTER_H))
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  useEffect(() => {
    // Already played this session — tear down immediately and hand the page straight over.
    if (hasSeenIntro()) {
      setPhase("done")
      onDone()
      return
    }

    // Marked "seen" as soon as this effect actually runs — via setTimeout(0), not
    // synchronously — rather than waiting for the intro to finish at HERO_REVEAL_MS (~9.7s).
    // That original timing meant clicking any nav/footer link during the ~10s the intro
    // plays (very easy to do — nobody waits out a 10s animation before clicking around) tore
    // the page down before the timer fired, so the flag never got saved; returning via the
    // logo would then find "not seen" and replay the whole intro from scratch.
    // setTimeout(0) still lands after the current synchronous effect-flush, so the parent's
    // own mount-time effect (the hero's video-zoom timer) still reads "not seen" on this
    // exact first render and schedules its own HERO_REVEAL_MS timer as before — only a
    // reload racing this at sub-millisecond speed could still slip through, which isn't a
    // real scenario.
    const tSeen = setTimeout(markIntroSeen, 0)

    // Tiny delay so the browser has painted before we start transitioning
    const t0 = setTimeout(() => setPhase("in"), 80)
    const t1 = setTimeout(() => setPhase("out"), LETTERS_IN_TOTAL)
    const t2 = setTimeout(() => { setPhase("icons"); setShowIcons(true) }, ICONS_START)
    const t2b = setTimeout(() => setShowIcons(false), ICONS_START + ICONS_TOTAL)
    const t3 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t4 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    const t5 = setTimeout(() => setPhase("done"), ANIM_TOTAL)

    return () => { clearTimeout(tSeen); clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t2b); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onDone])

  if (phase === "done") return null

  // Running index across real letters only (spaces don't consume a slot) — drives stagger delay
  let letterIndex = 0

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">

      {/* Gradient curtain — retracts upward, revealing mountains from bottom */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
          // White, not the page's #F5F4F0 — the reference's intro backdrop is pure white, and
          // it has to be: the orb is #F4F4F4, so on an off-white curtain it's the same colour
          // as its own background and simply doesn't read. The semi-transparent bubbles also
          // composite to the reference's exact greys only over white.
          background: "#FFFFFF",
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
          Bubbles are thrown out of the hub to a first waypoint, drift further out to a second,
          then collapse back in and are absorbed as the hub itself morphs away. Waypoints ride
          in as --dx1/--dy1/--dx2/--dy2 on a shared @keyframes (see globals.css).
          Everything is in absolute px to match the reference exactly, so the whole cluster is
          scaled as one unit rather than sized in percentages that would distort the layout. */}
      {showIcons && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Zero-size anchor: every child centers on this one point via translate(-50%,-50%),
              so the px offsets above are measured from the hub's center, as in the reference.
              Sits at 65% height, not centred — the reference anchors the whole cluster there
              (~135px below centre at 900px tall) so the bubbles have room to fly upward and
              leave space for the closing line, which lands higher up at 42%. */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "65%",
              width: 0,
              height: 0,
              // Shrinks as one unit on smaller screens instead of letting bubbles fly
              // off-canvas — see the measuring effect above for why this isn't pure CSS.
              transform: `scale(${clusterScale})`,
            }}
          >
            {/* Bubbles render BEFORE the orb so the orb paints on top of them — that's what
                makes the icons look like they slide back *behind* the logo and get absorbed,
                rather than passing over it. Same DOM order the reference uses. */}
            {BUBBLES.map((b, i) => (
              <div
                key={i}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  left: 0,
                  top: 0,
                  width: b.size,
                  height: b.size,
                  background: "linear-gradient(135deg, rgba(17,17,17,0.72), rgba(17,17,17,0.5))",
                  animation: `bubble-float ${BUBBLE_DUR}ms ease-in-out ${BUBBLE_DELAY0 + i * BUBBLE_STAGGER}ms both`,
                  ["--dx1" as string]: `${b.dx1}px`,
                  ["--dy1" as string]: `${b.dy1}px`,
                  ["--dx2" as string]: `${b.dx2}px`,
                  ["--dy2" as string]: `${b.dy2}px`,
                } as React.CSSProperties}
              >
                <svg
                  width={b.glyph}
                  height={b.glyph}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {b.icon}
                </svg>
              </div>
            ))}

            {/* Hub orb — painted after the bubbles so it covers them as they return. */}
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                left: 0,
                top: 0,
                width: ORB_SIZE,
                height: ORB_SIZE,
                background: "#F4F4F4",
                boxShadow: "0 20px 44px -14px rgba(0,0,0,0.2)",
                animation: `orb-in ${ORB_IN_DUR}ms ease both, orb-morph ${ORB_MORPH_DUR}ms ease ${ORB_MORPH_DELAY}ms both`,
              }}
            >
              <img src="/icon2.png" alt="" className="w-[80%] h-[80%] object-contain" />
            </div>
          </div>1

          {/* Closing line — arrives as the orb collapses, and is the last thing on screen
              before the curtain lifts. Centered on the full viewport (both axes handled by the
              intro-text-in keyframes' translate(-50%,-50%)), independent of where the icon
              cluster/orb above happen to sit.
              Two independently-sized lines (not one heading with a uniform size) so the lead
              line reads as the headline and the sub-line as supporting copy underneath it,
              matching the client's reference: "AI That Acts." bigger and bolder, the longer
              "Scale Your Business — Not Your Headcount." smaller beneath it. */}
          <h1
            className="absolute left-1/2 font-sans text-[#111] text-center m-0 flex flex-col items-center"
            style={{
              top: "50%",
              width: 780,
              maxWidth: "92vw",
              gap: "calc(0.35em + 12px)",
              animation: `intro-text-in ${TEXT_DUR}ms ease ${TEXT_DELAY}ms both`,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "clamp(38px, 6vw, 64px)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              AI That Acts.
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "clamp(19px, 2.7vw, 30px)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Scale Your Business — Not Your Headcount.
            </span>
          </h1>
        </div>
      )}

    </div>
  )
}
