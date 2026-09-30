"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  // On the Hope Angel page, the reference design replaces the nav's whole primary CTA
  // ("Get Started") with "Share Your Mission" instead of showing both a dedicated outlined
  // pill AND the usual filled CTA — so the outlined pill below only renders elsewhere.
  const pathname = usePathname();
  const isHopeAngel = pathname?.startsWith("/hire-an-angel/hope-angel") ?? false;
  const missionHref = "/hire-an-angel/hope-angel#share-your-mission";

  const [open, setOpen] = useState(false);
  const [personasOpen, setPersonasOpen] = useState(false);
  const [behindAccordionOpen, setBehindAccordionOpen] = useState(false);
  // Desktop "Hire an Angel" mega-menu: hand-rolled instead of Radix's DropdownMenu, because
  // DropdownMenuContent anchors/aligns itself to the trigger button — fine for a small popover,
  // but this panel needs to sit centered under the whole nav bar regardless of where the
  // trigger pill happens to sit in it (it's off to the right, not centered, since the
  // Buttons_update_header.png redesign right-aligned the nav group).
  const [hireOpen, setHireOpen] = useState(false);
  const hireRef = useRef<HTMLDivElement>(null);
  // Desktop "Behind the Angels" dropdown — a plain 2-item list (About Us / Our Social Impact),
  // so unlike Hire an Angel's mega-menu it's anchored to its own trigger (behindRef) rather than
  // centered under the whole bar.
  const [behindOpen, setBehindOpen] = useState(false);
  const behindRef = useRef<HTMLDivElement>(null);

  // Both desktop dropdowns open on hover rather than click. A short delay on close (instead of
  // closing the instant the pointer leaves) is what stops them snapping shut while the mouse is
  // still travelling from the trigger down to the panel — Hire an Angel's panel in particular
  // sits centered under the whole bar, not directly under its own trigger, so there's real
  // distance to cover. The timer is shared between the trigger and the panel (both call
  // openHire/scheduleCloseHire), so entering either cancels a pending close from the other.
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
    setBehindAccordionOpen(false);
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-6 md:px-12 lg:px-20 pointer-events-none">
      <div ref={hireRef} className="pointer-events-auto w-full max-w-6xl mx-auto relative">
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
            <button
              onClick={openHire}
              onMouseEnter={openHire}
              onMouseLeave={scheduleCloseHire}
              aria-expanded={hireOpen}
              className={`group outline-none cursor-pointer ${NAV_PILL}`}
            >
              Hire an Angel
              <ChevronIcon open={hireOpen} />
            </button>

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

              {/* mt-5 (not mt-2, like Hire an Angel's panel): this panel is anchored to
                  behindRef, which wraps just the button — top-full lands at the button's own
                  bottom edge, 12px (the nav's own py-3 bottom padding) short of the nav bar's
                  actual bottom edge. Hire an Angel's panel is anchored to hireRef, which wraps
                  the whole nav bar, so its top-full already includes that 12px. The extra 12px
                  here (on top of the same 8px/mt-2 gap) makes both panels open at the same depth
                  below the bar instead of Behind the Angels opening 12px shallower. */}
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
            {/* Shown on every page, like the other 3 nav pills — a bare hash + plain anchor
                when already on the Hope Angel page (next/link's Link doesn't reliably
                re-trigger a scroll-to-hash when only the hash changes on the SAME route),
                otherwise a normal cross-page Link. */}
            {isHopeAngel ? (
              <a href="#share-your-mission" className={NAV_PILL}>
                Share Your Mission
              </a>
            ) : (
              <Link href={missionHref} className={NAV_PILL}>
                Share Your Mission
              </Link>
            )}

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

        {/* Mega-menu panel (requirements/Hire_an_angel_dropdown.png) — a sibling of <nav>,
            absolutely positioned and centered under the whole nav bar via the outer wrapper's
            `relative` + this panel's `inset-x-0 flex justify-center`, rather than anchored to
            the trigger pill's own position (which sits off to the right, not centered). Hidden
            below lg as a defensive guard: hireOpen can only be set true by the desktop trigger
            above, which is itself only reachable at lg+, but this covers resizing the window
            down while the menu is still open. */}
        {hireOpen && (
          <div
            className="hidden lg:flex absolute inset-x-0 top-full mt-2 justify-center z-50"
            onMouseEnter={openHire}
            onMouseLeave={scheduleCloseHire}
          >
            {/* w-full (not a fixed/capped width): this panel sits inside the same max-w-6xl,
                mx-auto wrapper as the nav bar itself (the outer hireRef div), so w-full makes it
                exactly as wide as the navbar at every screen size — the previous 980px cap left
                too little room per column on wide screens, truncating names/roles ("Assistant
                An...", "Talent Managem..."). */}
            <div
              className="w-full rounded-2xl border border-black/[0.06] overflow-hidden"
              style={NAV_DROPDOWN_STYLE}
            >
              {/* 5 columns from 1222px up; below that (down to this panel's own lg/1024px
                  floor) a single row is too cramped, so it drops to 3 columns — 3 cards on
                  the first row, the remaining 2 wrapping to a second. */}
              <div className="grid grid-cols-3 [@media(min-width:1222px)]:grid-cols-5 gap-2.5 p-3">
                {PERSONAS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/hire-an-angel/${p.slug}`}
                    onClick={() => setHireOpen(false)}
                    className="flex flex-col rounded-xl border border-black/[0.08] px-[10px] py-5 cursor-pointer hover:border-black/20 hover:bg-black/[0.02] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                  >
                    {/* Header as one rounded pill/capsule (not a plain row) — avatar inset at
                        its left edge, chevron at its right edge, matching requirements/image.png. */}
                    <div className="flex items-center gap-3 rounded-full bg-black/[0.035] pl-1.5 pr-4 py-1.5">
                      <img
                        src={p.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p title={p.label} className="text-[15px] font-semibold text-[#111] truncate">{p.label}</p>
                        <p title={p.dropdownRole} className="text-[12.5px] text-black/50 truncate">{p.dropdownRole}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/[0.06]">
                      <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                        Use Cases
                      </p>
                      <ul className="mt-2.5 flex flex-col gap-1.5">
                        {p.useCases?.map((uc) => (
                          <li key={uc} className="flex items-start gap-2 text-[13px] font-medium leading-5 text-[#333]">
                            <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0 mt-2" />
                            {uc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] text-[13px]">
                <span className="text-black/50">
                  Not sure which Angel fits? <span className="font-semibold text-[#111]">We&apos;ll help you pick.</span>
                </span>
                <Link
                  href="/contact"
                  onClick={() => setHireOpen(false)}
                  className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
                >
                  Talk to us ›
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile dropdown — same lg threshold as the burger that opens it */}
        <div
          className="lg:hidden mt-2 max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "min(2000px, 80vh)" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_DROPDOWN_STYLE}
          >
            {/* "Hire an Angel" — inline expandable list, not a flyout (flyouts don't work well nested in an open mobile sheet) */}
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
              {/* Same card content as the desktop mega-menu (photo, name, role, use cases,
                  pill-shaped header) — 1 per row below sm (640px), 2-up from sm up to the lg
                  breakpoint where this whole mobile panel gives way to the desktop mega-menu.
                  Each persona is its own bordered card with a gap between them (matching
                  desktop), not flush columns separated by border-r/border-b lines. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {PERSONAS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/hire-an-angel/${p.slug}`}
                    onClick={close}
                    className="flex flex-col rounded-xl border border-black/[0.08] px-3 py-3 hover:border-black/20 hover:bg-black/[0.02] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                  >
                    <div className="flex items-center gap-2.5 rounded-full bg-black/[0.035] pl-1 pr-3 py-1">
                      <img
                        src={p.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p title={p.label} className="text-[13.5px] font-semibold text-[#111] truncate">{p.label}</p>
                        <p title={p.dropdownRole} className="text-[11px] text-black/50 truncate">{p.dropdownRole}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-black/[0.06]">
                      <p className="text-[9.5px] font-medium uppercase tracking-widest text-black/40">
                        Use Cases
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {p.useCases?.map((uc) => (
                          <li key={uc} className="flex items-center gap-2 text-[12px] font-medium text-[#333]">
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
            {isHopeAngel ? (
              <a
                href="#share-your-mission"
                onClick={close}
                className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
              >
                Share Your Mission
              </a>
            ) : (
              <Link
                href={missionHref}
                onClick={close}
                className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
              >
                Share Your Mission
              </Link>
            )}

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
