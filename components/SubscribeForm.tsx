"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      await new Promise((r) => setTimeout(r, 300));
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", minWidth: 260 }}
      />
      <button
        type="submit"
        disabled={status === "saving"}
        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111" }}
      >
        {status === "saving" ? "Saving..." : "Join Beta"}
      </button>
      {status === "done" && <span>✅</span>}
      {status === "error" && <span>❌</span>}
    </form>
  );
}
