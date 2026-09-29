"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import posthog from "posthog-js"
import { normalizePhone } from "@/lib/phone"

type Channel = "Call" | "WhatsApp" | "Email"
type Step = "details" | "otp" | "success"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_COOLDOWN_SECONDS = 30
const WHATSAPP_LINK = `https://wa.me/13236885001?text=${encodeURIComponent("Hi, I'd like to chat with Act Angel!")}`

// Icon paths ported as-is from the interactive-ai-sales-agent form.
const CHANNELS: { id: Channel; icon: React.ReactNode }[] = [
  {
    id: "Call",
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    id: "WhatsApp",
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
  },
  {
    id: "Email",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 6-10 7L2 6" />
      </>
    ),
  },
]

const inputClass =
  "bg-white border border-black/10 rounded-xl px-4 py-1.5 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors w-full"
const labelClass = "text-xs font-medium text-black/60"
const primaryButtonClass =
  "w-full px-6 py-2 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-wide font-medium disabled:opacity-50 disabled:cursor-not-allowed"

export interface MeetYourAngelFormProps {
  /**
   * Toggle this (e.g. pass the Dialog's `open` state) to reset the form whenever the modal
   * using it reopens — Radix keeps DialogContent mounted between opens, so without this,
   * state from a previous visit would still be sitting there. A standalone page doesn't need
   * this: a fresh route load already means a fresh mount, so omit it there.
   */
  resetOn?: boolean
  /** Called when the visitor dismisses the success screen. The modal closes itself with this. */
  onDone?: () => void
}

/**
 * The lead-capture form itself — channel picker, details, OTP verification, success —
 * extracted out of the "Meet Your Angel" modal (components/meet-your-angel-popup.tsx) so the
 * standalone /get-started page can render the exact same, real-backend-integrated flow
 * (POSTs to /api/otp/send and /api/otp/verify) instead of a second copy that could drift.
 * The modal is left fully intact and still works if reactivated — it just delegates its
 * content to this component now.
 */
