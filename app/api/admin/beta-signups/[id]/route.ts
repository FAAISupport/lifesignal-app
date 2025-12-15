import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthed(req: Request) {
  const expected = process.env.ADMIN_PROMOTE_SECRET;
  const provided = req.headers.get("x-admin-secret");
  return Boolean(expected && provided && provided === expected);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || "").trim();

    if (!["applied", "approved", "activated", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await admin
      .from("beta_signups")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
