"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

// Matches the reference theme's nav surface: a 75%-opaque white pill rather than the
// barely-there 30% warm tint this used before, so the bar reads as a solid surface over
// the hero video instead of letting it bleed through.
const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(255,255,255,0.75)",
  boxShadow: "0 10px 30px -12px rgba(0,0,0,0.12)",
} as const;

// Same surface, more opaque — for the floating dropdown/accordion panels rather than the
// always-at-the-top main bar.
const NAV_DROPDOWN_STYLE = {
  ...NAV_STYLE,
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  background: "rgba(255,255,255,0.99)",
} as const;

// Version 5 only — same surface treatment, light-purple tinted (the site's existing #EDE9F7
// wash) instead of white, so the whole panel reads as purple rather than just its accents.
const NAV_DROPDOWN_STYLE_PURPLE = {
  ...NAV_DROPDOWN_STYLE,
  background: "rgba(237,233,247,0.99)",
} as const;

const NAV_ITEM =
  "text-[14px] font-medium text-[#4A4A4A] hover:text-[#111] transition-colors duration-200 [font-family:system-ui,-apple-system,sans-serif]";

const NAV_PILL =
  "inline-flex items-center justify-center gap-[6px] h-[46px] px-5 rounded-full border border-[#DADADA] hover:border-[#b8b8b8] text-[12px] font-medium uppercase tracking-[0.08em] text-[#111] whitespace-nowrap shrink-0 transition-colors duration-200";

// One entry per candidate design. Each id has its own desktop + mobile render function below
// (HireDropdownDesktop / HireDropdownMobile switch on it) so a given version can be reworked in
// isolation without touching the other 3. All 4 start out identical — clones of the current live
// dropdown — and diverge as each one gets worked on.
const VARIANTS = [1, 2, 3, 4, 5, 6] as const;
type VariantId = (typeof VARIANTS)[number];

