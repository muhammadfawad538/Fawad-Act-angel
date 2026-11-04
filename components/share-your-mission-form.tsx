"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { normalizePhone } from "@/lib/phone";
import { hasMeaningfulContent } from "@/lib/text-quality";
import { saveDraft, loadDraft, clearDraft } from "@/lib/form-draft";
import { isValidUrl } from "@/lib/url";

// Used only until the /api/hope-angel/priority-options fetch below resolves, so the
// dropdown isn't empty on first render or if that fetch fails - not the source of truth.
// The actual list lives in data/hope-angel-priority-options.json (not hardcoded here)
// since the client hasn't confirmed yet whether these six are final or who manages them.
const FALLBACK_PRIORITIES = [
  "Purposeful fundraising",
  "Donor engagement",
  "Volunteer outreach",
  "Funding applications and disbursement support",
  "Multilingual communications",
  "Several of these",
];

const baseFieldClass =
  "bg-white border rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:ring-2 transition-colors w-full dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/30 purple:bg-[#12103C]/50 purple:text-[#F6F4FF] purple:placeholder:text-[#ABA6D9]/50";
const okBorder =
  "border-black/10 focus:border-[#5D4387] focus:ring-[#5D4387]/20 dark:border-white/15 dark:focus:border-white/40 dark:focus:ring-white/20 purple:border-[#B79CFF]/20 purple:focus:border-[#7C5CFF]/60 purple:focus:ring-[#7C5CFF]/20";
const errorBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/20";
function fieldClass(hasError: boolean) {
  return `${baseFieldClass} ${hasError ? errorBorder : okBorder}`;
}
const requiredLabelClass =
  "text-sm font-semibold text-[#111] after:content-['_*'] after:text-red-500 after:font-normal dark:text-white purple:text-[#F6F4FF]";
const optionalLabelClass =
  "text-sm font-semibold text-[#111] after:content-['_optional'] after:text-black/35 after:font-normal after:text-xs dark:text-white dark:after:text-white/45 purple:text-[#F6F4FF] purple:after:text-[#716C9E]";
const primaryButtonClass =
  "w-full px-6 py-3 bg-[#5D4387] text-white text-[12px] font-semibold uppercase rounded-full hover:bg-[#7168A0] transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-white/85 purple:bg-[#7C5CFF] purple:hover:bg-[#8F72FF]";

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
  | "campaignPage"
  | "phone";

function validateField(name: FieldName, value: string): string {
  const trimmed = value.trim();
  switch (name) {
    case "orgName":
      return hasMeaningfulContent(value) ? "" : "Please enter your organization's name.";
    case "registrationRegion":
      return hasMeaningfulContent(value)
        ? ""
        : "Please enter your registration country or region.";
    case "whereYouWork":
      return hasMeaningfulContent(value) ? "" : "Please tell us where you work.";
    case "registrationNumber":
      return hasMeaningfulContent(value)
        ? ""
        : "Please provide a registration number, registry link, or reason for exemption.";
    case "mission":
      return hasMeaningfulContent(value)
        ? ""
        : "Please describe your mission and who you serve.";
    case "priority":
      return trimmed ? "" : "Please select your first priority.";
    case "helpFirst":
      return hasMeaningfulContent(value)
        ? ""
        : "Please tell us what you'd like Hope Angel to help with first.";
    case "contactName":
      return hasMeaningfulContent(value) ? "" : "Please enter your name.";
    case "contactRole":
      return hasMeaningfulContent(value) ? "" : "Please enter your role at the NPO.";
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
    case "phone":
      // Optional - only validated when non-empty. normalizePhone requires an explicit
      // country code (leading '+'), which is what makes this work for any country without
      // a country-specific regex; it also strips spaces/dashes/parens/dots before checking,
      // so normal formatting is still allowed.
      return !trimmed || normalizePhone(trimmed)
        ? ""
        : "Please enter a valid phone number including country code, e.g. +14155551234 or +919876543210.";
  }
}

