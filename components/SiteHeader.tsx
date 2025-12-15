'use client';

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header style={{ borderBottom: "1px solid #e2e8f0" }}>
      <div className="container" style={{ paddingTop: 14, paddingBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#0ea5e9", color: "white", display: "grid", placeItems: "center", fontWeight: 800 }}>
            LS
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>LifeSignal</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Daily check-ins for independent seniors</div>
          </div>
        </Link>

        <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/#how" className="small" style={{ color: "#334155", textDecoration: "none" }}>How it works</a>
          <a href="/#pricing" className="small" style={{ color: "#334155", textDecoration: "none" }}>Pricing</a>
          <a href="/#faq" className="small" style={{ color: "#334155", textDecoration: "none" }}>FAQ</a>
          <Link href="/beta" className="btn btnPrimary" style={{ textDecoration: "none" }}>
            Start free beta
          </Link>
        </nav>
      </div>
    </header>
  );
}
