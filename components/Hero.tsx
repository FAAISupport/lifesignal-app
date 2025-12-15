import Link from "next/link";

export default function Hero() {
  return (
    <section style={{ background: "linear-gradient(180deg, var(--blueSoft), white)" }}>
      <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="grid grid2" style={{ alignItems: "center" }}>
          <div>
            <div className="small" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--blueDark)", fontWeight: 800 }}>
              For seniors living alone
            </div>

            <h1 style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.03em", margin: "14px 0 10px" }}>
              Daily “I’m okay” check-ins{" "}
              <span style={{ color: "var(--blue)" }}>so families can breathe easier.</span>
            </h1>

            <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 640, marginTop: 10 }}>
              LifeSignal calls (or texts) your loved one every day at scheduled times. If they don’t respond,
              we automatically alert family or friends. No devices, apps, or in-home hardware needed.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <Link className="btn btnPrimary" href="/beta">Start free beta</Link>
              <a className="btn btnOutline" href="#how">See how LifeSignal works</a>
            </div>

            <div className="small" style={{ marginTop: 10 }}>
              No equipment • Cancel anytime • Designed for seniors in communities like The Villages, FL
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginTop: 0 }}>At a glance</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div className="small" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Check-ins</div>
                <div style={{ fontWeight: 900 }}>1–4 times per day</div>
              </div>
              <div>
                <div className="small" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Contacts</div>
                <div style={{ fontWeight: 900 }}>Up to 5 family members</div>
              </div>
              <div>
                <div className="small" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Phones</div>
                <div style={{ fontWeight: 900 }}>Works with any phone</div>
              </div>
              <div>
                <div className="small" style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Monthly plans</div>
                <div style={{ fontWeight: 900 }}>From $39/mo</div>
              </div>
            </div>

            <hr className="sep" />
            <p className="small" style={{ margin: 0 }}>
              LifeSignal is not a medical alert or 911 service. It’s a proactive daily reassurance service that complements
              existing safety devices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