// Truncates a dropdown option's label with an ellipsis once it no longer fits the (now
// trigger-width-constrained) menu. Every option gets a tooltip showing its full text on hover,
// not just the ones currently truncated, so it stays correct if the menu's width (and therefore
// which options clip) changes later.
//
// line-clamp-1 (not `truncate`) — same mechanism SelectTrigger already uses for the closed
// field's value (components/ui/select.tsx), which held up inside this component's nested flex
// layout where plain `truncate`'s width-based ellipsis didn't reliably trigger.
function TruncatedOptionText({ text }: { text: string }) {
  const span = (
    <span className="line-clamp-1 w-full min-w-0 max-w-full">{text}</span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{span}</TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 purple:text-red-400">{message}</p>;
}

// AAA-HA-002: the form kept all entered values in plain component state only, so navigating
// away (including via the browser Back button from the "ready" screen, which isn't a separate
// route/history entry - see share-your-mission-form.tsx's handleSubmit) and reopening
// /share-your-mission unmounted and remounted the component from scratch, losing everything
// typed. Persisting to sessionStorage (tab-scoped, gone once the tab closes) survives that
// without needing any routing changes.
const DRAFT_STORAGE_KEY = "shareYourMissionForm:draft";
type DraftFields = Record<FieldName, string> & { currentTools: string };

/**
 * The nonprofit application form from https://hope-angel.vercel.app/hire-an-angel/hope-angel's
 * "Share Your Mission" flow. Submits to /api/hope-angel/intake, which proxies it into the WEB
 * backend's registration-requests queue for a SAD to review, since eligibility/authenticity
 * review is a manual, human step on Act Angel's side before an Angel is offered.
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

  const [priority, setPriority] = useState("");
  const [priorityOptions, setPriorityOptions] = useState<string[]>(FALLBACK_PRIORITIES);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/hope-angel/priority-options")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { options?: unknown }) => {
        if (!cancelled && Array.isArray(data.options) && data.options.length) {
          setPriorityOptions(data.options as string[]);
        }
      })
      .catch(() => {
        // Keep FALLBACK_PRIORITIES - better to show something than block the form.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  // Measured directly rather than left to Radix's own --radix-select-trigger-width CSS var:
  // that var didn't reliably keep the open dropdown panel at exactly the trigger's width at
  // small viewport sizes. A ResizeObserver on the trigger's wrapper gives us the real pixel
  // width to set on SelectContent's own `style`, which always wins over any CSS-based sizing.
  const priorityTriggerWrapperRef = useRef<HTMLDivElement>(null);
  const [priorityTriggerWidth, setPriorityTriggerWidth] = useState<number>();
  useEffect(() => {
    const el = priorityTriggerWrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setPriorityTriggerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [campaignPage, setCampaignPage] = useState("");
  const [helpFirst, setHelpFirst] = useState("");
  const [currentTools, setCurrentTools] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});

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
    phone,
  };

  // Restores a previously saved draft on mount (e.g. after Back navigation, a reload, or
  // reopening this page), so entered data survives rather than starting blank. Runs once,
  // after mount rather than in a lazy useState initializer, since sessionStorage isn't
  // available during server rendering and reading it there would cause a hydration mismatch.
  useEffect(() => {
    const d = loadDraft(DRAFT_STORAGE_KEY);
    if (!d) return;

    const restore = (value: unknown, setter: (v: string) => void) => {
      if (typeof value === "string" && value) setter(value);
    };
    restore(d.orgName, setOrgName);
    restore(d.orgWebsite, setOrgWebsite);
    restore(d.registrationRegion, setRegistrationRegion);
    restore(d.whereYouWork, setWhereYouWork);
    restore(d.registrationNumber, setRegistrationNumber);
    restore(d.mission, setMission);
    restore(d.priority, setPriority);
    restore(d.helpFirst, setHelpFirst);
    restore(d.currentTools, setCurrentTools);
    restore(d.contactName, setContactName);
    restore(d.contactRole, setContactRole);
    restore(d.workEmail, setWorkEmail);
    restore(d.annualReport, setAnnualReport);
    restore(d.governancePage, setGovernancePage);
    restore(d.campaignPage, setCampaignPage);
    restore(d.phone, setPhone);
  }, []);

  // Keeps the draft above current as the user types, so in-progress work survives accidental
  // navigation. Cleared separately in handleSubmit once a submission actually completes
  // (AAA-HA-008) - this effect's job is only to persist while the user is still filling the
  // form in, not to decide when a finished submission's data should stop reappearing.
  useEffect(() => {
    const draft: DraftFields = { ...fieldValues, currentTools };
    saveDraft(DRAFT_STORAGE_KEY, draft);
  }, [
    orgName,
    orgWebsite,
    registrationRegion,
    whereYouWork,
    registrationNumber,
    mission,
    priority,
    helpFirst,
    currentTools,
    contactName,
    contactRole,
    workEmail,
    annualReport,
    governancePage,
    campaignPage,
    phone,
  ]);

  // Validates on blur (so errors show once the user leaves a field, not while they're still
  // typing it the first time), and live once a field already has an error showing, so it clears
  // the moment the value is fixed instead of waiting for another blur.
  function handleBlur(name: FieldName) {
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, fieldValues[name]),
    }));
  }
  function handleChange(
    name: FieldName,
    value: string,
    setter: (v: string) => void,
  ) {
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

  async function handleSubmit(e: React.FormEvent) {
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
    // AAA-HA-008: a completed submission is done - the next time this form is opened, it
    // should be a fresh one, not a resurrected copy of what was already sent. Clearing here
    // (not earlier) means in-progress work is never lost while the user is still filling the
    // form in or hasn't submitted yet - only a real, successful submission triggers this.
    clearDraft(DRAFT_STORAGE_KEY);
    // Opened synchronously within this click handler (not a useEffect) so browsers treat it as
    // a direct result of the user's action instead of an unrequested popup.
    window.location.href = href;
  }

  if (ready) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-600/20 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400 purple:bg-emerald-500/15 purple:border-emerald-500/30 purple:text-emerald-400 flex items-center justify-center text-xl">
          ✓
        </div>
        <h3 className="text-lg font-medium">Your brief is ready to send.</h3>
        <p className="text-sm text-black/55 dark:text-white/65 purple:text-[#ABA6D9] max-w-sm">
          Please send the prepared email to{" "}
          <a
            href={`mailto:${MISSION_EMAIL}`}
            className="underline hover:text-black/70 dark:hover:text-white purple:hover:text-[#F6F4FF]"
          >
            {MISSION_EMAIL}
          </a>
          . Once sent, you may meet an Angel through our{" "}
          <Link href="/get-started" className="underline hover:text-black/70 dark:hover:text-white purple:hover:text-[#F6F4FF]">
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
        <h2 className="text-base font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
          Your organization
        </h2>
        <div className="mt-5 grid [@media(min-width:1180px)]:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={requiredLabelClass}>Organization name</label>
            <input
              value={orgName}
              onChange={(e) =>
                handleChange("orgName", e.target.value, setOrgName)
              }
              onBlur={() => handleBlur("orgName")}
              className={`${fieldClass(!!fieldErrors.orgName)} mt-2`}
            />
            <FieldError message={fieldErrors.orgName} />
          </div>
          <div>
            <label className={requiredLabelClass}>Organization website</label>
            <input
              value={orgWebsite}
              onChange={(e) =>
                handleChange("orgWebsite", e.target.value, setOrgWebsite)
              }
              onBlur={() => handleBlur("orgWebsite")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.orgWebsite)} mt-2`}
            />
            <FieldError message={fieldErrors.orgWebsite} />
          </div>
          <div>
            <label className={requiredLabelClass}>
              Registration country or region
            </label>
            <input
              value={registrationRegion}
              onChange={(e) =>
                handleChange(
                  "registrationRegion",
                  e.target.value,
                  setRegistrationRegion,
                )
              }
              onBlur={() => handleBlur("registrationRegion")}
              className={`${fieldClass(!!fieldErrors.registrationRegion)} mt-2`}
            />
            <FieldError message={fieldErrors.registrationRegion} />
          </div>
          <div>
            <label className={requiredLabelClass}>Where do you work?</label>
            <input
              value={whereYouWork}
              onChange={(e) =>
                handleChange("whereYouWork", e.target.value, setWhereYouWork)
              }
              onBlur={() => handleBlur("whereYouWork")}
              placeholder="City, region, or countries"
              className={`${fieldClass(!!fieldErrors.whereYouWork)} mt-2`}
            />
            <FieldError message={fieldErrors.whereYouWork} />
          </div>
          <div className="[@media(min-width:1180px)]:col-span-2">
            <label className={requiredLabelClass}>
              Registration number, registry link, or reason for exemption
            </label>
            <input
              value={registrationNumber}
              onChange={(e) =>
                handleChange(
                  "registrationNumber",
                  e.target.value,
                  setRegistrationNumber,
                )
              }
              onBlur={() => handleBlur("registrationNumber")}
              placeholder="Include the public record if available"
              className={`${fieldClass(!!fieldErrors.registrationNumber)} mt-2`}
            />
            <FieldError message={fieldErrors.registrationNumber} />
          </div>
          <div className="[@media(min-width:1180px)]:col-span-2">
            <label className={requiredLabelClass}>
              What is your mission, and who do you serve?
            </label>
            <textarea
              value={mission}
              onChange={(e) =>
                handleChange("mission", e.target.value, setMission)
              }
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
              onChange={(e) =>
                handleChange("annualReport", e.target.value, setAnnualReport)
              }
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
              onChange={(e) =>
                handleChange(
                  "governancePage",
                  e.target.value,
                  setGovernancePage,
                )
              }
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
        <h2 className="text-base font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
          How Hope Angel could help
        </h2>
        <div className="mt-5 grid [@media(min-width:1180px)]:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={requiredLabelClass}>Your first priority</label>
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value);
                setFieldErrors((prev) =>
                  prev.priority
                    ? { ...prev, priority: validateField("priority", value) }
                    : prev,
                );
              }}
            >
              <div ref={priorityTriggerWrapperRef} className="mt-2">
                {/* whitespace-normal overrides the base component's whitespace-nowrap — verified
                    with Playwright (measuring the trigger's own boundingBox before/after
                    selecting a long option) that nowrap was the actual cause of the field
                    growing: below the 1180px breakpoint this grid has no explicit
                    grid-template-columns, so its single column's width is driven by the widest
                    max-content contribution among its children. With nowrap, the browser treats
                    a long selected label as one unbreakable line when computing that
                    max-content, which forced the whole column (not just this field — every
                    field sharing it grows in lockstep) past the viewport width. line-clamp-1
                    (on the value span) doesn't need nowrap to clip to one line; it just needs
                    white-space to allow wrapping so intrinsic sizing stays sane, then clips
                    visually once a real width is assigned.
                    *:data-[slot=select-value]:min-w-0/max-w-full — Radix's Select.Value
                    primitive silently drops any className passed directly to it (destructured
                    out of props, never spread onto the rendered span — confirmed in
                    @radix-ui/react-select's source), so it has to be targeted this way, the
                    same descendant-selector mechanism the base component already uses for its
                    other styling. */}
                <SelectTrigger
                  onBlur={() => handleBlur("priority")}
                  className={`${fieldClass(!!fieldErrors.priority)} h-auto data-[size=default]:h-auto font-normal overflow-hidden whitespace-normal *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:max-w-full focus-visible:border-[#5D4387] focus-visible:ring-[#5D4387]/20 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/20 purple:focus-visible:border-[#7C5CFF]/60 purple:focus-visible:ring-[#7C5CFF]/20`}
                >
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
              </div>
              <SelectContent
                side="bottom"
                avoidCollisions={false}
                style={priorityTriggerWidth ? { width: priorityTriggerWidth } : undefined}
                className="rounded-xl border-black/10 shadow-lg dark:bg-[#0a0a0a] dark:border-white/10 dark:text-white purple:bg-[#1C1A56] purple:border-[#B79CFF]/15 purple:text-[#F6F4FF]"
              >
                {priorityOptions.map((p) => (
                  <SelectItem
                    key={p}
                    value={p}
                    className="cursor-pointer rounded-lg text-sm focus:bg-[#5D4387]/10 focus:text-[#5D4387] data-[state=checked]:font-medium data-[state=checked]:text-[#5D4387] [&_svg:not([class*='text-'])]:text-[#5D4387] dark:focus:bg-white/10 dark:focus:text-white dark:data-[state=checked]:text-white dark:[&_svg:not([class*='text-'])]:text-white purple:focus:bg-[#7C5CFF]/15 purple:focus:text-[#B79CFF] purple:data-[state=checked]:text-[#B79CFF] purple:[&_svg:not([class*='text-'])]:text-[#B79CFF]"
                  >
                    <TruncatedOptionText text={p} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={fieldErrors.priority} />
          </div>
          <div>
            <label className={optionalLabelClass}>
              Donation or campaign page
            </label>
            <input
              value={campaignPage}
              onChange={(e) =>
                handleChange("campaignPage", e.target.value, setCampaignPage)
              }
              onBlur={() => handleBlur("campaignPage")}
              type="url"
              placeholder="https://"
              className={`${fieldClass(!!fieldErrors.campaignPage)} mt-2`}
            />
            <FieldError message={fieldErrors.campaignPage} />
          </div>
          <div className="[@media(min-width:1180px)]:col-span-2">
            <label className={requiredLabelClass}>
              What would you like Hope Angel to help with first?
            </label>
            <textarea
              value={helpFirst}
              onChange={(e) =>
                handleChange("helpFirst", e.target.value, setHelpFirst)
              }
              onBlur={() => handleBlur("helpFirst")}
              rows={3}
              placeholder="For example, welcome new volunteers or follow up with donors."
              className={`${fieldClass(!!fieldErrors.helpFirst)} mt-2 resize-none`}
            />
            <FieldError message={fieldErrors.helpFirst} />
          </div>
          <div className="[@media(min-width:1180px)]:col-span-2">
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
        <h2 className="text-base font-semibold text-[#111] dark:text-white purple:text-[#F6F4FF]">
          Who we can contact
        </h2>
        <div className="mt-5 grid [@media(min-width:1180px)]:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={requiredLabelClass}>Your name</label>
            <input
              value={contactName}
              onChange={(e) =>
                handleChange("contactName", e.target.value, setContactName)
              }
              onBlur={() => handleBlur("contactName")}
              className={`${fieldClass(!!fieldErrors.contactName)} mt-2`}
            />
            <FieldError message={fieldErrors.contactName} />
          </div>
          <div>
            <label className={requiredLabelClass}>Your role at the NPO</label>
            <input
              value={contactRole}
              onChange={(e) =>
                handleChange("contactRole", e.target.value, setContactRole)
              }
              onBlur={() => handleBlur("contactRole")}
              className={`${fieldClass(!!fieldErrors.contactRole)} mt-2`}
            />
            <FieldError message={fieldErrors.contactRole} />
          </div>
          <div>
            <label className={requiredLabelClass}>Work email</label>
            <input
              value={workEmail}
              onChange={(e) =>
                handleChange("workEmail", e.target.value, setWorkEmail)
              }
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
              onChange={(e) => handleChange("phone", e.target.value, setPhone)}
              onBlur={() => handleBlur("phone")}
              type="tel"
              placeholder="+1 415 555 1234"
              className={`${fieldClass(!!fieldErrors.phone)} mt-2`}
            />
            <FieldError message={fieldErrors.phone} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-2 text-[14px] text-black/55 dark:text-white/65 purple:text-[#ABA6D9] leading-snug">
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

        {error && <div className="text-xs text-red-600 dark:text-red-400 purple:text-red-400">{error}</div>}

        <p className="text-[10.5px] leading-tight text-black/60 dark:text-white/45 purple:text-[#716C9E]">
          We use these details to review your enquiry and contact you. Please do
          not include personal information about beneficiaries or confidential
          financial records. See our{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="underline hover:text-black/60 dark:hover:text-white purple:hover:text-[#F6F4FF]"
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

        <p className="text-[10.5px] leading-tight text-black/60 dark:text-white/45 purple:text-[#716C9E] text-center">
          Your email app will open with this brief addressed to Act Angel AI.
          Send the email to complete your enquiry.
        </p>
      </div>
    </form>
  );
}
