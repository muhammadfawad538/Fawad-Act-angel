"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { PERSONAS } from "@/lib/personas";

// Dropdown/accordion toggle chevron — an SVG instead of the "⌄" text glyph this used before,
// which sat visibly off-center against the label next to it (text-glyph vertical metrics vary
// by font/browser, unlike an SVG's own tightly-cropped viewBox) and read as small/hard to notice.
// flex items-center on every button/pill this sits in does the vertical centering; this just
// needs a predictable box to center, which the glyph didn't reliably give it.
function ChevronIcon({ open, className = "" }: { open: boolean; className?: string }) {
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
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// "Behind the Angels" dropdown items — plain data (not persona-driven like Hire an Angel), used
// by both the desktop card grid and the mobile accordion below so the two can't drift.
const BEHIND_ITEMS = [
  { href: "/behind-the-angels/about-us", title: "About Us" },
  { href: "/behind-the-angels/progress-with-purpose", title: "Our Social Impact" },
];

// Matches the reference theme's nav surface: a 75%-opaque white pill rather than the
// barely-there 30% warm tint this used before, so the bar reads as a solid surface over
// the hero video instead of letting it bleed through.
const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(255,255,255,0.75)",
  boxShadow: "0 10px 30px -12px rgba(0,0,0,0.12)",
} as const;

// Same surface, more opaque — for the floating dropdown/accordion panels (Hire an Angel,
// Behind the Angels, the mobile menu) rather than the always-at-the-top main bar. Those panels
// open directly over whatever page content sits underneath (e.g. a heading), and at the main
// bar's 75% opacity that content showed through enough to fight with the menu item text for
// attention. Pushed close to fully solid (99%) plus a stronger blur: enough that whatever's
// behind still registers as "something's there" (the panel doesn't look like a flat cutout),
// but not legible — 96% still let text shapes read through clearly enough to compete with the
// menu items.
const NAV_DROPDOWN_STYLE = {
  ...NAV_STYLE,
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  background: "rgba(255,255,255,0.99)",
} as const;

// Menu-item typography, matching the reference theme's nav: 14px / weight 500 / #4A4A4A,
// with no extra letter-spacing. Hover darkens to near-black.
// font-family is set explicitly (not inherited font-sans/Geist) to match
// act_angel_frontend_backup's own nav, which sets this same system-ui stack on its links
// rather than using the site's Geist font — applied as a class here (not inherited from a
// wrapper) so it still reaches the dropdown popover, which portals outside the nav in the DOM.
const NAV_ITEM =
  "text-[14px] font-medium text-[#4A4A4A] hover:text-[#111] transition-colors duration-200 [font-family:system-ui,-apple-system,sans-serif]";

// Nav pill buttons (requirements/Buttons_update_header.png): "Hire an Angel", "Behind the
// Angels" and "Contact" are now outlined pills the same size as Get Started (46px tall, 12px
// uppercase/letterspaced) instead of plain text links.
// inline-flex (not flex) + shrink-0 + whitespace-nowrap: `flex` alone is block-level, so this
// stretches to fill its parent's width wherever it isn't already a flex child sized by its
// siblings (the mobile menu's standalone "Get Started" link, in particular) — inline-flex keeps
// it sized to its own content in both contexts. shrink-0/whitespace-nowrap stop the label from
// wrapping or the pill from getting squeezed when the desktop row is short on space.
const NAV_PILL =
  "inline-flex items-center justify-center gap-[6px] h-[46px] px-6 rounded-full border border-[#DADADA] hover:border-[#b8b8b8] text-[12px] font-medium uppercase tracking-[0.08em] text-[#111] whitespace-nowrap shrink-0 transition-colors duration-200";

// Get Started is filled — #5D4387 is a mid-tone step sampled from the logo icon's own gradient,
// lightening to #7168A0 on hover (both from the reference screenshot).
const NAV_CTA =
  "inline-flex items-center justify-center h-[46px] px-[26px] rounded-full bg-[#5D4387] hover:bg-[#7168A0] text-[12px] font-medium uppercase tracking-[0.08em] text-white whitespace-nowrap shrink-0 transition-colors duration-200";

