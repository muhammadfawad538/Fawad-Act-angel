"use client";

import { useState } from "react";
import Link from "next/link";
import { PERSONAS, type Persona, type PersonaId } from "@/lib/personas";
import { PersonaPhoneDemo } from "@/components/persona-phone-demo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Act Angel's own multi-channel concept (already used on the homepage's "always on / reachable
// everywhere" section) — reused here as the second picker in LiveDemoSection below.
const CHANNELS = ["Call", "Chat", "Email", "SMS", "Web"];

// Live-preview photo fill. The zoomed-out photo no longer reaches the frame's top/bottom, so the
// frame shows this gradient there — sampled from the persona images' own edges (light sky-grey
// at the top, near-white at the bottom), which all 4 share. The photo's edges are feathered into
// it so there's no hard line; the left/right feather only shows on the square mobile frame, since
// on desktop the photo is wider than the frame and those edges are clipped off.
const PHOTO_BACKDROP = "linear-gradient(to bottom, #DDE3E9, #F4F4F4)";
const PHOTO_FEATHER =
  "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent), linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

/**
 * "Live Preview" section — same broad idea as 11x.ai's "Talk to Julian, live" card (a photo with
 * an incoming-call affordance on one side, a scenario/voice picker and CTA on the other), rebuilt
 * in Act Angel's own palette/typography and wired to real product data instead of copied wording:
 * the "Scenario" pills are each persona's actual use cases (lib/personas.ts), the second picker
 * is Act Angel's own channel list (Call/Chat/Email/SMS/Web, already used on the homepage) rather
 * than voice accents, and the CTA scrolls to the real phone demo already on this page instead of
 * promising a live WebRTC call the site doesn't have.
 */
