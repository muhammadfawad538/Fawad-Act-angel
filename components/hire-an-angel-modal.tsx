"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PERSONAS, type PersonaId } from "@/lib/personas"
import { PersonaPhoneDemo } from "@/components/persona-phone-demo"

interface HireAnAngelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personaId: PersonaId
  onPersonaChange: (id: PersonaId) => void
}

export function HireAnAngelModal({ open, onOpenChange, personaId, onPersonaChange }: HireAnAngelModalProps) {
  const persona = PERSONAS.find(p => p.id === personaId) ?? PERSONAS[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Box matches the reference theme's modal: white, 20px radius, 32px padding, capped at
          90vh. Width is 524 (not 460): the theme sets width:460px with content-box sizing, so
          its 32px padding sits *outside* that and it renders 524 wide. Everything here is
          border-box, so 524 is what reproduces it — and leaves the same 460px content width
          the pill grid below is sized against. */}
      <DialogContent
        className="bg-white border-none p-8 gap-0 overflow-y-auto themed-scrollbar"
        style={{ width: 524, maxWidth: "100%", borderRadius: 20, maxHeight: "90vh" }}
      >
        <DialogHeader className="p-0 space-y-0">
          {/* line-height 27px matches the theme's title box exactly; the inherited one
              renders 30px and pushes everything below it down by 3. */}
          <DialogTitle
            className="text-[20px] font-medium tracking-tight text-[#111] text-left"
            style={{ lineHeight: "27px" }}
          >
            Hire an Angel
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview a live demo of how {persona.label} handles an incoming call and the
            conversation that follows.
          </DialogDescription>
        </DialogHeader>

        {/* Persona picker — 2-column grid of full-width pills, 10px gaps, each 38px tall via
            the theme's 10px/20px padding. Weight stays 500 on both states (only the colours
            change); bumping it on the active pill would reflow the text. */}
        <div className="grid grid-cols-2 gap-[10px] mt-5">
          {PERSONAS.map(p => {
            const active = p.id === personaId
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange(p.id)}
                className="text-[14px] font-medium rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  padding: "10px 20px",
                  // 18px line box + 20px vertical padding = the theme's 38px pill. Without
                  // this the inherited line-height gives a 21px box and a 41px pill.
                  lineHeight: "18px",
                  background: active ? "#111111" : "#F4F4F4",
                  color: active ? "#FFFFFF" : "#4A4A4A",
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* Phone — the theme renders the same 340px device scaled to 0.8. Restarts whenever
            the modal opens or the selected persona changes.
            590 = the theme's 580px block + 10px, at the user's request to make the modal
            10px taller than the exact match. */}
        <div className="flex justify-center mt-7" style={{ height: 590 }}>
          <PersonaPhoneDemo personaId={personaId} active={open} width={272} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