// No props: every item here is now a real link (persona pages, /get-started, /contact)
// rather than something that opens a modal, so the nav no longer needs callbacks from its
// parent. HireAnAngelModal/MeetYourAngelModal (still fully intact) simply aren't wired to
// anything here anymore.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  // Which persona's Use Cases is expanded in the mobile "Hire an Angel" list — touch has no
  // hover, so this plays the role the desktop version's group-hover does, toggled by tapping a
  // row's chevron instead.
  const [personasOpen, setPersonasOpen] = useState(false);
  const [expandedPersonaId, setExpandedPersonaId] = useState<string | null>(null);
  const [behindAccordionOpen, setBehindAccordionOpen] = useState(false);
  // Desktop "Hire an Angel" dropdown: a vertical hover-reveal stack of all 5 personas (client-
  // approved over the earlier grid mega-menu) — anchored to its own trigger (hireRef), like
  // Behind the Angels, rather than centered under the whole bar.
  const [hireOpen, setHireOpen] = useState(false);
  const hireRef = useRef<HTMLDivElement>(null);
  // Desktop "Behind the Angels" dropdown — a plain 2-item list (About Us / Our Social Impact),
  // anchored to its own trigger (behindRef) the same way.
  const [behindOpen, setBehindOpen] = useState(false);
  const behindRef = useRef<HTMLDivElement>(null);

  // Both desktop dropdowns open on hover rather than click. A short delay on close (instead of
  // closing the instant the pointer leaves) is what stops them snapping shut while the mouse is
  // still travelling from the trigger down to the panel. The timer is shared between the trigger
  // and the panel (both call openHire/scheduleCloseHire), so entering either cancels a pending
  // close from the other.
  const hireCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const behindCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openHire = () => {
    if (hireCloseTimer.current) { clearTimeout(hireCloseTimer.current); hireCloseTimer.current = null; }
    setBehindOpen(false);
    setHireOpen(true);
  };
  const scheduleCloseHire = () => {
    hireCloseTimer.current = setTimeout(() => setHireOpen(false), 150);
  };
  const openBehind = () => {
    if (behindCloseTimer.current) { clearTimeout(behindCloseTimer.current); behindCloseTimer.current = null; }
    setHireOpen(false);
    setBehindOpen(true);
  };
  const scheduleCloseBehind = () => {
    behindCloseTimer.current = setTimeout(() => setBehindOpen(false), 150);
  };

  // Clears any pending close timer left running if the nav unmounts mid-delay.
  useEffect(() => {
    return () => {
      if (hireCloseTimer.current) clearTimeout(hireCloseTimer.current);
      if (behindCloseTimer.current) clearTimeout(behindCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!hireOpen && !behindOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (hireOpen && hireRef.current && !hireRef.current.contains(e.target as Node)) {
        setHireOpen(false);
      }
      if (behindOpen && behindRef.current && !behindRef.current.contains(e.target as Node)) {
        setBehindOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setHireOpen(false);
        setBehindOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hireOpen, behindOpen]);

  const close = () => {
    setOpen(false);
    setPersonasOpen(false);
    setExpandedPersonaId(null);
    setBehindAccordionOpen(false);
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-6 md:px-12 lg:px-20 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-6xl mx-auto relative">
        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          <Link
            href="/"
            aria-label="Act Angel AI — go to homepage"
            className="flex items-center gap-2 font-pixel text-xs tracking-[0.25em] text-black/70"
          >
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop group — all 4 buttons (3 outlined pills + filled Get Started) right-aligned
              as one cluster next to the logo, per requirements/Buttons_update_header.png.
              Switches in at lg (1024px), not md (768px): below that, the row doesn't have
              enough room for all 4 pills and was squeezing/wrapping their labels — the burger
              menu handles that whole range instead. */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              ref={hireRef}
              className="relative"
              onMouseEnter={openHire}
              onMouseLeave={scheduleCloseHire}
            >
              <button
                onClick={openHire}
                aria-expanded={hireOpen}
                className={`group outline-none cursor-pointer ${NAV_PILL}`}
              >
                Hire an Angel
                <ChevronIcon open={hireOpen} />
              </button>

              {/* Anchored directly under its own trigger (left-aligned to it), not centered
                  under the whole bar. mt-5 (not mt-2): hireRef wraps just this trigger button,
                  so top-full lands at the button's own bottom edge — 12px (the nav's own py-3
                  bottom padding) short of the bar's actual bottom edge. Same fix, same reason,
                  as Behind the Angels' panel below. */}
              {hireOpen && (
                <div
                  className="hidden lg:block absolute left-0 top-full mt-5 z-50"
                  onMouseEnter={openHire}
                  onMouseLeave={scheduleCloseHire}
                >
                  <div
                    className="w-[410px] rounded-2xl border border-black/[0.06]"
                    style={NAV_DROPDOWN_STYLE}
                  >
                    <div className="flex flex-col">
                      {PERSONAS.map((p) => (
                        <Link
                          key={p.id}
                          href={`/hire-an-angel/${p.slug}`}
                          onClick={() => setHireOpen(false)}
                          className="group relative flex flex-col border-b border-black/[0.06] last:border-b-0 px-3 transition-colors duration-200 hover:bg-[#EDE9F7]/70 [font-family:system-ui,-apple-system,sans-serif]"
                        >
                          <div className="my-4 flex items-center gap-3 rounded-lg bg-[#5D4387]/10 pl-3 pr-3 py-2.5 transition-[background-color,padding] duration-200 group-hover:bg-[#5D4387]/30 group-hover:pl-[18px]">
                            <img
                              src={p.avatar}
                              alt=""
                              aria-hidden="true"
                              className="w-[75px] h-[75px] rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p title={p.label} className="text-[16px] font-semibold text-[#111] truncate">{p.label}</p>
                              <p title={p.dropdownRole} className="text-[13px] text-black/50 truncate">{p.dropdownRole}</p>
                            </div>
                            <span className="text-black/30 text-sm shrink-0">›</span>
                          </div>

                          {/* Use Cases — pops out to the right of the row as a floating card
                              (tooltip-like: fade + scale in) instead of expanding inline below
                              it. pointer-events-none since it's pure display, no interactive
                              content of its own; position:relative on the row above (not the
                              whole stack) is what anchors this to that specific row. */}
                          <div className="pointer-events-none absolute left-full top-4 ml-3 w-[240px] origin-left scale-95 rounded-xl border border-black/[0.06] bg-[#EDE9F7] p-4 opacity-0 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 z-10">
                            <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                              Business Functions
                            </p>
                            <ul className="mt-2 flex flex-col gap-1.5">
                              {p.useCases?.map((uc) => (
                                <li key={uc} className="flex items-center gap-2 text-[13px] font-medium text-[#333]">
                                  <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0" />
                                  {uc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              ref={behindRef}
              className="relative"
              onMouseEnter={openBehind}
              onMouseLeave={scheduleCloseBehind}
            >
              <button
                onClick={openBehind}
                aria-expanded={behindOpen}
                className={`group outline-none cursor-pointer ${NAV_PILL}`}
              >
                Behind the Angels
                <ChevronIcon open={behindOpen} />
              </button>

              {/* mt-5: behindRef wraps just the button — top-full lands at the button's own
                  bottom edge, 12px (the nav's own py-3 bottom padding) short of the nav bar's
                  actual bottom edge. The extra 12px (on top of the same 8px/mt-2 gap) makes both
                  this panel and Hire an Angel's open at the same depth below the bar. */}
              {behindOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-[440px] rounded-2xl border border-black/[0.06] overflow-hidden z-50 p-3"
                  style={NAV_DROPDOWN_STYLE}
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {BEHIND_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setBehindOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.08] p-4 cursor-pointer hover:border-black/20 hover:bg-black/[0.02] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                      >
                        <p className="text-[14px] font-semibold text-[#111]">{item.title}</p>
                        <span className="text-black/30 text-sm shrink-0">›</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/contact" className={NAV_PILL}>
              Contact
            </Link>
            <Link
              href="/get-started"
              onClick={() => posthog.capture("cta_get_started_clicked", { location: "nav_desktop" })}
              className={NAV_CTA}
            >
              Get Started
            </Link>
          </div>

          {/* Burger — shown below lg (1024px), same threshold as the desktop group above */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-px bg-black/60 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 transition-all duration-300"
              style={{
                width: "18px",
                opacity: open ? 0 : 1,
                transform: open ? "scaleX(0)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>

        {/* Mobile dropdown — same lg threshold as the burger that opens it */}
        <div
          className="lg:hidden mt-2 max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "min(2000px, 80vh)" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_DROPDOWN_STYLE}
          >
            {/* "Hire an Angel" — mirrors the desktop version's vertical stack/pill-card look: a
                single column, rounded-lg (not circular) avatar, pill-card with the same purple
                tint. Touch has no hover, so Use Cases is revealed by tapping a row's own chevron
                (expandedPersonaId) instead, and shown inline below the row rather than as a side
                flyout — there isn't room to pop one out to the right on a phone screen. */}
            <button
              onClick={() => setPersonasOpen((v) => !v)}
              className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Hire an Angel
              <ChevronIcon open={personasOpen} />
            </button>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{ maxHeight: personasOpen ? "1400px" : "0px" }}
            >
              <div className="flex flex-col pt-2">
                {PERSONAS.map((p) => {
                  const isExpanded = expandedPersonaId === p.id;
                  return (
                    <div key={p.id} className="border-b border-black/[0.06] last:border-b-0">
                      <div className="flex items-center gap-2 py-2">
                        <Link
                          href={`/hire-an-angel/${p.slug}`}
                          onClick={close}
                          className="flex flex-1 min-w-0 items-center gap-3 rounded-lg bg-[#5D4387]/10 pl-3 pr-3 py-2.5 [font-family:system-ui,-apple-system,sans-serif]"
                        >
                          <img
                            src={p.avatar}
                            alt=""
                            aria-hidden="true"
                            className="w-[75px] h-[75px] rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p title={p.label} className="text-[16px] font-semibold text-[#111] truncate">{p.label}</p>
                            <p title={p.dropdownRole} className="text-[13px] text-black/50 truncate">{p.dropdownRole}</p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpandedPersonaId(isExpanded ? null : p.id)}
                          aria-expanded={isExpanded}
                          aria-label={`Toggle ${p.label} use cases`}
                          className="p-2 -m-2 shrink-0 text-black/40"
                        >
                          <ChevronIcon open={isExpanded} />
                        </button>
                      </div>
                      <div
                        className="overflow-hidden transition-all duration-200 ease-in-out"
                        style={{ maxHeight: isExpanded ? "260px" : "0px" }}
                      >
                        {/* flex + matching gap-2 + a spacer the same width as the chevron button
                            above: that's what makes this card's rendered width equal the
                            image/title Link's width instead of the whole row's. */}
                        <div className="flex items-start gap-2 mb-3">
                          <div className="flex-1 min-w-0 rounded-xl bg-[#EDE9F7] p-4">
                            <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                              Business Functions
                            </p>
                            <ul className="mt-2 flex flex-col gap-1.5">
                              {p.useCases?.map((uc) => (
                                <li key={uc} className="flex items-center gap-2 text-[13px] font-medium text-[#333]">
                                  <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0" />
                                  {uc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="w-[14px] shrink-0" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* "Behind the Angels" — same inline-expandable pattern as "Hire an Angel" above,
                and now the same bordered-card treatment for its 2 items too. */}
            <button
              onClick={() => setBehindAccordionOpen((v) => !v)}
              className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Behind the Angels
              <ChevronIcon open={behindAccordionOpen} />
            </button>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{ maxHeight: behindAccordionOpen ? "200px" : "0px" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2 pt-2 pb-1">
                {BEHIND_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.08] p-3 hover:border-black/20 hover:bg-black/[0.03] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                  >
                    <p className="text-[13px] font-semibold text-[#111]">{item.title}</p>
                    <span className="text-black/30 text-sm shrink-0">›</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/contact"
              onClick={close}
              className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Contact
            </Link>

            <div className="mt-1 px-2 pb-1 flex justify-center">
              <Link
                href="/get-started"
                onClick={() => {
                  posthog.capture("cta_get_started_clicked", { location: "nav_mobile" })
                  close()
                }}
                className={NAV_CTA}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
