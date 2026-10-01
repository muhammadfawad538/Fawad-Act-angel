import { NextRequest, NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// See the matching comment in /api/otp/send/route.ts - same weak-but-useful check,
// not a true secret since this is also called directly from a browser.
function partnerKeyValid(request: NextRequest): boolean {
  const expected = process.env.NEXT_PUBLIC_PARTNER_API_KEY;
  return !!expected && request.headers.get("x-partner-api-key") === expected;
}

export async function POST(request: NextRequest) {
  if (!partnerKeyValid(request)) {
    return NextResponse.json({ error: "Invalid or missing X-Partner-Api-Key" }, { status: 401 });
  }

  let body: {
    orgName?: string;
    orgWebsite?: string;
    registrationRegion?: string;
    registrationNumber?: string;
    mission?: string;
    whereYouWork?: string;
    annualReport?: string;
    governancePage?: string;
    priority?: string;
    campaignPage?: string;
    helpFirst?: string;
    currentTools?: string;
    contactName?: string;
    contactRole?: string;
    workEmail?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orgName = body.orgName?.trim();
  const orgWebsite = body.orgWebsite?.trim();
  const registrationRegion = body.registrationRegion?.trim();
  const registrationNumber = body.registrationNumber?.trim();
  const mission = body.mission?.trim();
  const whereYouWork = body.whereYouWork?.trim();
  const priority = body.priority?.trim();
  const helpFirst = body.helpFirst?.trim();
  const contactName = body.contactName?.trim();
  const contactRole = body.contactRole?.trim();
  const workEmail = body.workEmail?.trim();
  // Optional fields - the frontend form already validates their URL shape when present,
  // so this route trusts that rather than re-validating syntax for fields that aren't
  // required at all.
  const annualReport = body.annualReport?.trim() ?? "";
  const governancePage = body.governancePage?.trim() ?? "";
  const campaignPage = body.campaignPage?.trim() ?? "";
  const currentTools = body.currentTools?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  const missing: string[] = [];
  if (!orgName) missing.push("organization name");
  if (!orgWebsite) missing.push("organization website");
  if (!registrationRegion) missing.push("registration country or region");
  if (!registrationNumber) missing.push("registration number, registry link, or exemption reason");
  if (!mission) missing.push("mission and who you serve");
  if (!whereYouWork) missing.push("where you work");
  if (!priority) missing.push("first priority");
  if (!helpFirst) missing.push("what to help with first");
  if (!contactName) missing.push("contact name");
  if (!contactRole) missing.push("contact role");
  if (!workEmail || !EMAIL.test(workEmail)) missing.push("a valid work email");
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing or invalid: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Mirrors the intake pattern in /api/otp/verify/route.ts: this route's only job is to
  // validate and forward to n8n, which owns storage (the AAA back-end). Not yet
  // configured - the receiving n8n workflow doesn't exist yet (see the Hope Angel
  // implementation plan) - so this correctly 500s with a clear reason until it is,
  // rather than silently pretending to succeed.
  const intakeUrl = process.env.N8N_HOPE_ANGEL_INTAKE_WEBHOOK_URL;
  const intakeApiKey = process.env.N8N_HOPE_ANGEL_INTAKE_WEBHOOK_API_KEY;
  if (!intakeUrl || !intakeApiKey) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing Hope Angel intake webhook config" },
      { status: 500 }
    );
  }

  try {
    const intakeRes = await fetch(intakeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Intake-Api-Key": intakeApiKey },
      body: JSON.stringify({
        orgName,
        orgWebsite,
        registrationRegion,
        registrationNumber,
        mission,
        whereYouWork,
        annualReport,
        governancePage,
        priority,
        campaignPage,
        helpFirst,
        currentTools,
        contactName,
        contactRole,
        workEmail,
        phone,
      }),
    });
    if (!intakeRes.ok) {
      return NextResponse.json({ error: "Intake submission failed" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Intake submission failed" }, { status: 502 });
  }

  return NextResponse.json({ submitted: true });
}
