import { ImageResponse } from "next/og";

export const alt = "Fast is solved. Here is how I would make it right. A working proposal by Rafeed Iqbal.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share card for the unlisted /belong link: paper and ink, no Belong branding.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: "#EDF0F3",
        color: "#101E2E",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, color: "#5A6B7D", fontFamily: "sans-serif" }}>
        A working proposal, November 2026
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 1.08 }}>
        <span>Fast is solved.</span>
        <span>Here is how I would make it right.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 24,
          borderTop: "2px solid #101E2E",
          fontSize: 26,
          fontFamily: "sans-serif",
        }}
      >
        <span>Break a fictional E-2 file and watch it get caught.</span>
        <span style={{ color: "#5A6B7D" }}>Rafeed Iqbal</span>
      </div>
    </div>,
    size,
  );
}
