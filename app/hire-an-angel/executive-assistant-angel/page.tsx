import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

export const metadata: Metadata = {
  title: "Executive Assistant Angel — Hire an Angel — Act Angel AI",
  description:
    "See how the Executive Assistant Angel handles an incoming call and follows up by message.",
}

export default function ExecutiveAssistantAngelPage() {
  return <HireAnAngelPageContent personaId="assistance" />
}
