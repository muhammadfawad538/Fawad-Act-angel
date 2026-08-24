"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Channel = "Call" | "WhatsApp" | "Email" | "SMS"
type Step = 1 | 2 | 3

// Validation ported as-is from act_angel.html's trialForm submit handler.
const MOBILE_RE = /^[+0-9 ]{7,15}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function newCaptcha() {
  const a = Math.floor(Math.random() * 8) + 1
  const b = Math.floor(Math.random() * 8) + 1
  return { a, b, answer: a + b }
}

// Icon paths verbatim from act_angel.html. "Call" and "WhatsApp" come from the modal's own
// channel-btn markup; "Email" doesn't exist there at all, so it's pulled from the separate
// .channel-icons row (the "Reachable Everywhere" trust bar) which does have a proper
// envelope glyph and visible labels — the only icon+label pattern in the source. "SMS" is
// the same path in both places.
const CHANNELS: { id: Channel; icon: React.ReactNode }[] = [
  { id: "Call", icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /> },
  { id: "WhatsApp", icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
  { id: "Email", icon: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></> },
  { id: "SMS", icon: <><path d="M21 6H3v12h18V6z" /><path d="M3 7l9 6 9-6" /></> },
]

const inputClass = "bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors w-full"
const labelClass = "text-xs font-medium text-black/60"
const primaryButtonClass = "w-full px-6 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium"

interface MeetYourAngelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MeetYourAngelModal({ open, onOpenChange }: MeetYourAngelModalProps) {
  const [step, setStep] = useState<Step>(1)
  // "Call" auto-selected by default rather than requiring an explicit pick.
  const [channel, setChannel] = useState<Channel | "">("Call")
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [captchaVal, setCaptchaVal] = useState("")
  const [captcha, setCaptcha] = useState(newCaptcha)
  const [consent, setConsent] = useState(false)
  const [formError, setFormError] = useState("")

  const [mobileOtp, setMobileOtp] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [genMobileOtp, setGenMobileOtp] = useState("")
  const [genEmailOtp, setGenEmailOtp] = useState("")
  const [otpError, setOtpError] = useState("")

  const sfFormRef = useRef<HTMLFormElement>(null)

  function reset() {
    setStep(1)
    setChannel("Call")
    setName("")
    setMobile("")
    setEmail("")
    setCaptchaVal("")
    setCaptcha(newCaptcha())
    setConsent(false)
    setFormError("")
    setMobileOtp("")
    setEmailOtp("")
    setOtpError("")
  }

  // Radix only calls onOpenChange for internally-triggered close events (Escape, overlay
  // click, the X button) — not when we open the modal externally via the `open` prop from
  // "Get Started" buttons elsewhere on the page. Watching `open` directly is what actually
  // catches every open, so the captcha/OTP state resets each time instead of just once on mount.
  useEffect(() => {
    if (open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!channel) { setFormError("Please choose how you'd like to experience Act Angel."); return }
    if (!name.trim()) { setFormError("Please enter your name."); return }
    if (!MOBILE_RE.test(mobile.trim())) { setFormError("Please enter a valid mobile number."); return }
    if (!EMAIL_RE.test(email.trim())) { setFormError("Please enter a valid email address."); return }
    if (parseInt(captchaVal, 10) !== captcha.answer) {
      setFormError("That answer doesn't look right — try again.")
      setCaptcha(newCaptcha())
      setCaptchaVal("")
      return
    }
    // Checked last so a wrong captcha still regenerates first — otherwise someone who
    // missed the checkbox would get a stale sum they'd already answered correctly.
    if (!consent) { setFormError("Please accept the Terms & Conditions to continue."); return }
    setFormError("")
    setGenMobileOtp(randomOtp())
    setGenEmailOtp(randomOtp())
    setStep(2)
  }

  function handleVerifyOtp() {
    if (mobileOtp.trim() !== genMobileOtp || emailOtp.trim() !== genEmailOtp) {
      setOtpError("One or both OTPs are incorrect. Please check and try again.")
      return
    }
    setOtpError("")
    // Push lead to Salesforce (Web-to-Lead), submitted silently via hidden iframe.
    // Hidden fields below are already bound to current state, so this just fires the POST.
    sfFormRef.current?.submit()
    setStep(3)
  }

  const nameParts = name.trim().split(" ")
  const firstName = nameParts[0] || name.trim()
  const lastName = nameParts.slice(1).join(" ") || "-"
  // Fallback if somehow reached with no channel picked — "Chat" isn't a channel anymore
  // now that the picker matches act_angel.html's 4 (Call/WhatsApp/Email/SMS), so default
  // to the first option instead.
  const chosenChannel = channel || "Call"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#F5F4F0] border-black/[0.08] p-0 overflow-hidden max-h-[85vh] flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 shrink-0">
          <DialogTitle className="text-xl font-light tracking-tight">Meet Your Angel</DialogTitle>
          <DialogDescription className="sr-only">
            Start a demo trial and get contacted by Act Angel AI.
          </DialogDescription>
        </DialogHeader>

        {/* Scrolls internally (themed scrollbar, not the native one) once content is taller
            than the viewport allows — header above stays pinned. */}
        <div className="flex-1 min-h-0 overflow-y-auto themed-scrollbar">
        <div className="px-6 pb-6 pt-4">

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#333]">
              Don&apos;t Take Our Word for It. Meet Your Angel.
            </p>
            <p className="text-sm text-black/45">
              No presentation. No pressure. Just experience it.
            </p>
            <p className="text-sm text-[#333]">
              You choose the channel. Your Angel takes it from there.
            </p>

            {/* act_angel.html's .channel-btn/.channel-btn.active/.channel-btn:hover, translated:
                flex:1 + gap:10px on the row, icon+label stacked (the label itself doesn't exist
                on the original channel-btn — it's borrowed from the only icon+label pattern in
                the source, .channel-icons .ci). Hover/active use #333 (charcoal) rather than
                act_angel.html's own --violet/#2563EB — matches primaryButtonClass's existing
                hover:bg-[#333] elsewhere in this file instead of introducing a new accent color.
                Hover has to be a real :hover selector (Tailwind's hover: class) rather than
                JS/inline style, which can't express pseudo-classes and would otherwise
                permanently win over any stylesheet hover rule regardless of state. */}
            <div className="flex gap-2.5">
              {CHANNELS.map(c => {
                const active = channel === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    aria-label={c.id}
                    title={c.id}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      active
                        ? "bg-[#333] border-[#333] text-white"
                        : "bg-transparent border-black/[0.12] text-black/55 hover:border-[#333] hover:text-[#333]"
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {c.icon}
                    </svg>
                    <span className="text-[11px] font-medium">{c.id}</span>
                  </button>
                )
              })}
            </div>
        
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-3 mt-1">
              <div>
                <label className={labelClass}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" className={`${inputClass} mt-1.5`} />
              </div>

              <div>
                <label className={labelClass}>Mobile number</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+1 555 000 0000" className={`${inputClass} mt-1.5`} />
                <div className="text-[11px] text-black/35 mt-1">OTP verification will be sent to this number</div>
              </div>

              <div>
                <label className={labelClass}>Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" className={`${inputClass} mt-1.5`} />
                <div className="text-[11px] text-black/35 mt-1">OTP verification will be sent to this email</div>
              </div>

              <div>
                <label className={labelClass}>Human check — {captcha.a} + {captcha.b} = ?</label>
                <input
                  value={captchaVal}
                  onChange={e => setCaptchaVal(e.target.value)}
                  placeholder="Answer"
                  inputMode="numeric"
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              {/* Consent — a real <input type="checkbox">, visually hidden and drawn with a
                  styled box, so it stays keyboard- and screen-reader-native while matching
                  the theme. The whole row is the label, so the text is clickable too. */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className="mt-[1px] shrink-0 w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-black/20"
                  style={{
                    background: consent ? "#111" : "#fff",
                    borderColor: consent ? "#111" : "rgba(0,0,0,0.2)",
                  }}
                >
                  {consent && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-[12px] leading-relaxed text-black/55">
                  I accept the Terms &amp; Conditions.
                </span>
              </label>

              {formError && <div className="text-xs text-red-600">{formError}</div>}

              <button type="submit" className={primaryButtonClass}>
                Send OTPs →
              </button>
            </form> 

          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-black/55">
              Demo mode — no live SMS/email gateway is connected yet, so both codes are shown below for testing.
            </p>
            <div className="text-sm bg-black/[0.04] border border-black/[0.06] rounded-xl p-3">
              Mobile OTP (demo): <strong>{genMobileOtp}</strong>
              <br />
              Email OTP (demo): <strong>{genEmailOtp}</strong>
            </div>

            <div>
              <label className={labelClass}>Enter mobile OTP</label>
              <input
                value={mobileOtp}
                onChange={e => setMobileOtp(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                placeholder="6-digit code"
                className={`${inputClass} mt-1.5`}
              />
            </div>

            <div>
              <label className={labelClass}>Enter email OTP</label>
              <input
                value={emailOtp}
                onChange={e => setEmailOtp(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                placeholder="6-digit code"
                className={`${inputClass} mt-1.5`}
              />
            </div>

            {otpError && <div className="text-xs text-red-600">{otpError}</div>}

            <button onClick={handleVerifyOtp} className={primaryButtonClass}>
              Verify &amp; Start Trial →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-600/20 text-emerald-600 flex items-center justify-center text-xl">
              ✓
            </div>
            <h3 className="text-lg font-medium">You&apos;re all set!</h3>
            <p className="text-sm text-black/55">
              Your Angel is on its way. Act Angel AI will reach out via {chosenChannel} shortly to get you started.
            </p>
            <button onClick={() => onOpenChange(false)} className={primaryButtonClass}>
              Done
            </button>
          </div>
        )}

        </div>
        </div>

        {/* Salesforce Web-to-Lead: hidden form, submitted silently via hidden iframe on OTP verify.
            `oid` is a placeholder until the client provides the real Salesforce org ID. */}
        <iframe name="sfHiddenFrame" title="Salesforce submission target" style={{ display: "none" }} />
        <form
          ref={sfFormRef}
          action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"
          method="POST"
          target="sfHiddenFrame"
          style={{ display: "none" }}
        >
          <input type="hidden" name="oid" value="YOUR_SALESFORCE_ORG_ID" />
          <input type="hidden" name="retURL" value="https://www.actangel.ai/thank-you" />
          <input type="hidden" name="lead_source" value="Website - Meet Your Angel" />
          <input type="hidden" name="company" value="Individual / Website Lead" />
          <input type="hidden" name="first_name" value={firstName} readOnly />
          <input type="hidden" name="last_name" value={lastName} readOnly />
          <input type="hidden" name="phone" value={mobile} readOnly />
          <input type="hidden" name="email" value={email} readOnly />
          <input
            type="hidden"
            name="description"
            value={`Meet Your Angel — requested via ${chosenChannel}. OTP verified.`}
            readOnly
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
