"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { CONSENT_EVENT, hasConsent } from "@/lib/cookie-consent"

/**
 * Renders Vercel Analytics only once the visitor has granted the "analytics" category.
 *
 * This is the part that makes Accept/Reject mean something: previously <Analytics /> was
 * mounted unconditionally in the root layout, so it loaded and started collecting before
 * anyone was asked. Mounting it here instead means rejecting keeps the script off the page
 * entirely, rather than loading it and hoping it behaves.
 *
 * Listens for CONSENT_EVENT so accepting takes effect immediately, without a reload.
 */
export function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false)

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

  if (!allowed) return null
  return <Analytics />
}
