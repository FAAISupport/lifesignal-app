export default function PricingSection() {
  return (
    <section id="pricing" style={{ padding: "72px 0", background: "#ffffff" }}>
      <div className="container">
        <div style={{ maxWidth: 720 }}>
          <div
            className="small"
            style={{
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#0284c7",
              fontWeight: 800,
            }}
          >
            Pricing
          </div>

          <h2 style={{ fontSize: 40, margin: "12px 0 10px" }}>
            Simple plans. No hardware.
          </h2>

          <p style={{ color: "#475569" }}>
            Works with any phone. Cancel anytime. LifeSignal is not 911 and not a medical alert device.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 32,
          }}
        >
          {/* Starter */}
          <div className="card" style={{ padding: 22 }}>
            <h3>Starter</h3>
            <div style={{ fontSize: 32, fontWeight: 800 }}>$19/mo</div>
            <p className="small">1 daily check-in • 1 contact</p>
            <ul className="small">
              <li>Landline or cell</li>
              <li>Retry if unanswered</li>
              <li>Alert one contact</li>
            </ul>
            <a className="btn btnOutline" href="/beta">
              Start free beta
            </a>
          </div>

          {/* Family (featured) */}
          <div className="card" style={{ padding: 22, border: "2px solid #0ea5e9" }}>
            <h3>Family</h3>
            <div style={{ fontSize: 32, fontWeight: 800 }}>$39/mo</div>
            <p className="small">Up to 4 check-ins/day • 5 contacts</p>
            <ul className="small">
              <li>Multiple daily check-ins</li>
              <li>Multiple contacts</li>
              <li>Priority retries</li>
            </ul>
            <a className="btn btnPrimary" href="/beta">
              Start free beta
            </a>
          </div>

          {/* Plus */}
          <div className="card" style={{ padding: 22 }}>
            <h3>Plus</h3>
            <div style={{ fontSize: 32, fontWeight: 800 }}>$59/mo</div>
            <p className="small">Custom schedules & escalation</p>
            <ul className="small">
              <li>Escalation rules</li>
              <li>Care notes (beta)</li>
              <li>Extended retries</li>
            </ul>
            <a className="btn btnOutline" href="/beta">
              Start free beta
            </a>
          </div>
        </div>

        <p className="small" style={{ marginTop: 16, color: "#64748b" }}>
          *Pricing shown for beta illustration. Final plans may change.
        </p>
      </div>
    </section>
  );
}
