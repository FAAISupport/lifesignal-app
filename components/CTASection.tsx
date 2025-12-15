import Link from "next/link";

export default function CTASection() {
  return (
    <section id="how">
      <div className="container" style={{ paddingTop: 44, paddingBottom: 44 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="grid grid3">
            <div>
              <div className="badge"><span className="dot" /> Step 1</div>
              <h3 style={{ marginTop: 10, marginBottom: 6 }}>Pick a daily call time</h3>
              <p className="small" style={{ margin: 0 }}>
                Set a time that fits the routine—morning, lunch, or evening. Consistency reduces confusion.
              </p>
            </div>
            <div>
              <div className="badge"><span className="dot" /> Step 2</div>
              <h3 style={{ marginTop: 10, marginBottom: 6 }}>We place the check-in call</h3>
              <p className="small" style={{ margin: 0 }}>
                LifeSignal calls the senior’s phone. They press a key to confirm. No apps. No passwords.
              </p>
            </div>
            <div>
              <div className="badge"><span className="dot" /> Step 3</div>
              <h3 style={{ marginTop: 10, marginBottom: 6 }}>Contacts get notified if needed</h3>
              <p className="small" style={{ margin: 0 }}>
                If the call isn’t answered, selected contacts get an alert so someone can check in quickly.
              </p>
            </div>
          </div>

          <hr className="sep" />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Join the LifeSignal Beta</h2>
              <p className="small" style={{ margin: 0 }}>Free early access • Limited seats • Help shape the product</p>
            </div>
            <Link className="btn btnPrimary" href="/beta">Apply Now</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
