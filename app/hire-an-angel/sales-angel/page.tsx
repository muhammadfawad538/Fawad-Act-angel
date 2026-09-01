import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

export const metadata: Metadata = {
  title: "Sales Angel — Hire an Angel — Act Angel AI",
  description: "See how the Sales Angel handles an incoming call and follows up by message.",
}

export default function SalesAngelPage() {
  return <HireAnAngelPageContent personaId="sales" />
}