// Shared Scenario/Channel pill style — a light-purple fill (not a solid one) for the selected
// pill, plus a hover lift/press animation, matching 11x.ai's own scenario/voice picker: on
// 11x the pill shifts slightly upward on hover rather than growing, so this uses a translateY
// instead of a scale.
// Same chevron used by the nav's dropdown triggers (components/mobile-nav.tsx) — duplicated
// locally (rather than imported) since it's a small, self-contained SVG and this file has no
// other dependency on nav internals.
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Collapsed-by-default Q&A row for the FAQ section's accordion entries (everything past the
// first faqs[] item, which renders as a plain headline+paragraph instead — see the "What is
// Hope Angel?" explainer section below).
function FaqAccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-black/[0.08] dark:border-white/10 purple:border-[#B79CFF]/15 py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
      >
        <span className="text-[15px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
          {question}
        </span>
        <span className="text-[#5D4387] dark:text-white/70 purple:text-[#B79CFF]">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <p className="mt-3 text-sm text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

// compact: AAA-UI-DM-WEB-011 (phone) + tablet enhancement request — Scenario pills (unlike
// Channel, which also uses this function) have long enough labels ("Ticket Triage &
// Resolution", "Calendar Management", "Interview Scheduling", ...) that auto-width flex-wrap
// packed them inconsistently (uneven multi-row wraps on phone, one-per-row on tablet despite
// room for 2). Scenario's wrapper (below) uses a 2-column equal-width grid at every size
// instead — per explicit follow-up request, the pills stay equal-width on desktop too, not
// just phone/tablet, rather than reverting to flex's auto-width packing once there's room for
// it. Text stays small (12px) only below 768px where cells are narrowest; from md: up it's the
// normal 13px/px-5 py-2.5 pill size, just in equal-width cells instead of auto-width.
function pillClass(active: boolean, compact = false) {
  return `${compact ? "px-3 py-2.5 text-[12px] leading-snug text-center w-full md:px-5 md:py-2.5 md:text-[13px] md:leading-normal" : "px-4 py-2 text-[13px]"} lg:px-5 lg:py-2.5 lg:text-[13px] lg:leading-normal rounded-full font-medium border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
    active
      ? "bg-[#EDE9F7] border-[#5D4387]/30 text-[#5D4387] dark:bg-white/15 dark:border-white/30 dark:text-white purple:bg-[#7C5CFF]/20 purple:border-[#7C5CFF]/40 purple:text-[#F6F4FF]"
      : "border-black/15 text-black/60 hover:border-[#5D4387]/30 hover:bg-[#5D4387]/[0.05] hover:text-[#5D4387] dark:border-white/15 dark:text-white/60 dark:hover:border-white/35 dark:hover:bg-white/5 dark:hover:text-white purple:border-[#B79CFF]/20 purple:text-[#ABA6D9] purple:hover:border-[#7C5CFF]/40 purple:hover:bg-[#7C5CFF]/[0.08] purple:hover:text-[#F6F4FF]"
  }`;
}

function LiveDemoSection({ persona }: { persona: Persona }) {
  const [scenario, setScenario] = useState(0);
  const [channel, setChannel] = useState(0);
  const scenarios = persona.scenarios ?? persona.useCases!;
  const channels = persona.channels ?? CHANNELS;

  return (
    <section id="live-preview" className="mt-24 scroll-mt-24">
      {/* Single unified card (matching 11x.ai's "Talk to Julian, live" widget) — one bordered,
          rounded, shadowed container holding both halves, rather than the photo floating as its
          own separate card next to a plain text column. The inner grid has no gap/padding of its
          own so the photo sits flush against the shared border on 3 sides and butts directly up
          against the text column on the 4th — that seam is a plain edge, not independently
          rounded, since only the OUTER card's corners are meant to read as rounded. */}
      <div className="rounded-3xl border border-black/[0.08] bg-white dark:bg-white/[0.04] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]">
        {/* 45/55 split — photo column at 45% width. */}
        <div className="grid md:grid-cols-[45%_55%] items-stretch">
          {/* Portrait photo half. On desktop its height comes from the text column beside it;
              below md the grid stacks, so it's a plain square instead. overflow-hidden clips the
              photo to this frame (it's deliberately wider than the frame on desktop, and the
              zoom animation would otherwise also spill into the text column). */}
          <div
            className="relative w-full aspect-square md:aspect-auto md:min-h-[600px] overflow-hidden"
            style={{ background: PHOTO_BACKDROP }}
          >
            {/* Standing in for the mp4 the 11x.ai reference plays here — there's no per-persona
                video, so a slow, continuous Ken Burns zoom/pan on the still photo (defined in
                globals.css) is what gives it that "alive"/video feel instead of a flat static
                image.
                The photo keeps its own square shape (h-full + w-auto) rather than object-cover:
                object-cover clips it to the frame's box, so zooming out shrank that box too and
                opened gaps on every side. As a full square it overhangs the frame left and right
                on desktop, so zooming out reveals more of its sides while only the top/bottom
                open up (onto PHOTO_BACKDROP). max-w-none and shrink-0 stop Tailwind's img reset
                and flex from squeezing it back down to the frame's width. */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={persona.avatar}
                alt={persona.contact}
                className="h-full w-auto max-w-none shrink-0 animate-[live-preview-motion_9s_ease-in-out_infinite]"
                style={{
                  maskImage: PHOTO_FEATHER,
                  WebkitMaskImage: PHOTO_FEATHER,
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                }}
              />
            </div>

            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-white">
                {persona.livePreviewPillReversed ? (
                  <>
                    {persona.livePreviewPillLabel ?? persona.label} ·{" "}
                    {persona.contact}
                  </>
                ) : (
                  <>
                    {persona.contact} ·{" "}
                    {persona.livePreviewPillLabel ?? persona.label}
                  </>
                )}
              </span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              <span className="text-[11px] font-medium text-white">
                {persona.liveDemoBadgeLabel ?? "Live"}
              </span>
            </div>

            {/* Campaign-progress overlay — Hope Angel-only, a question/answer bubble pair plus
                a donation progress card sitting over the photo's bottom edge. Content follows
                whichever Scenario pill is selected (persona.campaignScenarios, aligned by index
                with `scenarios`); falls back to the static campaignDemo text when a persona
                hasn't got per-scenario data. */}
            {false && (persona.campaignScenarios || persona.campaignDemo) &&
              (() => {
                const fallback = persona.campaignDemo;
                const active = persona.campaignScenarios?.[scenario] ?? {
                  question: "How close are you to the campaign goal?",
                  answer: `Our example campaign has raised ${fallback!.raised} toward a ${fallback!.goal} goal. May I show you how your contribution can help?`,
                  progressValueText: `${fallback!.raised} / ${fallback!.goal}`,
                  progressPct: Math.min(
                    100,
                    Math.round(
                      (fallback!.raisedValue / fallback!.goalValue) * 100,
                    ),
                  ),
                };
                return (
                  <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
                    <div className="self-end max-w-[85%] px-4 py-2 rounded-2xl rounded-br-sm bg-black/70 backdrop-blur-sm text-white text-[13px] font-medium">
                      {active.question}
                    </div>
                    <div className="flex items-start gap-2 px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
                      <img
                        src={persona.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <span className="text-[13px] text-[#111] leading-relaxed">
                        {active.answer}
                      </span>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-black/50">
                          Sample campaign progress
                        </span>
                        <span className="font-semibold text-[#111]">
                          {active.progressValueText}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#5D4387]"
                          style={{ width: `${active.progressPct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] text-black/40">
                        Illustrative example, not live donation data.
                      </p>
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Content half — its own padding now that it's inside the shared card instead of
              being a bare grid cell in the page's own gutter. */}
          <div className="p-6 md:p-12 lg:p-8">
            {/* Background matches the "Hire a [X] Angel" button below exactly — same
                liveDemoCtaVariant switch, so the pair always stays in sync per persona
                (black/white for the default variant, purple/white for Hope Angel). */}
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-white text-[11px] font-semibold uppercase tracking-widest dark:bg-white dark:text-black purple:bg-[#7C5CFF] purple:text-white ${
                persona.liveDemoCtaVariant === "purple" ? "bg-[#5D4387]" : "bg-[#111]"
              }`}
            >
              Live Preview
            </span>
            <h2 className="mt-4 md:mt-6 text-2xl md:text-4xl font-bold tracking-tight leading-[1.15]">
              {persona.liveDemoHeadline ??
                `See a ${persona.label} handle it, live.`}
            </h2>
            <p className="mt-3 md:mt-5 text-[15px] text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed max-w-md">
              {persona.liveDemoSubtext ??
                `Pick a scenario and a channel, then watch ${persona.contact} — your ${persona.label} — take it from first message to next step.`}
            </p>

            <div className="mt-6 md:mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 purple:text-[#716C9E]">
                Scenario
              </p>
              {/* grid-cols-2: AAA-UI-DM-WEB-011 (phone) + tablet enhancement request — a 2x2
                  grid of equal-width pills at every viewport size, instead of the one-per-row
                  vertical stack / uneven wrap QA flagged on phone and tablet. Kept as grid (not
                  reverting to flex/flex-wrap) at desktop too per explicit follow-up request, so
                  the 4 pills stay equal-width everywhere rather than auto-sized to their own
                  text once there's room for flex-wrap to pack them well on its own. */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {scenarios.map((uc, i) => (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => setScenario(i)}
                    className={pillClass(i === scenario, true)}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 md:mt-10 flex flex-wrap items-center gap-5">
              {(() => {
                const href =
                  persona.liveDemoCtaHref ?? persona.ctaHref ?? "/get-started";
                const label = persona.liveDemoCtaLabel ?? persona.ctaHireLabel;
                const className = `px-7 py-3.5 text-white text-[12px] font-semibold uppercase tracking-wide rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:hover:bg-[#8F72FF] purple:text-white ${
                  persona.liveDemoCtaVariant === "purple"
                    ? "bg-[#5D4387] hover:bg-[#7168A0]"
                    : "bg-[#111] hover:bg-black/80"
                }`;
                // Next's Link doesn't reliably re-trigger a scroll-to-hash when only the hash
                // changes on the SAME route (no pathname change) — a plain anchor lets the
                // browser handle the in-page jump natively instead.
                return href.startsWith("#") ? (
                  <a href={href} className={className}>
                    {label}
                  </a>
                ) : (
                  <Link href={href} className={className}>
                    {label}
                  </Link>
                );
              })()}
            </div>

            <div className="mt-6 md:mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 purple:text-[#716C9E]">
                Channel
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {channels.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(i)}
                    className={pillClass(i === channel)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[12px] text-black/40 dark:text-white/40 purple:text-[#716C9E]">
              {persona.liveDemoCaption ??
                "Don’t Take Our Word for It. Meet Your Angel."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// "Hire a [X] Angel" (filled) — hero only now. Was previously paired with an "Experience an
// Angel" button in both the hero and the closing section; split into two standalone buttons so
// each section can show just the one it needs (hero: hire; closing: experience).
function HireButton({
  hireLabel,
  href = "/get-started",
}: {
  hireLabel?: string;
  href?: string;
}) {
  const className =
    "inline-block px-7 py-3.5 bg-[#5D4387] text-white text-[12px] font-semibold uppercase tracking-wide rounded-full hover:bg-[#7168A0] transition-colors dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:hover:bg-[#8F72FF]";
  // Next's Link doesn't reliably re-trigger a scroll-to-hash when only the hash changes on the
  // SAME route (no pathname change) — a plain anchor lets the browser handle the in-page jump
  // natively instead (used by Hope Angel's "Share Your Mission" CTAs).
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {hireLabel}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {hireLabel}
    </Link>
  );
}

// "Experience an Angel" (outlined) — closing section only now. Scrolls to the Live Preview
// section (not the hero's own phone demo) since that's the page's actual interactive preview,
// unless a persona provides its own closing CTA target (Hope Angel's "Share Your Mission").
function ExperienceButton({
  label = "Experience an Angel",
  href = "#live-preview",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-block px-7 py-3.5 border border-black/15 text-[#111] text-[12px] font-semibold uppercase tracking-wide rounded-full hover:border-black/30 hover:bg-black/[0.03] transition-colors dark:border-white/20 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 purple:border-[#B79CFF]/25 purple:text-[#F6F4FF] purple:hover:border-[#B79CFF]/50 purple:hover:bg-[#7C5CFF]/10"
    >
      {label}
    </a>
  );
}

/**
 * Shared body for the 4 standalone Hire-an-Angel pages (app/hire-an-angel/<slug>/page.tsx) —
 * each page is a thin wrapper that just picks a personaId, so the layout, persona-switcher
 * row, and phone demo can't drift across the 4 routes. Mirrors the modal's own persona-picker
 * pill grid (components/hire-an-angel-modal.tsx, left intact for later reactivation) but as
 * real links between the 4 pages instead of in-place state.
 *
 * Layout matches requirements/angel_pages.png (colors/light theme) + screenshot1-3.png (full
 * structure — the same design, just a dark-theme variant): left-aligned persona tabs, a
 * two-column hero (eyebrow badge/headline/subtext/CTAs/trust line + phone demo with a floating
 * "Business Outcome" card), a 3-column capabilities grid, a full-bleed outcome banner, an
 * FAQ-style explainer, and a closing CTA — all above the site's normal footer.
 * The site's own global nav (SiteHeader) is left untouched — the persona switcher shown
 * embedded in the navbar in those reference shots was intentionally NOT adopted; it lives here
 * instead, as its own left-aligned tab row (no breadcrumb above it).
 */
export function HireAnAngelPageContent({
  personaId,
}: {
  personaId: PersonaId;
}) {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];
  // Gates the full landing-page sections below (hero headline through CTA). Personas that
  // haven't had their content doc copy filled in yet (lib/personas.ts) just keep a bare
  // phone-demo fallback instead of rendering half-empty sections.
  const hasLandingContent = !!persona.heroHeadline;

  // flex flex-col + flex-1 on the content div below: keeps the footer pinned to the bottom
  // of the screen on short-content pages instead of stranded right after the content.
  return (
    <div className="bg-[#F5F4F0] text-[#111] dark:bg-[#0a0a0a] dark:text-white purple:bg-[#12103C] purple:text-[#F6F4FF] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 pt-28 md:pt-32 pb-24">
        <main className="max-w-6xl mx-auto">
          {/* Persona tab row — left-aligned (not centered, and not embedded in the navbar). One
              shared underline (border-b on the row) with each link's own bottom border
              overlapping it via -mb-px — the classic tab-bar trick, so the active tab's
              underline sits flush on the divider line instead of floating below it. */}
          <div className="flex flex-nowrap items-center gap-x-8 overflow-x-auto no-scrollbar border-b border-black/[0.08] dark:border-white/10 purple:border-[#B79CFF]/15">
            {PERSONAS.map((p) => {
              const active = p.id === personaId;
              return (
                <Link
                  key={p.id}
                  href={`/hire-an-angel/${p.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap pb-3 text-[14px] font-medium border-b-2 -mb-px transition-colors duration-200 purple:font-[Inter,sans-serif] ${
                    active
                      ? "text-[#111] border-[#111] dark:text-white dark:border-white purple:text-[#F6F4FF] purple:border-[#7C5CFF]"
                      : "text-[#8A8A8A] border-transparent hover:text-[#111] dark:text-white/50 dark:hover:text-white purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF]"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>

          {hasLandingContent ? (
            <>
              {/* Hero — two columns: copy + CTAs + trust line on the left, phone demo + a
                  floating "Business Outcome" card on the right. items-start (not items-center):
                  personas' text columns vary in height (Hope Angel's extra heroSubtext2
                  paragraph makes it taller than the other 4), and centering the phone against
                  that height shifted its top position — and thus its gap from the nav — per
                  persona. Top-aligning keeps that gap identical everywhere. */}
              <div className="mt-10 md:mt-14 grid md:grid-cols-[minmax(0,1.72fr)_minmax(260px,1fr)] gap-12 md:gap-16 items-start">
                <div className="min-w-0">
                  {persona.eyebrow && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#EDE9F7] text-[#5D4387] dark:bg-white/10 dark:text-white purple:bg-[#7C5CFF]/[0.14] purple:text-[#B79CFF] text-[11px] font-semibold uppercase tracking-widest">
                      {persona.eyebrow}
                    </span>
                  )}
                  {/* text-4xl (36px) fixed was wrapping the longer headlines ("From Customer
                      Request to Resolution.", "Hope Angel: More Good, Done Every Day.") to 3-4
                      stacked lines on mid-size phones like Pixel 9 (412px) — UI enhancement
                      request, generalized to the whole mobile range rather than just 412px.
                      clamp(28px, 7.5vw, 36px) scales the heading down just enough that every
                      persona's headline wraps to 2 balanced lines across ~360-430px (nearly all
                      current phones); still 36px (unchanged) once md: takes over at 768px. */}
                  <h1 className="mt-5 text-[clamp(28px,7.5vw,36px)] md:text-5xl font-bold tracking-tight leading-[1.08] dark:text-white purple:text-[#F6F4FF]">
                    {persona.heroHeadline}
                  </h1>
                  {/* AAA-UI-DM-WEB-007: approved #716C9E/contrast 3.72 against the page's
                      #12103C bg, not the #ABA6D9/7.88 every other purple: secondary-text
                      instance uses — scoped to this hero description only, not the shared
                      muted-text color used elsewhere on the page. */}
                  <p className="mt-5 text-[15px] text-black/55 dark:text-white/70 purple:text-[#716C9E] leading-relaxed max-w-2xl">
                    {persona.heroSubtext}
                  </p>
                  {persona.heroSubtext2 && (
                    <p className="mt-3 text-[15px] text-black/55 dark:text-white/70 purple:text-[#716C9E] leading-relaxed max-w-2xl">
                      {persona.heroSubtext2}
                    </p>
                  )}

                  <div className="mt-8">
                    <HireButton
                      hireLabel={persona.ctaHireLabel}
                      href={persona.ctaHref}
                    />
                  </div>

                  {/* Trust/differentiator line — identical wording across all 4 original personas,
                      so it's hardcoded here; personas.ts's trustSubtext lets one (e.g. Hope Angel)
                      override the second line where the client's copy differs. */}
                  <div className="mt-8 pl-4 border-l-2 border-[#5D4387]/40 dark:border-white/30 purple:border-[#7C5CFF]/50 max-w-md">
                    <p className="text-[14px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
                      No bad days. No fear. No greed. Just focus.
                    </p>
                    <p className="mt-1.5 text-[13px] text-black/50 dark:text-white/55 purple:text-[#ABA6D9] leading-relaxed">
                      {persona.trustSubtext ??
                        "Free from personal worries, emotional ups and downs, or self-interest. Your Virtual AI Specialist stays focused on the work and your business goals—24/7."}
                    </p>
                  </div>
                  {/* inline-block (not w-full max-w-[240px]): the card now shrinks/grows to fit
                      its content instead of wrapping to a fixed width — outcomeTitle stays on
                      one line (sm:whitespace-nowrap) from sm up, and some personas' titles (e.g.
                      HR's "Smoother processes. More time for people.") are too long to fit a
                      240px card on one line otherwise. Below sm, it's still allowed to wrap
                      (whitespace-normal) so it doesn't overflow a narrow phone screen. */}
                  <div className="mt-4 inline-block rounded-xl border border-black/[0.08] bg-white dark:bg-white/[0.06] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 px-5 py-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
                    <p className="text-[13px] font-semibold uppercase tracking-widest text-[#5D4387] dark:text-white/70 purple:text-[#B79CFF]">
                      {persona.outcomeLabel ?? "Business Outcome"}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF] whitespace-normal sm:whitespace-nowrap">
                      {persona.outcomeCardTitle ?? persona.outcomeTitle}
                    </p>
                  </div>
                </div>

                {/* sticky: keeps the phone in view as the (usually shorter) left column
                    finishes and the capabilities section begins, matching the reference.
                    width dropped from 300 to 240 (the device scales as a unit, so height drops
                    with it) specifically to close the gap between this column and the shorter
                    text column on the left — at 300 the phone ran noticeably taller than the
                    copy, leaving dead space beneath the text. */}
                <div className="flex flex-col items-center md:items-end md:sticky md:top-28 min-w-0">
                  <div id="demo" className="scroll-mt-24">
                    <PersonaPhoneDemo
                      personaId={personaId}
                      active
                      width={240}
                    />
                  </div>
                  {/* <div className="mt-4 w-full max-w-[240px] rounded-xl border border-black/[0.08] bg-white px-5 py-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5D4387]">
                      Business Outcome
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#111]">{persona.outcomeTitle}</p>
                  </div> */}
                </div>
              </div>

              {/* Capabilities — 3-column bordered cards with a small icon swatch, bold title
                  and description each, straight from the content doc. */}
              <section className="mt-12">
                <h2 className="text-xs font-medium uppercase tracking-widest text-black/40 dark:text-white/40 purple:text-[#716C9E]">
                  Capabilities
                </h2>
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {persona.capabilities!.map((c) => (
                    <div
                      key={c.title}
                      tabIndex={0}
                      className="rounded-2xl border-2 border-black/[0.08] bg-white dark:bg-white/[0.04] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 px-6 py-6 transition-colors cursor-pointer hover:border-[#5D4387] focus:outline-none focus:border-[#5D4387] active:border-[#5D4387] dark:hover:border-white/30 dark:focus:border-white/30 dark:active:border-white/30 purple:hover:border-[#7C5CFF] purple:focus:border-[#7C5CFF] purple:active:border-[#7C5CFF]"
                    >
                      {/* Layered icon swatch — light-purple square with a smaller solid-purple
                          square (60% of the outer size, not a circle) centered inside it,
                          matching the design mockup (angelpageslight.vercel.app). */}
                      <span
                        className="inline-flex items-center justify-center w-[25px] h-[25px] rounded-md bg-[#EDE9F7] dark:bg-white/10 purple:bg-[#7C5CFF]/[0.15]"
                        aria-hidden="true"
                      >
                        <span className="w-[40%] h-[40%] rounded-[3px] bg-[#5D4387] dark:bg-white/70 purple:bg-[#B79CFF]" />
                      </span>
                      <p className="mt-4 font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
                        {c.title}
                      </p>
                      <p className="mt-1.5 text-sm text-black/50 dark:text-white/55 purple:text-[#ABA6D9] leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <LiveDemoSection persona={persona} />

              {/* Business outcome — full-bleed gradient banner, reusing the same
                  outcomeTitle/outcomeDescription already teased in the hero's floating card. */}
              <section
                className="mt-8 rounded-2xl px-6 py-8 md:px-12 md:py-14"
                style={{
                  background: "var(--outcome-banner-gradient)",
                }}
              >
                <p className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-[1.2] md:leading-tight">
                  {persona.outcomeTitle}
                </p>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-white/90 leading-relaxed max-w-4xl">
                  {persona.outcomeDescription}
                </p>
              </section>

              {/* Plain-language explainer, tagged as answer-engine/FAQ-schema content per the
                  reference design. Personas with a faqs list (e.g. Hope Angel) render its first
                  entry the same way — big headline + paragraph — then the remaining entries as a
                  collapsed accordion, matching the reference; personas without a faqs list just
                  get the single whatIsTitle/whatIsDescription paragraph.
                  purple:bg-[#1C1A56] etc. — AAA-UI-DM-WEB-005: the approved design wraps this
                  whole block in a card (that color, rounded, padded); the current implementation
                  had no card at all, just plain text straight on the page background. Light
                  theme card is bg-white/border-black-[0.08], the same white-card pattern already
                  used elsewhere on this page (capability cards, the Live Preview card) rather
                  than a reference value, since the client reference is purple/dark-only. dark:
                  cancels the new light-only properties back to nothing — dark wasn't part of
                  either this or the original ticket, stays card-less as before.
                  Reference site measured directly (idyllic-axolotl…, .def-block): card width is
                  1160px against a 1425px content column — essentially the full max-w-6xl column,
                  not the old max-w-2xl here — so that's dropped for light/purple (dark:max-w-2xl
                  keeps dark exactly as it was; dark wasn't part of this round). */}
              <section className="mt-20 bg-white border border-black/[0.08] rounded-2xl p-8 dark:max-w-2xl dark:bg-transparent dark:border-0 dark:rounded-none dark:p-0 purple:bg-[#1C1A56] purple:border-0 purple:rounded-2xl purple:p-8">
                {/* Reference measured directly (.def-tag): 10px/700/1px tracking (the 10px and
                    tracking-widest's 0.1em already matched at this size; font-weight/padding
                    didn't) — px-4/py-1.5/font-semibold restored for dark via dark: overrides,
                    unchanged there. purple: gets the reference's exact accent trio: #B79CFF
                    text/border-at-16%, #7C5CFF-at-12% background (this span had no background
                    at all before). */}
                <span className="inline-block px-[12px] py-[5px] rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-widest text-black/45 dark:px-4 dark:py-1.5 dark:font-semibold dark:border-white/15 dark:text-white/50 purple:border-[#B79CFF]/16 purple:bg-[#7C5CFF]/[0.12] purple:text-[#B79CFF]">
                  {persona.faqEyebrow ??
                    "Structured for Answer Engines · FAQPage Schema"}
                </span>
                {persona.faqs ? (
                  <>
                    <h2 className="mt-5 text-lg font-bold tracking-tight dark:text-2xl dark:md:text-3xl dark:font-light">
                      {persona.faqs[0].question}
                    </h2>
                    <p className="mt-4 text-sm text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed">
                      {persona.faqs[0].answer}
                    </p>
                    <div className="mt-8 border-b border-black/[0.08] dark:border-white/10 purple:border-[#B79CFF]/15">
                      {persona.faqs.slice(1).map((f) => (
                        <FaqAccordionItem
                          key={f.question}
                          question={f.question}
                          answer={f.answer}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-5 text-lg font-bold tracking-tight dark:text-2xl dark:md:text-3xl dark:font-light">
                      {persona.whatIsTitle}
                    </h2>
                    <p className="mt-4 text-sm text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed">
                      {persona.whatIsDescription}
                    </p>
                  </>
                )}
              </section>

              {/* Closing CTA. Most personas just get "Experience an Angel" scrolling back up to
                  the Live Preview section (the hire button already lives in the hero above);
                  a persona with closingHeadline set (Hope Angel) gets the richer eyebrow +
                  headline + paragraph + single-CTA closer from the reference design instead. */}
              <section className="mt-20 pb-4 max-w-2xl">
                {persona.closingHeadline ? (
                  <>
                    {persona.closingEyebrow && (
                      <span className="inline-block px-4 py-1.5 rounded-full bg-[#EDE9F7] text-[#5D4387] dark:bg-white/10 dark:text-white purple:bg-[#7C5CFF]/[0.14] purple:text-[#B79CFF] text-[11px] font-semibold uppercase tracking-widest">
                        {persona.closingEyebrow}
                      </span>
                    )}
                    <h2 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight">
                      {persona.closingHeadline}
                    </h2>
                    {persona.closingDescription && (
                      <p className="mt-4 text-sm text-black/55 dark:text-white/70 purple:text-[#ABA6D9] leading-relaxed">
                        {persona.closingDescription}
                      </p>
                    )}
                    <div className="mt-6">
                      <HireButton
                        hireLabel={persona.closingCtaLabel}
                        href={persona.closingCtaHref}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
                      {persona.ctaLine}
                    </p>
                    <div className="mt-6">
                      <ExperienceButton />
                    </div>
                  </>
                )}
              </section>

              {/* Pull-quote banner between the closing CTA and the mission form — Hope
                  Angel-only (persona.closingQuote). */}
              {persona.closingQuote && (
                <section className="mt-10 pb-4">
                  <div className="rounded-2xl bg-[#EDE9F7] dark:bg-white/[0.06] purple:bg-[#7C5CFF]/10 pl-6 pr-6 py-6 md:py-7 border-l-4 border-[#5D4387] dark:border-l-white/40 purple:border-l-[#7C5CFF] flex flex-wrap items-center justify-between gap-4">
                    <p className="text-lg md:text-xl font-bold text-[#111] dark:text-white purple:text-[#F6F4FF] tracking-tight">
                      &ldquo;{persona.closingQuote}&rdquo;
                    </p>
                    {persona.closingQuoteTag && (
                      <span className="text-[14px] font-bold uppercase tracking-widest text-[#5D4387] dark:text-white/70 purple:text-[#B79CFF] whitespace-nowrap">
                        {persona.closingQuoteTag}
                      </span>
                    )}
                  </div>
                </section>
              )}

            </>
          ) : (
            <div className="mt-16 flex justify-center">
              <div id="demo" className="scroll-mt-24">
                <PersonaPhoneDemo personaId={personaId} active width={340} />
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />

      {/* Floating "Share Your Mission" widget — Hope Angel-only (persona.showMissionForm),
          pinned to the bottom-right of the viewport on every scroll position, matching the
          reference design's persistent conversion prompt. Links to the standalone
          /share-your-mission page (not an in-page anchor — the form no longer lives here). */}
      {persona.showMissionForm && (
        <Link
          href="/share-your-mission"
          className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white dark:bg-[#1c1c1c] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-black/[0.06] hover:shadow-[0_14px_44px_-8px_rgba(0,0,0,0.35)] transition-shadow"
        >
          <span className="text-[13px] font-medium text-black/60 dark:text-white/65 purple:text-[#ABA6D9] whitespace-nowrap">
            {persona.label} for your NPO
          </span>
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#5D4387] text-white dark:bg-white dark:text-black purple:bg-[#7C5CFF] purple:text-white text-[12px] font-semibold uppercase tracking-wide rounded-full whitespace-nowrap">
            Share Your Mission
            <span aria-hidden="true">↗</span>
          </span>
        </Link>
      )}
    </div>
  );
}
