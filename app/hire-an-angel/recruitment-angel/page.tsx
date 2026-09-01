import type { Metadata } from "next"
import { HireAnAngelPageContent } from "@/components/hire-an-angel-page-content"

export const metadata: Metadata = {
  title: "Recruitment Angel — Hire an Angel — Act Angel AI",
  description: "See how the Recruitment Angel handles an incoming call and follows up by message.",
}

export default function RecruitmentAngelPage() {
  return <HireAnAngelPageContent personaId="hr" />
}
