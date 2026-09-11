"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { PERSONAS } from "@/lib/personas";

// Matches the reference theme's nav surface: a 75%-opaque white pill rather than the
// barely-there 30% warm tint this used before, so the bar reads as a solid surface over
// the hero video instead of letting it bleed through.
const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(255,255,255,0.75)",
  boxShadow: "0 10px 30px -12px rgba(0,0,0,0.12)",
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
  const [personasOpen, setPersonasOpen] = useState(false);
  // Desktop "Hire an Angel" mega-menu: hand-rolled instead of Radix's DropdownMenu, because
  // DropdownMenuContent anchors/aligns itself to the trigger button — fine for a small popover,
  // but this panel needs to sit centered under the whole nav bar regardless of where the
  // trigger pill happens to sit in it (it's off to the right, not centered, since the
  // Buttons_update_header.png redesign right-aligned the nav group).
  const [hireOpen, setHireOpen] = useState(false);
  const hireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hireOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (hireRef.current && !hireRef.current.contains(e.target as Node)) {
        setHireOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setHireOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hireOpen]);

  const close = () => {
    setOpen(false);
    setPersonasOpen(false);
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
              onClick={() => setHireOpen((v) => !v)}
              aria-expanded={hireOpen}
              className={`group outline-none cursor-pointer ${NAV_PILL}`}
            >
              Hire an Angel
              <span className={`text-[9px] transition-transform duration-200 ${hireOpen ? "rotate-180" : ""}`}>
                ⌄
              </span>
            </button>

            <Link href="/behind-the-angels" className={NAV_PILL}>
              Behind the Angels
            </Link>
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

        {/* Mega-menu panel (requirements/Hire_an_angel_dropdown.png) — a sibling of <nav>,
            absolutely positioned and centered under the whole nav bar via the outer wrapper's
            `relative` + this panel's `inset-x-0 flex justify-center`, rather than anchored to
            the trigger pill's own position (which sits off to the right, not centered). Hidden
            below lg as a defensive guard: hireOpen can only be set true by the desktop trigger
            above, which is itself only reachable at lg+, but this covers resizing the window
            down while the menu is still open. */}
        {hireOpen && (
          <div className="hidden lg:flex absolute inset-x-0 top-full mt-2 justify-center z-50">
            <div
              className="w-[min(94vw,980px)] rounded-2xl border border-black/[0.06] overflow-hidden"
              style={NAV_STYLE}
            >
              <div className="grid grid-cols-4 divide-x divide-black/[0.06] px-2">
                {PERSONAS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/hire-an-angel/${p.slug}`}
                    onClick={() => setHireOpen(false)}
                    className="flex flex-col px-4 py-5 cursor-pointer hover:bg-black/[0.02] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-[#111] truncate">{p.label}</p>
                        <p className="text-[12.5px] text-black/50 truncate">{p.dropdownRole}</p>
                      </div>
                      <span className="text-black/30 text-sm shrink-0">›</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/[0.06]">
                      <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                        Use Cases
                      </p>
                      <ul className="mt-2.5 flex flex-col gap-1.5">
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
            style={NAV_STYLE}
          >
            {/* "Hire an Angel" — inline expandable list, not a flyout (flyouts don't work well nested in an open mobile sheet) */}
            <button
              onClick={() => setPersonasOpen((v) => !v)}
              className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Hire an Angel
              <span
                className="text-[10px] transition-transform duration-200"
                style={{ transform: personasOpen ? "rotate(180deg)" : "none" }}
              >
                ⌄
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{ maxHeight: personasOpen ? "1400px" : "0px" }}
            >
              {/* Same card content as the desktop mega-menu (photo, name, role, use cases): 1 per
                  row on very small screens, 2-up from sm (640px) up to the lg breakpoint where
                  this whole mobile panel gives way to the desktop mega-menu. border-r/border-b
                  on index give the same flush line separation as the desktop grid's
                  divide-x/divide-y, since Tailwind's `divide` utilities don't line up correctly
                  once flex-wrap puts items on more than one row — and the divider pattern itself
                  has to change between the 1-col and 2-col layouts (a bottom border on every
                  item but the last vs. only on the first row). */}
              <div className="flex flex-wrap border-t border-black/[0.06]">
                {PERSONAS.map((p, i) => {
                  const bottomAtBase = i < PERSONAS.length - 1; // 1-col: every item but the last
                  const bottomAtSm = i < PERSONAS.length - 2; // 2-col: only the first row
                  const rightAtSm = i % 2 === 0; // 2-col: left column only
                  return (
                    <Link
                      key={p.id}
                      href={`/hire-an-angel/${p.slug}`}
                      onClick={close}
                      className={`w-full sm:w-1/2 flex flex-col px-4 py-3 hover:bg-black/[0.03] transition-colors [font-family:system-ui,-apple-system,sans-serif] border-black/[0.06] ${
                        bottomAtBase ? "border-b" : ""
                      } ${bottomAtBase && !bottomAtSm ? "sm:border-b-0" : ""} ${
                        rightAtSm ? "sm:border-r" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt=""
                          aria-hidden="true"
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold text-[#111] truncate">{p.label}</p>
                          <p className="text-[11px] text-black/50 truncate">{p.dropdownRole}</p>
                        </div>
                      </div>

                      <div className="mt-2.5">
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
                  );
                })}
              </div>
            </div>

            <Link
              href="/behind-the-angels"
              onClick={close}
              className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Behind the Angels
            </Link>
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
