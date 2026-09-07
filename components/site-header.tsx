import { MobileNav } from "@/components/mobile-nav"

/**
 * The site's nav — packaged here so secondary pages (Cookies Policy, Behind the Angels,
 * Contact, Get Started, the 4 Hire-an-Angel pages) render the identical header instead of a
 * stripped-down logo-only copy.
 *
 * This used to also own the "Hire an Angel" and "Meet Your Angel" modal state and render both
 * dialogs. Every trigger for them is now a real link to a standalone page (the 4
 * /hire-an-angel/* pages and /get-started) instead, so there's nothing left to open them here.
 * HireAnAngelModal still works and is untouched. The old duplicate MeetYourAngelModal (a
 * second, unmaintained copy of the get-started flow) has been removed — MeetYourAngelForm
 * (components/meet-your-angel-form.tsx) is now the single source of truth for that flow,
 * shared by /get-started and the still-dormant MeetYourAngelPopup (components/meet-your-angel-popup.tsx).
 */
export function SiteHeader() {
  return <MobileNav />
}
