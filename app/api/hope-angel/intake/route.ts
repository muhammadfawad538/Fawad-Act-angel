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

  // Forwards into the ACT Angel AI WEB backend's registration-requests queue (the same
  // public endpoint the WEB "Get Started" form uses, with formType "hope_angel_mission"),
  // where a SAD reviews it. Mission goes in `message`; the remaining fields live in `details`.
  const webApiUrl = process.env.ACTANGEL_WEB_API_URL;
  if (!webApiUrl) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing ACTANGEL_WEB_API_URL" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${webApiUrl.replace(/\/+$/, "")}/api/registration-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactName,
        email: workEmail,
        organizationName: orgName,
        phone: phone || undefined,
        message: mission,
        formType: "hope_angel_mission",
        details: {
          organizationWebsite: orgWebsite,
          registrationRegion,
          registrationNumber,
          whereYouWork,
          annualReport,
          governancePage,
          priority,
          campaignPage,
          helpFirst,
          currentTools,
          contactRole,
        },
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Intake submission failed" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Intake submission failed" }, { status: 502 });
  }

  return NextResponse.json({ submitted: true });
}
