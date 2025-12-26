import {{ supabaseAdmin }} from "@/lib/supabase-admin";
import {{ NextResponse }} from "next/server";

export async function GET(
  req: Request,
  {{ params }}: {{ params: {{ id: string }} }}
) {{
  const supabase = supabaseAdmin();
  return NextResponse.json({{ ok: true, id: params.id }});
}}
