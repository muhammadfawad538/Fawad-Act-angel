"use client"

import { useEffect, useState } from "react"
import { PERSONAS, type PersonaId, type ScriptLine, type CampaignDemo } from "@/lib/personas"

type Stage = "call" | "connecting" | "messages"

// ── Geometry, colours and timing all measured off the reference theme's phone ──────
// (https://aiactangel.netlify.app/), read from its live DOM rather than eyeballed.
// The theme draws the device at a fixed 340x716 and scales the whole thing down where a
// smaller one is needed (the persona modal renders it at 0.8), so every value below is in
// that base and the component scales as a unit — keeping proportions exact at any size.
const BASE_W = 340
const BASE_H = 716
const SCREEN_W = 320
const SCREEN_H = 696

const STAGE_CALL_MS = 3200      // "Incoming Call" holds before it's answered
const STAGE_CONNECTING_MS = 1650 // "Connecting…" between answering and the thread opening
const FIRST_MSG_MS = 2800       // empty thread holds, then the first bubble lands
const MESSAGE_STAGGER_MS = 2800 // gap between bubbles
const END_HOLD_MS = 7300        // full thread sits before the loop restarts

/** Total time for one full run — used as the default loop interval. */
export function cycleMs(messageCount: number) {
  return (
    STAGE_CALL_MS + STAGE_CONNECTING_MS + FIRST_MSG_MS +
    Math.max(0, messageCount - 1) * MESSAGE_STAGGER_MS + END_HOLD_MS
  )
}

const CALL_ICON_PATH = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"

