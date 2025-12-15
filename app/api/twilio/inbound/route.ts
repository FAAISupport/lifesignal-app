import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function parseForm(body: string) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

function verifyTwilioSignature({
  authToken,
  signature,
  url,
  params,
}: {
  authToken: string;
  signature: string | null;
  url: string;
  params: Record<string, string>;
}) {
  if (!signature) return false;

  const sortedKeys = Object.keys(params).sort();
  const data = url + sortedKeys.map((k) => `${k}${params[k] ?? ""}`).join("");

  const digest = crypto.createHmac("sha1", authToken).update(data).digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

function twiml(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const form = parseForm(rawBody);

  const from = (form.From || "").trim();
  const bodyRaw = (form.Body || "").trim();
  const messageSid = (form.MessageSid || "").trim();

  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL!;

  const signature = req.headers.get("x-twilio-signature");
  const isValid = verifyTwilioSignature({
    authToken: twilioAuthToken,
    signature,
    url: webhookUrl,
    params: form as Record<string, string>,
  });

  if (!isValid) return new NextResponse("Invalid signature", { status: 403 });

  const normalized = bodyRaw.toLowerCase().replace(/\s+/g, " ").trim();
  const isYes = normalized === "yes" || normalized === "y";
  const isStop =
    normalized === "stop" ||
    normalized === "unsubscribe" ||
    normalized === "cancel" ||
    normalized === "end" ||
    normalized === "quit";
  const isHelp = normalized === "help" || normalized === "info";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: senior, error: seniorErr } = await supabase
    .from("seniors")
    .select("id, full_name, phone")
    .eq("phone", from)
    .maybeSingle();

  if (seniorErr) console.error("Senior lookup error:", seniorErr);

  if (!senior?.id) {
    return new NextResponse(twiml("Thanks! (No account found for this number.)"), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // STOP = opt out (record it)
  if (isStop) {
    await supabase.from("sms_consents").upsert(
      {
        senior_id: senior.id,
        phone: from,
        consented: false,
        consent_method: "sms_stop",
        consent_text:
          "LifeSignal: Reply YES to confirm and start. Reply STOP to opt out. Msg&data rates may apply.",
        consent_text_version: "v1",
        consented_at: new Date().toISOString(),
        twilio_message_sid: messageSid || null,
      },
      { onConflict: "phone,senior_id" }
    );

    return new Nex
