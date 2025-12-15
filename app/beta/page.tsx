'use client';

import React, { useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function BetaPage() {
  const [invitedBy, setInvitedBy] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [inviteLink, setInviteLink] = useState<string>("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Read ?ref= on initial load only
    try {
      const ref = new URLSearchParams(window.location.search).get("ref") || "";
      setInvitedBy(ref);
    } catch {
      setInvitedBy("");
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const canShowInvite = status === "success" && inviteLink.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mountedRef.current) return;

    setStatus("loading");
    setMessage("");
    setInviteLink("");

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // pass referral code through to API
    if (invitedBy) fd.append("invitedBy", invitedBy);

    try {
      const res = await fetch("/api/beta-signups", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "Request failed.");

      if (!mountedRef.current) return;
      setStatus("success");
      setMessage(data?.existing ? "You’re already on the list — here’s your invite link." : "Application received! Your invite link is below.");
      setInviteLink(data?.inviteLink || "");
      formEl.reset();
    } catch (err: any) {
      if (!mountedRef.current) return;
      setStatus("error");
      setMessage(err?.message || "Something went wrong. Please try again.");
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (mountedRef.current) setMessage("Copied invite link to clipboard.");
    } catch {
      if (mountedRef.current) setMessage("Copy failed. You can manually select + copy the link.");
    }
  }

  return (
    <main>
      {/* Hero (matches main site vibe) */}
      <section style={{ background: "linear-gradient(180deg, #e0f2fe, #ffffff)" }}>
        <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div style={{ maxWidth: 760 }}>
            <div
              className="small"
              style={{
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#0284c7",
                fontWeight: 800,
              }}
            >
              LifeSignal Beta
            </div>

            <h1
              style={{
                fontSize: 52,
                lineHeight: 1.03,
                letterSpacing: "-0.03em",
                margin: "14px 0 10px",
              }}
            >
              Apply for free early access.
            </h1>

            <p style={{ fontSize: 18, color: "#475569", marginTop: 10, maxWidth: 720 }}>
              Join the LifeSignal beta to try daily check-in calls for seniors living alone. Simple, respectful reassurance — no devices or apps required.
            </p>

            {invitedBy ? (
              <div className="small" style={{ marginTop: 10, color: "#334155" }}>
                You were invited by code: <span className="kbd">{invitedBy}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Form + Invite */}
      <section>
        <div className="container" style={{ paddingTop: 28, paddingBottom: 52 }}>
          <div className="grid grid2" style={{ alignItems: "start" }}>
            <form className="card" onSubmit={handleSubmit} style={{ padding: 22 }}>
              <h2 style={{ marginTop: 0, marginBottom: 6 }}>Beta application</h2>
              <p className="small" style={{ marginTop: 0 }}>
                No credit card. Beta access is limited. We’ll contact you with next steps.
              </p>

              <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                <div>
                  <div className="label">Your name *</div>
                  <input className="input" name="name" required placeholder="Jane Smith" />
                </div>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <div className="label">Email *</div>
                    <input className="input" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div>
                    <div className="label">Phone (optional)</div>
                    <input className="input" name="phone" placeholder="(555) 555-5555" />
                    <div className="small">Used only for onboarding/support.</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <div className="label">You are… *</div>
                    <select name="role" required className="input">
                      <option value="">Select one</option>
                      <option value="family">Family member / caregiver</option>
                      <option value="senior">The senior who will receive calls</option>
                      <option value="professional">Professional caregiver</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">City &amp; state</div>
                    <input className="input" name="location" placeholder="Leesburg, FL" />
                  </div>
                </div>

                <div>
                  <div className="label">Senior’s first name (optional)</div>
                  <input className="input" name="seniorName" placeholder="Mary" />
                </div>

                <div>
                  <div className="label">Tell us your situation</div>
                  <textarea className="input" name="situation" rows={3} placeholder="Distance, schedule, peace of mind…" />
                </div>

                <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
  <input name="consent" type="checkbox" required style={{ marginTop: 4 }} />
  <span className="small">
    I agree to be contacted about the LifeSignal beta. If I provide a phone number, I consent to receive SMS messages
    related to onboarding, reminders, and account updates. Message &amp; data rates may apply. Reply STOP to opt out.
    LifeSignal is not 911 and not a medical alert device.
  </span>
</label>


                <button className="btn btnPrimary" disabled={status === "loading"} type="submit">
                  {status === "loading" ? "Submitting…" : "Submit application"}
                </button>

                {message ? (
                  <div className="small" style={{ color: status === "error" ? "var(--bad)" : "var(--good)" }}>
                    {message}
                  </div>
                ) : null}
              </div>
            </form>

            <aside className="card" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>Invite family &amp; friends</h3>
              <p className="small" style={{ marginTop: 0 }}>
                After signup, you’ll get a personal invite link to share. In production, this becomes a real referral + onboarding flow.
              </p>

              <hr className="sep" />

              {canShowInvite ? (
                <>
                  <div className="label">Your invite link</div>
                  <input className="input kbd" readOnly value={inviteLink} />

                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button className="btn btnPrimary" type="button" onClick={() => copy(inviteLink)}>
                      Copy link
                    </button>
                    <a className="btn btnOutline" href={inviteLink} target="_blank" rel="noreferrer">
                      Open link
                    </a>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="label">Suggested message</div>
                    <div className="card" style={{ padding: 14, borderRadius: 14, boxShadow: "none" }}>
                      <div className="small kbd">
                        I’m trying a beta called LifeSignal — daily check-in calls for seniors living alone. If a call goes unanswered, contacts can be notified. Free beta: {inviteLink}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="small" style={{ opacity: 0.9 }}>
                  Submit the application to generate your invite link.
                </div>
              )}

              <hr className="sep" />

              <div className="small" style={{ color: "#475569" }}>
                LifeSignal is not 911 and not a medical alert device. It’s a daily reassurance system.
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
