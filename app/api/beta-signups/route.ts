import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function safeEmail(s: string) {
  return s.trim().toLowerCase();
}

function makeReferralCode(email: string) {
  // deterministic; stable per email
  const hash = crypto.createHash("sha256").update(email).digest("hex");
  return hash.slice(0, 12);
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const name = String(fd.get("name") || "").trim();
    const email = safeEmail(String(fd.get("email") || ""));
    const role = String(fd.get("role") || "").trim();
    const phone = String(fd.get("phone") || "").trim() || null;
    const location = String(fd.get("location") || "").trim() || null;
    const seniorName = String(fd.get("seniorName") || "").trim() || null;
    const situation = String(fd.get("situation") || "").trim() || null;
    const consent = fd.get("consent") === "on" || fd.get("consent") === "true";

    // passed from the beta page when URL has ?ref=...
    const invitedByCode = String(fd.get("invitedBy") || "").trim() || null;

    if (!consent) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    if (!name || !email || !role) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    if (!email.includes("@")) return NextResponse.json({ error: "Invalid email." }, { status: 400 });

    const referral_code = makeReferralCode(email);

    // If already exists, return the invite link (stable referral code)
    const { data: existing, error: selErr } = await supabase
      .from("beta_signups")
      .select("id, referral_code")
      .eq("email", email)
      .maybeSingle();

    if (selErr) {
      console.error(selErr);
      return NextResponse.json({ error: "Database read failed." }, { status: 500 });
    }

    const base = getBaseUrl(req);

    if (existing?.id) {
      const inviteLink = `${base}/beta?ref=${existing.referral_code || referral_code}`;
      return NextResponse.json({ ok: true, inviteLink, existing: true });
    }

    // Resolve inviter row (optional, but we store it if it exists)
    let invited_by_signup_id: string | null = null;

    if (invitedByCode) {
      const { data: inviter, error: inviterErr } = await supabase
        .from("beta_signups")
        .select("id")
        .eq("referral_code", invitedByCode)
        .maybeSingle();

      if (inviterErr) {
        // Don't fail the signup if inviter lookup fails; just log it
        console.error(inviterErr);
      } else {
        invited_by_signup_id = inviter?.id ?? null;
      }
    }

    const { error: insErr } = await supabase.from("beta_signups").insert({
      name,
      email,
      role,
      phone,
      location,
      senior_name: seniorName,
      situation,
      consent,
      referral_code,
      invited_by_code: invitedByCode,
      invited_by_signup_id,
      status: "applied",
      source: "beta-landing",
    });

    if (insErr) {
      console.error(insErr);
      return NextResponse.json({ error: "Database write failed." }, { status: 500 });
    }

    const inviteLink = `${base}/beta?ref=${referral_code}`;
    return NextResponse.json({ ok: true, inviteLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

function getBaseUrl(req: Request) {
  // Works local + Vercel
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "http";
  return `${proto}://${host}`;
}