export function MeetYourAngelForm({ resetOn, onDone }: MeetYourAngelFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
  const [channel, setChannel] = useState<Channel>("Call")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [normalizedPhone, setNormalizedPhone] = useState("")
  const [email, setEmail] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  // Twilio Verify hands back the SAME pending verification (same code) if you
  // create one again for a `To` that already has one outstanding - confirmed
  // live, this is why "Resend" used to send the identical OTP (AAA-SA-002).
  // Tracking the last verification sid per channel lets /api/otp/send cancel
  // it first, which forces Twilio to actually generate a fresh code.
  const [phoneSid, setPhoneSid] = useState<string | undefined>(undefined)
  const [emailSid, setEmailSid] = useState<string | undefined>(undefined)
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function reset() {
    setStep("details")
    setChannel("Call")
    setName("")
    setPhone("")
    setNormalizedPhone("")
    setEmail("")
    setPhoneCode("")
    setEmailCode("")
    setLoading(false)
    setError("")
    setResendCooldown(0)
    setPhoneSid(undefined)
    setEmailSid(undefined)
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
  }

  useEffect(() => {
    if (resetOn) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOn])

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    }
  }, [])

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function sendCodes(phoneNumber: string, emailAddress: string) {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Api-Key": process.env.NEXT_PUBLIC_PARTNER_API_KEY ?? "",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        email: emailAddress,
        previousPhoneSid: phoneSid,
        previousEmailSid: emailSid,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Couldn't send the verification codes.")
    setPhoneSid(data.phoneSid)
    setEmailSid(data.emailSid)
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      posthog.capture("form_validation_failed", { step: "details", field: "name" })
      return setError("Please enter your name.")
    }
    const cleanPhone = normalizePhone(phone)
    if (!cleanPhone) {
      posthog.capture("form_validation_failed", { step: "details", field: "phone" })
      return setError(
        "Please enter your mobile number including country code, e.g. +14155551234 or +919876543210.",
      )
    }
    if (!EMAIL_RE.test(email.trim())) {
      posthog.capture("form_validation_failed", { step: "details", field: "email" })
      return setError("Please enter a valid email address.")
    }

    setLoading(true)
    try {
      await sendCodes(cleanPhone, email.trim())
      setNormalizedPhone(cleanPhone)
      setStep("otp")
      startResendCooldown()
      posthog.capture("form_step_completed", { step: "details", channel })
      posthog.capture("otp_sent", { channel })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      posthog.capture("otp_send_failed", { error: message })
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return
    setError("")
    setLoading(true)
    posthog.capture("otp_resend_requested", { channel })
    try {
      await sendCodes(normalizedPhone, email.trim())
      startResendCooldown()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't resend the code."
      setError(message)
      posthog.capture("otp_resend_failed", { error: message })
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!/^\d{4,10}$/.test(phoneCode.trim())) {
      posthog.capture("form_validation_failed", { step: "otp", field: "phoneCode" })
      return setError("Please enter the mobile code we sent you.")
    }
    if (!/^\d{4,10}$/.test(emailCode.trim())) {
      posthog.capture("form_validation_failed", { step: "otp", field: "emailCode" })
      return setError("Please enter the email code we sent you.")
    }

    setLoading(true)
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Partner-Api-Key": process.env.NEXT_PUBLIC_PARTNER_API_KEY ?? "",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          email: email.trim(),
          phoneCode: phoneCode.trim(),
          emailCode: emailCode.trim(),
          channel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "That code didn't work.")
      setStep("success")
      // Ties this browser's future activity to the actual lead once verified, so
      // retention/return-visit cohorts in PostHog can be built off a real identity
      // instead of only anonymous sessions.
      posthog.identify(email.trim(), { phone: normalizedPhone, name: name.trim() })
      posthog.capture("form_step_completed", { step: "otp", channel })
      posthog.capture("form_submitted", { channel })
      if (channel === "WhatsApp") {
        // Opened synchronously within this click handler (not in a useEffect)
        // so browsers treat it as a direct result of the user's action rather
        // than an unrequested popup - this is what keeps it from being blocked.
        window.open(WHATSAPP_LINK, "_blank", "noopener,noreferrer")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      posthog.capture("otp_verification_failed", { error: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {step === "details" && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-[#333] leading-snug">
            Don&apos;t Take Our Word for It. Meet Your Angel.
          </p>
          <p className="text-[13px] text-black/45 leading-snug">
            No presentation, no pressure — you choose the channel below.
          </p>

          <div className="flex gap-2 mt-0.5">
            {CHANNELS.map((c) => {
              const active = channel === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setChannel(c.id)
                    posthog.capture("channel_selected", { channel: c.id })
                  }}
                  aria-label={c.id}
                  aria-pressed={active}
                  title={c.id}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    active
                      ? "bg-[#333] border-[#333] text-white"
                      : "bg-transparent border-black/[0.12] text-black/55 hover:border-[#333] hover:text-[#333]"
                  }`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {c.icon}
                  </svg>
                  <span className="text-[11px] font-medium">{c.id}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-2">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                className={`${inputClass} mt-0.5`}
              />
            </div>

            <div>
              <label className={labelClass}>Mobile number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+14155551234"
                type="tel"
                autoComplete="tel"
                className={`${inputClass} mt-0.5`}
              />
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                type="email"
                autoComplete="email"
                className={`${inputClass} mt-0.5`}
              />
            </div>

            <div className="text-[11px] text-black/35">
              Include your country code — we&apos;ll text a verification code to your mobile and
              email.
            </div>

            <p className="text-[10.5px] leading-tight text-black/40">
              By submitting this form, you agree to receive phone calls and recurring automated
              text messages from Act Angel AI about your enquiry, including a verification code,
              callback confirmations, and follow-ups. Consent is not a condition of purchase.
              Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. See
              our{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-black/60">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" target="_blank" className="underline hover:text-black/60">
                Terms of Service
              </a>
              .
            </p>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Sending code…" : "Send me a code →"}
            </button>
          </form>
        </div>
      )}

      {step === "otp" && (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-black/55">
            Your Angel is ready. Just verify your phone and email to get started.
          </p>

          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-2.5">
            <div>
              <label className={labelClass}>Mobile verification code</label>
              <input
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                maxLength={10}
                inputMode="numeric"
                placeholder="123456"
                autoFocus
                className={`${inputClass} mt-1`}
              />
            </div>

            <div>
              <label className={labelClass}>Email verification code</label>
              <input
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                maxLength={10}
                inputMode="numeric"
                placeholder="123456"
                className={`${inputClass} mt-1`}
              />
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Verifying…" : "Verify & continue →"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-center text-xs text-black/45 hover:text-black/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Resend codes in ${resendCooldown}s` : "Resend codes"}
          </button>

          <button
            type="button"
            onClick={() => {
              posthog.capture("form_step_back", { from: "otp", to: "details" })
              setStep("details")
              setError("")
              setPhoneCode("")
              setEmailCode("")
              setResendCooldown(0)
              setPhoneSid(undefined)
              setEmailSid(undefined)
              if (cooldownTimer.current) clearInterval(cooldownTimer.current)
            }}
            className="text-center text-xs text-black/45 hover:text-black/70 transition-colors"
          >
            Use a different number or email
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center text-center gap-2.5 py-1">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-600/20 text-emerald-600 flex items-center justify-center text-xl">
            ✓
          </div>
          <h3 className="text-lg font-medium">You&apos;re all set!</h3>
          {channel === "Call" && (
            <p className="text-sm text-black/55">
              Your mobile and email are verified. Act Angel is calling you now — keep an eye on
              your phone.
            </p>
          )}
          {channel === "WhatsApp" && (
            <>
              <p className="text-sm text-black/55">
                Your mobile and email are verified. WhatsApp should be opening now to start
                chatting with your Angel.
              </p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`${primaryButtonClass} inline-flex items-center justify-center gap-1`}
              >
                Didn&apos;t open? Continue on WhatsApp →
              </a>
            </>
          )}
          {channel === "Email" && (
            <p className="text-sm text-black/55">
              Your mobile and email are verified. Check your inbox — your Angel has just sent you
              a note to get the conversation started.
            </p>
          )}
          <button
            onClick={() => {
              // onDone is only provided by the modal (components/meet-your-angel-popup.tsx),
              // which uses it to close the dialog. On the standalone /get-started page there is
              // no modal to close and no onDone is passed, so the button did nothing at all -
              // that's the bug report ("Done not closing the popup"): there never was a popup on
              // that page, just a button silently no-op'ing. Falling back to navigating home
              // gives it real, sensible behavior in that case instead of doing nothing.
              if (onDone) onDone()
              else router.push("/")
            }}
            className={primaryButtonClass}
          >
            Done
          </button>
        </div>
      )}
    </>
  )
}
