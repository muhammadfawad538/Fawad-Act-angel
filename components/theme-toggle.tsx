"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";

// Cycles light → dark (black) → purple → light. A single button rather than a 3-option control
// since that's what was asked for first; each click just advances to the next theme in the
// list, same gesture as the original light/dark toggle.
const THEME_ORDER = ["light", "dark", "purple"] as const;
const THEME_ICON = { light: Moon, dark: Sparkles, purple: Sun } as const;
const THEME_LABEL = {
  light: "Switch to dark theme",
  dark: "Switch to purple theme",
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

  const current = (theme as (typeof THEME_ORDER)[number] | undefined) ?? "light";
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  const Icon = THEME_ICON[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={THEME_LABEL[current]}
      className={`inline-flex items-center justify-center h-[46px] w-[46px] shrink-0 rounded-full border border-[#DADADA] hover:border-[#b8b8b8] text-[#111] cursor-pointer transition-colors duration-200 dark:border-white/20 dark:text-white dark:hover:border-white/40 purple:border-[#EDE9F7]/25 purple:text-[#EDE9F7] purple:hover:border-[#EDE9F7]/50 ${className}`}
    >
      <Icon size={18} />
    </button>
  );
}
