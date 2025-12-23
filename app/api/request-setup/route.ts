import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important on Vercel

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation (keep strict)
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const senior_name = String(body.senior_name || "").trim();
    const senior_city = String(body.senior_city || "").trim();
    const plan = String(body.plan || "").trim();
    const source = String(body.source || "beta").trim();

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Insert into your table (update table name/columns if different)
    const { error } = await supabase.from("beta_signups").insert([
      {
        name,
        email,
        senior_name: senior_name || null,
        senior_city: senior_city || null,
        plan: plan || null,
        source,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Backend error parsing request." },
      { status: 500 }
    );
  }
}
