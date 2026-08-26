import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Privacy Policy — Act Angel AI",
  description:
    "How Act Angel AI collects, uses, and shares the information you give us through the enquiry form, phone calls, WhatsApp, and SMS.",
}

const LAST_UPDATED = "20 August 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.15] text-[#111]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-black/60">{children}</div>
    </section>
  )
}

// Content transcribed verbatim from https://act-angel-ai-form.vercel.app/privacy.
export default function PrivacyPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <SiteHeader />

      <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[13px] text-black/40">Last updated: {LAST_UPDATED}</p>

        <Section title="Information we collect">
          <p>
            When you submit our enquiry form we collect the name, phone number, and email
            address you provide. When you speak with our AI assistant by phone, or message us
            on WhatsApp or SMS, we collect the contents of that conversation, including call
            recordings and transcripts, so we can follow up on your enquiry.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>
            We use your information to respond to your enquiry, place the call you requested,
            verify your phone number, schedule and confirm callbacks, and send follow-up
            messages about your enquiry by SMS, WhatsApp, or email.
          </p>
        </Section>

        <Section title="SMS and phone communications">
          <p>
            By submitting the enquiry form you consent to receive phone calls and recurring
            automated text messages from Act Angel AI relating to your enquiry. Consent to
            receive marketing messages is not a condition of any purchase. Message frequency
            varies. Message and data rates may apply.
          </p>
          <p>
            You may opt out of text messages at any time by replying STOP to any message. You
            will receive a single confirmation that you have been unsubscribed, and no further
            messages after that. Reply HELP to any message, or contact us using the details
            below, for assistance.
          </p>
          <p>
            Mobile information and consent obtained for SMS will not be shared with third
            parties or affiliates for marketing or promotional purposes.
          </p>
        </Section>

        <Section title="Sharing your information">
          <p>
            We share your information only with the service providers that operate this
            service on our behalf — including our telephony, messaging, and AI providers — and
            only so they can deliver the calls and messages you have asked for. We do not sell
            your personal information.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We retain enquiry details, call recordings, transcripts, and message history for as
            long as needed to handle your enquiry and to meet our legal and record-keeping
            obligations. You may request deletion of your data using the contact details below.
          </p>
        </Section>

        <Section title="Your choices">
          <p>
            You may request access to, correction of, or deletion of the personal information
            we hold about you, and you may withdraw consent to calls and messages at any time.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            For any privacy question or request, contact us at{" "}
            <a
              href="mailto:angel@actangel.com"
              className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
            >
              angel@actangel.com
            </a>
            .
          </p>
        </Section>
      </main>
      </div>

      <SiteFooter />
    </div>
  )
}
