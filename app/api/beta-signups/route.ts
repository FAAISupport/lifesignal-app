import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = supabaseAdmin();

  // TODO: paste your original beta signup logic back in here if it was overwritten.
  return NextResponse.json({ ok: true });
}