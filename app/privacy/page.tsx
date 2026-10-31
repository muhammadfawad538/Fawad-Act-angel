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
      <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.15] text-[#111]">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-black/60">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen flex flex-col font-sans antialiased">
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <main className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Privacy Policy
          </h1>

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

          <Section title="4. Google API data use and Limited Use">
            <p>
              ACT ANGEL AI's use and transfer of information received from
              Google APIs complies with the Google API Services User Data
              Policy, including its Limited Use requirements.
            </p>
            <p>
              Google user data is accessed and used only to provide or improve
              user-facing features that are visible and available within ACT
              ANGEL AI.
            </p>
            <p>Specifically, Google Calendar information is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check calendar availability when scheduling appointments.</li>
              <li>Identify available appointment times.</li>
              <li>
                Create, update, and manage calendar events when authorized.
              </li>
              <li>
                Associate appointments with the appropriate connected Google
                Account.
              </li>
            </ul>
            <p>
              We do not sell Google user data or use it for targeted or
              personalized advertising. We do not transfer Google user data to
              data brokers or information resellers.
            </p>
            <p>
              We do not use Google Workspace API data to develop, improve, or
              train generalized or non-personalized artificial intelligence or
              machine learning models. Google user data is not used to train
              generalized AI models, including third-party AI models.
            </p>
            <p>
              We do not use Google user data for purposes unrelated to the
              user-facing features authorized by the user.
            </p>
          </Section>

          <Section title="5. SMS and phone communications">
            <p>
              By submitting the enquiry form you consent to receive phone calls
              and recurring automated text messages from Act Angel AI relating
              to your enquiry. Consent to receive marketing messages is not a
              condition of any purchase. Message frequency varies. Message and
              data rates may apply.
            </p>
            <p>
              You may opt out of text messages at any time by replying STOP to
              any message. You will receive a single confirmation that you have
              been unsubscribed, and no further messages after that. Reply HELP
              to any message, or contact us using the details below, for
              assistance.
            </p>
            <p>
              Mobile information and consent obtained for SMS will not be shared
              with third parties or affiliates for marketing or promotional
              purposes.
            </p>
          </Section>

          <Section title="6. Sharing your information">
            <p>We do not sell your personal information.</p>
            <p>
              We may share information with service providers that help us
              operate and deliver our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cloud hosting and infrastructure providers.</li>
              <li>Telephony and messaging providers.</li>
              <li>AI and speech processing providers.</li>
              <li>Email delivery providers.</li>
              <li>Calendar and scheduling integration providers.</li>
              <li>Security and technical support providers.</li>
            </ul>
            <p>
              These providers may process information only as necessary to
              perform services on our behalf and subject to applicable
              contractual and confidentiality obligations.
            </p>
            <p className="font-medium text-[#111]">Google user data sharing</p>
            <p>
              Google user data is not sold, rented, or shared for advertising or
              unrelated commercial purposes.
            </p>
            <p>
              We may transfer or disclose Google user data only when necessary
              to provide authorized functionality, comply with applicable legal
              obligations, or protect the security of our services, consistent
              with Google's API Services User Data Policy.
            </p>
            <p>
              We do not permit third parties receiving Google user data to use
              it for their own advertising, data brokerage, or generalized AI
              model training.
            </p>
          </Section>

          <Section title="7. Data security and protection of sensitive information">
            <p>
              We implement appropriate technical and organizational security
              measures designed to protect personal information and sensitive
              user data against unauthorized access, disclosure, alteration,
              loss, or destruction.
            </p>

            <p className="font-medium text-[#111]">Encryption in transit</p>
            <p>
              Communications between users, our applications, and our servers
              are protected using HTTPS and Transport Layer Security (TLS).
              Sensitive information is transmitted using secure communication
              protocols.
            </p>

            <p className="font-medium text-[#111]">Encryption at rest</p>
            <p>
              Sensitive information stored within our systems is protected using
              encryption mechanisms designed to prevent unauthorized access.
              Google OAuth access tokens and refresh tokens are encrypted before
              being stored and are not stored in plaintext.
            </p>

            <p className="font-medium text-[#111]">
              OAuth credential protection
            </p>
            <p>
              Google OAuth credentials are handled through secure server-side
              processes. Access tokens, refresh tokens, client secrets, and
              encryption keys are treated as confidential information and are
              restricted from unauthorized access.
            </p>

            <p className="font-medium text-[#111]">Access restrictions</p>
            <p>
              Access to sensitive information is restricted to authorized
              personnel and application services based on operational
              responsibilities. We use authentication, authorization, role-based
              access controls, and organization-level access restrictions to
              help prevent unauthorized access to customer information.
            </p>

            <p className="font-medium text-[#111]">
              Infrastructure and application security
            </p>
            <p>
              We maintain security safeguards for our application
              infrastructure, databases, and connected services. These
              safeguards are designed to protect information against
              unauthorized access, misuse, accidental disclosure, and security
              incidents.
            </p>

            <p className="font-medium text-[#111]">Security monitoring</p>
            <p>
              We take appropriate measures to identify and respond to suspected
              security incidents and unauthorized access.
            </p>
            <p>
              No internet transmission or electronic storage method can be
              guaranteed to be completely secure. However, we take reasonable
              measures to protect the information entrusted to us.
            </p>
          </Section>

          <Section title="8. Data retention and deletion">
            <p>
              We retain personal information only for as long as necessary to
              provide our services, respond to enquiries, manage customer
              communications, maintain appointment functionality, meet legal
              obligations, resolve disputes, and enforce agreements.
            </p>

            <p className="font-medium text-[#111]">
              Google Account data retention
            </p>
            <p>
              Google OAuth access tokens and refresh tokens are retained only
              while necessary to provide the authorized integration and related
              functionality.
            </p>
            <p>
              When a user disconnects their Google Account or revokes
              authorization, we take appropriate steps to stop accessing the
              account and revoke or delete stored authorization credentials.
            </p>
            <p>
              Google Calendar information is retained only as necessary for the
              scheduling functionality requested by the user and applicable
              operational or legal requirements.
            </p>
            <p>
              When information is no longer required, we take appropriate steps
              to delete it or securely dispose of it, subject to applicable
              legal retention obligations and backup retention processes.
            </p>
            <p className="font-medium text-[#111]">Requesting data deletion</p>
            <p>
              You may request deletion of your personal information by
              contacting us at Hello@ActAngel.com. We will review and process
              valid deletion requests in accordance with applicable laws and our
              data retention obligations.
            </p>
          </Section>

          <Section title="9. Your privacy rights and choices">
            <p>
              Depending on your location and applicable law, you may have the
              right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Withdraw consent to communications.</li>
              <li>Disconnect third-party integrations.</li>
              <li>
                Request information about how your personal information is
                processed.
              </li>
            </ul>
            <p>
              You can revoke ACT ANGEL AI's access to your Google Account
              through your Google Account security settings.
            </p>
            <p>
              Revoking access prevents future access through the revoked
              authorization but does not automatically delete information
              already retained in accordance with this Privacy Policy. You may
              separately request deletion.
            </p>
          </Section>

          <Section title="10. Third-party services">
            <p>
              Our services may integrate with third-party platforms and
              providers, including Google, telephony providers, messaging
              providers, cloud infrastructure providers, and AI service
              providers.
            </p>
            <p>
              These services may have their own privacy policies and data
              handling practices. When you connect a third-party account, the
              information shared with that service is subject to the applicable
              permissions and privacy terms.
            </p>
            <p>
              For Google's data handling practices, please refer to the Google
              API Services User Data Policy:
            </p>
            <p>
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
              >
                Google API Services User Data Policy
              </a>
            </p>
          </Section>

          <Section title="11. Children's privacy">
            <p>
              Our services are not knowingly intended to collect personal
              information from children in violation of applicable privacy laws.
            </p>
            <p>
              If we become aware that personal information has been collected
              from a child in circumstances where consent is required, we will
              take appropriate steps to address the information.
            </p>
          </Section>

          <Section title="12. Changes to this Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our services, technology, legal requirements, or data
              handling practices.
            </p>
            <p>
              The latest version will be published on this page with an updated
              revision date.
            </p>
            <p>
              If we materially change how Google user data is accessed or used,
              we will provide appropriate notice and obtain renewed consent
              where required.
            </p>
          </Section>

          <Section title="13. Contact us">
            <p>
              For questions, concerns, access requests, correction requests, or
              deletion requests relating to this Privacy Policy, please contact:
            </p>
            <p className="text-[#111] font-medium">ACT ANGEL AI</p>
            <p>
              Email:{" "}
              <a
                href="mailto:Hello@ActAngel.com"
                className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
              >
                Hello@ActAngel.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.actangel.ai"
                className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
              >
                https://www.actangel.ai
              </a>
            </p>
          </Section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
