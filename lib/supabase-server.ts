import { createClient } from "@supabase/supabase-js";
import { mustGetEnv } from "./env";

export function supabaseServer() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
