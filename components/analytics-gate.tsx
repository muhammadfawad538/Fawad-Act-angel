"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import posthog from "posthog-js"
import { CONSENT_EVENT, hasConsent } from "@/lib/cookie-consent"

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

/**
 * Renders Vercel Analytics, Microsoft Clarity, and PostHog only once the visitor has granted
 * the "analytics" category.
 *
 * This is the part that makes Accept/Reject mean something: previously <Analytics /> was
 * mounted unconditionally in the root layout, so it loaded and started collecting before
 * anyone was asked. Mounting it here instead means rejecting keeps the script off the page
 * entirely, rather than loading it and hoping it behaves. Clarity and PostHog follow the same
 * rule - see COOKIES_BY_CATEGORY in lib/cookie-consent.ts for the cookies each one sets
 * (_clck/_clsk for Clarity, ph_<project key>_posthog for PostHog), which get cleared on
 * reject the same way Vercel's/GA's do.
 *
 * PostHog is imperative (posthog.init(), not a component), so it's driven from a useEffect
 * rather than just rendered conditionally like Clarity's inline script. If consent is
 * withdrawn after having been granted, opt_out_capturing() actually stops it rather than
 * leaving a live SDK instance running with nothing pointed at it.
 *
 * Listens for CONSENT_EVENT so accepting takes effect immediately, without a reload.
 */
export function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false)
  const pathname = usePathname()
  const pageTimerRef = useRef<{ path: string; enteredAt: number } | null>(null)

  useEffect(() => {
    const sync = () => setAllowed(hasConsent("analytics"))
    sync()
    window.addEventListener(CONSENT_EVENT, sync)
    // Consent may also change in another tab.
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  useEffect(() => {
    if (!POSTHOG_KEY) return
    if (allowed) {
      if (!posthog.__loaded) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: "identified_only",
          capture_pageview: true,
          // Required as of recent posthog-js versions to actually pick up the
          // library's current recommended defaults - omitting it silently no-ops
          // rather than erroring, which is what happened here initially.
          defaults: "2026-01-30",
        })
      } else {
        posthog.opt_in_capturing()
      }
    } else if (posthog.__loaded) {
      posthog.opt_out_capturing()
    }
  }, [allowed])

  /**
   * Time-on-page, per route. `visibilitychange` (not `beforeunload`, which is unreliable on
   * mobile/Safari) is what actually catches a tab close/background - flushing there AND
   * resetting the clock means a visitor who comes back to a still-open tab later doesn't get
   * double-counted for the time it sat hidden. The pathname effect below catches in-app SPA
   * navigation, which never fires a visibility change at all.
   */
  useEffect(() => {
    if (!allowed) return

    function flushAndReset() {
      const cur = pageTimerRef.current
      if (!cur) return
      const seconds = Math.round((Date.now() - cur.enteredAt) / 1000)
      if (seconds > 0) posthog.capture("page_time_spent", { path: cur.path, seconds })
      pageTimerRef.current = { path: cur.path, enteredAt: Date.now() }
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") flushAndReset()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [allowed])

  useEffect(() => {
    if (!allowed) return
    const prev = pageTimerRef.current
    if (prev && prev.path !== pathname) {
      const seconds = Math.round((Date.now() - prev.enteredAt) / 1000)
      if (seconds > 0) posthog.capture("page_time_spent", { path: prev.path, seconds })
    }
    pageTimerRef.current = { path: pathname, enteredAt: Date.now() }
  }, [allowed, pathname])

  if (!allowed) return null
  return (
    <>
      <Analytics />
      {CLARITY_PROJECT_ID && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
        </Script>
      )}
    </>
  )
}
