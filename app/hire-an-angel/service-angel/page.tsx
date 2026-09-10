import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

// Title and description are the client's exact SEO copy from
// requirements/Act_Angel_AI_Hire_an_Angel_Website_Content.pdf — used verbatim, not paraphrased.
export const metadata: Metadata = {
  title: "Service Angel | AI Customer Service Agent | Act Angel AI",
  description:
    "Meet Service Angel, your virtual AI customer service employee. Resolve routine requests, update records, and coordinate escalations across connected systems.",
}

export default function ServiceAngelPage() {
  return <HireAnAngelPageContent personaId="service" />
}
