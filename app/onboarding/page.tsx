'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OnboardingPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function activate() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user?.id) {
        setStatus("error");
        return;
      }

      // Call server route to flip beta → activated
      const res = await fetch("/api/activate", { method: "POST" });
      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("ready");
    }

    activate();
  }, []);

  if (status === "loading") {
    return (
      <main className="container" style={{ padding: 48 }}>
        <h1>Setting things up…</h1>
        <p>Please wait while we finish activating your LifeSignal account.</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="container" style={{ padding: 48 }}>
        <h1>Almost there</h1>
        <p>
          We couldn’t finish activation automatically.
          Please contact support and we’ll fix it immediately.
        </p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: 48 }}>
      <h1>Welcome to LifeSignal</h1>
      <p>Your account is active. You’re officially part of the beta.</p>

      <ul>
        <li>✔ Daily check-in calls</li>
        <li>✔ Family alert setup</li>
        <li>✔ Early access features</li>
      </ul>

      <p style={{ marginTop: 24 }}>
        Next step: we’ll help you set up the daily call schedule.
      </p>
    </main>
  );
}
