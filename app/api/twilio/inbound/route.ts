import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Twilio webhooks should run on Node (not Edge)

function twimlResponse(xml: string) {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  try {
    // Twilio sends x-www-form-urlencoded by default
    const contentType = req.headers.get("content-type") || "";
    let form: URLSearchParams;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const bodyText = await req.text();
      form = new URLSearchParams(bodyText);
    } else if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => ({}));
      form = new URLSearchParams(Object.entries(json).map(([k, v]) => [k, String(v)]));
    } else {
      // fallback
      const bodyText = await req.text();
      form = new URLSearchParams(bodyText);
    }

    const from = form.get("From") || "";
    const body = (form.get("Body") || "").trim().toLowerCase();

    // Minimal logic: reply to any inbound SMS with a friendly confirmation.
    // You can expand this later to match seniors, log messages to Supabase, etc.
    const message =
      body === "stop"
        ? "You can stop messages by replying STOP. If you meant something else, reply HELP."
        : "Thanks — LifeSignal received your message. If you need help, reply HELP.";

    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response>` +
      `<Message>${escapeXml(message)}</Message>` +
      `</Response>`;

    // Optional: quick debug log (Vercel logs only)
    console.log("[twilio-inbound]", { from, body });

    return twimlResponse(twiml);
  } catch (err) {
    console.error("[twilio-inbound] error", err);

    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response>` +
      `<Message>Sorry — something went wrong on our end.</Message>` +
      `</Response>`;

    return twimlResponse(twiml);
  }
}

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
