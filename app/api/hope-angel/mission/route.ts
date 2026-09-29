import { NextRequest, NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Share Your Mission" (Hope Angel persona intake) proxies to the WEB
// backend's public registration-requests queue - same table a SAD reviews
// for the generic "Get Started" form, tagged formType: "hope_angel_mission"
// so it's not mistaken for one. Public, unauthenticated (rate-limited on the
// WEB side by registerLimiter), same trust level as /api/email-enquiry.
export async function POST(request: NextRequest) {
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
  const mission = body.mission?.trim();
  const contactName = body.contactName?.trim();
  const workEmail = body.workEmail?.trim();

  if (!orgName) {
    return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  }
  if (!mission) {
    return NextResponse.json({ error: "Your mission is required" }, { status: 400 });
  }
  if (!contactName) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }
  if (!workEmail || !EMAIL.test(workEmail)) {
    return NextResponse.json({ error: "a valid work email is required" }, { status: 400 });
  }

  const webApiUrl = process.env.ACTANGEL_WEB_API_URL;
  if (!webApiUrl) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing ACTANGEL_WEB_API_URL" },
      { status: 500 }
    );
  }

  try {
    const upstreamRes = await fetch(
      `${webApiUrl.replace(/\/+$/, "")}/api/registration-requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: workEmail,
          organizationName: orgName,
          phone: body.phone?.trim() || undefined,
          message: mission,
          formType: "hope_angel_mission",
          details: {
            organizationWebsite: body.orgWebsite?.trim() || undefined,
            registrationRegion: body.registrationRegion?.trim() || undefined,
            registrationNumber: body.registrationNumber?.trim() || undefined,
            whereYouWork: body.whereYouWork?.trim() || undefined,
            annualReport: body.annualReport?.trim() || undefined,
            governancePage: body.governancePage?.trim() || undefined,
            priority: body.priority?.trim() || undefined,
            campaignPage: body.campaignPage?.trim() || undefined,
            helpFirst: body.helpFirst?.trim() || undefined,
            currentTools: body.currentTools?.trim() || undefined,
            contactRole: body.contactRole?.trim() || undefined,
          },
        }),
      }
    );

    const data = await upstreamRes.json().catch(() => null);
    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to submit your mission" },
        { status: upstreamRes.status }
      );
    }
    return NextResponse.json({ submitted: true, id: data?.id });
  } catch {
    return NextResponse.json({ error: "Failed to reach the server. Please try again." }, { status: 502 });
  }
}
