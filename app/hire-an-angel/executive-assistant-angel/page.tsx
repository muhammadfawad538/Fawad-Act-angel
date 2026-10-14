import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

// SEO copy is the client's exact wording for "Assistant Angel" (the on-page/display name — the
// route itself intentionally stays /hire-an-angel/executive-assistant-angel).
export const metadata: Metadata = {
  title: "Assistant Angel | AI Executive Assistant | Act Angel AI",
  description:
    "Meet Assistant Angel, your virtual AI specialist for everyday coordination. Manage schedules, prepare briefs, and move tasks forward across connected tools.",
}

export default function ExecutiveAssistantAngelPage() {
  return <HireAnAngelPageContent personaId="assistance" />
}
