"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  COOKIE_CATEGORIES,
  OPEN_PREFERENCES_EVENT,
  OPTIONAL_CATEGORIES,
  acceptAll,
  readConsent,
  rejectAll,
  saveConsent,
  type OptionalCategory,
} from "@/lib/cookie-consent"

const ALL_OFF: Record<OptionalCategory, boolean> = {
  functional: false,
  analytics: false,
  performance: false,
  advertisement: false,
}

export function CookieConsent() {
  // Starts hidden and only opens once we've checked storage on the client. Rendering the
  // banner during SSR would flash it at visitors who already chose, and would mismatch
  // hydration since localStorage isn't readable on the server.
  const [showBanner, setShowBanner] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [choice, setChoice] = useState<Record<OptionalCategory, boolean>>(ALL_OFF)

  useEffect(() => {
    const load = () => {
      const existing = readConsent()
      if (existing) {
        setChoice({
          functional: existing.functional,
          analytics: existing.analytics,
          performance: existing.performance,
          advertisement: existing.advertisement,
        })
        return true
      }
      return false
    }
    if (!load()) setShowBanner(true)

    // Lets the Cookies Policy page (a server component, so it can't share this state)
    // reopen the panel with the visitor's current choice pre-filled.
    const reopen = () => { load(); setShowPrefs(true) }
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen)
  }, [])

  function close() {
    setShowPrefs(false)
    setShowBanner(false)
  }

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie consent"
          // z-40 deliberately: Radix dialogs (overlay and content alike) sit at z-50, so a
          // higher value here would paint the banner over the preferences modal. 40 still
          // clears all page content, which tops out at z-30.
          className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08]"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 -10px 30px -12px rgba(0,0,0,0.12)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
            <div className="flex-1">
              <p className="text-[15px] font-medium text-[#111]">We value your privacy</p>
              <p className="mt-2 text-[13px] leading-relaxed text-black/55">
                We use cookies to give you the best experience on our site — to remember your
                preferences, understand how the site is used, and improve it. Click
                &ldquo;Accept All&rdquo; to agree to all cookies, or &ldquo;Customize&rdquo; to
                choose which categories you allow. For more detail, see our{" "}
                <a href="/privacy-policy" className="underline underline-offset-2 hover:text-[#111] transition-colors">
                  Cookies Policy
                </a>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPrefs(true)}
                className="px-5 py-2.5 text-[13px] font-medium rounded-full border border-black/15 text-[#111] hover:border-black/30 hover:bg-black/[0.03] transition-colors cursor-pointer"
              >
                Customize
              </button>
              <button
                onClick={() => { rejectAll(); close() }}
                className="px-5 py-2.5 text-[13px] font-medium rounded-full border border-black/15 text-[#111] hover:border-black/30 hover:bg-black/[0.03] transition-colors cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={() => { acceptAll(); close() }}
                className="px-5 py-2.5 text-[13px] font-medium rounded-full bg-[#111] text-white hover:bg-[#333] transition-colors cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showPrefs} onOpenChange={setShowPrefs}>
        <DialogContent
          className="bg-white border-none p-8 gap-0 overflow-y-auto themed-scrollbar"
          style={{ width: 524, maxWidth: "100%", borderRadius: 20, maxHeight: "90vh" }}
        >
          <DialogHeader className="p-0 space-y-0">
            <DialogTitle
              className="text-[20px] font-medium tracking-tight text-[#111] text-left"
              style={{ lineHeight: "27px" }}
            >
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose which categories of cookies Act Angel AI may use.
            </DialogDescription>
          </DialogHeader>

          <p className="mt-3 text-[13px] leading-relaxed text-black/55">
            Necessary cookies are always on because the site cannot work without them.
            Everything else is off unless you turn it on.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {COOKIE_CATEGORIES.map(cat => {
              const locked = !!cat.locked
              const on = locked || choice[cat.id as OptionalCategory]
              return (
                <div key={cat.id} className="rounded-2xl border border-black/[0.08] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[14px] font-medium text-[#111]">{cat.label}</span>

                    {locked ? (
                      <span className="text-[12px] font-medium text-black/40 shrink-0 pt-1">
                        Always Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${cat.label} cookies`}
                        onClick={() =>
                          setChoice(c => ({ ...c, [cat.id as OptionalCategory]: !c[cat.id as OptionalCategory] }))
                        }
                        className="relative shrink-0 rounded-full transition-colors duration-200 cursor-pointer"
                        style={{ width: 40, height: 24, background: on ? "#111" : "rgba(0,0,0,0.15)" }}
                      >
                        <span
                          className="absolute top-[3px] bg-white rounded-full transition-all duration-200"
                          style={{ width: 18, height: 18, left: on ? 19 : 3 }}
                        />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-black/50">{cat.description}</p>
                </div>
              )
            })}
          </div>

          {/* whitespace-nowrap + a smaller min-width so "Save Preferences" stays on one line:
              at the previous 140px floor the three buttons split the 460px row evenly and the
              longest label wrapped. */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => { setChoice(ALL_OFF); rejectAll(); close() }}
              className="flex-1 min-w-[120px] px-4 py-2 text-[12px] font-medium whitespace-nowrap rounded-full border border-black/15 text-[#111] hover:border-black/30 hover:bg-black/[0.03] transition-colors cursor-pointer"
            >
              Reject All
            </button>
            <button
              onClick={() => { saveConsent(choice); close() }}
              className="flex-1 min-w-[120px] px-4 py-2 text-[12px] font-medium whitespace-nowrap rounded-full border border-black/15 text-[#111] hover:border-black/30 hover:bg-black/[0.03] transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
            <button
              onClick={() => {
                setChoice(Object.fromEntries(OPTIONAL_CATEGORIES.map(c => [c, true])) as Record<OptionalCategory, boolean>)
                acceptAll()
                close()
              }}
              className="flex-1 min-w-[120px] px-4 py-2 text-[12px] font-medium whitespace-nowrap rounded-full bg-[#111] text-white hover:bg-[#333] transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
