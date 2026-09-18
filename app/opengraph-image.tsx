import { ImageResponse } from "next/og";
import { PROFILE } from "@/lib/content";

export const alt = "Rafeed Iqbal — Software Engineer & Product Leader";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Terminal-styled social-share card, generated at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111315",
        color: "#E7E9E8",
        padding: "32px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          padding: "0 30px",
          backgroundColor: "#191C1F",
          border: "1px solid #30353A",
          color: "#A3AAA7",
          fontSize: 20,
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: "#8FAF9B" }}>~</span>/rafeed.dev / portfolio
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "36px 48px",
          border: "1px solid #30353A",
          borderTop: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#A3AAA7",
            fontFamily: "monospace",
          }}
        >
          <span style={{ color: "#8FAF9B" }}>$</span>&nbsp;whoami
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 94,
            fontWeight: 700,
            letterSpacing: "-4px",
            marginTop: 22,
          }}
        >
          {PROFILE.name}
          <span style={{ color: "#A3AAA7" }}>.</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 12 }}>
          {PROFILE.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#A3AAA7",
            fontSize: 20,
            marginTop: 40,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#8FAF9B",
            }}
          />
          Selected work · Experience · Background
        </div>
      </div>
    </div>,
    { ...size },
  );
}
