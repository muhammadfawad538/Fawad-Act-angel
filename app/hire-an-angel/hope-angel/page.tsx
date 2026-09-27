import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

// Draft copy — see lib/personas.ts ("hope" entry) for the review note.
export const metadata: Metadata = {
  title: "Hope Angel | AI Wellbeing Companion | Act Angel AI",
  description:
    "Meet Hope Angel, your virtual AI wellbeing companion. Check in with people, listen without judgement, and connect them to the right support when it matters.",
}

export default function HopeAngelPage() {
  return <HireAnAngelPageContent personaId="hope" />
}