// iOS status bar — 9:41 at 17px/590 weight, then signal, wifi and battery glyphs.
function StatusBar() {
  return (
    <div className="absolute top-0 inset-x-0 flex items-center justify-between px-[19px] pt-[22px] z-20">
      <span className="text-[17px] text-black" style={{ fontWeight: 590, letterSpacing: "-0.2px" }}>9:41</span>
      <div className="flex items-center gap-[5px]">
        <svg width="19" height="12" viewBox="0 0 19 12" fill="#111">
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
          <rect x="4.6" y="5" width="3" height="7" rx="1" />
          <rect x="9.2" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="13.8" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round">
          <path d="M1 4a11 11 0 0 1 15 0" />
          <path d="M3.9 7a7 7 0 0 1 9.2 0" />
          <path d="M6.8 10a3 3 0 0 1 3.4 0" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="#111" strokeOpacity="0.35" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="#111" />
          <path d="M25 4.5v4a2.2 2.2 0 0 0 0-4z" fill="#111" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

// Hope Angel's variant of the "messages" stage — the reference site shows a campaign-progress
// card here instead of a chat thread (nonprofits ask "how close are we to goal", not "what did
// they say"), so this swaps in for the chat bubbles above only when persona.campaignDemo is set.
function CampaignDemoScreen({ photo, name, demo }: { photo: string; name: string; demo: CampaignDemo }) {
  const pct = Math.min(100, Math.round((demo.raisedValue / demo.goalValue) * 100))
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#FAF9F7", padding: "70px 20px 33px" }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <img src={photo} alt="" className="object-cover" style={{ width: 44, height: 44, borderRadius: "50%" }} />
        <div>
          <p className="text-[16px]" style={{ fontWeight: 600, color: "#111" }}>{name}</p>
          <p className="text-[13px]" style={{ color: "#8C8C8C" }}>{demo.tagline}</p>
        </div>
      </div>

      <span
        className="text-[11px] font-medium self-start"
        style={{ marginTop: 20, padding: "6px 14px", borderRadius: 999, background: "#EDE9F7", color: "#5D4387" }}
      >
        {demo.scenarioTag}
      </span>

      <div
        style={{
          marginTop: "auto",
          padding: 18,
          borderRadius: 18,
          background: "#FFFFFF",
          boxShadow: "0 10px 30px -15px rgba(0,0,0,0.15)",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8C8C8C" }}>
          Campaign progress
        </p>
        <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: "#EDECE8", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#5D4387" }} />
        </div>
        <p className="text-[14px]" style={{ marginTop: 8, fontWeight: 600, color: "#111" }}>
          {demo.raised} / {demo.goal}
        </p>
      </div>

      <div
        className="flex items-center justify-center text-[13px] font-medium"
        style={{ marginTop: 14, height: 44, borderRadius: 999, background: "#5D4387", color: "#fff" }}
      >
        {demo.ctaLabel}
      </div>
    </div>
  )
}

interface PersonaPhoneDemoProps {
  /** Persona whose contact + thread to play. Omit to use the hero's own script. */
  personaId?: PersonaId
  /** Contact name / avatar / messages override — the hero passes its own script. */
  contact?: string
  avatar?: string
  messages?: ScriptLine[]
  /** Whether the animation should be running — pass false while e.g. a modal is closed. */
  active?: boolean
  /** Restart interval; defaults to one full cycle so it loops seamlessly. */
  loopMs?: number
  /** Rendered width in px. The device is drawn at 340 and scaled to fit this. */
  width?: number
}

export function PersonaPhoneDemo({
  personaId, contact, avatar, messages, active = true, loopMs, width = BASE_W,
}: PersonaPhoneDemoProps) {
  const persona = personaId ? PERSONAS.find(p => p.id === personaId) : undefined
  const name = contact ?? persona?.contact ?? PERSONAS[0].contact
  const photo = avatar ?? persona?.avatar ?? PERSONAS[0].avatar
  const script = messages ?? persona?.messages ?? PERSONAS[0].messages
  const campaignDemo = persona?.campaignDemo

  const [stage, setStage] = useState<Stage>("call")
  const [messagesShown, setMessagesShown] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!active) return
    setStage("call")
    setMessagesShown(0)

    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

    at(() => setStage("connecting"), STAGE_CALL_MS)
    const threadStart = STAGE_CALL_MS + STAGE_CONNECTING_MS
    at(() => setStage("messages"), threadStart)
    script.forEach((_, i) => {
      at(() => setMessagesShown(n => Math.max(n, i + 1)), threadStart + FIRST_MSG_MS + i * MESSAGE_STAGGER_MS)
    })

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, personaId, name, cycle])

  useEffect(() => {
    if (!active) return
    const period = loopMs ?? cycleMs(script.length)
    const t = setInterval(() => setCycle(c => c + 1), period)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, loopMs, personaId, name, script.length])

  const scale = width / BASE_W

  return (
    // Outer box takes the scaled footprint so surrounding layout reserves the right space —
    // the inner device is drawn full-size and scaled, so nothing has to be re-measured per size.
    <div style={{ width, height: BASE_H * scale }}>
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          borderRadius: 58,
          background: "linear-gradient(155deg, rgb(58,58,60), rgb(17,17,19))",
          padding: 10,
          boxSizing: "border-box",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 48,
            background: stage === "messages" ? "#FFFFFF" : "#F2F2F7",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.06)",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          {/* Dynamic-island notch */}
          <div className="absolute z-30 bg-black" style={{ width: 100, height: 30, borderRadius: 20, left: 110, top: 11 }} />

          {stage !== "messages" && <StatusBar />}

          {stage === "call" && (
            <div className="absolute inset-0 flex flex-col items-center">
              <p className="text-[13px]" style={{ color: "#8C8C8C", marginTop: 84 }}>Incoming Call</p>
              <img
                src={photo}
                alt={name}
                className="object-cover"
                style={{ width: 116, height: 116, borderRadius: "50%", marginTop: 32 }}
              />
              <p className="text-[23px]" style={{ fontWeight: 500, color: "#111", marginTop: 26 }}>{name}</p>
              <p className="text-[16px]" style={{ color: "#8C8C8C", marginTop: 6 }}>mobile</p>

              <div className="absolute flex" style={{ bottom: 54, gap: 67 }}>
                {[
                  { label: "Decline", bg: "#FF3B30", rotate: 135 },
                  { label: "Accept", bg: "#34C759", rotate: 0 },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center" style={{ gap: 10 }}>
                    <div
                      className="flex items-center justify-center"
                      style={{ width: 67, height: 67, borderRadius: "50%", background: b.bg }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" style={{ transform: `rotate(${b.rotate}deg)` }}>
                        <path d={CALL_ICON_PATH} />
                      </svg>
                    </div>
                    <span className="text-[13px]" style={{ color: "#8C8C8C" }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === "connecting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img
                src={photo}
                alt={name}
                className="object-cover"
                style={{ width: 116, height: 116, borderRadius: "50%" }}
              />
              <p className="text-[23px]" style={{ fontWeight: 500, color: "#111", marginTop: 26 }}>{name}</p>
              <p className="text-[16px]" style={{ color: "#8C8C8C", marginTop: 6, animation: "pulse-dot 1.2s ease-in-out infinite" }}>
                Connecting…
              </p>
            </div>
          )}

          {stage === "messages" && campaignDemo && (
            <CampaignDemoScreen photo={photo} name={name} demo={campaignDemo} />
          )}

          {stage === "messages" && !campaignDemo && (
            <div className="absolute inset-0 flex flex-col">
              {/* Chat header — its 53px top padding is what clears the status bar/notch */}
              <div
                className="flex items-center shrink-0"
                style={{ background: "#FAF9F7", padding: "53px 19px 14px", borderBottom: "1px solid #EDECE8", gap: 10 }}
              >
                <img src={photo} alt="" className="object-cover" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                <span className="text-[16px]" style={{ fontWeight: 500, color: "#111" }}>{name}</span>
              </div>

              {/* justify-end keeps the thread pinned to the bottom, growing upward */}
              <div
                className="flex flex-col overflow-hidden"
                style={{ flex: 1, padding: "17px 17px 33px", justifyContent: "flex-end", gap: 10 }}
              >
                {script.slice(0, messagesShown).map(([dir, text], i) => (
                  <div key={i} className="flex" style={{ justifyContent: dir === "out" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "11px 16px",
                        borderRadius: 17,
                        fontSize: 15,
                        lineHeight: 1.4,
                        background: dir === "out" ? "#5A5A5A" : "#F4F4F4",
                        color: dir === "out" ? "#FFFFFF" : "#111111",
                        animation: "message-in 0.8s ease both",
                      }}
                    >
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home indicator */}
          <div className="absolute inset-x-0 flex justify-center" style={{ bottom: 9 }}>
            <div style={{ width: 139, height: 5, borderRadius: 100, background: "rgba(0,0,0,0.25)" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
