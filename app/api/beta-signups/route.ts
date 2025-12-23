import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function cleanEmail(s: string) {
  return s.trim().toLowerCase();
}

function cleanPhone(s: string) {
  // Minimal cleanup for MVP; convert to E.164 later
  const t = s.trim();
  return t.length ? t : "";
}

function makeCode(len = 8) {
  // Simple alphanumeric code; stable enough for MVP
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip confusing chars
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const name = String(fd.get("name") || "").trim();
    const email = cleanEmail(String(fd.get("email") || ""));
    const phone = cleanPhone(String(fd.get("phone") || ""));
    const role = String(fd.get("role") || "").trim();
    const location = String(fd.get("location") || "").trim();
    const seniorName = String(fd.get("seniorName") || "").trim();
    const situation = String(fd.get("situation") || "").trim();
    const invitedBy = String(fd.get("invitedBy") || "").trim();
    const consent = String(fd.get("consent") || "") === "on" || String(fd.get("consent") || "") === "true";

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    }

    // Check if existing by email
    const existing = await supabaseAdmin
      .from("beta_signups")
      .select("invite_code")
      .eq("email", email)
      .maybeSingle();

    if (existing.data?.invite_code) {
      const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
      const inviteLink = base ? `${base}/beta?ref=${existing.data.invite_code}` : "";
      return NextResponse.json({ existing: true, inviteLink }, { status: 200 });
    }

    // Create a unique invite code (retry a few times on collision)
    let inviteCode = makeCode();
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await supabaseAdmin
        .from("beta_signups")
        .select("id")
        .eq("invite_code", inviteCode)
        .maybeSingle();
      if (!clash) break;
      inviteCode = makeCode();
    }

    const insert = await supabaseAdmin.from("beta_signups").insert({
      name,
      email,
      phone: phone || null,
      role,
      location: location || null,
      senior_name: seniorName || null,
      situation: situation || null,
      invited_by: invitedBy || null,
      invite_code: inviteCode,
      consent,
      status: "applied",
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
    const inviteLink = base ? `${base}/beta?ref=${inviteCode}` : "";

    return NextResponse.json({ existing: false, inviteLink }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error." }, { status: 500 });
  }
}
