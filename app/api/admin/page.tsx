<td style={{ padding: 12, whiteSpace: "nowrap" }}>
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {/* Copy Invite Link (uses referral_code if present; otherwise disabled) */}
    <button
      type="button"
      onClick={async () => {
        if (!r.referral_code) return;
        const link = `${window.location.origin}/beta?ref=${r.referral_code}`;
        try {
          await navigator.clipboard.writeText(link);
          setMsg(`✅ Copied invite link for ${r.email}`);
        } catch {
          setMsg("Copy failed (browser permissions).");
        }
      }}
      disabled={!r.referral_code}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        background: !r.referral_code ? "#f1f5f9" : "white",
        color: !r.referral_code ? "#94a3b8" : "#0f172a",
        fontWeight: 800,
        cursor: !r.referral_code ? "not-allowed" : "pointer",
      }}
    >
      Copy Invite Link
    </button>

    {/* Approve (no invite yet) */}
    <button
      type="button"
      onClick={async () => {
        setMsg("");
        const res = await fetch(`/api/admin/beta-signups/${r.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": secret,
          },
          body: JSON.stringify({ status: "approved" }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setMsg(data?.error || "Approve failed.");
          return;
        }
        setMsg(`✅ Approved (no invite) ${r.email}`);
        await fetchRows();
      }}
      disabled={r.status === "activated" || r.status === "declined"}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background:
          r.status === "activated" || r.status === "declined" ? "#e2e8f0" : "#0ea5e9",
        color:
          r.status === "activated" || r.status === "declined" ? "#475569" : "white",
        fontWeight: 800,
        cursor:
          r.status === "activated" || r.status === "declined" ? "not-allowed" : "pointer",
      }}
    >
      Approve
    </button>

    {/* Decline */}
    <button
      type="button"
      onClick={async () => {
        setMsg("");
        const res = await fetch(`/api/admin/beta-signups/${r.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": secret,
          },
          body: JSON.stringify({ status: "declined" }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setMsg(data?.error || "Decline failed.");
          return;
        }
        setMsg(`✅ Declined ${r.email}`);
        await fetchRows();
      }}
      disabled={r.status === "activated"}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background: r.status === "activated" ? "#e2e8f0" : "#ef4444",
        color: r.status === "activated" ? "#475569" : "white",
        fontWeight: 800,
        cursor: r.status === "activated" ? "not-allowed" : "pointer",
      }}
    >
      Decline
    </button>

    {/* Promote + Invite (magic link email) */}
    <button
      type="button"
      onClick={() => promote(r.email)}
      disabled={r.status === "activated" || r.auth_user_id !== null}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background:
          r.status === "activated" || r.auth_user_id ? "#e2e8f0" : "#16a34a",
        color:
          r.status === "activated" || r.auth_user_id ? "#475569" : "white",
        fontWeight: 800,
        cursor:
          r.status === "activated" || r.auth_user_id ? "not-allowed" : "pointer",
      }}
    >
      Promote + Invite
    </button>
  </div>
</td>
