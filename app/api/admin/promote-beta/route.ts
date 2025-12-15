import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple shared-secret protection (fast + effective for MVP)
function assertAdmin(req: Request) {
  const expected = process.env.ADMIN_PROMOTE_SECRET;
  const provided = req.headers.get("x-admin-secret");
  if (!expected || !provided || provided !== expected) {
    return false;
  }
  return true;
}

type Body = {
  email: string;            // beta applicant email
  sendInvite?: boolean;     // default true
  redirectTo?: string;      // where Supabase invite link should send them
};

export async function POST(req: Request) {
  try {
    if (!assertAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const email = (body.email || "").trim().toLowerCase();
    const sendInvite = body.sendInvite ?? true;
    const redirectTo = body.redirectTo || `${baseUrl(req)}/onboarding`;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // 1) Load beta signup
    const { data: beta, error: betaErr } = await supabase
      .from("beta_signups")
      .select("id,email,name,status,auth_user_id")
      .eq("email", email)
      .maybeSingle();

    if (betaErr) {
      console.error(betaErr);
      return NextResponse.json({ error: "DB read failed" }, { status: 500 });
    }

    if (!beta?.id) {
      return NextResponse.json({ error: "Beta signup not found" }, { status: 404 });
    }

    // If already promoted, just return info
    if (beta.auth_user_id) {
      return NextResponse.json({
        ok: true,
        message: "Already promoted",
        betaId: beta.id,
        authUserId: beta.auth_user_id,
        status: beta.status,
      });
    }

    // 2) Create (or invite) Supabase Auth user
    // Using Admin API:
    // - If sendInvite = true: create user and send an invite email
    // - Else: create user without email
    const createPayload: any = {
      email,
      email_confirm: false,
      user_metadata: {
        name: beta.name || null,
        source: "beta_promotion",
      },
    };

    if (sendInvite) {
      // Supabase sends an invite email with a link
      createPayload.options = { redirectTo };
    }

    const { data: created, error: createErr } = sendInvite
      ? await supabase.auth.admin.inviteUserByEmail(email, { redirectTo })
      : await supabase.auth.admin.createUser(createPayload);

    if (createErr) {
      // If user already exists in auth, we can fetch them and continue.
      // Supabase sometimes returns an error; safest approach: try to locate by listing users is not ideal.
      // For MVP: surface the error so you can handle manually.
      console.error(createErr);
      return NextResponse.json(
        { error: "Auth user create/invite failed", details: createErr.message },
        { status: 500 }
      );
    }

    const authUserId =
      (created as any)?.user?.id ||
      (created as any)?.data?.user?.id ||
      null;

    if (!authUserId) {
      return NextResponse.json(
        { error: "Auth user created but no id returned" },
        { status: 500 }
      );
    }

    // 3) Mark beta as approved + linked to auth user
    const { error: updErr } = await supabase
      .from("beta_signups")
      .update({
        status: "approved",
        auth_user_id: authUserId,
      })
      .eq("id", beta.id);

    if (updErr) {
      console.error(updErr);
      return NextResponse.json(
        { error: "DB update failed (beta_signups)" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: sendInvite
        ? "Promoted and invite sent"
        : "Promoted (no invite sent)",
      betaId: beta.id,
      authUserId,
      redirectTo,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

function baseUrl(req: Request) {
  const url = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto =
    req.headers.get("x-forwarded-proto") ||
    url.protocol.replace(":", "") ||
    "http";
  return `${proto}://${host}`;
}
