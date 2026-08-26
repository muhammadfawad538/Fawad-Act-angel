import { MobileNav } from "@/components/mobile-nav"

/**
 * The site's nav — packaged here so secondary pages (Cookies Policy, Behind the Angels,
 * Contact, Get Started, the 4 Hire-an-Angel pages) render the identical header instead of a
 * stripped-down logo-only copy.
 *
 * This used to also own the "Hire an Angel" and "Meet Your Angel" modal state and render both
 * dialogs. Every trigger for them is now a real link to a standalone page (the 4
 * /hire-an-angel/* pages and /get-started) instead, so there's nothing left to open them here.
 * HireAnAngelModal and MeetYourAngelModal are untouched and still fully work — they're just
 * not wired to anything at the moment. Re-wiring them means restoring the state/callbacks this
 * component used to carry and passing them back into MobileNav.
 */
export function SiteHeader() {
  return <MobileNav />
}
