"use client"

import { openCookiePreferences } from "@/lib/cookie-consent"

/**
 * Reopens the cookie preferences panel. Split into its own client component so the Cookies
 * Policy page can stay a server component and still offer the control.
 */
export function CookiePreferencesButton() {
  return (
    <button
      onClick={openCookiePreferences}
      className="px-5 py-2.5 text-[13px] font-medium rounded-full bg-[#111] text-white hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:hover:bg-[#8F72FF] transition-colors cursor-pointer"
    >
      Manage Cookie Preferences
    </button>
  )
}
