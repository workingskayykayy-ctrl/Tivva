import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { phone, code, password } = await request.json();
    if (typeof phone !== "string" || !/^\+[1-9]\d{7,14}$/.test(phone) ||
        typeof code !== "string" || !/^\d{4,10}$/.test(code) ||
        typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Enter a valid phone number, verification code and password of at least 8 characters." }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!accountSid || !authToken || !serviceSid || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Phone signup setup is incomplete. The server needs the Twilio settings and Supabase service-role key." }, { status: 503 });
    }

    const credentials = Buffer.from(accountSid + ":" + authToken).toString("base64");
    const body = new URLSearchParams({ To: phone, Code: code });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const result = await response.json();
    if (!response.ok || result.status !== "approved") {
      return NextResponse.json({ error: result.message || "That code is incorrect or has expired. Request a new code and try again." }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.auth.admin.createUser({
      phone,
      password,
      phone_confirm: true
    });
    if (error) {
      const message = error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")
        ? "This phone number already has a Tivva account. Log in instead."
        : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Phone number verified and account created." });
  } catch {
    return NextResponse.json({ error: "We couldn't complete phone verification. Please try again." }, { status: 500 });
  }
}
