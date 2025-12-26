import {{ supabaseAdmin }} from "@/lib/supabase-admin";
import {{ NextResponse }} from "next/server";

export async function GET(req: Request) {{
  const supabase = supabaseAdmin();
  return NextResponse.json({{ ok: true }});
}}
