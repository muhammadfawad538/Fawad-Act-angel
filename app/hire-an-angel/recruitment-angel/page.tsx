import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

// SEO copy is the client's exact wording for "HR Angel" (the on-page/display name — the route
// itself intentionally stays /hire-an-angel/recruitment-angel).
export const metadata: Metadata = {
  title: "HR Angel | AI HR Assistant for People Operations",
  description:
    "Meet HR Angel, your virtual AI employee for people operations. Coordinate onboarding, answer policy questions, and advance HR workflows across connected systems.",
}

export default function RecruitmentAngelPage() {
  return <HireAnAngelPageContent personaId="hr" />
}
