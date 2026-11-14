import { ImageResponse } from "next/og";
export const alt = "Rafeed Iqbal’s application to Publicus, with a CanadaBuys award row that lists a $1,073,002.14 contract amount and a $0.00 total.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cell = { display: "flex", padding: "14px 18px", fontSize: 22 } as const;

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fcfcfb", color: "#1a1820", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", background: "#634086", color: "#fff", padding: "56px 64px 34px" }}>
        <div style={{ display: "flex", fontSize: 62, lineHeight: 1.04, letterSpacing: -1.5, fontWeight: 600, maxWidth: 1000 }}>I’m applying to be Publicus’s Founding Engineer, Product &amp; AI.</div>
        <div style={{ display: "flex", gap: 44, marginTop: 34, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.32)", fontSize: 20, color: "#e6ddf0" }}><span>Rafeed Iqbal</span><span>2026-11-15</span><span>10 CanadaBuys records</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", margin: "40px 64px 0", border: "1px solid #1a1820" }}>
        <div style={{ display: "flex", background: "#2e1e44", color: "#fff" }}><span style={{ ...cell, width: 90 }}>01</span><span style={{ ...cell, flex: 1 }}>PRCP0003463 - Software Symantec DLP / CASB</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...cell, color: "#47434f" }}>contractAmount</span><span style={{ ...cell, background: "#f5d547" }}>1,073,002.14</span>
          <span style={{ ...cell, color: "#47434f" }}>totalContractValue</span><span style={{ ...cell, background: "#f5d547", fontSize: 28, fontWeight: 700 }}>0.00</span>
        </div>
      </div>
    </div>,
    size,
  );
}
