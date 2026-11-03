import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Progress with Purpose | Act Angel AI",
  description:
    "Act Angel AI’s philanthropic commitment: giving from our growth, sharing our technology and contributing our time to support people and communities.",
};

// Every value below (colors, font sizes, weights, line-heights, letter-spacing, paddings) is
// pulled directly from the reference build's own CSS
// (https://vermillion-mooncake-35f0e2.netlify.app/behind-the-angels/progress-with-purpose/,
// view-source), not eyeballed — inline styles are used instead of Tailwind's spacing/type scale
// specifically so these numbers can stay exact. Two things worth knowing about that source:
//
// 1. Its palette is close to, but not identical to, the rest of this site's usual tokens (ink
//    #19171D vs the site's #111, paper #F8F7F5 vs #F5F4F0) — kept exact here since the brief was
//    to match this one page precisely, not restate it in the site's normal tokens.
// 2. Its stylesheet layers a spacious "base" composition and then, physically later in the same
//    file (so it wins the cascade unconditionally, not just at some breakpoint), a much more
//    compact "Compact desktop composition" pass that shrinks nearly every size/padding and drops
//    the <br> line-breaks in the h1/card titles. That compact pass is what actually renders by
//    default, so it's what's reproduced below (single-line headline/card titles, tight padding),
//    not the larger spacious numbers that sit earlier in that stylesheet but never win. Its
//    further viewport-*height*-based rules (hiding the eyebrow on short screens, etc.) are not
//    reproduced — nothing else on this site branches on viewport height, and this page still
//    reads correctly without that extra layer.
function Eyebrow({
  children,
  marginBottom,
  center,
  line = true,
  pill = false,
}: {
  children: React.ReactNode;
  marginBottom: number;
  center?: boolean;
  line?: boolean;
  pill?: boolean;
}) {
  // Pill variant — a rounded badge (matching the persona pages' own eyebrow pill style)
  // instead of the plain uppercase-text-with-a-line treatment used elsewhere on this page.
  if (pill) {
    return (
      <p
        style={{
          margin: `0 0 ${marginBottom}px`,
          textAlign: center ? "center" : undefined,
        }}
      >
        <span
          className="inline-block rounded-full uppercase text-[#5D4387] bg-[#EFEAF5] dark:text-white dark:bg-white/[0.06] purple:text-[#7C5CFF] purple:bg-[#7C5CFF]/10"
          style={{
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: 650,
            padding: "7px 18px",
          }}
        >
          {children}
        </span>
      </p>
    );
  }

  return (
    <p
      className={`flex items-center gap-3 uppercase text-[#5D4387] dark:text-white purple:text-[#7C5CFF] ${center ? "justify-center" : ""}`}
      style={{
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: 650,
        margin: `0 0 ${marginBottom}px`,
      }}
    >
      {line && (
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 1,
            background: "currentColor",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </p>
  );
}

const COMMITMENTS = [
  {
    number: "01 / REVENUE",
    title: "Give from Our Growth",
    body: "Dedicate a portion of our revenue to charitable causes, vocational training and support for people and families affected by economic change.",
  },
  {
    number: "02 / ANGELS",
    title: "Share Our Angels",
    body: "Provide donated or discounted AI tools to nonprofit, educational and religious institutions across all beliefs and faiths, without prejudice—helping organizations that teach goodness, nurture virtues and serve their communities.",
  },
  {
    number: "03 / TIME",
    title: "Contribute Our Time",
    body: "Encourage and support our team in volunteering, mentoring and sharing practical expertise, including training in essential fields such as agriculture, caregiving, skilled trades and repair.",
  },
];

export default function ProgressWithPurposePage() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans antialiased bg-[#F8F7F5] text-[#19171D] dark:bg-[#0a0a0a] dark:text-white purple:bg-[#12103C] purple:text-[#F6F4FF]"
    >
      {/* Same nav + modals as the rest of the site (per the integration brief) — the reference
          build's own minimal brand+back-link header is not reused; only the page content below
          is matched to it exactly. */}
      <SiteHeader />

      <div className="flex-1 px-6 md:px-12 lg:px-20 pt-28 md:pt-32 pb-24">
        <main className="max-w-6xl mx-auto">
          {/* Hero — centered (the reference itself is left-aligned; centered per explicit
              request here instead). The compact pass drops the h1's <br> so "Progress with
              Purpose." is one line. */}
          <section style={{ textAlign: "center" }}>
            <Eyebrow center pill marginBottom={16}>
              Our philanthropic commitment
            </Eyebrow>
            <h1
              className="text-[#19171D] dark:text-white purple:text-[#F6F4FF]"
              style={{
                fontSize: 48,
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-1.6px",
                margin: "0 0 9px",
              }}
            >
              Progress with <span className="text-[#5D4387] dark:text-white purple:text-[#7C5CFF]">Purpose.</span>
            </h1>
            <p
              className="text-[#5D4387] dark:text-white purple:text-[#7C5CFF]"
              style={{
                fontSize: 21,
                lineHeight: 1.5,
                fontWeight: 400,
                letterSpacing: "-0.4px",
                margin: "0 0 12px",
              }}
            >
              We choose to measure success by the good we do with it.
            </p>
            <p
              className="text-[#635D6B] dark:text-white/55 purple:text-[#ABA6D9]"
              style={{
                maxWidth: 1050,
                margin: "0 auto",
                fontSize: 16,
                lineHeight: 1.5,
              }}
            >
              As AI transforms our world, we believe growing wealth and
              influence bring a responsibility to serve others. We are building
              philanthropy into our business through three commitments.
            </p>
          </section>

          {/* Three Commitments */}
          <section
            className="mt-6 pt-5 border-t border-[#DDD7E5] dark:border-white/10 purple:border-[#B79CFF]/15"
          >
            <h2
              className="text-[#635D6B] dark:text-white/55 purple:text-[#ABA6D9]"
              style={{
                fontSize: 12,
                fontWeight: 500,
                margin: "0 0 12px",
              }}
            >
              Revenue. Angels. Time.
            </h2>
            {/* Card style matches the site's standard capability-card pattern (Angel pages'
                Capabilities section) rather than this page's original reference-matched
                treatment — an explicit, deliberate override of that reference brief, requested
                to bring this section in line with the rest of the site. */}
            <div className="grid sm:grid-cols-3 gap-5">
              {COMMITMENTS.map((c) => (
                <div
                  key={c.number}
                  tabIndex={0}
                  className="rounded-2xl border-2 border-black/[0.08] bg-white dark:bg-white/[0.04] dark:border-white/10 purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 px-6 py-6 transition-colors cursor-pointer hover:border-[#5D4387] focus:outline-none focus:border-[#5D4387] active:border-[#5D4387] dark:hover:border-white/30 dark:focus:border-white/30 dark:active:border-white/30 purple:hover:border-[#7C5CFF] purple:focus:border-[#7C5CFF] purple:active:border-[#7C5CFF]"
                >
                  <span
                    className="inline-flex items-center justify-center w-[25px] h-[25px] rounded-md bg-[#EDE9F7] dark:bg-white/10 purple:bg-[#7C5CFF]/[0.15]"
                    aria-hidden="true"
                  >
                    <span className="w-[40%] h-[40%] rounded-[3px] bg-[#5D4387] dark:bg-white/70 purple:bg-[#B79CFF]" />
                  </span>
                  <p className="mt-4 font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">{c.title}</p>
                  <p className="mt-1.5 text-sm text-black/50 dark:text-white/55 purple:text-[#ABA6D9] leading-relaxed">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Vision / "Our inspiration" — a compact horizontal band (wash-tinted, vertically
              centered columns), not a tall two-column block; that's the base composition's
              shape, superseded by the compact pass same as everything else on this page. */}
          <section
            className="mt-6 grid md:grid-cols-[0.6fr_1.8fr] gap-6 md:items-center bg-[#EFEAF5] dark:bg-white/[0.06] purple:bg-[#7C5CFF]/10"
            style={{ borderRadius: 16, padding: "20px 26px" }}
          >
            <div>
              <Eyebrow marginBottom={7}>Our inspiration</Eyebrow>
              <h2
                className="text-[#19171D] dark:text-white purple:text-[#F6F4FF]"
                style={{
                  fontSize: 29,
                  lineHeight: 1.16,
                  letterSpacing: "-1px",
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                Sat Yug
                <span
                  className="text-[#5D4387] dark:text-white purple:text-[#7C5CFF]"
                  style={{
                    display: "block",
                    fontSize: 16,
                    letterSpacing: 0,
                    marginTop: 7,
                  }}
                >
                  The Age of Truth
                </span>
              </h2>
            </div>
            <div>
              <p
                className="text-[#51465F] dark:text-white/70 purple:text-[#ABA6D9]"
                style={{
                  margin: "0 0 7px",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Sat Yug, or <em>Satya Yuga</em>, literally means{" "}
                <strong>&ldquo;Age of Truth.&rdquo;</strong> In Hindu tradition,
                it represents an ideal age guided by truth and virtue.
              </p>
              <p
                className="text-[#51465F] dark:text-white/70 purple:text-[#ABA6D9]"
                style={{
                  margin: "0 0 7px",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                For us, it inspires a universal aspiration: shared prosperity,
                responsible leadership and a world where everyone&rsquo;s basic
                needs are met.
              </p>
              <p
                className="text-[#51465F] dark:text-white/70 purple:text-[#ABA6D9]"
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                We welcome people of every faith and none.
              </p>
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
