// Cookie-consent state, shared by the banner/preferences UI (components/cookie-consent.tsx)
// and the analytics gate (components/analytics-gate.tsx).
//
// Category set and copy follow the reference implementation the client pointed at
// (cloudsteer.com, a CookieYes install): Necessary / Functional / Analytics / Performance /
// Advertisement, with Necessary always on.
//
// Consent is stored in localStorage rather than a cookie on purpose — storing the record of
// "this visitor rejected cookies" in a cookie is the sort of thing that undercuts the whole
// point, and nothing here needs to be readable server-side.

export type CookieCategory =
  | "necessary"
  | "functional"
  | "analytics"
  | "performance"
  | "advertisement"

/** Categories the visitor can actually toggle — "necessary" is always granted. */
export type OptionalCategory = Exclude<CookieCategory, "necessary">

export interface ConsentRecord {
  necessary: true
  functional: boolean
  analytics: boolean
  performance: boolean
  advertisement: boolean
  /** ISO timestamp of when this choice was made — consent is not indefinite. */
  savedAt: string
  version: number
}

const STORAGE_KEY = "actangel.cookie-consent"

/** Bump when the category set or their meaning changes, to re-ask everyone. */
const CONSENT_VERSION = 1

/** Re-ask after a year, which is the usual expectation for a consent record. */
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

/** Fired on window whenever consent is saved, so open components can react in-place. */
export const CONSENT_EVENT = "actangel:cookie-consent"

/**
 * Fired to reopen the preferences panel from anywhere (e.g. the Cookies Policy page).
 * An event rather than shared state, so callers don't need to be inside the banner's tree —
 * the policy page is a server component and can't hold that state.
 */
export const OPEN_PREFERENCES_EVENT = "actangel:cookie-preferences"

export function openCookiePreferences() {
  if (isBrowser()) window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))
}

export const COOKIE_CATEGORIES: {
  id: CookieCategory
  label: string
  description: string
  locked?: boolean
}[] = [
  {
    id: "necessary",
    label: "Necessary",
    description:
      "Necessary cookies are required to enable the basic features of this site, such as remembering your cookie preferences or keeping a form submission secure. These cookies do not store any personally identifiable data.",
    locked: true,
  },
  {
    id: "functional",
    label: "Functional",
    description:
      "Functional cookies help perform certain functionalities, like remembering which Angel you last previewed, collecting feedback, and other third-party features.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Analytical cookies are used to understand how visitors interact with the site. They provide information on metrics such as the number of visitors, bounce rate and traffic source.",
  },
  {
    id: "performance",
    label: "Performance",
    description:
      "Performance cookies are used to understand and analyse the key performance indexes of the site, which helps us deliver a better experience for visitors.",
  },
  {
    id: "advertisement",
    label: "Advertisement",
    description:
      "Advertisement cookies are used to show you relevant Act Angel AI campaigns based on the pages you have visited, and to measure how effective those campaigns are.",
  },
]

export const OPTIONAL_CATEGORIES: OptionalCategory[] = [
  "functional",
  "analytics",
  "performance",
  "advertisement",
]

export function isBrowser() {
  return typeof window !== "undefined"
}

/**
 * Current consent, or null if the visitor hasn't chosen yet (or their choice has expired /
 * predates the current category set) — null is what makes the banner show.
 */
export function readConsent(): ConsentRecord | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentRecord
    if (parsed?.version !== CONSENT_VERSION) return null
    if (Date.now() - new Date(parsed.savedAt).getTime() > CONSENT_MAX_AGE_MS) return null
    return { ...parsed, necessary: true }
  } catch {
    // Private mode, disabled storage, or corrupt JSON — treat as "not asked yet" rather
    // than throwing, so the site still renders.
    return null
  }
}

export function hasConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true
  return readConsent()?.[category] ?? false
}

/** Persist a choice, drop any cookies the visitor just withdrew, and notify listeners. */
export function saveConsent(choice: Record<OptionalCategory, boolean>): ConsentRecord {
  const record: ConsentRecord = {
    necessary: true,
    ...choice,
    savedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  }
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    } catch {
      // Nothing we can do if storage is unavailable; the banner will simply ask again.
    }
    clearDeclinedCookies(record)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }))
  }
  return record
}

export function acceptAll() {
  return saveConsent({ functional: true, analytics: true, performance: true, advertisement: true })
}

export function rejectAll() {
  return saveConsent({ functional: false, analytics: false, performance: false, advertisement: false })
}

// Cookies we know this site (or its embedded analytics) can set, grouped by the category
// that authorises them. Rejecting has to actually remove what's already there — otherwise a
// visitor who accepted and later changed their mind keeps being tracked by the old cookie.
const COOKIES_BY_CATEGORY: Record<OptionalCategory, string[]> = {
  analytics: [
    "_ga", "_gid", "_gat", "_vercel_insights", "va-session", "_clck", "_clsk",
    // PostHog's cookie name is ph_<project api key>_posthog - fixed for this project's key.
    "ph_phc_zHKkDeNhQf8cPyqM7DxmaB2skkMg5gNepoJtajbc6KD8_posthog",
  ],
  performance: ["_vercel_speed_insights"],
  functional: [],
  advertisement: ["_fbp", "_gcl_au"],
}

function deleteCookie(name: string) {
  const { hostname } = window.location
  // A cookie can only be removed by matching the exact path+domain it was set with, and we
  // don't know that for third-party ones — so expire it across every plausible combination.
  const domains = ["", hostname, `.${hostname}`, `.${hostname.split(".").slice(-2).join(".")}`]
  const paths = ["/", window.location.pathname]
  for (const domain of domains) {
    for (const path of paths) {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}` +
        (domain ? `; domain=${domain}` : "")
    }
  }
}

function clearDeclinedCookies(record: ConsentRecord) {
  for (const category of OPTIONAL_CATEGORIES) {
    if (record[category]) continue
    for (const name of COOKIES_BY_CATEGORY[category]) deleteCookie(name)
    // Google Analytics also sets a per-property cookie (_ga_XXXXXXX) we can't name upfront.
    if (category === "analytics") {
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0]?.trim()
        if (name && /^_ga_/.test(name)) deleteCookie(name)
      }
    }
  }
}
