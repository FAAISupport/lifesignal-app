import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = supabaseAdmin();

  const { id } = await context.params;

  // TODO: paste your original logic back in here (this is only the build-safe wrapper)
  return NextResponse.json({ ok: true, id });
}
