"use client";

import { useState } from "react";
import Link from "next/link";

type Priority =
  | "Purposeful fundraising"
  | "Donor engagement"
  | "Volunteer outreach"
  | "Funding applications and disbursement support"
  | "Multilingual communications"
  | "Several of these";

const PRIORITIES: Priority[] = [
  "Purposeful fundraising",
  "Donor engagement",
  "Volunteer outreach",
  "Funding applications and disbursement support",
  "Multilingual communications",
  "Several of these",
];

const inputClass =
  "bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-[#5D4387] focus:ring-2 focus:ring-[#5D4387]/20 transition-colors w-full";
const textareaClass = `${inputClass} resize-none`;
const labelClass = "text-sm font-semibold text-[#111]";
const optionalLabelClass =
  "text-sm font-semibold text-[#111] after:content-['_optional'] after:text-black/35 after:font-normal after:text-xs";
const primaryButtonClass =
  "w-full px-6 py-3 bg-[#5D4387] text-white text-[12px] font-semibold uppercase rounded-full hover:bg-[#7168A0] transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";

const MISSION_EMAIL = "Hello@ActAngel.com";

/**
 * The nonprofit application form from https://hope-angel.vercel.app/hire-an-angel/hope-angel's
 * "Share Your Mission" flow: no backend submission — it just prepares a mailto: brief for the
 * NPO to send, since eligibility/authenticity review is a manual, human step on Act Angel's side
 * before an Angel is offered.
 */
