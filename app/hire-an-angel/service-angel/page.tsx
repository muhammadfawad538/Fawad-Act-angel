import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

export const metadata: Metadata = {
  title: "Service Angel — Hire an Angel — Act Angel AI",
  description: "See how the Service Angel handles an incoming call and follows up by message.",
}

export default function ServiceAngelPage() {
  return <HireAnAngelPageContent personaId="service" />
}
