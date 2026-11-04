"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { PERSONAS } from "@/lib/personas";
import { ThemeToggle } from "@/components/theme-toggle";

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
// background/boxShadow read from CSS variables (globals.css) rather than hardcoded values —
// Tailwind's dark:/purple: variants only ever apply to className, never to an inline `style`
// object like this one (needed here for backdrop-filter blur), so the three themes drive this
// through the var()s' own .dark/.purple overrides instead of conditional logic in this file.
const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "var(--nav-bg)",
  boxShadow: "var(--nav-shadow)",
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
  background: "var(--nav-dropdown-bg)",
} as const;

// Menu-item typography, matching the reference theme's nav: 14px / weight 500 / #4A4A4A,
// with no extra letter-spacing. Hover darkens to near-black.
// font-family is set explicitly (not inherited font-sans/Geist) to match
// act_angel_frontend_backup's own nav, which sets this same system-ui stack on its links
// rather than using the site's Geist font — applied as a class here (not inherited from a
// wrapper) so it still reaches the dropdown popover, which portals outside the nav in the DOM.
const NAV_ITEM =
  "text-[14px] font-medium text-[#4A4A4A] hover:text-[#111] transition-colors duration-200 [font-family:system-ui,-apple-system,sans-serif] dark:text-white/60 dark:hover:text-white purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF]";

// Nav pill buttons (requirements/Buttons_update_header.png): "Hire an Angel", "Behind the
// Angels" and "Contact" are now outlined pills the same size as Get Started (46px tall, 12px
// uppercase/letterspaced) instead of plain text links.
// inline-flex (not flex) + shrink-0 + whitespace-nowrap: `flex` alone is block-level, so this
// stretches to fill its parent's width wherever it isn't already a flex child sized by its
// siblings (the mobile menu's standalone "Get Started" link, in particular) — inline-flex keeps
// it sized to its own content in both contexts. shrink-0/whitespace-nowrap stop the label from
// wrapping or the pill from getting squeezed when the desktop row is short on space.
// AAA-UI-DM-WEB-001's approved values (Inter font, 9px/18px padding, #ABA6D9 text) applied to
// the navbar pills too, per follow-up request — h-auto on the base/purple pair overrides the
// old shared h-[46px] since 9px vertical padding + this text's line-height comes out shorter
// than that fixed height; py-[9px] replaces it instead of stacking on top of it. Extended to
// light theme too (explicit request) — dark: gets its own h-[46px]/px-6/font-sans overrides
// to stay exactly as it was, since black theme isn't part of this round of changes.
// #ABA6D9 text against the card-surface color (#1C1A56) computes to exactly the approved 6.9
// contrast (it was 7.89 against the old #12103C bar — see git history). No explicit pill
// background needed for that any more: AAA-UI-DM-WEB-002 moved --nav-bg itself to #1C1A56, so
// a transparent pill already inherits the right effective background from the bar behind it.
// Not extended to light theme — its near-black text already has very high contrast regardless.
const NAV_PILL =
  "inline-flex items-center justify-center gap-[6px] h-auto py-[9px] px-[18px] rounded-full border border-[#DADADA] hover:border-[#b8b8b8] text-[12px] font-medium uppercase tracking-[0.08em] text-[#111] whitespace-nowrap shrink-0 transition-colors duration-200 font-[Inter,sans-serif] dark:h-[46px] dark:py-0 dark:px-6 dark:font-sans dark:border-white/15 dark:hover:border-white/35 dark:text-white purple:h-auto purple:py-[9px] purple:px-[18px] purple:font-[Inter,sans-serif] purple:border-[#B79CFF]/25 purple:hover:border-[#B79CFF]/50 purple:text-[#ABA6D9] purple:hover:text-[#F6F4FF]";