export function ShareYourMissionForm() {
  const [ready, setReady] = useState(false);
  const [mailtoHref, setMailtoHref] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [registrationRegion, setRegistrationRegion] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [mission, setMission] = useState("");
  const [whereYouWork, setWhereYouWork] = useState("");
  const [annualReport, setAnnualReport] = useState("");
  const [governancePage, setGovernancePage] = useState("");

  const [priority, setPriority] = useState<Priority | "">("");
  const [campaignPage, setCampaignPage] = useState("");
  const [helpFirst, setHelpFirst] = useState("");
  const [currentTools, setCurrentTools] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    orgName.trim() &&
    mission.trim() &&
    contactName.trim() &&
    workEmail.trim() &&
    authorized;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !orgName.trim() ||
      !mission.trim() ||
      !contactName.trim() ||
      !workEmail.trim()
    ) {
      return setError(
        "Please fill in your organization name, mission, name, and work email.",
      );
    }
    if (!authorized) {
      return setError(
        "Please confirm you're authorized to contact us on your organization's behalf.",
      );
    }

    const lines = [
      `Organization name: ${orgName.trim()}`,
      `Organization website: ${orgWebsite.trim() || "—"}`,
      `Registration country or region: ${registrationRegion.trim() || "—"}`,
      `Registration number, registry link, or reason for exemption: ${registrationNumber.trim() || "—"}`,
      "",
      `Mission and who you serve: ${mission.trim()}`,
      `Where you work: ${whereYouWork.trim() || "—"}`,
      `Public annual report or impact page: ${annualReport.trim() || "—"}`,
      `Leadership or governance page: ${governancePage.trim() || "—"}`,
      "",
      `First priority for Hope Angel: ${priority || "—"}`,
      `Donation or campaign page: ${campaignPage.trim() || "—"}`,
      `What you'd like Hope Angel to help with first: ${helpFirst.trim() || "—"}`,
      `Current tools or communication channels: ${currentTools.trim() || "—"}`,
      "",
      `Contact name: ${contactName.trim()}`,
      `Role at the NPO: ${contactRole.trim() || "—"}`,
      `Work email: ${workEmail.trim()}`,
      `Phone: ${phone.trim() || "—"}`,
    ];

    const subject = `Share Your Mission: ${orgName.trim()}`;
    const href = `mailto:${MISSION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setMailtoHref(href);
    setReady(true);
    // Opened synchronously within this click handler (not a useEffect) so browsers treat it as
    // a direct result of the user's action instead of an unrequested popup.
    window.location.href = href;
  }

  if (ready) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-600/20 text-emerald-600 flex items-center justify-center text-xl">
          ✓
        </div>
        <h3 className="text-lg font-medium">Your brief is ready to send.</h3>
        <p className="text-sm text-black/55 max-w-sm">
          Please send the prepared email to{" "}
          <a
            href={`mailto:${MISSION_EMAIL}`}
            className="underline hover:text-black/70"
          >
            {MISSION_EMAIL}
          </a>
          . Once sent, you may meet an Angel through our{" "}
          <Link href="/get-started" className="underline hover:text-black/70">
            Get Started
          </Link>{" "}
          page. Our team will review your organization before offering Hope
          Angel.
        </p>
        <a
          href={mailtoHref}
          className={`${primaryButtonClass} inline-flex items-center justify-center gap-1`}
        >
          Didn&rsquo;t open? Open your email app →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <h2 className="text-base font-semibold text-[#111]">
          Your organization
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={labelClass}>Organization name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>Organization website</label>
            <input
              value={orgWebsite}
              onChange={(e) => setOrgWebsite(e.target.value)}
              type="url"
              placeholder="https://"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>Registration country or region</label>
            <input
              value={registrationRegion}
              onChange={(e) => setRegistrationRegion(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>Where do you work?</label>
            <input
              value={whereYouWork}
              onChange={(e) => setWhereYouWork(e.target.value)}
              placeholder="City, region, or countries"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Registration number, registry link, or reason for exemption
            </label>
            <input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Include the public record if available"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              What is your mission, and who do you serve?
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={3}
              placeholder="A brief description is enough to begin."
              className={`${textareaClass} mt-2`}
            />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Public annual report or impact page
            </label>
            <input
              value={annualReport}
              onChange={(e) => setAnnualReport(e.target.value)}
              type="url"
              placeholder="https://"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Leadership or governance page
            </label>
            <input
              value={governancePage}
              onChange={(e) => setGovernancePage(e.target.value)}
              type="url"
              placeholder="https://"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111]">
          How Hope Angel could help
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={labelClass}>Your first priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority | "")}
              className={`${inputClass} mt-2`}
            >
              <option value="">Select one</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={optionalLabelClass}>
              Donation or campaign page
            </label>
            <input
              value={campaignPage}
              onChange={(e) => setCampaignPage(e.target.value)}
              type="url"
              placeholder="https://"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              What would you like Hope Angel to help with first?
            </label>
            <textarea
              value={helpFirst}
              onChange={(e) => setHelpFirst(e.target.value)}
              rows={3}
              placeholder="For example, welcome new volunteers or follow up with donors."
              className={`${textareaClass} mt-2`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={optionalLabelClass}>
              Current tools or communication channels
            </label>
            <input
              value={currentTools}
              onChange={(e) => setCurrentTools(e.target.value)}
              placeholder="For example, CRM, donation platform, email, WhatsApp"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111]">
          Who we can contact
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={labelClass}>Your name</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>Your role at the NPO</label>
            <input
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>Work email</label>
            <input
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              type="email"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={optionalLabelClass}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-2 text-[14px] text-black/55 leading-snug">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          I am authorized to contact Act Angel AI on behalf of this
          organization. The details I provided are accurate to the best of my
          knowledge. I understand that complimentary service depends on
          eligibility, authenticity, and ethical review.
        </label>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <p className="text-[10.5px] leading-tight text-black/60">
          We use these details to review your enquiry and contact you. Please do
          not include personal information about beneficiaries or confidential
          financial records. See our{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="underline hover:text-black/60"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className={primaryButtonClass}
        >
          Prepare My Mission Brief
        </button>

        <p className="text-[10.5px] leading-tight text-black/60 text-center">
          Your email app will open with this brief addressed to Act Angel AI.
          Send the email to complete your enquiry.
        </p>
      </div>
    </form>
  );
}
