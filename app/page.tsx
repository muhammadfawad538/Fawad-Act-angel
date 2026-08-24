"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  IntroAnimation,
  INTRO_DURATION_MS,
  HERO_REVEAL_MS,
  hasSeenIntro,
} from "@/components/intro-animation";
import { RevealText } from "@/components/reveal-text";
import { StackingAgentCards } from "@/components/stacking-agent-cards";
import { MobileNav } from "@/components/mobile-nav";
import { DevExSection } from "@/components/devex-section";
import { HireAnAngelModal } from "@/components/hire-an-angel-modal";
import { MeetYourAngelModal } from "@/components/meet-your-angel-popup";
import { PersonaPhoneDemo } from "@/components/persona-phone-demo";
import {
  HERO_CONTACT,
  HERO_AVATAR,
  HERO_MESSAGES,
  type PersonaId,
} from "@/lib/personas";

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, end]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Hover glow spot */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AgenticPage() {
  const [heroReady, setHeroReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const handleIntroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  // "Hire an Angel" persona-demo modal — opened from the nav dropdown (Step 3);
  // the Hero's own trigger wires into this once Step 5 lands.
  const [angelModalOpen, setAngelModalOpen] = useState(false);
  const [angelPersonaId, setAngelPersonaId] = useState<PersonaId>("sales");
  const openAngelModal = useCallback((id: PersonaId) => {
    setAngelPersonaId(id);
    setAngelModalOpen(true);
  }, []);

  // "Meet Your Angel" lead-capture modal — shared entry point for every "Get Started"
  // button on the site (nav Step 3, hero Step 5, CTA Step 10, footer Step 11).
  const [angelLeadModalOpen, setAngelLeadModalOpen] = useState(false);
  const handleGetStarted = useCallback(() => {
    setAngelLeadModalOpen(true);
  }, []);

  // Start video zoom slightly before hero content reveals, for seamless overlap.
  // When the intro is skipped (already seen this session) there's nothing to overlap with,
  // so go straight to the zoomed state instead of holding it back for ~10s.
  useEffect(() => {
    if (hasSeenIntro()) {
      setVideoReady(true);
      return;
    }
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS);
    return () => clearTimeout(t);
  }, []);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <MobileNav
        onSelectPersona={openAngelModal}
        onGetStarted={handleGetStarted}
      />

      {/* ── "HIRE AN ANGEL" PERSONA DEMO MODAL ──────────────────────────────── */}
      <HireAnAngelModal
        open={angelModalOpen}
        onOpenChange={setAngelModalOpen}
        personaId={angelPersonaId}
        onPersonaChange={setAngelPersonaId}
      />

      {/* ── "MEET YOUR ANGEL" LEAD-CAPTURE MODAL ────────────────────────────── */}
      <MeetYourAngelModal
        open={angelLeadModalOpen}
        onOpenChange={setAngelLeadModalOpen}
      />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/agentic-hero.mp4"
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Progressive blur + light gradient rising from bottom */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "65%",
            background:
              "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)",
          }}
        />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "20%",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "38%",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "55%",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

        {/* Title + phone demo — pushed to the bottom of the section by mt-auto, in normal
            flow (not absolute) so the section can grow taller than 100vh whenever content needs
            more room (e.g. the bigger phone mockup) instead of clipping under the sticky nav. */}
        {/* px-6 md:px-12 only — no lg:px-20 step. The theme's hero wrapper stops at md:px-12
            even though every other section in it goes on to lg:px-20; matched here so large
            screens don't get extra hero padding the theme itself doesn't have. */}
        <div className="relative z-30 mt-auto px-6 md:px-12 pb-12">
          {/* No max-w-6xl/mx-auto here — the theme (act_angel_frontend_backup) deliberately
              doesn't width-match its hero to the max-w-6xl mx-auto column every other section
              uses; its hero content is left-anchored to the page padding instead. This carries
              that same treatment over, adapted for the phone alongside the text: the row spans
              the full padded width instead of being capped/centered like the sections below. */}
          {/* md:items-center, not items-end — the reference theme's hero is a two-column grid
              with align-items:center, where the phone spans the full content box and the text
              column is centred against it (sitting ~154px clear of the bottom rather than
              flush with it). Bottom-aligning both, as this did before, dropped the text to the
              phone's baseline. Only the text column moves; the phone's own box already fills
              the row height, so its position is unchanged. */}
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-10">
            {/* Text */}
            <div className="max-w-xl">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl font-light text-[#111] leading-[1.0] tracking-tight mb-6"
                style={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(24px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(32px)",
                  transition:
                    "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
                }}
              >
                Meet your
                <br />
                best employee
              </h1>

              <p
                className="text-base sm:text-lg text-[#111]/60 max-w-sm mb-8"
                style={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition:
                    "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 120ms",
                }}
              >
                Sales and service, handled personally — every time, day or
                night.
              </p>

              <div
                className="flex flex-wrap gap-3"
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition:
                    "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 200ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 200ms",
                }}
              >
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium"
                >
                  GET STARTED
                </button>
                <button
                  onClick={() => openAngelModal("sales")}
                  className="px-6 py-3 border border-black/15 bg-white/40 text-[#111] text-sm rounded-xl hover:border-black/30 hover:bg-white/70 transition-colors tracking-wide font-medium"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  HIRE AN ANGEL
                </button>
              </div>

              {/* 3 metrics — values/labels from the reference theme's hero, styling restored
                  from the backup template's own metrics block (which the migration dropped):
                  IBM Plex Sans, large light value over a small uppercase letterspaced label,
                  staggered in after the buttons. */}
              <div className="flex gap-8 sm:gap-12 mt-10">
                {[
                  { value: "2 sec", label: "Response Time" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "24/7", label: "Coverage" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      opacity: heroReady ? 1 : 0,
                      filter: heroReady ? "blur(0px)" : "blur(16px)",
                      transform: heroReady
                        ? "translateY(0px)"
                        : "translateY(20px)",
                      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${280 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${280 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${280 + i * 80}ms`,
                    }}
                  >
                    <div
                      className="text-3xl sm:text-4xl text-[#111] font-light tracking-tight"
                      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs text-black/40 tracking-widest uppercase mt-1"
                      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone demo — always plays the "sales" script, looping every 13s, matching source's hero behavior.
                self-center only (not on the parent): the phone is a fixed-340px box, so on the
                mobile flex-col-reverse stack it defaults to flush-left without this. Scoped to
                just this element so the text block above keeps stretching full-width rather
                than shrinking to its content width. md:self-auto drops it once the row layout
                (with its own md:items-end) takes over. */}
            <div
              className="self-center md:self-auto"
              style={{
                marginTop: 48,
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(20px)",
                transform: heroReady ? "translateY(0px)" : "translateY(24px)",
                transition:
                  "opacity 1s cubic-bezier(0.16,1,0.3,1) 250ms, filter 1s cubic-bezier(0.16,1,0.3,1) 250ms, transform 1s cubic-bezier(0.16,1,0.3,1) 250ms",
              }}
            >
              {/* Gated on heroReady: without it the demo starts on mount and plays its whole
                  call→messages sequence hidden behind the intro curtain, so the curtain lifts
                  on a thread that's already finished and the first thing the visitor actually
                  sees animate is the 13s loop restarting. */}
              {/* The theme's hero runs its own 5-message thread, not the Sales persona's
                  modal script — passed explicitly here. loopMs omitted so it uses one full
                  cycle, keeping the restart seamless instead of cutting the thread short. */}
              <PersonaPhoneDemo
                contact={HERO_CONTACT}
                avatar={HERO_AVATAR}
                messages={HERO_MESSAGES}
                width={340}
                active={heroReady}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ALWAYS ON / REACHABLE EVERYWHERE (trust bar + channels) ────────── */}
      <section id="channels" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Header mirrors the Tools section: logo instead of a PixelIcon eyebrow, centred. */}
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[48px] h-[48px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              Reachable everywhere
            </RevealText>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-black/45">
              One Angel. Every Touchpoint. Nothing Gets Lost.
            </p>
          </div>

          <div onMouseMove={handleMouse}>
            {/* Channel ticker */}
            <div
              className="channel-ticker mt-3"
              aria-label="Available communication channels"
            >
              <div className="channel-ticker-track">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="channel-ticker-group"
                    aria-hidden={copy === 1}
                  >
                    {[
                      {
                        label: "Phone Calls",
                        icon: (
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                        ),
                      },
                      {
                        label: "SMS",
                        icon: (
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        ),
                      },
                      {
                        label: "WhatsApp",
                        icon: (
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        ),
                      },
                      {
                        label: "Web Chat",
                        icon: (
                          <>
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            <path d="M8 10h8" />
                          </>
                        ),
                      },
                      {
                        label: "Email",
                        icon: (
                          <>
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                          </>
                        ),
                      },
                      {
                        label: "Facebook Messenger",
                        icon: (
                          <>
                            <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c1 .3 2 .4 3 .4 5.5 0 10-4.1 10-9.3S17.5 2 12 2z" />
                            <polyline points="9 12 12 9 15 12 12 15" />
                          </>
                        ),
                      },
                      {
                        label: "Instagram DM",
                        icon: (
                          <>
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle
                              cx="17.5"
                              cy="6.5"
                              r="1"
                              fill="currentColor"
                              stroke="none"
                            />
                          </>
                        ),
                      },
                      {
                        label: "Google Business",
                        icon: (
                          <>
                            <path d="M12 21s-7-6.5-7-11.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21z" />
                            <circle cx="12" cy="9.5" r="2.2" />
                          </>
                        ),
                      },
                    ].map((channel) => (
                      <div key={channel.label} className="channel-pill">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {channel.icon}
                        </svg>
                        <span>{channel.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL YOUR TOOLS (relocated from the "How It Works" slot) ────────── */}
      <section
        id="tools"
        className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[48px] h-[48px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              All Your Tools.
            </RevealText>
            <p className="mt-4 text-md text-black/45 leading-relaxed max-w-xlg">
              Act Angel AI works alongside the platforms your business already
              runs on.
            </p>
          </div>

          {/* Circular orbit layout based on the original 720x460 tool-hub stage. */}
          {(() => {
            const TOOLS = [
              {
                name: "Salesforce",
                color: "56,132,255",
                bgImage: "/images/salesforce_bg.png",
                icon: (
                  <path d="M12 3a5 5 0 0 1 4.546 2.914A4 4 0 0 1 17.5 5.8a4.2 4.2 0 0 1 4.2 4.2 4 4 0 0 1-.3 1.514A3.5 3.5 0 0 1 20.5 18h-15A4 4 0 0 1 4 14.3a4 4 0 0 1 2.1-3.53A4.5 4.5 0 0 1 6 10a4.5 4.5 0 0 1 6-4.24A5 5 0 0 1 12 3z" />
                ),
              },
              {
                name: "SAP",
                color: "52,199,89",
                bgImage: "/images/sap_bg.png",
                icon: (
                  <>
                    <ellipse cx="12" cy="6" rx="8" ry="3" />
                    <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
                    <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
                  </>
                ),
              },
              {
                name: "Email",
                color: "142,142,147",
                bgImage: "/images/email_bg.png",
                icon: (
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </>
                ),
              },
              {
                name: "Calendar",
                color: "255,159,10",
                bgImage: "/images/calendar_bg.png",
                icon: (
                  <>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </>
                ),
              },
              {
                name: "Chat",
                color: "56,132,255",
                bgImage: "/images/chat_bg.png",
                icon: (
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                ),
              },
              {
                name: "Messaging",
                color: "255,149,0",
                bgImage: "/images/message_bg.png",
                icon: (
                  <>
                    <path d="M21 6H3v12h18V6z" />
                    <path d="M3 7l9 6 9-6" />
                  </>
                ),
              },
              {
                name: "Video",
                color: "52,199,89",
                bgImage: "/images/video_bg.png",
                icon: (
                  <>
                    <rect x="2" y="6" width="14" height="12" rx="2" />
                    <path d="m16 10 6-3v10l-6-3" />
                  </>
                ),
              },
              {
                name: "Docs",
                color: "52,199,89",
                bgImage: "/images/docs_bg.png",
                icon: (
                  <>
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <path d="M14 3v6h6" />
                  </>
                ),
              },
              {
                name: "Maps",
                color: "255,149,0",
                bgImage: "/images/maps_bg.png",
                icon: (
                  <>
                    <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </>
                ),
              },
              {
                name: "Notes",
                color: "56,132,255",
                bgImage: "/images/notes_bg.png",
                icon: (
                  <>
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                  </>
                ),
              },
              {
                name: "Tasks",
                color: "255,69,58",
                bgImage: "/images/tasks_bg.png",
                icon: (
                  <>
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="m7 9 2 2 3-3M7 15h10" />
                  </>
                ),
              },
              {
                name: "Marketing",
                color: "175,82,222",
                bgImage: "/images/marketing_bg.png",
                icon: (
                  <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4v-6M6 11l10-5v14l-10-5" />
                ),
              },
            ];
            const NODE_POSITIONS = [
              [328, 23],
              [478, 46],
              [588, 110],
              [628, 198],
              [588, 286],
              [478, 350],
              [328, 373],
              [178, 350],
              [68, 286],
              [28, 198],
              [68, 110],
              [178, 46],
            ];

            return (
              <div className="tools-orbit relative w-full max-w-[940px] aspect-[720/420] mx-auto">
                {/* Center hub — hidden below md: the hub gets cramped against the orbiting
                    tool nodes on small screens, so it's dropped rather than shrunk further.
                    display/alignItems/justifyContent removed from inline style (they used to
                    duplicate what `flex items-center justify-center` already does via
                    className) because an inline `display` can't be responsive and would have
                    overridden `hidden` at every breakpoint regardless of the md: prefix. */}
                <div
                  className="hidden md:flex absolute rounded-full bg-white items-center justify-center z-10"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "60%",
                    backgroundImage: "url('/images/tools_logo_bg.png')",
                    backgroundSize: "150% 150%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    boxShadow: "rgba(0, 0, 0, 0.06) 0px 0px 18px 6px",
                    zIndex: 2,
                    animation: "centerLevitate 5s ease-in-out infinite",
                    width: 100,
                    height: 100,
                  }}
                >
                  <img
                    src="/icon2.png"
                    alt="Act Angel AI"
                    className="w-[80px] h-[80px] object-contain"
                  />
                </div>

                {TOOLS.map((tool, i) => {
                  const [left, top] = NODE_POSITIONS[i];

                  return (
                    <div
                      key={tool.name}
                      className="tools-orbit-node absolute"
                      style={{
                        left: `${(left / 720) * 100}%`,
                        top: `${(top / 460) * 100}%`,
                        animationDelay: `${i * 0.24}s`,
                      }}
                    >
                      <div
                        className="relative rounded-full flex items-center justify-center w-[72px] h-[72px]"
                        style={{
                          backgroundImage: `url('${tool.bgImage}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          boxShadow: "0 0 0 3px rgba(255,255,255,0.9)",
                          border: "none",
                        }}
                      >
                        <span
                          className="absolute w-1 h-1 rounded-full bg-white"
                          style={{
                            top: "22%",
                            left: "28%",
                            animation: `pulse-dot ${2 + (i % 3) * 0.4}s ease-in-out infinite`,
                          }}
                        />
                        <svg
                          width="40%"
                          height="40%"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(17,24,39,0.65)"
                          strokeWidth="1.6"
                        >
                          {tool.icon}
                        </svg>
                      </div>
                      <span className="tools-orbit-label text-[11px] text-black/45 tracking-wide text-center whitespace-nowrap">
                        {tool.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section
        id="agents"
        className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header mirrors Reachable-everywhere / Tools: logo instead of a PixelIcon eyebrow,
              centred, no Tag pill and no "Act Angel AI is." aside. */}
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[48px] h-[48px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"60% of a seller's time\nisn't spent selling."}
            </RevealText>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── A DAY ON THE JOB (repurposed "Developer Experience" slot) ──────── */}
      <DevExSection />

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        id="pilot"
        className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden"
      >
        {/* Glass panels image — anchored to bottom center */}
        <img
          src="/images/footer.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
          style={{ opacity: 0.85 }}
        />
        {/* Progressive blur from bottom — blends into site bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            WebkitMaskImage:
              "linear-gradient(to top, transparent 0%, black 55%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        {/* Colour fade from bottom to site bg #f5f4f0 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-10">
            Hire your first
            <br />
            AI employee
          </h2>
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        id="contact"
        className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <a
            href="#"
            className="flex items-center gap-2 font-pixel text-xs tracking-[0.25em] text-black/50"
          >
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-auto"
            />
          </a>

          <div className="flex items-center gap-6">
            <a
              href="/privacy-policy"
              className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
            >
              Cookies Policy
            </a>
            <a
              href="mailto:hello@actangel.com"
              className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
            >
              hello@actangel.com
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-sm text-black/20">© 2026 Act Angel AI</span>
        </div>
      </footer>
    </div>
  );
}
