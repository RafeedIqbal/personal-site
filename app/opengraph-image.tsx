import { ImageResponse } from "next/og";

export const alt = "Rafeed Iqbal — Software Engineer & Product Leader";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Terminal-styled social-share card, generated at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#888888" }}>
          rafeed@portfolio:~$ whoami
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-2px",
            marginTop: 24,
            textTransform: "uppercase",
          }}
        >
          Rafeed Iqbal
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#aaaaaa",
            marginTop: 16,
          }}
        >
          Software Engineer &amp; Product Leader
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#555555",
            marginTop: 48,
          }}
        >
          rafeed.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
