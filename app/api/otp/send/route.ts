import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Not a true secret - this endpoint is called directly from a browser, so
// whatever key is sent here is visible in that page's own network requests.
// This only filters out generic internet noise; the real gate against abuse
// is Twilio Verify's own code-matching and built-in rate limiting on /verify.
function partnerKeyValid(request: NextRequest): boolean {
  const expected = process.env.NEXT_PUBLIC_PARTNER_API_KEY;
  return !!expected && request.headers.get("x-partner-api-key") === expected;
}

// Twilio Verify supports "email" as a Channel alongside "sms"/"call"/"whatsapp" -
// reusing the same Verify Service means one set of credentials and one rate-limit
// surface for both channels, instead of standing up a separate email provider.
//
// Cancels `previousSid` (if given) before creating the new verification. This
// is required, not optional: confirmed live (2026-09-23) that Twilio Verify
// hands back the SAME pending verification - same sid, same code - if you call
// Verifications.create() again for a `To` that still has one outstanding,
// rather than generating a fresh code. That's why "Resend" was returning the
// same OTP every time (AAA-SA-002). Explicitly canceling the prior pending
// verification first is Twilio's own documented way to force a new one.
async function startVerification(
  accountSid: string,
  authToken: string,
  verifyServiceSid: string,
  to: string,
  channel: "sms" | "email",
  previousSid?: string
): Promise<{ status: string; sid: string }> {
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  if (previousSid) {
    await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications/${previousSid}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Status: "canceled" }).toString(),
      }
    ).catch(() => {
      // Best-effort - if it's already expired/checked, canceling fails harmlessly
      // and creating a new verification below still works fine either way.
    });
  }

  const params = new URLSearchParams({ To: to, Channel: channel });
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`,
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
  if (!res.ok) {
    const label = channel === "sms" ? "SMS" : "email";
    throw new Error(data.message ?? `Failed to send the ${label} verification code`);
  }
  return { status: data.status, sid: data.sid };
}

export async function POST(request: NextRequest) {
  if (!partnerKeyValid(request)) {
    return NextResponse.json({ error: "Invalid or missing X-Partner-Api-Key" }, { status: 401 });
  }

  let body: { phone?: string; email?: string; previousPhoneSid?: string; previousEmailSid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const email = body.email?.trim();
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid mobile number including country code, e.g. +14155551234" },
      { status: 400 }
    );
  }
  if (!email || !EMAIL.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !verifyServiceSid) {
    return NextResponse.json(
      { error: "Server is misconfigured: missing Twilio Verify credentials" },
      { status: 500 }
    );
  }

  try {
    const [phoneResult, emailResult] = await Promise.all([
      startVerification(accountSid, authToken, verifyServiceSid, phone, "sms", body.previousPhoneSid),
      startVerification(accountSid, authToken, verifyServiceSid, email, "email", body.previousEmailSid),
    ]);
    return NextResponse.json({
      phoneStatus: phoneResult.status,
      emailStatus: emailResult.status,
      phoneSid: phoneResult.sid,
      emailSid: emailResult.sid,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send verification codes" },
      { status: 502 }
    );
  }
}
