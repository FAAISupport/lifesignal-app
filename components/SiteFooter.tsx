export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid #e2e8f0", marginTop: 40 }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28 }}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div className="small" style={{ color: "#64748b" }}>
            © {new Date().getFullYear()} LifeSignal. All rights reserved.
          </div>
          <div className="small" style={{ color: "#64748b" }}>
            LifeSignal is not 911 and not a medical alert device.
          </div>
        </div>
      </div>
    </footer>
  );
}
