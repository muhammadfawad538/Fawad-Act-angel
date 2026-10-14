import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

// Title and description are the client's exact SEO copy from
// requirements/Act_Angel_AI_Hire_an_Angel_Website_Content.pdf — used verbatim, not paraphrased.
export const metadata: Metadata = {
  title: "Sales Angel | AI Sales Agent for Qualification & Follow-Up",
  description:
    "Meet Sales Angel, your virtual AI sales specialist. Qualify deals, automate follow-ups, book meetings, and keep your CRM moving with Act Angel AI.",
}

export default function SalesAngelPage() {
  return <HireAnAngelPageContent personaId="sales" />
}
