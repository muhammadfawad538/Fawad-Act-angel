"use client"

import { useCallback, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { HireAnAngelModal } from "@/components/hire-an-angel-modal"
import { MeetYourAngelModal } from "@/components/meet-your-angel-popup"
import type { PersonaId } from "@/lib/personas"

/**
 * The site's nav plus its two modals, wired up exactly as on the homepage (app/page.tsx) —
 * packaged here so secondary pages (Cookies Policy, Behind the Angels) get the identical,
 * fully-functional header (dropdown, Get Started, both modals) instead of a stripped-down
 * logo-only copy that doesn't do anything when clicked.
 */
export function SiteHeader() {
  const [angelModalOpen, setAngelModalOpen] = useState(false)
  const [angelPersonaId, setAngelPersonaId] = useState<PersonaId>("sales")
  const openAngelModal = useCallback((id: PersonaId) => {
    setAngelPersonaId(id)
    setAngelModalOpen(true)
  }, [])

  const [angelLeadModalOpen, setAngelLeadModalOpen] = useState(false)
  const handleGetStarted = useCallback(() => {
    setAngelLeadModalOpen(true)
  }, [])

  return (
    <>
      <MobileNav onSelectPersona={openAngelModal} onGetStarted={handleGetStarted} />

      <HireAnAngelModal
        open={angelModalOpen}
        onOpenChange={setAngelModalOpen}
        personaId={angelPersonaId}
        onPersonaChange={setAngelPersonaId}
      />

      <MeetYourAngelModal open={angelLeadModalOpen} onOpenChange={setAngelLeadModalOpen} />
    </>
  )
}
