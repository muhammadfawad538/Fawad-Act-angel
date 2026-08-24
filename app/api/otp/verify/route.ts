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
  const intakeUrl = process.env.N8N_INTAKE_WEBHOOK_URL;
  const intakeApiKey = process.env.N8N_INTAKE_WEBHOOK_API_KEY;
  if (!accountSid || !authToken || !verifyServiceSid || !intakeUrl || !intakeApiKey) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing Twilio Verify or intake webhook config" },
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

  // OTP verified: hand off to the n8n intake workflow, which pushes the lead
  // to Postgres, picks the right outbound number by country, and fires the
  // Retell call.
  let intakeOk = true;
  let intakeData: unknown = null;
  try {
    const intakeRes = await fetch(intakeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Intake-Api-Key": intakeApiKey },
      body: JSON.stringify({ name, phone, email, otp_status: "verified", channel }),
    });
    intakeData = await intakeRes.json().catch(() => null);
    intakeOk = intakeRes.ok;
  } catch {
    intakeOk = false;
  }

  // The OTP verification itself succeeded regardless of whether the downstream
  // call-trigger succeeded - don't make the user re-verify because of a backend hiccup.
  return NextResponse.json({ verified: true, callTriggered: intakeOk, intake: intakeData });
}
