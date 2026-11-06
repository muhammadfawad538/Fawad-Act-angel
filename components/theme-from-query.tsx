"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

// Maps the URL's client-facing theme name to next-themes' actual internal theme id. The
// client calls the purple theme "dark" — there's a separate, unused black theme still sitting
// in the codebase under the literal id "dark" (ThemeProvider's themes list in app/layout.tsx),
// but that's not what a shared ?theme=dark link should mean, so it's deliberately not in this
// map; only "dark" (-> purple) and "light" are accepted.
const QUERY_THEME_MAP: Record<string, string> = {
  light: "light",
  dark: "purple",
};

// Lets the client share a link that opens the site already in a given theme — e.g.
// https://actangel.ai/?theme=dark — instead of whatever a visitor's browser already has saved
// (or the "light" default for a first-time visitor). setTheme() both applies it immediately
// and writes it to localStorage via next-themes, so it also becomes that visitor's remembered
// preference afterward, same as using the toggle itself would.
function ThemeFromQueryInner() {
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();

  useEffect(() => {
    const requested = searchParams.get("theme");
    const resolved = requested ? QUERY_THEME_MAP[requested] : undefined;
    if (resolved) {
      setTheme(resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

// useSearchParams() requires a Suspense boundary (Next.js App Router) or the whole route
// opts into fully client-side rendering during the build — this component has no visible
// fallback since it renders nothing either way.
export function ThemeFromQuery() {
  return (
    <Suspense fallback={null}>
      <ThemeFromQueryInner />
    </Suspense>
  );
}
