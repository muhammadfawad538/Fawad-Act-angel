import { redirect } from "next/navigation"

// The form lives inline on the Hope Angel page itself (matching the reference site, where
// "Share Your Mission" scrolls to a section rather than navigating away) — this route just
// keeps the old /share-your-mission link working for anyone who bookmarked it.
export default function ShareYourMissionRedirect() {
  redirect("/hire-an-angel/hope-angel#share-your-mission")
}
