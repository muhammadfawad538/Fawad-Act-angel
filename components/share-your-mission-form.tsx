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

const baseFieldClass =
  "bg-white border rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:ring-2 transition-colors w-full";
const okBorder = "border-black/10 focus:border-[#5D4387] focus:ring-[#5D4387]/20";
const errorBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/20";
function fieldClass(hasError: boolean) {
  return `${baseFieldClass} ${hasError ? errorBorder : okBorder}`;
}
const requiredLabelClass =
  "text-sm font-semibold text-[#111] after:content-['_*'] after:text-red-500 after:font-normal";
const optionalLabelClass =
  "text-sm font-semibold text-[#111] after:content-['_optional'] after:text-black/35 after:font-normal after:text-xs";
const primaryButtonClass =
  "w-full px-6 py-3 bg-[#5D4387] text-white text-[12px] font-semibold uppercase rounded-full hover:bg-[#7168A0] transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";

const MISSION_EMAIL = "Hello@ActAngel.com";

// Field-level validation covers every mandatory field (required-if-empty) plus the URL fields
// (checked for a valid shape whenever they're non-empty, required or not).
type FieldName =
  | "orgName"
  | "orgWebsite"
  | "registrationRegion"
  | "whereYouWork"
  | "registrationNumber"
  | "mission"
  | "priority"
  | "helpFirst"
  | "contactName"
  | "contactRole"
  | "workEmail"
  | "annualReport"
  | "governancePage"
  | "campaignPage";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateField(name: FieldName, value: string): string {
  const trimmed = value.trim();
  switch (name) {
    case "orgName":
      return trimmed ? "" : "Please enter your organization's name.";
    case "registrationRegion":
      return trimmed ? "" : "Please enter your registration country or region.";
    case "whereYouWork":
      return trimmed ? "" : "Please tell us where you work.";
    case "registrationNumber":
      return trimmed
        ? ""
        : "Please provide a registration number, registry link, or reason for exemption.";
    case "mission":
      return trimmed ? "" : "Please describe your mission and who you serve.";
    case "priority":
      return trimmed ? "" : "Please select your first priority.";
    case "helpFirst":
      return trimmed
        ? ""
        : "Please tell us what you'd like Hope Angel to help with first.";
    case "contactName":
      return trimmed ? "" : "Please enter your name.";
    case "contactRole":
      return trimmed ? "" : "Please enter your role at the NPO.";
    case "workEmail":
      if (!trimmed) return "Please enter your work email.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ""
        : "Please enter a valid email address.";
    case "orgWebsite":
      if (!trimmed) return "Please enter your organization's website.";
      return isValidUrl(trimmed)
        ? ""
        : "Please enter a valid URL (e.g. https://example.org).";
    case "annualReport":
    case "governancePage":
    case "campaignPage":
      return !trimmed || isValidUrl(trimmed)
        ? ""
        : "Please enter a valid URL (e.g. https://example.org).";
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  const fieldValues: Record<FieldName, string> = {
    orgName,
    orgWebsite,
    registrationRegion,
    whereYouWork,
    registrationNumber,
    mission,
    priority,
    helpFirst,
    contactName,
    contactRole,
    workEmail,
    annualReport,
    governancePage,
    campaignPage,
  };

  // Validates on blur (so errors show once the user leaves a field, not while they're still
  // typing it the first time), and live once a field already has an error showing, so it clears
  // the moment the value is fixed instead of waiting for another blur.
  function handleBlur(name: FieldName) {
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValues[name]) }));
  }
  function handleChange(name: FieldName, value: string, setter: (v: string) => void) {
    setter(value);
    setFieldErrors((prev) =>
      prev[name] ? { ...prev, [name]: validateField(name, value) } : prev,
    );
  }

  const canSubmit =
    orgName.trim() &&
    orgWebsite.trim() &&
    registrationRegion.trim() &&
    whereYouWork.trim() &&
    registrationNumber.trim() &&
    mission.trim() &&
    priority.trim() &&
    helpFirst.trim() &&
    contactName.trim() &&
    contactRole.trim() &&
    workEmail.trim() &&
    authorized;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nextFieldErrors: Partial<Record<FieldName, string>> = {};
    (Object.keys(fieldValues) as FieldName[]).forEach((name) => {
      const message = validateField(name, fieldValues[name]);
      if (message) nextFieldErrors[name] = message;
    });
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return setError("Please fix the highlighted fields before submitting.");
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

    // Best-effort structured capture alongside the mailto brief below. Fire-and-forget and
    // non-blocking on purpose: the mailto is still the real, working submission path, so a
    // failure here (e.g. while the receiving backend isn't wired up yet) must never delay or
    // interrupt it, and never surfaces an error to the applicant.
    fetch("/api/hope-angel/intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Api-Key": process.env.NEXT_PUBLIC_PARTNER_API_KEY ?? "",
      },
      body: JSON.stringify({
        orgName: orgName.trim(),
        orgWebsite: orgWebsite.trim(),
        registrationRegion: registrationRegion.trim(),
        registrationNumber: registrationNumber.trim(),
        mission: mission.trim(),
        whereYouWork: whereYouWork.trim(),
        annualReport: annualReport.trim(),
        governancePage: governancePage.trim(),
        priority,
        campaignPage: campaignPage.trim(),
        helpFirst: helpFirst.trim(),
        currentTools: currentTools.trim(),
        contactName: contactName.trim(),
        contactRole: contactRole.trim(),
        workEmail: workEmail.trim(),
        phone: phone.trim(),
      }),
    }).catch(() => {});

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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <div>
        <h2 className="text-base font-semibold text-[#111]">
          Your organization
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={requiredLabelClass}>Organization name</label>
            <input
              value={orgName}
              onChange={(e) => handleChange("orgName", e.target.value, setOrgName)}
              onBlur={() => handleBlur("orgName")}
              className={`${fieldClass(!!fieldErrors.orgName)} mt-2`}
            />
            <FieldError message={fieldErrors.orgName} />
          </div>
          <div>
            <label className={requiredLabelClass}>Organization website</label>
            <input
              value={orgWebsite}
              onChange={(e) => handleChange("orgWebsite", e.target.value, setOrgWebsite)}
              onBlur={() => handleBlur("orgWebsite")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.orgWebsite)} mt-2`}
            />
            <FieldError message={fieldErrors.orgWebsite} />
          </div>
          <div>
            <label className={requiredLabelClass}>Registration country or region</label>
            <input
              value={registrationRegion}
              onChange={(e) => handleChange("registrationRegion", e.target.value, setRegistrationRegion)}
              onBlur={() => handleBlur("registrationRegion")}
              className={`${fieldClass(!!fieldErrors.registrationRegion)} mt-2`}
            />
            <FieldError message={fieldErrors.registrationRegion} />
          </div>
          <div>
            <label className={requiredLabelClass}>Where do you work?</label>
            <input
              value={whereYouWork}
              onChange={(e) => handleChange("whereYouWork", e.target.value, setWhereYouWork)}
              onBlur={() => handleBlur("whereYouWork")}
              placeholder="City, region, or countries"
              className={`${fieldClass(!!fieldErrors.whereYouWork)} mt-2`}
            />
            <FieldError message={fieldErrors.whereYouWork} />
          </div>
          <div className="sm:col-span-2">
            <label className={requiredLabelClass}>
              Registration number, registry link, or reason for exemption
            </label>
            <input
              value={registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value, setRegistrationNumber)}
              onBlur={() => handleBlur("registrationNumber")}
              placeholder="Include the public record if available"
              className={`${fieldClass(!!fieldErrors.registrationNumber)} mt-2`}
            />
            <FieldError message={fieldErrors.registrationNumber} />
          </div>
          <div className="sm:col-span-2">
            <label className={requiredLabelClass}>
              What is your mission, and who do you serve?
            </label>
            <textarea
              value={mission}
              onChange={(e) => handleChange("mission", e.target.value, setMission)}
              onBlur={() => handleBlur("mission")}
              rows={3}
              placeholder="A brief description is enough to begin."
              className={`${fieldClass(!!fieldErrors.mission)} mt-2 resize-none`}
            />
            <FieldError message={fieldErrors.mission} />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Public annual report or impact page
            </label>
            <input
              value={annualReport}
              onChange={(e) => handleChange("annualReport", e.target.value, setAnnualReport)}
              onBlur={() => handleBlur("annualReport")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.annualReport)} mt-2`}
            />
            <FieldError message={fieldErrors.annualReport} />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Leadership or governance page
            </label>
            <input
              value={governancePage}
              onChange={(e) => handleChange("governancePage", e.target.value, setGovernancePage)}
              onBlur={() => handleBlur("governancePage")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.governancePage)} mt-2`}
            />
            <FieldError message={fieldErrors.governancePage} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#111]">
          How Hope Angel could help
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={requiredLabelClass}>Your first priority</label>
            <select
              value={priority}
              onChange={(e) => {
                const value = e.target.value as Priority | "";
                setPriority(value);
                setFieldErrors((prev) =>
                  prev.priority ? { ...prev, priority: validateField("priority", value) } : prev,
                );
              }}
              onBlur={() => handleBlur("priority")}
              className={`${fieldClass(!!fieldErrors.priority)} mt-2`}
            >
              <option value="">Select one</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.priority} />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Donation or campaign page
            </label>
            <input
              value={campaignPage}
              onChange={(e) => handleChange("campaignPage", e.target.value, setCampaignPage)}
              onBlur={() => handleBlur("campaignPage")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.campaignPage)} mt-2`}
            />
            <FieldError message={fieldErrors.campaignPage} />
          </div>
          <div className="sm:col-span-2">
            <label className={requiredLabelClass}>
              What would you like Hope Angel to help with first?
            </label>
            <textarea
              value={helpFirst}
              onChange={(e) => handleChange("helpFirst", e.target.value, setHelpFirst)}
              onBlur={() => handleBlur("helpFirst")}
              rows={3}
              placeholder="For example, welcome new volunteers or follow up with donors."
              className={`${fieldClass(!!fieldErrors.helpFirst)} mt-2 resize-none`}
            />
            <FieldError message={fieldErrors.helpFirst} />
          </div>
          <div className="sm:col-span-2">
            <label className={optionalLabelClass}>
              Current tools or communication channels
            </label>
            <input
              value={currentTools}
              onChange={(e) => setCurrentTools(e.target.value)}
              placeholder="For example, CRM, donation platform, email, WhatsApp"
              className={`${fieldClass(false)} mt-2`}
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
            <label className={requiredLabelClass}>Your name</label>
            <input
              value={contactName}
              onChange={(e) => handleChange("contactName", e.target.value, setContactName)}
              onBlur={() => handleBlur("contactName")}
              className={`${fieldClass(!!fieldErrors.contactName)} mt-2`}
            />
            <FieldError message={fieldErrors.contactName} />
          </div>
          <div>
            <label className={requiredLabelClass}>Your role at the NPO</label>
            <input
              value={contactRole}
              onChange={(e) => handleChange("contactRole", e.target.value, setContactRole)}
              onBlur={() => handleBlur("contactRole")}
              className={`${fieldClass(!!fieldErrors.contactRole)} mt-2`}
            />
            <FieldError message={fieldErrors.contactRole} />
          </div>
          <div>
            <label className={requiredLabelClass}>Work email</label>
            <input
              value={workEmail}
              onChange={(e) => handleChange("workEmail", e.target.value, setWorkEmail)}
              onBlur={() => handleBlur("workEmail")}
              type="email"
              className={`${fieldClass(!!fieldErrors.workEmail)} mt-2`}
            />
            <FieldError message={fieldErrors.workEmail} />
          </div>
          <div>
            <label className={optionalLabelClass}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className={`${fieldClass(false)} mt-2`}
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
