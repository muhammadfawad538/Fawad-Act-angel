import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";

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
    name?: string;
    phone?: string;
    email?: string;
    phoneCode?: string;
    emailCode?: string;
    channel?: string;
    source?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = normalizePhone(body.phone);
  const email = body.email?.trim();
  const phoneCode = body.phoneCode?.trim();
  const emailCode = body.emailCode?.trim();
  const channel = body.channel?.trim() || undefined;
  // Validated server-side too, not just trusted from the client - this ends up in an AI
  // agent's spoken opening line via the n8n intake dispatch, so an unrecognized value is
  // dropped rather than forwarded.
  const KNOWN_SOURCES = ["hope-angel"];
  const rawSource = body.source?.trim();
  const source = rawSource && KNOWN_SOURCES.includes(rawSource) ? rawSource : undefined;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid mobile number including country code, e.g. +14155551234" },
      { status: 400 }
    );
  }
  if (!email || !EMAIL.test(email)) {
    return NextResponse.json({ error: "a valid email is required" }, { status: 400 });
  }
  if (!phoneCode || !/^\d{4,10}$/.test(phoneCode)) {
    return NextResponse.json({ error: "the mobile verification code is required" }, { status: 400 });
  }
  if (!emailCode || !/^\d{4,10}$/.test(emailCode)) {
    return NextResponse.json({ error: "the email verification code is required" }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !verifyServiceSid) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing Twilio Verify config" },
      { status: 500 }
    );
  }

  const isEmailChannel = channel?.toLowerCase() === "email";
  // Call/WhatsApp go through the n8n intake workflow (picks the right
  // outbound number by country, fires the Retell call). Email now goes
  // through BOTH: the client's own email-assistant pipeline below (the
  // actual candidate-facing conversation, unchanged) AND this same n8n
  // webhook with data_only - so an Email-channel lead lands in our own DB
  // too, same as every other channel, without triggering a welcome email
  // or a call. Checked up front so a misconfigured deployment fails fast
  // with a clear error instead of after burning both Twilio Verify calls.
  const intakeUrl = process.env.N8N_INTAKE_WEBHOOK_URL;
  const intakeApiKey = process.env.N8N_INTAKE_WEBHOOK_API_KEY;
  const webApiUrl = process.env.ACTANGEL_WEB_API_URL;
  const emailAssistantId = process.env.ACTANGEL_EMAIL_ASSISTANT_ID;
  if (!intakeUrl || !intakeApiKey || (isEmailChannel && (!webApiUrl || !emailAssistantId))) {
    return NextResponse.json(
      {
        error: isEmailChannel
          ? "Server is misconfigured: missing ACTANGEL_WEB_API_URL, ACTANGEL_EMAIL_ASSISTANT_ID, or intake webhook config"
          : "Server is misconfigured: missing intake webhook config",
      },
      { status: 500 }
    );
  }

  const checkVerification = async (to: string, code: string): Promise<boolean> => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const params = new URLSearchParams({ To: to, Code: code });
    try {
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      const data = await res.json();
      return res.ok && data.status === "approved";
    } catch {
      return false;
    }
  };

  const [phoneApproved, emailApproved] = await Promise.all([
    checkVerification(phone, phoneCode),
    checkVerification(email, emailCode),
  ]);

  if (!phoneApproved || !emailApproved) {
    const which =
      !phoneApproved && !emailApproved
        ? "Both codes"
        : !phoneApproved
          ? "The mobile code"
          : "The email code";
    return NextResponse.json({ error: `${which} didn't match or has expired` }, { status: 400 });
  }

  // OTP verified: hand off to the right backend for this channel.
  let intakeOk = true;
  let intakeData: unknown = null;
  try {
    if (isEmailChannel) {
      // Email is handled natively by the main ACT Angel AI backend's email
      // assistant pipeline (contact -> email conversation -> AI-handled
      // reply) instead of the n8n intake workflow - see server/routes/
      // emailEnquiry.ts in the WEB repo. assistantId tells that backend
      // exactly which org/mailbox owns this conversation, so nothing here
      // depends on a separately-configured "which org is the demo org"
      // setting on the WEB side. Public, unauthenticated endpoint (rate
      // limited there), same as this route's own Twilio-gated access.
      const enquiryRes = await fetch(`${webApiUrl!.replace(/\/+$/, "")}/api/email-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, assistantId: emailAssistantId }),
      });
      intakeData = await enquiryRes.json().catch(() => null);
      intakeOk = enquiryRes.ok;

      // Also store the lead in our own DB, same as Call/WhatsApp get via the
      // branch below - data_only tells the intake workflow to skip the
      // welcome email and the call dispatch, since the email-assistant
      // pipeline above already owns the actual candidate-facing
      // conversation. Best-effort: this must never affect the response the
      // candidate's own OTP verification depends on.
      try {
        await fetch(intakeUrl!, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Intake-Api-Key": intakeApiKey! },
          body: JSON.stringify({ name, phone, email, otp_status: "verified", channel, source, data_only: true }),
        });
      } catch (err) {
        console.error(
          "Email-channel lead storage (data_only intake call) failed:",
          err instanceof Error ? err.message : String(err)
        );
      }
    } else {
      // n8n intake workflow: pushes the lead to Postgres, picks the right
      // outbound number by country, and fires the Retell call.
      const intakeRes = await fetch(intakeUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Intake-Api-Key": intakeApiKey! },
        body: JSON.stringify({ name, phone, email, otp_status: "verified", channel, source }),
      });
      intakeData = await intakeRes.json().catch(() => null);
      intakeOk = intakeRes.ok;
    }
  } catch {
    intakeOk = false;
  }

  // The OTP verification itself succeeded regardless of whether the downstream
  // call-trigger succeeded - don't make the user re-verify because of a backend hiccup.
  return NextResponse.json({ verified: true, callTriggered: intakeOk, intake: intakeData });
}
