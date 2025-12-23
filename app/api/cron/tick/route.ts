import { NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Unauthorized", { status: 401 });
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }
  if (auth !== expected) return unauthorized();

  // Run the scheduler "tick"
  // 1) Find due check-ins
  // 2) Lock them so only one runner processes each
  // 3) Trigger Twilio calls
  // 4) Record attempts + next retry time
  // 5) Emit heartbeat + metrics

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