// Version 1: a vertical stack (not a grid) of all 5 personas — name/role always visible, Use
// Cases hidden until that specific row is hovered. Stacking (rather than a grid) is what lets
// one row grow taller on hover without reflowing/misaligning its neighbors the way a multi-
// column grid would. group-hover (CSS only, no per-row state needed) drives the reveal since
// each row's own `group` wrapper scopes the hover to just that row.
function HireDropdownDesktopV1({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col">
      {PERSONAS.map((p) => (
        <Link
          key={p.id}
          href={`/hire-an-angel/${p.slug}`}
          onClick={onNavigate}
          className="group flex flex-col border-b border-black/[0.06] last:border-b-0 px-5 transition-colors duration-200 hover:bg-[#EDE9F7]/30 [font-family:system-ui,-apple-system,sans-serif]"
        >
          <div className="flex items-center gap-3 py-4">
            <img
              src={p.avatar}
              alt=""
              aria-hidden="true"
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p title={p.label} className="text-[16px] font-semibold text-[#111] truncate">{p.label}</p>
              <p title={p.dropdownRole} className="text-[13px] text-black/50 truncate">{p.dropdownRole}</p>
            </div>
            <span className="text-black/30 text-sm shrink-0">›</span>
          </div>

          {/* max-h-0 at rest, expanding on hover — the generous max-h value just needs to clear
              the tallest possible Use Cases list; overflow-hidden clips the collapsed state. */}
          <div className="overflow-hidden max-h-0 group-hover:max-h-[220px] transition-[max-height] duration-300 ease-in-out">
            <div className="pb-4 pt-1">
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                Use Cases
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                {p.useCases?.map((uc) => (
                  <li key={uc} className="flex items-center gap-2 text-[13px] font-medium text-[#333]">
                    <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Version 2: identical to V1 (hover-reveal stack) except the Use Cases list stacks vertically
// (one per line) instead of wrapping in a row, and the panel itself (see MobileNavLab's
// per-variant width below) shrinks to fit its content instead of spanning the full bar width.
function HireDropdownDesktopV2({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col">
      {PERSONAS.map((p) => (
        <Link
          key={p.id}
          href={`/hire-an-angel/${p.slug}`}
          onClick={onNavigate}
          className="group flex flex-col border-b border-black/[0.06] last:border-b-0 px-3 transition-colors duration-200 hover:bg-[#EDE9F7]/70 [font-family:system-ui,-apple-system,sans-serif]"
        >
          <div className="my-4 flex items-center gap-3 rounded-lg bg-[#5D4387]/10 px-3 py-2.5 transition-colors duration-200 group-hover:bg-[#5D4387]/30">
            <img
              src={p.avatar}
              alt=""
              aria-hidden="true"
              className="w-[58px] h-[58px] rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p title={p.label} className="text-[16px] font-semibold text-[#111] truncate">{p.label}</p>
              <p title={p.dropdownRole} className="text-[13px] text-black/50 truncate">{p.dropdownRole}</p>
            </div>
            <span className="text-black/30 text-sm shrink-0">›</span>
          </div>

          <div className="overflow-hidden max-h-0 group-hover:max-h-[260px] transition-[max-height] duration-300 ease-in-out">
            <div className="pb-4 pt-1">
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                Use Cases
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
          </div>
        </Link>
      ))}
    </div>
  );
}

// Version 3: same card grid as the default design below, except the avatar+title header is a
// rectangular rounded block (rounded-xl) instead of a pill (rounded-full).
function HireDropdownDesktopV3({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 p-3">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            href={`/hire-an-angel/${p.slug}`}
            onClick={onNavigate}
            className="group flex flex-col rounded-xl border border-[#5D4387]/20 px-5 py-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#5D4387]/50 hover:shadow-[0_16px_32px_-16px_rgba(93,67,135,0.4)] [font-family:system-ui,-apple-system,sans-serif]"
          >
            <div className="flex items-center gap-3 rounded-xl bg-black/[0.035] border border-transparent transition-colors duration-200 group-hover:bg-[#EDE9F7] group-hover:border-[#5D4387]/40 pl-3 pr-4 py-3">
              <img
                src={p.avatar}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 rounded-lg object-cover shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="min-w-0 flex-1">
                <p title={p.label} className="text-[17px] font-semibold text-[#111] truncate">{p.label}</p>
                <p title={p.dropdownRole} className="text-[14px] text-black/50 truncate">{p.dropdownRole}</p>
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
          onClick={onNavigate}
          className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
        >
          Talk to us ›
        </Link>
      </div>
    </>
  );
}

// Version 4: card grid with the hover lift/shadow animation removed, no card border, and the
// card's own padding zeroed out. Dividing lines between cells use the "gap as line" technique
// (a 1px gap filled by the grid's own background, with each cell painted over it) rather than
// per-cell borders — that way lines appear both between rows and between columns without having
// to strip them back off the outer edge or the last row/column by hand. Each cell then gets its
// own 8px padding so content sits inset from those lines instead of touching them.
function HireDropdownDesktopV4({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-px bg-black/[0.08]">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            href={`/hire-an-angel/${p.slug}`}
            onClick={onNavigate}
            className="group flex flex-col bg-white p-3 cursor-pointer [font-family:system-ui,-apple-system,sans-serif]"
          >
            <div className="flex items-center gap-3 rounded-xl bg-black/[0.035] border border-transparent transition-colors duration-200 group-hover:bg-[#EDE9F7] group-hover:border-[#5D4387]/40 pl-3 pr-4 py-3">
              <img
                src={p.avatar}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 rounded-lg object-cover shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="min-w-0 flex-1">
                <p title={p.label} className="text-[17px] font-semibold text-[#111] truncate">{p.label}</p>
                <p title={p.dropdownRole} className="text-[14px] text-black/50 truncate">{p.dropdownRole}</p>
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                Use Cases
              </p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {p.useCases?.map((uc) => (
                  <li key={uc} className="flex items-start gap-2 text-[13px] font-medium leading-5 text-black/60">
                    <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0 mt-2" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
        {/* 5 personas in a 3-col grid leaves the 6th cell empty — without an element there it
            just shows the grid's own line color instead of matching the other (white) cells. */}
        <div className="bg-white" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] text-[13px]">
        <span className="text-black/50">
          Not sure which Angel fits? <span className="font-semibold text-[#111]">We&apos;ll help you pick.</span>
        </span>
        <Link
          href="/contact"
          onClick={onNavigate}
          className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
        >
          Talk to us ›
        </Link>
      </div>
    </>
  );
}

// Version 5: starts as an exact clone of V4 — next steps to follow.
// bg-transparent on the cells (rather than bg-white) lets the panel's own light-purple
// background (set in MobileNavLab for variant 5) show through everywhere uniformly — a darker
// purple-tinted gap line is used instead of the default grey so it still reads against that
// purple backdrop.
function HireDropdownDesktopV5({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-px bg-[#5D4387]/40">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            href={`/hire-an-angel/${p.slug}`}
            onClick={onNavigate}
            className="group flex flex-col bg-[#EDE9F7] p-3 cursor-pointer [font-family:system-ui,-apple-system,sans-serif]"
          >
            <div className="flex items-center gap-3 rounded-xl bg-[#5D4387]/20 border border-transparent transition-colors duration-200 group-hover:border-[#5D4387]/40 pl-3 pr-4 py-3">
              <img
                src={p.avatar}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 rounded-lg object-cover shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="min-w-0 flex-1">
                <p title={p.label} className="text-[17px] font-semibold text-[#111] truncate">{p.label}</p>
                <p title={p.dropdownRole} className="text-[14px] text-black/50 truncate">{p.dropdownRole}</p>
              </div>
            </div>

            <div className="mt-[14px] rounded-md bg-black/10 p-3">
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                Use Cases
              </p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {p.useCases?.map((uc) => (
                  <li key={uc} className="flex items-start gap-2 text-[13px] font-medium leading-5 text-black/60">
                    <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0 mt-2" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
        {/* 5 personas in a 3-col grid leaves the 6th cell empty — needs a matching filler so it
            doesn't show the grid's own (darker) line color through that gap. */}
        <div className="bg-[#EDE9F7]" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-[#5D4387]/15 text-[13px]">
        <span className="text-black/50">
          Not sure which Angel fits? <span className="font-semibold text-[#111]">We&apos;ll help you pick.</span>
        </span>
        <Link
          href="/contact"
          onClick={onNavigate}
          className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
        >
          Talk to us ›
        </Link>
      </div>
    </>
  );
}

// Version 6: starts as an exact clone of V4 — next steps to follow.
function HireDropdownDesktopV6({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-px bg-black/[0.08]">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            href={`/hire-an-angel/${p.slug}`}
            onClick={onNavigate}
            className="group flex flex-col bg-white p-3 cursor-pointer [font-family:system-ui,-apple-system,sans-serif]"
          >
            {/* bg/border are now static (the color that used to only show on hover) — the only
                thing that still changes on hover is the horizontal padding, growing 4px each side. */}
            <div className="flex items-center gap-3 rounded-xl bg-[#EDE9F7] border border-[#5D4387]/40 transition-[padding] duration-200 pl-3 pr-4 py-3 group-hover:pl-4 group-hover:pr-5">
              <img
                src={p.avatar}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 rounded-lg object-cover shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="min-w-0 flex-1">
                <p title={p.label} className="text-[17px] font-semibold text-[#111] truncate">{p.label}</p>
                <p title={p.dropdownRole} className="text-[14px] text-black/50 truncate">{p.dropdownRole}</p>
              </div>
            </div>

            <div className="mt-[14px] rounded-md bg-black/[0.035] py-3 px-3 transition-[padding] duration-200 hover:px-[18px]">
              <p className="text-[10.5px] font-medium uppercase tracking-widest text-black/40">
                Use Cases
              </p>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {p.useCases?.map((uc) => (
                  <li key={uc} className="flex items-start gap-2 text-[13px] font-medium leading-5 text-black/60">
                    <span className="w-1 h-1 rounded-full bg-[#5D4387] shrink-0 mt-2" />
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
        {/* 5 personas in a 3-col grid leaves the 6th cell empty — without an element there it
            just shows the grid's own line color instead of matching the other (white) cells. */}
        <div className="bg-white" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06] text-[13px]">
        <span className="text-black/50">
          Not sure which Angel fits? <span className="font-semibold text-[#111]">We&apos;ll help you pick.</span>
        </span>
        <Link
          href="/contact"
          onClick={onNavigate}
          className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
        >
          Talk to us ›
        </Link>
      </div>
    </>
  );
}

function HireDropdownDesktop({ variant, onNavigate }: { variant: VariantId; onNavigate: () => void }) {
  if (variant === 1) return <HireDropdownDesktopV1 onNavigate={onNavigate} />;
  if (variant === 2) return <HireDropdownDesktopV2 onNavigate={onNavigate} />;
  if (variant === 3) return <HireDropdownDesktopV3 onNavigate={onNavigate} />;
  if (variant === 4) return <HireDropdownDesktopV4 onNavigate={onNavigate} />;
  if (variant === 5) return <HireDropdownDesktopV5 onNavigate={onNavigate} />;
  if (variant === 6) return <HireDropdownDesktopV6 onNavigate={onNavigate} />;
  return (
    <>
      <div className="grid grid-cols-3 gap-3 p-3">
        {PERSONAS.map((p) => (
          <Link
            key={p.id}
            href={`/hire-an-angel/${p.slug}`}
            onClick={onNavigate}
            className="group flex flex-col rounded-xl border border-[#5D4387]/20 px-5 py-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#5D4387]/50 hover:shadow-[0_16px_32px_-16px_rgba(93,67,135,0.4)] [font-family:system-ui,-apple-system,sans-serif]"
          >
            <div className="flex items-center gap-3 rounded-full bg-black/[0.035] border border-transparent transition-colors duration-200 group-hover:bg-[#EDE9F7] group-hover:border-[#5D4387]/40 pl-2 pr-5 py-2">
              <img
                src={p.avatar}
                alt=""
                aria-hidden="true"
                className="w-14 h-14 rounded-full object-cover shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="min-w-0 flex-1">
                <p title={p.label} className="text-[17px] font-semibold text-[#111] truncate">{p.label}</p>
                <p title={p.dropdownRole} className="text-[14px] text-black/50 truncate">{p.dropdownRole}</p>
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
          onClick={onNavigate}
          className="font-medium text-[#5D4387] hover:text-[#7168A0] cursor-pointer transition-colors"
        >
          Talk to us ›
        </Link>
      </div>
    </>
  );
}

// Version 1, mobile: touch has no hover, so each row expands on tap instead (its own local
// open/closed state) rather than the desktop's hover reveal. Tapping the row itself still
// navigates — only the chevron button toggles the Use Cases list — mirroring hover vs. click
// being two separate affordances on desktop.
function HireDropdownMobileV1({ onNavigate }: { onNavigate: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="flex flex-col">
      {PERSONAS.map((p) => {
        const isExpanded = expandedId === p.id;
        return (
          <div key={p.id} className="border-b border-black/[0.06] last:border-b-0">
            <div className="flex items-center gap-2.5 px-1">
              <Link
                href={`/hire-an-angel/${p.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-2.5 flex-1 min-w-0 py-3 [font-family:system-ui,-apple-system,sans-serif]"
              >
                <img
                  src={p.avatar}
                  alt=""
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p title={p.label} className="text-[14px] font-semibold text-[#111] truncate">{p.label}</p>
                  <p title={p.dropdownRole} className="text-[11.5px] text-black/50 truncate">{p.dropdownRole}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${p.label} use cases`}
                className="p-2 -m-2 shrink-0 text-black/40"
              >
                <ChevronIcon open={isExpanded} />
              </button>
            </div>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{ maxHeight: isExpanded ? "220px" : "0px" }}
            >
              <div className="pb-3">
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HireDropdownMobile({ variant, onNavigate }: { variant: VariantId; onNavigate: () => void }) {
  if (variant === 1) return <HireDropdownMobileV1 onNavigate={onNavigate} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
      {PERSONAS.map((p) => (
        <Link
          key={p.id}
          href={`/hire-an-angel/${p.slug}`}
          onClick={onNavigate}
          className="group flex flex-col rounded-xl border border-[#5D4387]/20 px-3 py-3 hover:border-[#5D4387]/50 hover:bg-black/[0.02] transition-colors [font-family:system-ui,-apple-system,sans-serif]"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-black/[0.035] border border-transparent transition-colors duration-200 group-hover:bg-[#EDE9F7] group-hover:border-[#5D4387]/40 pl-1 pr-3 py-1">
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
  );
}

/**
 * Design-exploration duplicate of components/mobile-nav.tsx — NOT part of the real site nav.
 * Rendered once, below the main navbar, purely so the "Hire an Angel" dropdown can be reworked
 * into multiple candidate designs for client review without touching the live nav at all.
 * Trimmed down to just the logo + 4 "Hire an Angel N" triggers (one per candidate design) —
 * "Behind the Angels", "Contact" and "Get Started" are deliberately left out since this is a
 * dropdown-design demo, not a working nav. Delete this file (and its one usage on the homepage)
 * once a final dropdown direction is picked and folded back into mobile-nav.tsx.
 */
export function MobileNavLab() {
  const [open, setOpen] = useState(false);
  const [openMobileVariant, setOpenMobileVariant] = useState<VariantId | null>(null);
  const [openVariant, setOpenVariant] = useState<VariantId | null>(null);
  const hireRef = useRef<HTMLDivElement>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openHire = (variant: VariantId) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenVariant(variant);
  };
  const scheduleCloseHire = () => {
    closeTimer.current = setTimeout(() => setOpenVariant(null), 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (openVariant === null) return;
    function onPointerDown(e: MouseEvent) {
      if (hireRef.current && !hireRef.current.contains(e.target as Node)) {
        setOpenVariant(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenVariant(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openVariant]);

  const close = () => {
    setOpen(false);
    setOpenMobileVariant(null);
  };

  return (
    // sticky + top-28 (not relative + pt-28): top-28 (112px) keeps the same clearance below the
    // real fixed nav (components/mobile-nav.tsx) that pt-28 gave it at the top of the page, but
    // sticky also pins it there as the page scrolls instead of letting it scroll away — needed to
    // actually test hover/scroll behavior on this dropdown further down the homepage.
    <div className="sticky top-28 z-40 flex flex-col items-center px-6 md:px-12 lg:px-20">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#5D4387]">
        Design exploration — Hire an Angel dropdown variants
      </p>
      <div ref={hireRef} className="w-full max-w-6xl mx-auto relative">
        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          <div className="hidden lg:flex items-center gap-3">
            {VARIANTS.map((v) => (
              <div key={v} className="relative">
                <button
                  onClick={() => openHire(v)}
                  onMouseEnter={() => openHire(v)}
                  onMouseLeave={scheduleCloseHire}
                  aria-expanded={openVariant === v}
                  className={`group outline-none cursor-pointer ${NAV_PILL}`}
                >
                  Hire an Angel {v}
                  <ChevronIcon open={openVariant === v} />
                </button>

                {/* Version 2 only: anchored directly under its own trigger (left-aligned to
                    it) instead of the shared panel below, which centers under the whole bar. */}
                {v === 2 && openVariant === 2 && (
                  <div
                    className="hidden lg:block absolute left-0 top-full mt-2 z-50"
                    onMouseEnter={() => openHire(2)}
                    onMouseLeave={scheduleCloseHire}
                  >
                    <div
                      className="w-[410px] rounded-2xl border border-black/[0.06] overflow-hidden"
                      style={NAV_DROPDOWN_STYLE}
                    >
                      <HireDropdownDesktop variant={2} onNavigate={() => setOpenVariant(null)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
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

        {/* Mega-menu panel — content swaps per the active trigger's variant number. Variant 2
            has its own anchored panel (above, next to its trigger) instead of this shared one,
            which centers under the whole bar. */}
        {openVariant !== null && openVariant !== 2 && (
          <div
            className="hidden lg:flex absolute inset-x-0 top-full mt-2 justify-center z-50"
            onMouseEnter={() => openHire(openVariant)}
            onMouseLeave={scheduleCloseHire}
          >
            <div
              className="w-full rounded-2xl border border-black/[0.06] overflow-hidden"
              style={openVariant === 5 ? NAV_DROPDOWN_STYLE_PURPLE : NAV_DROPDOWN_STYLE}
            >
              <HireDropdownDesktop variant={openVariant} onNavigate={() => setOpenVariant(null)} />
            </div>
          </div>
        )}

        {/* Mobile dropdown — same lg threshold as the burger that opens it. One accordion
            section per variant, same content-swap-by-id approach as the desktop panel above. */}
        <div
          className="lg:hidden mt-2 max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "min(2000px, 80vh)" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_DROPDOWN_STYLE}
          >
            {VARIANTS.map((v) => (
              <div key={v}>
                <button
                  onClick={() => setOpenMobileVariant((cur) => (cur === v ? null : v))}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] rounded-xl ${NAV_ITEM}`}
                >
                  Hire an Angel {v}
                  <ChevronIcon open={openMobileVariant === v} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ maxHeight: openMobileVariant === v ? "1400px" : "0px" }}
                >
                  <HireDropdownMobile variant={v} onNavigate={close} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
