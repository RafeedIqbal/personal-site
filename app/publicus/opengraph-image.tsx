import { ImageResponse } from "next/og";
export const alt = "Rafeed × Publicus — From messy inputs to products people can rely on.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "65px 75px", background: "#15111d", color: "#f1edf5", fontFamily: "sans-serif" }}><div style={{ display: "flex", fontSize: 25, gap: 18 }}><span>rafeed</span><span style={{ color: "#846b9d" }}>×</span><span>publicus</span></div><div style={{ display: "flex", flexDirection: "column", marginTop: 85, fontSize: 66, letterSpacing: -2, lineHeight: 1.1 }}><span>From messy inputs.</span><span>To products people</span><span style={{ color: "#c3a3e7" }}>can rely on.</span></div><div style={{ display: "flex", marginTop: "auto", color: "#a99bb8", fontSize: 17 }}>An application. Selected work. A working procurement explorer.</div></div>, size);
}
