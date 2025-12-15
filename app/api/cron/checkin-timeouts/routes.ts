import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function minutesAgoIso(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

async function sendTwilioSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const form = new URLSearchParams();
  form.set("To", to);
  form.set("From", from);
  form.set("Body", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio SMS failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function GET(req: Request) {
  // Protect the endpoint
  const secret = process.env.CRON_SECRET!;
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key || key !== secret) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // We’ll look at “recent pending attempts” to avoid scanning the whole table.
  // Adjust 24h if you want (this is safe for daily check-ins).
  const since = minutesAgoIso(24 * 60);

  // Pull pending attempts with their schedule window + senior + contacts.
  // NOTE: This assumes:
  // - checkin_attempts.schedule_id -> checkin_schedules.id
  // - checkin_schedules.window_minutes exists
  // - checkin_attempts.sent_at exists and is set when you send the check-in
  const { data: attempts, error } = await supabase
    .from("checkin_attempts")
    .select(
      `
      id, senior_id, schedule_id, channel, scheduled_for, sent_at, status, result, meta,
      seniors:seniors ( id, full_name, phone ),
      checkin_schedules:checkin_schedules ( id, window_minutes ),
      contacts:contacts ( id, full_name, phone, notify_via, notify_order )
    `
    )
    .in("status", ["pending", null])
    .gte("created_at", since)
    .not("sent_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error(error);
    return new NextResponse("DB error", { status: 500 });
  }

  let scanned = attempts?.length ?? 0;
  let missed = 0;
  let escalated = 0;
  let errors = 0;

  const nowMs = Date.now();

  for (const a of attempts ?? []) {
    try {
      const windowMinutes = a.checkin_schedules?.window_minutes ?? 60;
      const sentAt = a.sent_at ? new Date(a.sent_at).getTime() : null;
      if (!sentAt) continue;

      const deadline = sentAt + windowMinutes * 60_000;
      if (nowMs <= deadline) continue; // not timed out yet

      // Don’t escalate if already confirmed/missed/escalated by another run
      // (extra safety)
      if (a.status && a.status !== "pending") continue;

      // Step 1: mark MISSED
      const { error: missErr } = await supabase
        .from("checkin_attempts")
        .update({
          status: "missed",
          result: "missed",
          meta: {
            ...(a.meta ?? {}),
            timeout: {
              window_minutes: windowMinutes,
              missed_at: new Date().toISOString(),
            },
          },
        })
        .eq("id", a.id);

      if (missErr) throw missErr;
      missed++;

      // Step 2: confirm recipient consent exists (avoid messaging if opted out)
      // This is for the SENIOR’s number; escalation contacts are separate numbers.
      // If you also want consent for contacts, add a second consent table/rule.
      const { data: seniorConsent } = await supabase
        .from("sms_consents")
        .select("consented")
        .eq("senior_id", a.senior_id)
        .eq("phone", a.seniors?.phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If senior opted out, we still alert family? Up to you.
      // I recommend: YES, still alert, because the check-in failed.
      // So we won't block escalation on senior consent.

      // Step 3: notify FIRST contact (notify_order asc)
      const contacts = (a.contacts ?? []).slice().sort((c1: any, c2: any) => {
        const o1 = Number(c1.notify_order ?? 9999);
        const o2 = Number(c2.notify_order ?? 9999);
        return o1 - o2;
      });

      const first = contacts[0];
      if (!first?.phone) {
        // No contact to alert — leave as missed, don’t escalated
        continue;
      }

      const seniorName = a.seniors?.full_name || "Your loved one";
      const msg =
        `⚠️ LifeSignal Alert\n\n` +
        `${seniorName} did not respond to today’s safety check.\n` +
        `Please try reaching them now.\n\n` +
        `Reply STOP to opt out of LifeSignal alerts.`;

      // Send SMS to contact (basic)
      await sendTwilioSms(first.phone, msg);
      escalated++;

      // Step 4: mark ESCALATED (so we don’t spam)
      const { error: escErr } = await supabase
        .from("checkin_attempts")
        .update({
          status: "escalated",
          result: "escalated",
          meta: {
            ...(a.meta ?? {}),
            escalation: {
              escalated_at: new Date().toISOString(),
              contact_id: first.id,
              contact_phone: first.phone,
              contact_name: first.full_name ?? null,
            },
          },
        })
        .eq("id", a.id);

      if (escErr) throw escErr;
    } catch (e) {
      errors++;
      console.error("Timeout worker error:", e);
    }
  }

  return NextResponse.json({ ok: true, scanned, missed, escalated, errors });
}
