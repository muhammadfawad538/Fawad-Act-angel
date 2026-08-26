import type { Metadata } from "next"
import { COOKIE_CATEGORIES } from "@/lib/cookie-consent"
import { CookiePreferencesButton } from "@/components/cookie-preferences-button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Cookies Policy — Act Angel AI",
  description:
    "How Act Angel AI uses cookies and similar technologies, the categories we use, and how you can control them.",
}

const LAST_UPDATED = "21 August 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.15] text-[#111]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-black/60">{children}</div>
    </section>
  )
}

export default function CookiesPolicyPage() {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      {/* Same nav + modals as the homepage, matching /privacy, /terms, and
          /behind-the-angels — not the stripped-down logo-only nav this used to have. */}
      <SiteHeader />

      <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          Cookies Policy
        </h1>
        <p className="mt-4 text-[13px] text-black/40">Last updated: {LAST_UPDATED}</p>

        <p className="mt-8 text-[15px] leading-relaxed text-black/60">
          This policy explains how Act Angel AI uses cookies and similar technologies when you
          visit our website, what each category is for, and how you can change your mind at any
          time. It sits alongside — and should be read with — the way we handle any personal
          information you choose to give us, described below.
        </p>

        <Section title="What cookies are">
          <p>
            Cookies are small text files placed on your device when you visit a website. They
            let a site remember things about your visit — such as which preferences you set —
            and help us understand how the site is being used so we can improve it.
          </p>
          <p>
            Most of the cookies we rely on are session cookies, which are removed automatically
            when you close your browser. Others persist for a limited period so that a choice
            you made — like your cookie preferences — is still there when you come back.
          </p>
        </Section>

        <Section title="The categories we use">
          <p>
            When you first arrive you are asked to choose which categories to allow. Only
            &ldquo;Necessary&rdquo; is switched on by default; nothing else is set unless you
            turn it on.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {COOKIE_CATEGORIES.map(cat => (
              <div key={cat.id} className="rounded-2xl border border-black/[0.08] bg-white/60 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] font-medium text-[#111]">{cat.label}</span>
                  {cat.locked && (
                    <span className="text-[12px] font-medium text-black/40 shrink-0">Always Active</span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-black/55">{cat.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Information you give us">
          <p>
            Separately from cookies, you may choose to give us personal information — your name,
            mobile number and email address — through the &ldquo;Meet Your Angel&rdquo; form on
            this site. We use it to contact you about the demo or trial you asked for, on the
            channel you selected.
          </p>
          <p>
            We ask only for what we need to respond to you, and we do not sell your personal
            information.
          </p>
        </Section>

        <Section title="How we use what we collect">
          <p>To provide and operate the service you asked to see, and to respond to enquiries.</p>
          <p>
            To understand our audience in aggregate — which pages are visited, how visitors
            arrive, where the experience breaks down — so we can improve the site. This is what
            the Analytics and Performance categories are for, and it only happens if you allow
            them.
          </p>
          <p>
            To keep the site secure and working correctly, which is what the Necessary category
            covers.
          </p>
        </Section>

        <Section title="Third parties and links to other sites">
          <p>
            Some cookies are set by third parties we use — for example our analytics provider.
            Where that is the case, the data is handled under that provider&rsquo;s own policy
            as well as this one.
          </p>
          <p>
            Our site may link to other websites. We are not responsible for the privacy or
            cookie practices of sites we do not operate, and we would encourage you to read
            their policies before sharing anything with them.
          </p>
        </Section>

        <Section title="How you can control cookies">
          <p>
            You can change your choice at any time using the button below, which reopens the
            preference panel. Turning a category off also removes the cookies already set under
            it, as far as we are able to.
          </p>
          <p>
            You can also block or delete cookies through your browser settings. Note that
            blocking Necessary cookies may stop parts of the site from working as intended.
          </p>
          <div className="pt-2">
            <CookiePreferencesButton />
          </div>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as the site changes or as the law requires. When the
            categories or their meaning change materially, we will ask for your consent again
            rather than relying on a choice you made under the old version.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            If you have a question about this policy, about the information we hold, or if you
            would like a choice reversed, contact us and we will respond as quickly as we can.
          </p>
          <p>
            <a
              href="mailto:angel@actangel.com"
              className="text-[#111] underline underline-offset-2 hover:text-black/60 transition-colors"
            >
              angel@actangel.com
            </a>
          </p>
        </Section>

      </main>
      </div>

      <SiteFooter />
    </div>
  )
}
