import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = supabaseAdmin();
  const { id } = await params;

  return NextResponse.json({ ok: true, id });
}