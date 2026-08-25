import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Terms of Service — Act Angel AI",
  description:
    "The terms that apply when you submit an enquiry and Act Angel AI's AI assistant calls or messages you in response.",
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

// Content transcribed verbatim from https://act-angel-ai-form.vercel.app/terms.
export default function TermsPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <SiteHeader />

      <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          Terms of Service
        </h1>
        <p className="mt-4 text-[13px] text-black/40">Last updated: {LAST_UPDATED}</p>

        <Section title="About this service">
          <p>
            Act Angel AI provides an AI assistant that calls and messages you in response to an
            enquiry you submit. By submitting the enquiry form you agree to these terms.
          </p>
        </Section>

        <Section title="Calls and messages">
          <p>
            When you submit the form and verify your phone number, you are asking us to call
            you. You also agree to receive recurring automated text messages relating to your
            enquiry, including a verification code, callback confirmations, and follow-ups.
            Consent is not a condition of purchase. Message frequency varies, and message and
            data rates may apply.
          </p>
          <p>Reply STOP to any message to unsubscribe, or HELP for assistance.</p>
        </Section>

        <Section title="Recording">
          <p>
            Calls with our AI assistant may be recorded and transcribed so we can handle your
            enquiry and improve the service. If you do not wish to be recorded, please end the
            call.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <p>
            You agree to provide accurate contact details and to only submit a phone number you
            own or are authorised to use.
          </p>
        </Section>

        <Section title="No professional advice">
          <p>
            Information provided by the AI assistant is for general informational purposes only
            and does not constitute professional advice. Pricing or availability discussed on a
            call is indicative and subject to confirmation.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms from time to time. The current version will always be
            available at this address.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about these terms? Contact us at{" "}
            <a
              href="mailto:crm@cloudsteer.com"
              className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
            >
              crm@cloudsteer.com
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
