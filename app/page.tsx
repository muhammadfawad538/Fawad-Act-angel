"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { useTheme } from "next-themes";
import {
  IntroAnimation,
  INTRO_DURATION_MS,
  HERO_REVEAL_MS,
  hasSeenIntro,
} from "@/components/intro-animation";
import { RevealText } from "@/components/reveal-text";
import { StackingAgentCards } from "@/components/stacking-agent-cards";
import { MobileNav } from "@/components/mobile-nav";
import { MobileNavLab } from "@/components/mobile-nav-lab";
import { DevExSection } from "@/components/devex-section";
import { PersonaPhoneDemo } from "@/components/persona-phone-demo";
import { HERO_CONTACT, HERO_AVATAR, HERO_MESSAGES } from "@/lib/personas";

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

  // Gates which CTA background image is actually fetched (see id="pilot" below) — resolvedTheme
  // is undefined until next-themes reads the real value client-side, so this falls back to
  // "light" (matching SSR output) until mounted, same guard as ThemeToggle/DevExSection use.
  const { resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);
  const isDarkOrPurple =
    themeMounted && (resolvedTheme === "dark" || resolvedTheme === "purple");
  const handleIntroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  // Hero phone demo's width is a JS prop (PersonaPhoneDemo derives its own height from it), not
  // a CSS size — a media query can't touch it directly, and a CSS transform:scale wouldn't
  // actually shrink the layout box it reserves (which is the overflow problem in the first
  // place), so this tracks the same row-squeeze condition in JS (portrait, >=768px wide — see
  // the heading's own comment above for why this isn't a literal width band, AAA-UI-DM-WEB-010)
  // and passes a smaller width through instead. 306 is 10% below the normal 340.
  const [heroPhoneWidth, setHeroPhoneWidth] = useState(340);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (orientation: portrait)");
    setHeroPhoneWidth(mq.matches ? 306 : 340);
    const onChange = (e: MediaQueryListEvent) => setHeroPhoneWidth(e.matches ? 306 : 340);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
      <MobileNav />

      {/* ── HIRE AN ANGEL DROPDOWN — DESIGN EXPLORATION (homepage-only, see
          components/mobile-nav-lab.tsx) ───────────────────────────────────── */}
      {/* <MobileNavLab /> */}

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

        {/* Progressive blur + light gradient rising from bottom — the gradient itself comes
            from a CSS variable (globals.css) rather than being hardcoded, so the three themes
            can each fade to their own page-background color instead of always fading to the
            light theme's #F5F4F0. */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "65%",
            background: "var(--hero-fade-gradient)",
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
        {/* AAA-UI-DM-WEB-010: mt-auto bottom-anchors this block against min-h-screen (the
            <section> above) — on a normal-aspect (landscape) viewport the two roughly agree,
            but on any tall/narrow portrait one — iPad Mini (768x1024), iPad Air (820x1180),
            iPad Pro 11" (834x1194), iPad Pro 12.9" (1024x1366), etc. — mt-auto scales with
            viewport height and reads as a large gap between the nav and the heading (the
            taller the device, the worse it gets). Capped to a fixed 144px for any portrait
            viewport >=768px wide — not a literal width band, since QA found this on multiple
            tablet sizes, not just one. 144px is close to iPad Mini's own natural ~160px (so
            it's not a big jump there) and was tested down to ~110px before the hero video's
            background glow started showing through the KPI row text, so this stops short of
            that rather than chasing the smallest possible gap. */}
        <div className="relative z-30 mt-auto [@media(min-width:768px)_and_(orientation:portrait)]:mt-36 px-6 md:px-12 pb-12">
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
                // md:text-8xl (96px) is too wide once the row layout kicks in on a narrow/
                // portrait viewport — the phone demo beside it is a fixed (or 768-872px-range,
                // 306px-reduced) width, and at these widths the heading's own content (e.g.
                // "specialist") can't shrink below its intrinsic width, so the flex row
                // overflows and pushes the phone off the right edge of the screen. Originally
                // scoped to a literal 768-872px width band, but AAA-UI-DM-WEB-010 QA found the
                // same wrap on other portrait tablets outside that band (iPad Air 820, iPad Pro
                // 11" 834, iPad Pro 12.9" 1024-wide) — the real condition is "row layout +
                // portrait", not a specific width, so this now targets any >=768px-wide portrait
                // viewport instead of just that one range. 67px (~30% below the 96px original,
                // the first fix for this) still wrapped the 2nd line ("AI Specialist") a 3rd
                // time at iPad Mini's 768px width, the narrowest/tightest case — bisected down
                // to 56px there (fits up to and including 60px, so 56 keeps a few px of margin)
                // and that same value comfortably fits the wider portrait tablets too. Back to
                // md:text-8xl in landscape/desktop where there's room for both.
                className="text-6xl sm:text-7xl md:text-8xl [@media(min-width:768px)_and_(orientation:portrait)]:text-[56px] font-light text-[#111] dark:text-white purple:text-[#F6F4FF] leading-[1.0] tracking-tight mb-6"
                style={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(24px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(32px)",
                  transition:
                    "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
                }}
              >
                Meet Your
                <br />
                AI Specialist
              </h1>

              <p
                className="text-base sm:text-lg font-medium text-[#111]/70 dark:text-white/75 purple:text-[#F6F4FF]/75 max-w-sm mb-8"
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
                <Link
                  href="/get-started"
                  // dark:/purple: invert to a white pill/black text — bg-[#111] is already
                  // near-black, so on either dark theme it'd otherwise sit nearly invisible
                  // against the hero's own now-dark fade background.
                  className="px-6 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:text-white purple:hover:bg-[#8F72FF] transition-colors tracking-wide font-medium"
                >
                  GET STARTED
                </Link>
                <Link
                  href="/hire-an-angel/sales-angel"
                  className="px-6 py-3 border border-black/15 bg-white/40 text-[#111] text-sm rounded-xl hover:border-black/30 hover:bg-white/70 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/20 purple:border-[#B79CFF]/20 purple:bg-white/5 purple:text-[#F6F4FF] purple:hover:border-[#B79CFF]/40 purple:hover:bg-[#7C5CFF]/10 transition-colors tracking-wide font-medium"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  HIRE AN ANGEL
                </Link>
              </div>

              {/* 3 metrics — values/labels from the reference theme's hero, styling restored
                  from the backup template's own metrics block (which the migration dropped):
                  IBM Plex Sans, large light value over a small uppercase letterspaced label,
                  staggered in after the buttons. */}
              {/* AAA-UI-DM-WEB-009: gap-8 (32px) left only 233px for the 3 values on a 360px
                  viewport (Galaxy A55) — "< 10 sec" needs ~108px single-line and was wrapping
                  to "< 10"/"sec", taller than the other two KPIs. Smaller mobile value size
                  (text-2xl vs sm:text-4xl) plus whitespace-nowrap fixes the wrap; w-full
                  justify-between (mobile only) spreads the 3 columns across the full text
                  column so there's still a clear gap between each instead of them bunching up
                  on the left — sm:w-auto/justify-start/gap-12 restores the original fixed-gap,
                  left-anchored desktop layout untouched. */}
              <div className="flex w-full justify-between sm:w-auto sm:justify-start sm:gap-12 mt-10">
                {[
                  { value: "< 10 sec", label: "Response Time" },
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
                    {/* Same row-squeeze fix/condition as the hero heading above (portrait,
                        >=768px wide, not a literal width band — AAA-UI-DM-WEB-010) — 23px is
                        ~20% below the 36px (sm:text-4xl) original. */}
                    <div
                      className="text-2xl sm:text-4xl [@media(min-width:768px)_and_(orientation:portrait)]:text-[23px] text-[#111] dark:text-white purple:text-[#F6F4FF] font-light tracking-tight whitespace-nowrap"
                      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs text-black/40 dark:text-white/45 purple:text-[#716C9E] tracking-widest uppercase mt-1"
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
                width={heroPhoneWidth}
                active={heroReady}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ALWAYS ON / REACHABLE EVERYWHERE (trust bar + channels) ────────── */}
      {/* dark:/purple: bg here (not on the root page wrapper) — this section has no background
          of its own in the light theme, just the root wrapper's #F5F4F0 showing through, and
          the root wrapper itself isn't themed yet (see hero's own note on this). Same #0a0a0a /
          #1a1226 tones as the hero's fade target, so there's no visible seam between the two
          once both are themed, even though each sets its background independently. */}
      <section id="channels" className="py-32 px-6 md:px-12 lg:px-20 dark:bg-[#0a0a0a] purple:bg-[#12103C]">
        <div className="max-w-6xl mx-auto">
          {/* Header mirrors the Tools section: logo instead of a PixelIcon eyebrow, centred. */}
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[86px] h-[86px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-[#111] dark:text-white purple:text-[#F6F4FF]">
              Reachable everywhere
            </RevealText>
            <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-[#111]/70 dark:text-white/75 purple:text-[#ABA6D9]">
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
      {/* Same dark:/purple: bg pattern as the two sections above — this section has no
          background of its own in the light theme either, just the still-unthemed root
          wrapper's #F5F4F0 showing through. Same #0a0a0a / #1a1226 tones, so there's no seam
          continuing down from "Reachable everywhere" above it. */}
      <section
        id="tools"
        className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 dark:bg-[#0a0a0a] purple:bg-[#12103C] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[86px] h-[86px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-[#111] dark:text-white purple:text-[#F6F4FF]">
              All Your Tools.
            </RevealText>
            <p className="mt-4 text-md font-medium text-[#111]/70 dark:text-white/75 purple:text-[#ABA6D9] leading-relaxed max-w-xlg">
              Act Angel AI works alongside the platforms your business already
              runs on.
            </p>
          </div>

          {/* Scattered tool cloud around the centre hub, laid out on a 720x460 stage. Below
              760px globals.css drops the absolute positioning entirely and reflows these into
              a plain grid, so each tool's `pos` only applies from that width up. */}
          {(() => {
            // Colored brand/product logos (public/images/icons) rather than the plain
            // stroked SVG glyphs this used before, matching the reference composition in
            // "All_your_tools_catch_agent.png".
            //
            // Each tool carries its own position (`pos`) instead of indexing into a separate
            // positions array — with two parallel arrays, commenting a tool out silently shifted
            // every later tool into its neighbour's spot. `pos` is the node's top-left corner on
            // a 720x460 stage (centre = 360,230; nodes are 72px). The spots are scattered at
            // irregular angles and distances from the hub (radius ~130-290), all clear of the hub
            // and ~100px+ apart — pick a free gap if you add a tool.
            // `size` (optional, % of the circle, default 62) is only for wide wordmark-style
            // logos: every logo is fit into the same square box, so a 2:1 logo like SAP gets
            // capped by the box's width and renders half as tall as a square icon. A circle has
            // more room across its middle than that inner square uses, so these get a bigger
            // box — sized so their corners still clear the circle's edge.
            const TOOLS: { name: string; logo: string; pos: [number, number]; size?: number }[] = [
              { name: "Salesforce", logo: "/images/icons/salesforce.png", pos: [278, 20], size: 76 },
              { name: "SAP", logo: "/images/icons/sap.svg", pos: [443, 27], size: 76 },              
              { name: "Gmail", logo: "/images/icons/gmail.svg", pos: [422, 286] },
              { name: "Outlook", logo: "/images/icons/outlook.svg", pos: [196, 66] },
              { name: "Chat", logo: "/images/icons/chat.svg", pos: [136, 82] },
              { name: "Google Meet", logo: "/images/icons/google_meet.svg", pos: [282, 316] },
              { name: "Zoom", logo: "/images/icons/zoom.png", pos: [110, 292] },
              { name: "Docs", logo: "/images/icons/google_docs.svg", pos: [41, 123] },
              { name: "Calendar", logo: "/images/icons/google_calendar.svg", pos: [86, 192] },
              { name: "Maps", logo: "/images/icons/google_maps.svg", pos: [538, 76] },              
              { name: "WhatsApp", logo: "/images/icons/whatsapp.svg", pos: [392, 90] },              
              { name: "Slack", logo: "/images/icons/slack.svg", pos: [212, 276] },
              { name: "Otter", logo: "/images/icons/otter.png", pos: [568, 174] },
              { name: "Googletv", logo: "/images/icons/googletv.png", pos: [698, 194] },
              { name: "Notion", logo: "/images/icons/notion.svg", pos: [613, 34] },
              { name: "HubSpot", logo: "/images/icons/hubspot.svg", pos: [668, 124] },
              { name: "Asana", logo: "/images/icons/asana.svg", pos: [26, 242] },
              { name: "ClickUp", logo: "/images/icons/clickup.svg", pos: [26, 342] }, 
              { name: "Fathom", logo: "/images/icons/fathom.png", pos: [662, 312] },              
              { name: "Cloud", logo: "/images/icons/cloud.png", pos: [522, 286], size: 96 },
              { name: "Fireflies", logo: "/images/icons/fireflies.png", pos: [488, 420] },
              { name: "Phone", logo: "/images/icons/phone.png", pos: [372, 346] },     
              { name: "Spiral", logo: "/images/icons/spiral.png", pos: [106, 22] },                   
              { name: "Todoist", logo: "/images/icons/todoist.svg", pos: [222, 416] },
              { name: "monday.com", logo: "/images/icons/mondaydotcom.png", pos: [636, 412] },
            ];

            return (
              // max-w bumped from 940 to 1100: the 14->21 icon count needed tighter positions
              // (down from ~100 to ~78 units apart in the 720-unit coordinate space) than the
              // original layout used. Node size stays a fixed 72px regardless of container width,
              // so widening the container (rather than re-deriving every position at a smaller
              // scale) is what buys back that lost breathing room — 78 units now maps to ~119px
              // of real separation instead of ~100px, comparable to the original spacing.
              // [@media(992px<=width<=1098px)]: at this narrow a container, the fixed-72px
              // node size eats proportionally more of the stage, exposing an asymmetry already
              // latent in the hand-tuned positions — the rightmost icon (Googletv, x=698) was
              // actually overflowing the 720-unit stage's right edge by ~44px of real margin
              // while the leftmost (Asana/ClickUp, x=26) still had ~32px of clear margin.
              // Computed via the actual node-size-at-this-scale math (not eyeballed): shifting
              // the icon layer 39px left equalizes both sides instead of leaving one tight and
              // one loose. A slightly taller aspect ratio in the same range (420->445) adds a
              // bit more vertical breathing room between rows, as asked, without moving any
              // icon's own position.
              // [@media(768px<=width<=991px)]: same asymmetry, same fix — at this container
              // width (viewport minus the md:px-12 96px gutters) the computed left/right
              // margins come out to ~24-32px clear on the left vs. ~45-51px of overflow on the
              // right across the whole range, a near-constant ~76-77px gap, so a single -38px
              // shift (half the gap) equalizes both ends from 768px through 991px.
              <div className="tools-orbit relative w-full max-w-[1100px] aspect-[720/420] [@media(992px<=width<=1098px)]:aspect-[720/445] mx-auto">
                {/* Center hub — hidden below md: the hub gets cramped against the orbiting
                    tool nodes on small screens, so it's dropped rather than shrunk further.
                    display/alignItems/justifyContent removed from inline style (they used to
                    duplicate what `flex items-center justify-center` already does via
                    className) because an inline `display` can't be responsive and would have
                    overridden `hidden` at every breakpoint regardless of the md: prefix. */}
                <div
                  // Width lives in className (not the inline style below) so the
                  // [@media(768px<=width<=991px)]: override can win — inline styles beat
                  // classes, so a responsive width can't be expressed there. The icon
                  // img below is sized at 80% of this div, so shrinking this hub shrinks
                  // the background circle and the icon inside it together.
                  className="hidden md:flex absolute rounded-full bg-[#EDECE9] dark:bg-white/[0.07] purple:bg-[#7C5CFF]/15 items-center justify-center z-10 w-[min(200px,26%)] [@media(768px<=width<=991px)]:w-[min(160px,20.8%)]"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "60%",
                    // Same purple glow as the tool circles, scaled up with this larger hub so it
                    // reads at the same relative strength.
                    boxShadow: "0 12px 50px 8px rgba(93,67,135,0.45)",
                    zIndex: 2,
                    animation: "centerLevitate 5s ease-in-out infinite",
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src="/icon2.png"
                    alt="Act Angel AI"
                    className="w-[80%] h-[80%] object-contain"
                  />
                </div>

                {/* Wraps just the icon layer (not the hub above) so the 992-1098px and
                    768-991px shifts below can nudge the icons without re-centering the hub
                    along with them. Below 760px, globals.css's `.tools-orbit-icon-layer`
                    rule sets this to `display: contents` — otherwise this wrapper would sit
                    between .tools-orbit and .tools-orbit-node, breaking the plain-grid
                    layout that CSS applies there (it needs the nodes as direct children). */}
                <div className="tools-orbit-icon-layer absolute inset-0 [@media(992px<=width<=1098px)]:translate-x-[-39px] [@media(768px<=width<=991px)]:translate-x-[-38px]">
                {TOOLS.map((tool, i) => {
                  const [left, top] = tool.pos;

                  return (
                    <React.Fragment key={tool.name}>
                    {/* Blank grid cells before the last two icons. i===12 centres the last pair in
                        the 4-column view (hidden in the 3-column view); i===13 splits it to the
                        outer columns in the 3-column view (hidden in the 4-column view). The media
                        queries mirror globals.css's grid breakpoints exactly (3 columns at
                        max-width 540px, 4 columns above that up to 760px) — Tailwind's max-[...]
                        shorthand is exclusive, so it would be 1px off at exactly 540/760px.
                        `hidden!` is important so it beats globals.css's grid rule
                        `.tools-orbit-node { display: flex }`, which would otherwise win. */}
                    {/* {i===12 && <div className="tools-orbit-node absolute [@media(max-width:540px)]:hidden!" style={{ left: '50%', top: '50%' }} />} */}
                    {i===24 && <div className="tools-orbit-node absolute [@media(540px<width<=760px)]:hidden!" style={{ left: '50%', top: '50%' }} />}
                    <div
                      // Top-row icons (pos[1] <= 130 — Docs, Spiral, Chat, Outlook, Salesforce,
                      // SAP, Notion, WhatsApp, Maps, HubSpot) shift up an extra 30px at
                      // 992-1098px (same range as the icon-layer/aspect-ratio tweaks above),
                      // and 40px at 768-991px — this narrower range compresses row spacing
                      // more (smaller container height via the same aspect ratio), so it
                      // needs a bigger push to clear the row below it.
                      // Within that top row, the topmost sub-tier (pos[1] <= 40 — Spiral,
                      // Salesforce, SAP, Notion) still crowded the row below them at
                      // 768-991px even after the 40px shift, so they get 30px more there —
                      // 70px total (a single translate, not two stacked ones, since a second
                      // translate-y utility would replace rather than add to the first).
                      // Middle-row icons (130 < pos[1] < 400 — Otter, Calendar, Googletv, Asana,
                      // Slack, Gmail, Cloud, Zoom, Fathom, Google Meet, ClickUp, Phone) shift
                      // down 20px at 992-1098px, to restore the gap the top row's upward shift
                      // closed. Bottom row (pos[1] >= 400 — Fireflies, Todoist, monday.com) is
                      // left alone.
                      // Outlook individually needed its own nudge at 768-991px on top of the
                      // shared top-row shift, in two rounds (10px right/20px down, then 20px
                      // more of each since it was still cluttered) — 30px right total, and the
                      // two 20px-down corrections exactly cancel the shared -40px upward shift,
                      // so no net vertical translate remains (single combined values, not
                      // stacked translate-y utilities, since only one wins per element).
                      // Calendar (middle row) gets its own 768-991px nudge too — 24px right,
                      // 6px up — on top of its unchanged 992-1098px down-shift.
                      // Google Meet and Gmail (middle row) shift down 60px total at 768-991px
                      // (20px matching their shared 992-1098px down-shift, then 40px more since
                      // they were still too close to the row above). Phone started in that same
                      // group, then needed 16px more (76px total) individually. Todoist (bottom
                      // row, otherwise left alone) started with that same 60px-down fix plus
                      // 30px left, then came up 14px twice more (net 32px down) since it kept
                      // moving too far; it has no 992-1098px treatment since it was never part
                      // of that group.
                      className={`tools-orbit-node absolute${
                        top <= 40
                          ? " [@media(992px<=width<=1098px)]:-translate-y-[30px] [@media(768px<=width<=991px)]:-translate-y-[70px]"
                          : tool.name === "Outlook"
                          ? " [@media(992px<=width<=1098px)]:-translate-y-[30px] [@media(768px<=width<=991px)]:translate-x-[30px]"
                          : top <= 130
                          ? " [@media(992px<=width<=1098px)]:-translate-y-[30px] [@media(768px<=width<=991px)]:-translate-y-[40px]"
                          : tool.name === "Calendar"
                          ? " [@media(992px<=width<=1098px)]:translate-y-[20px] [@media(768px<=width<=991px)]:translate-x-[24px] [@media(768px<=width<=991px)]:-translate-y-[6px]"
                          : tool.name === "Todoist"
                          ? " [@media(768px<=width<=991px)]:translate-y-[32px] [@media(768px<=width<=991px)]:-translate-x-[30px]"
                          : tool.name === "Phone"
                          ? " [@media(992px<=width<=1098px)]:translate-y-[20px] [@media(768px<=width<=991px)]:translate-y-[76px]"
                          : ["Google Meet", "Gmail"].includes(tool.name)
                          ? " [@media(992px<=width<=1098px)]:translate-y-[20px] [@media(768px<=width<=991px)]:translate-y-[60px]"
                          : top < 400
                          ? " [@media(992px<=width<=1098px)]:translate-y-[20px]"
                          : ""
                      }`}
                      style={{
                        left: `${(left / 720) * 100}%`,
                        top: `${(top / 460) * 100}%`,
                        animationDelay: `${i * 0.24}s`,
                      }}
                    >
                      {/* Light warm-grey circle (#EDECE9, as in the reference) behind each logo,
                          with a glow in the brand purple (#5D4387) standing in for the
                          reference's pink one. The logo sits at 56% rather than filling the box,
                          so it stays inset from the circle's edge — at full size the
                          square-backed logos (Maps, Tasks) would cover the circle completely and
                          it wouldn't read. */}
                      <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#EDECE9] shadow-[0_4px_18px_3px_rgba(93,67,135,0.45)]">
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          loading="lazy"
                          className="object-contain"
                          style={{ width: `${tool.size ?? 62}%`, height: `${tool.size ?? 62}%` }}
                        />
                      </div>
                      {/* <span className="tools-orbit-label text-[11px] text-black/45 tracking-wide text-center whitespace-nowrap">
                        {tool.name}
                      </span> */}
                    </div>
                    </React.Fragment>
                  );
                })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      {/* Same dark:/purple: bg pattern continuing down the page — see the note on the
          "Reachable everywhere" section above for why this is set per-section rather than on
          the root wrapper. */}
      <section
        id="agents"
        className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 dark:bg-[#0a0a0a] purple:bg-[#12103C]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header mirrors Reachable-everywhere / Tools: logo instead of a PixelIcon eyebrow,
              centred, no Tag pill and no "Act Angel AI is." aside. */}
          <div className="mb-16 flex flex-col items-center text-center">
            <img
              src="/icon2.png"
              alt="Act Angel AI"
              className="w-[86px] h-[86px] object-contain"
            />
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-[#111] dark:text-white purple:text-[#F6F4FF]">
              {"60% of a seller's time\nisn't spent selling."}
            </RevealText>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── A DAY ON THE JOB (repurposed "Developer Experience" slot) ──────── */}
      <DevExSection />

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {/* Same dark:/purple: bg pattern as every section above — shows through wherever the
          image/fade layers below don't fully cover (mainly the upper portion of the section). */}
      <section
        id="pilot"
        className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 dark:bg-[#0a0a0a] purple:bg-[#12103C] overflow-hidden"
      >
        {/* Glass panels image (light) vs. the crystal skyline (dark/purple) — swapped by theme
            rather than just faded, since footer.png's light lavender/white background fights a
            dark section at any opacity worth seeing. isDarkOrPurple gates which one actually
            mounts (not just a dark:/purple: class toggle) so the page isn't fetching both a
            ~1.2MB and a ~2MB image on every load regardless of theme. Full opacity on dark/purple
            per explicit request — not faded down the way footer.png is on light. */}
        <img
          src={isDarkOrPurple ? "/dark_images/Iridescent_Crystal_Skyline.png" : "/images/footer.png"}
          alt=""
          aria-hidden="true"
          className={`absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none ${
            isDarkOrPurple ? "" : "opacity-[0.85]"
          }`}
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
        {/* Colour fade from bottom to site bg — var(--cta-fade-gradient), themed in globals.css,
            same reasoning as the hero's own fade gradient variable. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "var(--cta-fade-gradient)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-10 text-[#111] dark:text-white purple:text-[#F6F4FF]">
            Hire your first
            <br />
            AI specialist
          </h2>
          <Link
            href="/get-started"
            onClick={() => posthog.capture("cta_get_started_clicked", { location: "hero" })}
            className="inline-block px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:text-white purple:hover:bg-[#8F72FF] transition-colors tracking-wide font-medium"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      {/* Same dark:/purple: bg pattern as every section above. */}
      <footer
        id="contact"
        className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 dark:bg-[#0a0a0a] purple:bg-[#12103C]"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Row 1: logo, address, email. Stacks on small screens, one row from md up. */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-8">
            <Link
              href="/"
              aria-label="Act Angel AI — go to homepage"
              className="flex items-center gap-2 font-pixel text-xs tracking-[0.25em] text-black/50"
            >
              {/* Same invert treatment as the nav logo (mobile-nav.tsx) — no separate light-logo
                  asset, so this flips the dark wordmark to white via filter instead. */}
              <img
                src="/images/logo.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-auto dark:brightness-0 dark:invert purple:brightness-0 purple:invert"
              />
            </Link>
            <a href="#m" className="text-sm text-black/55 hover:text-black/70 dark:text-white/55 dark:hover:text-white/75 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF] transition-colors tracking-widest">
              One Boston Place, # 2600, Boston, MA, 02108
            </a>
            <a
              href="mailto:Hello@ActAngel.com"
              className="text-sm text-[gray] font-medium underline underline-offset-2 hover:text-black/70 dark:text-white/60 dark:hover:text-white/80 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF] transition-colors tracking-widest"
            >
              Hello@ActAngel.com
            </a>
          </div>

        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04] dark:border-white/10 purple:border-[#B79CFF]/15 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-sm text-black/55 dark:text-white/55 purple:text-[#ABA6D9]">© 2026 Act Angel AI, Inc.</span>
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-6 gap-y-2">
            <a
              href="/privacy"
              target="_blank"
              className="text-sm text-black/55 hover:text-black/70 dark:text-white/55 dark:hover:text-white/75 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF] transition-colors tracking-widest"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              target="_blank"
              className="text-sm text-black/55 hover:text-black/70 dark:text-white/55 dark:hover:text-white/75 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF] transition-colors tracking-widest"
            >
              Terms &amp; Conditions
            </a>
            <a
              href="/cookies"
              target="_blank"
              className="text-sm text-black/55 hover:text-black/70 dark:text-white/55 dark:hover:text-white/75 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF] transition-colors tracking-widest"
            >
              Cookies Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
