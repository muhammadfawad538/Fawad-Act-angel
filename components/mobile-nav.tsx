"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERSONAS, type PersonaId } from "@/lib/personas";

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

// The "Get Started" CTA is styled separately in the reference: smaller, uppercase and
// letterspaced, in full black on a white pill rather than the muted grey of the links.
const NAV_CTA =
  "text-[12px] font-medium uppercase tracking-[0.08em] text-[#111] transition-colors duration-200";

interface MobileNavProps {
  onSelectPersona?: (id: PersonaId) => void;
  // TODO(Step 12): wire to open the "Meet Your Angel" lead-capture modal.
  onGetStarted?: () => void;
}

export function MobileNav({ onSelectPersona, onGetStarted }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [personasOpen, setPersonasOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setPersonasOpen(false);
  };

  const selectPersona = (id: PersonaId) => {
    onSelectPersona?.(id);
    close();
  };

  const getStarted = () => {
    onGetStarted?.();
    close();
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-6 md:px-12 lg:px-20 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-6xl mx-auto">
        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          <a
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
          </a>

          {/* Desktop links — gap-8 (32px) matches the reference's spacing between items */}
          <div className="hidden md:flex items-center gap-8">
            {/* modal={false}: Radix's default (modal) locks body scroll while the menu is
                open, which hides the page scrollbar and shifts the layout sideways on every
                open/close. A nav dropdown doesn't need to trap focus or block the page. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                className={`flex items-center gap-[5px] outline-none ${NAV_ITEM}`}
              >
                Hire an Angel
                <span className="text-[9px]">⌄</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="rounded-2xl border border-black/[0.06] p-1.5 min-w-[220px]"
                style={NAV_STYLE}
              >
                {PERSONAS.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onSelect={() => selectPersona(p.id)}
                    className={`rounded-xl px-3 py-2.5 cursor-pointer focus:bg-black/[0.05] focus:text-[#111] ${NAV_ITEM}`}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="/behind-the-angels" className={NAV_ITEM}>
              Behind the Angels
            </a>
            <a href="#contact" className={NAV_ITEM}>
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={getStarted}
              className={`hidden md:block px-[26px] h-[46px] rounded-full bg-white border border-[#DADADA] hover:border-[#b8b8b8] ${NAV_CTA}`}
            >
              Get Started
            </button>

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
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
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
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
                  <button
                    key={p.id}
                    onClick={() => selectPersona(p.id)}
                    className={`text-left px-4 py-2.5 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="/behind-the-angels"
              onClick={close}
              className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Behind the Angels
            </a>
            <a
              href="#contact"
              onClick={close}
              className={`px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
            >
              Contact
            </a>

            <div className="mt-1 px-2 pb-1">
              <button
                onClick={getStarted}
                className={`w-full px-4 h-[46px] rounded-full bg-white border border-[#DADADA] hover:border-[#b8b8b8] ${NAV_CTA}`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