// Get Started is filled — #5D4387 is a mid-tone step sampled from the logo icon's own gradient,
// lightening to #7168A0 on hover (both from the reference screenshot).
// dark: (the black theme specifically, not purple) inverts this to a white pill/black text —
// the purple fill reads as a muddy, low-contrast accent against a near-black bar, where a plain
// white button pops the way the purple one does against the light bar.
// purple: overrides the light-theme fill with the client reference palette's own accent
// (#7C5CFF, the solid color its "Hire a Sales Angel" buttons and active nav pill use).
// h-auto + the same py-[9px]/px-[18px]/Inter as NAV_PILL above — matches Get Started's size to
// the other 3 nav pills (was the fixed h-[46px]/px-[26px] every other theme still uses).
// Extended to light theme (explicit request); dark: gets h-[46px]/px-[26px]/font-sans back to
// stay exactly as it was.
const NAV_CTA =
  "inline-flex items-center justify-center h-auto py-[9px] px-[18px] rounded-full bg-[#5D4387] hover:bg-[#7168A0] text-[12px] font-medium uppercase tracking-[0.08em] text-white whitespace-nowrap shrink-0 transition-colors duration-200 font-[Inter,sans-serif] dark:h-[46px] dark:py-0 dark:px-[26px] dark:font-sans dark:bg-white dark:text-black dark:hover:bg-white/85 purple:h-auto purple:py-[9px] purple:px-[18px] purple:font-[Inter,sans-serif] purple:bg-[#7C5CFF] purple:hover:bg-[#8F72FF]";

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
  // The panel scrolls internally on short screens (max-h + overflow-y-auto below), which means
  // the Business Functions tooltip can no longer be a plain CSS absolute child of its row — a
  // scrollable ancestor clips anything that tries to overflow it on any axis, including
  // sideways. So the tooltip is positioned with real coordinates instead (measured from the
  // hovered row's own DOM rect) and rendered as a `position: fixed` sibling outside the
  // scrolling container, where that clipping can't reach it. positionTooltip recomputes those
  // coordinates — called on hover, and again on every scroll of the panel so the tooltip tracks
  // the row instead of drifting as the list scrolls underneath it.
  const [tooltip, setTooltip] = useState<{ id: string; style: React.CSSProperties } | null>(null);
  const pillRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const panelScrollRef = useRef<HTMLDivElement>(null);
  // Scrolling moves rows under a cursor that hasn't itself moved, but a wheel scroll alone
  // doesn't fire mouseenter/mouseleave on whatever's now underneath it — browsers only
  // recompute hover state from actual pointer movement. Without tracking the cursor separately,
  // the onScroll handler below would just keep re-positioning the tooltip for whichever persona
  // was hovered *before* the scroll, even once a different row has scrolled in under it. This
  // tracks the last known cursor position so the scroll handler can look up which row is
  // actually there now, the same hit-testing a real mouseenter would have done.
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  // Generous estimate of the tooltip's rendered height (heading + up to ~5 lines + padding) —
  // used only to decide top- vs bottom-anchoring, so it doesn't need to be exact, just safely
  // on the high side.
  const TOOLTIP_HEIGHT_ESTIMATE = 190;

  function positionTooltip(personaId: string) {
    const pill = pillRefs.current[personaId];
    const panel = panelScrollRef.current;
    if (!pill || !panel) return;
    const rect = pill.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    // Row has scrolled out of the panel's own visible area — hide rather than show a tooltip
    // floating next to nothing.
    if (rect.bottom <= panelRect.top || rect.top >= panelRect.bottom) {
      setTooltip(null);
      return;
    }
    // Measured from the panel's own right edge (not the pill's), which sits inset from it by
    // the row's own padding — so this is an exact 6px gap from the dropdown card itself, not an
    // incidental one that happens to shrink/grow with the row's padding.
    const left = panelRect.right + 6;
    const overflowsBottom = rect.top + TOOLTIP_HEIGHT_ESTIMATE > window.innerHeight;
    setTooltip({
      id: personaId,
      style: overflowsBottom
        ? { left, bottom: window.innerHeight - rect.bottom }
        : { left, top: rect.top },
    });
  }

  // Scroll-driven re-check: finds whichever row's pill now actually contains the last known
  // cursor position (not just "wherever the originally-hovered persona's row scrolled to"), and
  // switches the tooltip to that persona — or hides it if the cursor isn't over any row anymore
  // (e.g. it's now over a gap, or the panel scrolled enough that nothing is under it).
  function updateTooltipAtCursor() {
    const pos = lastMouseRef.current;
    if (!pos) return;
    const match = Object.entries(pillRefs.current).find(([, el]) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return pos.x >= r.left && pos.x <= r.right && pos.y >= r.top && pos.y <= r.bottom;
    });
    if (match) positionTooltip(match[0]);
    else setTooltip(null);
  }

  // Desktop "Behind the Angels" dropdown — a plain 2-item list (About Us / Our Social Impact),
  // anchored to its own trigger (behindRef) the same way.
  const [behindOpen, setBehindOpen] = useState(false);
  const behindRef = useRef<HTMLDivElement>(null);

  // All desktop dropdowns open on hover rather than click. A short delay on close (instead of
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

  // Chrome's device-emulation ("responsive") mode, and real touch devices, synthesize
  // mouseenter/mouseleave around a tap so hover-reliant sites still sort of work — a single tap
  // on the trigger can fire enter (opens) immediately followed by leave (schedules a close),
  // racing against the click handler. That's what testers saw: Hire an Angel getting stuck open
  // (a later synthetic enter on the panel itself cancels the scheduled close) and Behind the
  // Angels flickering shut (nothing cancels its close, so the scheduled 150ms close just fires).
  // e.pointerType reliably distinguishes a real mouse from touch/pen even when the browser also
  // emits legacy mouse events for compatibility — these wrappers use it to skip the hover
  // open/close logic entirely for touch, so only the click/tap toggle below drives it there,
  // while real mouse users keep the existing hover behavior untouched.
  const onHirePointerEnter = (e: React.PointerEvent) => { if (e.pointerType === "mouse") openHire(); };
  const onHirePointerLeave = (e: React.PointerEvent) => { if (e.pointerType === "mouse") scheduleCloseHire(); };
  const onBehindPointerEnter = (e: React.PointerEvent) => { if (e.pointerType === "mouse") openBehind(); };
  const onBehindPointerLeave = (e: React.PointerEvent) => { if (e.pointerType === "mouse") scheduleCloseBehind(); };

  // Click is now a true toggle rather than "always open" — on mouse this is just a harmless
  // bonus (hover already opens/closes it), but on touch it's the only way to close a trigger
  // that's already open, since there's no hover-out to rely on.
  const toggleHire = () => {
    if (hireOpen) {
      if (hireCloseTimer.current) { clearTimeout(hireCloseTimer.current); hireCloseTimer.current = null; }
      setHireOpen(false);
    } else {
      openHire();
    }
  };
  const toggleBehind = () => {
    if (behindOpen) {
      if (behindCloseTimer.current) { clearTimeout(behindCloseTimer.current); behindCloseTimer.current = null; }
      setBehindOpen(false);
    } else {
      openBehind();
    }
  };

  // Clears any pending close timer left running if the nav unmounts mid-delay.
  useEffect(() => {
    return () => {
      if (hireCloseTimer.current) clearTimeout(hireCloseTimer.current);
      if (behindCloseTimer.current) clearTimeout(behindCloseTimer.current);
    };
  }, []);

  // Covers every way hireOpen can become false (hover-delay timeout, switching to Behind the
  // Angels, outside click, Escape) in one place, rather than remembering to clear the tooltip
  // at each of those call sites individually.
  useEffect(() => {
    if (!hireOpen) setTooltip(null);
  }, [hireOpen]);

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
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15"
          style={NAV_STYLE}
        >
          <Link
            href="/"
            aria-label="Act Angel AI — go to homepage"
            className="flex items-center gap-2 font-pixel text-xs tracking-[0.25em] text-black/70"
          >
            {/* brightness-0 invert: the logo file's wordmark is dark navy text, invisible
                against a dark/purple bar. There's no separate light-logo asset, so this flips it
                to a flat white silhouette instead — loses the icon's purple gradient, but stays
                legible, which matters more for a nav mark. */}
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden="true"
              className="h-12 w-auto dark:brightness-0 dark:invert purple:brightness-0 purple:invert"
            />
          </Link>

          {/* Desktop group — all 4 buttons (3 outlined pills + filled Get Started) right-aligned
              as one cluster next to the logo, per requirements/Buttons_update_header.png.
              Switches in at a custom 1180px (not Tailwind's lg/1024px): below that, screens are
              realistically tablet-sized, where there's no real hover to drive these dropdowns —
              the burger menu's accordion is click-based natively, so it's used for that whole
              range instead rather than making the hover-pills click-togglable there too. */}
          <div className="hidden [@media(min-width:1180px)]:flex items-center gap-3">
            <div
              ref={hireRef}
              className="relative"
              onPointerEnter={onHirePointerEnter}
              onPointerLeave={onHirePointerLeave}
            >
              <button
                onClick={toggleHire}
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
                  className="hidden [@media(min-width:1180px)]:block absolute left-0 top-full mt-5 z-50"
                  onPointerEnter={onHirePointerEnter}
                  onPointerLeave={onHirePointerLeave}
                >
                  {/* max-h + overflow-y-auto: on a short viewport this scrolls internally
                      instead of running off the bottom of the screen. That's also why the
                      Business Functions tooltip below is no longer a CSS absolute child in here
                      — a scrolling ancestor clips anything that overflows it on any axis,
                      including the tooltip's sideways pop-out. */}
                  <div
                    ref={panelScrollRef}
                    onScroll={() => tooltip && updateTooltipAtCursor()}
                    onMouseMove={(e) => { lastMouseRef.current = { x: e.clientX, y: e.clientY }; }}
                    className="themed-scrollbar w-[410px] max-h-[calc(100vh-160px)] overflow-y-auto rounded-2xl border border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15"
                    style={NAV_DROPDOWN_STYLE}
                  >
                    <div className="flex flex-col">
                      {PERSONAS.map((p) => (
                        <Link
                          key={p.id}
                          href={`/hire-an-angel/${p.slug}`}
                          onClick={() => setHireOpen(false)}
                          onPointerEnter={(e) => {
                            // Same fix as the dropdown trigger's hover gating above — without
                            // this, a tap on a row (which, under touch, still synthesizes a
                            // mouseenter for hover-reliant sites) can pop the tooltip open with
                            // no reliable "leave" event to ever clear it again.
                            if (e.pointerType !== "mouse") return;
                            lastMouseRef.current = { x: e.clientX, y: e.clientY };
                            positionTooltip(p.id);
                          }}
                          onPointerLeave={(e) => { if (e.pointerType === "mouse") setTooltip(null); }}
                          className="group relative flex flex-col border-b border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 last:border-b-0 px-3 transition-colors duration-200 hover:bg-[#EDE9F7]/70 dark:hover:bg-white/5 purple:hover:bg-[#7C5CFF]/10 [font-family:system-ui,-apple-system,sans-serif]"
                        >
                          {/* AAA-UI-DM-WEB-003: purple:bg-[#272269] is a solid color, not the
                              translucent rgba(124,92,255,0.12) this used to be — that alpha-
                              blended over whatever sat behind the dropdown, so the title text's
                              actual contrast drifted with scroll position/backdrop, and the
                              0.12→0.20 hover jump alone dropped it from ~12.7 to ~11.5. #272269
                              is solved to land title text (#F6F4FF) at exactly the approved
                              12.71 contrast deterministically, same value on hover since hover
                              no longer changes this background at all (the existing pl-3→18px
                              padding shift still gives hover feedback). */}
                          <div
                            ref={(el) => { pillRefs.current[p.id] = el; }}
                            className="my-4 flex items-center gap-3 rounded-lg bg-[#5D4387]/10 pl-3 pr-3 py-2.5 transition-[background-color,padding] duration-200 group-hover:bg-[#5D4387]/30 group-hover:pl-[18px] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.12] purple:bg-[#272269] purple:group-hover:bg-[#272269]"
                          >
                            <img
                              src={p.avatar}
                              alt=""
                              aria-hidden="true"
                              className="w-[75px] h-[75px] rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p title={p.label} className="text-[16px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF] truncate">{p.label}</p>
                              <p title={p.dropdownRole} className="text-[13px] text-black/50 dark:text-white/55 purple:text-[#ABA6D9] truncate">{p.dropdownRole}</p>
                            </div>
                            <span className="text-black/30 dark:text-white/30 purple:text-[#716C9E] text-sm shrink-0">›</span>
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
              onPointerEnter={onBehindPointerEnter}
              onPointerLeave={onBehindPointerLeave}
            >
              <button
                onClick={toggleBehind}
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-[440px] rounded-2xl border border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 overflow-hidden z-50 p-3"
                  style={NAV_DROPDOWN_STYLE}
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {BEHIND_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setBehindOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.08] p-4 cursor-pointer hover:border-black/20 hover:bg-black/[0.02] dark:border-white/10 dark:hover:border-white/25 dark:hover:bg-white/5 purple:border-[#B79CFF]/15 purple:hover:border-[#7C5CFF]/40 purple:hover:bg-[#7C5CFF]/10 transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                      >
                        <p className="text-[14px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">{item.title}</p>
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
            <ThemeToggle />
          </div>

          {/* Burger — shown below 1180px, same threshold as the desktop group above */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="[@media(min-width:1180px)]:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/10 purple:hover:bg-[#7C5CFF]/12 transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-px bg-black/60 dark:bg-white/70 purple:bg-[#F6F4FF]/85 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 dark:bg-white/70 purple:bg-[#F6F4FF]/85 transition-all duration-300"
              style={{
                width: "18px",
                opacity: open ? 0 : 1,
                transform: open ? "scaleX(0)" : "none",
              }}
            />
            <span
              className="block h-px bg-black/60 dark:bg-white/70 purple:bg-[#F6F4FF]/85 transition-all duration-300 origin-center"
              style={{
                width: "18px",
                transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>

        {/* Business Functions tooltip — a position:fixed sibling of <nav> (not a descendant of
            it, and not nested inside the scrollable panel either), positioned from the hovered
            row's real getBoundingClientRect() via positionTooltip(). It has to sit outside
            <nav> specifically: NAV_STYLE applies backdropFilter to <nav> itself, and a
            backdrop-filter establishes a new containing block for position:fixed descendants —
            so a fixed element nested inside <nav> is positioned relative to <nav>'s own box,
            not the true viewport, which is what caused the tooltip to render far off from
            where it should've appeared. top- or bottom-anchored depending on whether it would
            otherwise run off the bottom of the viewport; pointer-events-none since it's pure
            display, nothing inside it to interact with. */}
        {hireOpen && tooltip && (() => {
          const p = PERSONAS.find((x) => x.id === tooltip.id);
          if (!p) return null;
          return (
            <div
              key={tooltip.id}
              className="hidden [@media(min-width:1180px)]:block fixed w-[240px] rounded-xl border border-black/[0.06] bg-[#EDE9F7] dark:bg-[#1c1c1c] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] z-50 pointer-events-none"
              style={{ ...tooltip.style, transformOrigin: "left center", animation: "tooltip-in 180ms ease" }}
            >
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40 dark:text-white/45 purple:text-[#716C9E]">
                Business Functions
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {p.useCases?.map((uc) => (
                  <li key={uc} className="flex items-center gap-2 text-[13px] font-medium text-[#333] dark:text-white/90 purple:text-[#F6F4FF]">
                    <span className="w-1 h-1 rounded-full bg-[#5D4387] dark:bg-white/60 purple:bg-[#7C5CFF] shrink-0" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Mobile dropdown — same 1180px threshold as the burger that opens it */}
        <div
          className="[@media(min-width:1180px)]:hidden mt-2 max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "min(2000px, 80vh)" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 px-2 py-2 flex flex-col"
            style={NAV_DROPDOWN_STYLE}
          >
            {/* "Hire an Angel" — mirrors the desktop version's vertical stack/pill-card look: a
                single column, rounded-lg (not circular) avatar, pill-card with the same purple
                tint. Touch has no hover, so Use Cases is revealed by tapping a row's own chevron
                (expandedPersonaId) instead, and shown inline below the row rather than as a side
                flyout — there isn't room to pop one out to the right on a phone screen. */}
            <button
              onClick={() => setPersonasOpen((v) => !v)}
              className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/5 purple:hover:bg-[#7C5CFF]/10 rounded-xl ${NAV_ITEM}`}
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
                    <div key={p.id} className="border-b border-black/[0.06] dark:border-white/10 purple:border-[#B79CFF]/15 last:border-b-0">
                      <div className="flex items-center gap-2 py-2">
                        <Link
                          href={`/hire-an-angel/${p.slug}`}
                          onClick={close}
                          className="flex flex-1 min-w-0 items-center gap-3 rounded-lg bg-[#5D4387]/10 dark:bg-white/[0.06] purple:bg-[#272269] pl-3 pr-3 py-2.5 [font-family:system-ui,-apple-system,sans-serif]"
                        >
                          <img
                            src={p.avatar}
                            alt=""
                            aria-hidden="true"
                            className="w-[75px] h-[75px] rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p title={p.label} className="text-[16px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF] truncate">{p.label}</p>
                            <p title={p.dropdownRole} className="text-[13px] text-black/50 dark:text-white/55 purple:text-[#ABA6D9] truncate">{p.dropdownRole}</p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpandedPersonaId(isExpanded ? null : p.id)}
                          aria-expanded={isExpanded}
                          aria-label={`Toggle ${p.label} use cases`}
                          className="p-2 -m-2 shrink-0 text-black/40 dark:text-white/40 purple:text-[#716C9E]"
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
                          <div className="flex-1 min-w-0 rounded-xl bg-[#EDE9F7] dark:bg-[#1c1c1c] purple:bg-[#1C1A56] p-4">
                            <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40 dark:text-white/45 purple:text-[#716C9E]">
                              Business Functions
                            </p>
                            <ul className="mt-2 flex flex-col gap-1.5">
                              {p.useCases?.map((uc) => (
                                <li key={uc} className="flex items-center gap-2 text-[13px] font-medium text-[#333] dark:text-white/90 purple:text-[#F6F4FF]">
                                  <span className="w-1 h-1 rounded-full bg-[#5D4387] dark:bg-white/60 purple:bg-[#7C5CFF] shrink-0" />
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
              className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/5 purple:hover:bg-[#7C5CFF]/10 rounded-xl ${NAV_ITEM}`}
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
                    className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.08] p-3 hover:border-black/20 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/25 dark:hover:bg-white/5 purple:border-[#B79CFF]/15 purple:hover:border-[#7C5CFF]/40 purple:hover:bg-[#7C5CFF]/10 transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                  >
                    <p className="text-[13px] font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">{item.title}</p>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/contact"
              onClick={close}
              className={`px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/5 purple:hover:bg-[#7C5CFF]/10 rounded-xl ${NAV_ITEM}`}
            >
              Contact
            </Link>

            <div className="mt-1 px-2 pb-1 flex justify-center items-center gap-3">
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
