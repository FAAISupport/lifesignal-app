export function requireCronAuth(req: Request) {
  const expected = process.env.CRON_TOKEN;

  // Allow if token not set (local/dev safety)
  if (!expected) return;

  const header = req.headers.get("authorization") || "";
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");

  if (
    header !== `Bearer ${expected}` &&
    queryToken !== expected
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
}
