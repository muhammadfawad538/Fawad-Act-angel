"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Sparkles } from "lucide-react";

// Cycles light → purple → light. Black theme is deliberately not in this list any more (client
// is only being shown light/purple for now) — its CSS/dark: classes are all still fully intact
// site-wide, just not reachable from this toggle. ThemeProvider (app/layout.tsx) still lists
// "dark" as a valid theme, so it can still be set programmatically (e.g. localStorage.theme =
// "dark") if it's ever needed again.
const THEME_ORDER = ["light", "purple"] as const;
const THEME_ICON = { light: Sparkles, purple: Sun } as const;
const THEME_LABEL = {
  light: "Switch to purple theme",
  purple: "Switch to light theme",
} as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // next-themes only knows the real theme after mount (it reads localStorage/the class script
  // client-side); rendering the icon before that would mismatch SSR's assumed state. Rendering
  // nothing until mounted avoids a flash of the wrong icon rather than guessing.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`h-[46px] w-[46px] shrink-0 ${className}`} aria-hidden="true" />;
  }

  // Falls back to "light" for anything not in THEME_ORDER — not just undefined, but also a
  // "dark" value a returning visitor might still have saved in localStorage from before this
  // toggle stopped offering it, which would otherwise look up a missing THEME_ICON/THEME_LABEL
  // entry and crash the render.
  const current = theme && (THEME_ORDER as readonly string[]).includes(theme)
    ? (theme as (typeof THEME_ORDER)[number])
    : "light";
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  const Icon = THEME_ICON[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={THEME_LABEL[current]}
      className={`inline-flex items-center justify-center h-[46px] w-[46px] shrink-0 rounded-full border border-[#DADADA] hover:border-[#b8b8b8] text-[#111] cursor-pointer transition-colors duration-200 dark:border-white/20 dark:text-white dark:hover:border-white/40 purple:border-[#B79CFF]/25 purple:text-[#F6F4FF] purple:hover:border-[#B79CFF]/50 ${className}`}
    >
      <Icon size={18} />
    </button>
  );
}
