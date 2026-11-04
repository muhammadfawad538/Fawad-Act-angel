import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Act Angel AI",
  description:
    "Learn how Act Angel AI collects, uses, stores, protects, and shares personal information, including Google Account and Google Calendar data.",
};

const LAST_UPDATED = "31 October 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.15] text-[#111] dark:text-white purple:text-[#F6F4FF]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-black/60 dark:text-white/70 purple:text-[#ABA6D9]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] dark:bg-[#0a0a0a] dark:text-white purple:bg-[#12103C] purple:text-[#F6F4FF] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[13px] text-black/40 dark:text-white/45 purple:text-[#716C9E]">Last updated: {LAST_UPDATED}</p>

          <p className="mt-4 text-[13px] text-black/40">
            Last updated: {LAST_UPDATED}
          </p>

          <Section title="1. Introduction">
            <p>
              ACT ANGEL AI ("Act Angel AI", "we", "our", or "us") respects your
              privacy and is committed to protecting your personal information.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, access, store,
              protect, share, and delete personal information when you use our
              website, applications, AI assistants, communication services, and
              appointment scheduling features.
            </p>
            <p>
              Our services include AI-powered customer engagement, telephone and
              messaging communications, and integrations with third-party
              platforms, including Google Calendar.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p className="font-medium text-[#111]">Information you provide</p>
            <p>
              When you submit an enquiry form or interact with our services, we
              may collect your name, phone number, email address, enquiry
              details, messages, appointment preferences, and other information
              you voluntarily provide.
            </p>

            <p className="font-medium text-[#111]">
              Communications information
            </p>
            <p>
              When you communicate with us through telephone calls, SMS,
              WhatsApp, or email, we may collect call recordings, transcripts,
              message contents, communication timestamps, and delivery
              information.
            </p>

            <p className="font-medium text-[#111]">
              Google Account and Calendar information
            </p>
            <p>
              When you voluntarily connect your Google Account through Google's
              OAuth authorization process, we may access information according
              to the permissions you grant, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Google Account email address and basic account identification
                information.
              </li>
              <li>Calendar availability and free/busy information.</li>
              <li>
                Calendar event information necessary for appointment scheduling.
              </li>
              <li>
                Event titles, dates, times, descriptions, and attendee
                information when authorized and necessary.
              </li>
              <li>
                Information necessary to create, update, or manage calendar
                events on your behalf.
              </li>
            </ul>
            <p>
              We access only the Google information necessary to provide the
              features you authorize.
            </p>
          </Section>

          <Section title="3. How we use your information">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to enquiries and customer requests.</li>
              <li>Provide AI-powered customer support and engagement.</li>
              <li>
                Make requested telephone calls and send SMS, WhatsApp, and email
                communications.
              </li>
              <li>Verify contact information and manage callbacks.</li>
              <li>Schedule, confirm, and manage appointments.</li>
              <li>
                Check calendar availability and prevent scheduling conflicts.
              </li>
              <li>Create or update calendar events when authorized.</li>
              <li>Operate, maintain, and secure our services.</li>
              <li>Meet applicable legal and regulatory obligations.</li>
            </ul>
          </Section>

        <Section title="Contact us">
          <p>
            For any privacy question or request, contact us at{" "}
            <a
              href="mailto:Hello@ActAngel.com"
              className="text-[#111] underline underline-offset-2 hover:text-black/60 dark:text-white dark:hover:text-white/70 purple:text-[#F6F4FF] purple:hover:text-[#ABA6D9] transition-colors"
            >
              Hello@ActAngel.com
            </a>
            .
          </p>
        </Section>
      </main>
      </div>

      <SiteFooter />
    </div>
  );
}
