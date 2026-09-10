"use client";

import { useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const close = () => {
    setOpen(false);
    setPersonasOpen(false);
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-6 md:px-12 lg:px-20 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-6xl mx-auto">
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
            {/* modal={false}: Radix's default (modal) locks body scroll while the menu is
                open, which hides the page scrollbar and shifts the layout sideways on every
                open/close. A nav dropdown doesn't need to trap focus or block the page. */}
            <DropdownMenu modal={false}>
              {/* Radix sets data-state="open"/"closed" on the trigger itself — `group` here
                  lets the chevron span react to it directly, no extra state needed. */}
              <DropdownMenuTrigger className={`group outline-none cursor-pointer ${NAV_PILL}`}>
                Hire an Angel
                <span className="text-[9px] transition-transform duration-200 group-data-[state=open]:rotate-180">
                  ⌄
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="rounded-2xl border border-black/[0.06] p-1.5 min-w-[220px]"
                style={NAV_STYLE}
              >
                {PERSONAS.map((p) => (
                  // asChild: renders the <a> itself as the menu item (real navigation, works
                  // with right-click/open-in-new-tab) while Radix still handles focus and
                  // closes the dropdown on click, same as the onSelect it replaces.
                  <DropdownMenuItem key={p.id} asChild>
                    <Link
                      href={`/hire-an-angel/${p.slug}`}
                      className={`rounded-xl px-3 py-2.5 cursor-pointer focus:bg-black/[0.05] focus:text-[#111] ${NAV_ITEM}`}
                    >
                      {p.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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

        {/* Mobile dropdown — same lg threshold as the burger that opens it */}
        <div
          className="lg:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "480px" : "0px", opacity: open ? 1 : 0 }}
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
              style={{ maxHeight: personasOpen ? "220px" : "0px" }}
            >
              <div className="flex flex-col pl-4">
                {PERSONAS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/hire-an-angel/${p.slug}`}
                    onClick={close}
                    className={`text-left px-4 py-2.5 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
                  >
                    {p.label}
                  </Link>
                ))}
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
