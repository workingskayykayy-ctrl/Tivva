import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (typeof phone !== "string" || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json({ error: "Enter your phone number with country code, for example +2348012345678." }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!accountSid || !authToken || !serviceSid) {
      return NextResponse.json({ error: "Phone verification is not configured on the server yet." }, { status: 503 });
    }

    const credentials = Buffer.from(accountSid + ":" + authToken).toString("base64");
    const body = new URLSearchParams({ To: phone, Channel: "sms" });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: result.message || "Twilio could not send the verification code. Check the number and your Twilio account settings." }, { status: response.status });
    }
    return NextResponse.json({ success: true, message: "Verification code sent by SMS." });
  } catch {
    return NextResponse.json({ error: "Unable to send the verification code. Please try again." }, { status: 500 });
  }
}
