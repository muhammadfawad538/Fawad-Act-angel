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

type Phase = "idle" | "in" | "out" | "done"

// Every value below is read directly off the reference build's live DOM/stylesheet
// (https://aiactangel.netlify.app/) rather than inferred from screenshots — bubble sizes,
// both waypoints, icon glyph sizes and the timing are all verbatim. Not rendered any more (the
// icon-cluster phase was replaced by the closing line below) and no longer feeds any timing
// calculation — kept only as reference measurements in case that phase is ever revived.
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

// Hub orb timing, also verbatim from the reference. Not rendered any more (the icon-cluster
// phase was replaced by the closing line below) and no longer feeds any timing calculation —
// kept only as reference measurements in case that phase is ever revived.
const ORB_SIZE        = 101
const ORB_IN_DUR      = 575
const ORB_MORPH_DELAY = 3507.5
const ORB_MORPH_DUR   = 690

// Closing line. TEXT_DELAY is pinned to ICONS_START (the moment the wordmark finishes fading
// out) plus a near-zero gap, so the handoff between the two animations reads as continuous
// rather than a dead pause. TEXT_DUR + TEXT_HOLD is the headline's total on-screen time
// (fade-in, then holding fully visible) — 1500ms total, by explicit request.
const TEXT_DELAY = ICONS_START + 10
const TEXT_DUR   = 300
const TEXT_HOLD  = 1200

// When setPhase("in") actually fires (see the effect below). CURTAIN_DELAY needs this because
// TEXT_DELAY above is itself counted from that same moment — it's a CSS animation-delay on an
// element that first mounts the instant phase leaves "idle", not from component mount.
const PHASE_IN_START = 80

// Curtain starts lifting once the headline has finished its whole on-screen run (fade-in +
// hold) — BUBBLE_*/ORB_* above no longer factor in here since nothing renders them.
const CURTAIN_DELAY      = PHASE_IN_START + TEXT_DELAY + TEXT_DUR + TEXT_HOLD + 100
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

    // Tiny delay so the browser has painted before we start transitioning.
    // The second icon-cluster phase is removed completely, so the final headline starts
    // immediately after the wordmark exits and there is no blank gap in the middle.
    const t0 = setTimeout(() => setPhase("in"), PHASE_IN_START)
    const t1 = setTimeout(() => setPhase("out"), LETTERS_IN_TOTAL)
    const t3 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t4 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    // Only place `phase` flips to "done" — render bails out to null the instant it does (see
    // below), so this must wait until the curtain has actually lifted. An earlier intermediate
    // timer used to flip it much sooner (tuned for when an icon-cluster phase still sat between
    // the wordmark and the closing line); once that phase was removed, that timer fired ~3s
    // before the curtain even started lifting, tearing the whole white overlay down early and
    // leaving the still-unrevealed hero (small video, hidden text) exposed and frozen until
    // HERO_REVEAL_MS finally caught up — the "delayed enlarge" this was causing.
    const t5 = setTimeout(() => setPhase("done"), ANIM_TOTAL)

    return () => { clearTimeout(tSeen); clearTimeout(t0); clearTimeout(t1); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onDone])

  if (phase === "done") return null

  // Running index across real letters only (spaces don't consume a slot) — drives stagger delay
  let letterIndex = 0

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">

      {/* Gradient curtain — retracts upward, revealing mountains from bottom. Background is a
          className, not the inline style below, so dark:/purple: can reach it — matches
          whichever page background it's about to reveal (next-themes sets .dark/.purple on
          <html> synchronously before hydration, so this is correct from the very first paint,
          no flash of the wrong colour). White on light: the reference's intro backdrop was
          pure white, kept as the light-theme default. */}
      <div
        className="absolute inset-x-0 top-0 bg-white dark:bg-[#0a0a0a] purple:bg-[#12103C]"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
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
                const isOut  = phase === "out"

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
                    className="font-sans font-bold text-[#111] dark:text-white purple:text-[#F6F4FF] leading-none select-none uppercase"
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

      {/* Final headline — third animation only. The second icon-cluster phase has been removed
          so the intro flows directly from the first wordmark sequence to the closing headline.
          Hidden as soon as the curtain starts lifting (curtainUp), not just when the whole
          overlay unmounts at ANIM_TOTAL: its own CSS animation holds it fully opaque forever
          (fill: both) once it's faded in, so without this it kept sitting on screen through the
          curtain lift and past HERO_REVEAL_MS — i.e. still visible on top of the already-loaded
          homepage — until that later unmount finally caught up. curtainUp flips well before
          HERO_REVEAL_MS, so this always clears the text before the homepage is visible. */}
      {phase !== "idle" && !curtainUp && (
        <h1
          className="absolute left-1/2 font-sans text-[#111] dark:text-white purple:text-[#F6F4FF] text-center m-0 flex flex-col items-center"
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
            Work Gets Done—with What You Already Have.
          </span>
        </h1>
      )}

    </div>
  )
}
