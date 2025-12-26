import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin();

  // TODO: paste your original logic back in here if you overwrote it previously.
  return NextResponse.json({ ok: true, id: params.id });
}
