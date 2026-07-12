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
          backgroundColor: "#060607",
          color: "#ececec",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#9aa0a6" }}>
          <span style={{ color: "#4ade80" }}>$</span>&nbsp;whoami
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-4px",
            marginTop: 24,
            color: "#ffffff",
          }}
        >
          Rafeed Iqbal
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#c9cdd2",
            marginTop: 16,
          }}
        >
          software engineer <span style={{ color: "#4ade80" }}>&nbsp;×&nbsp;</span> product leader
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#5b6067",
            marginTop: 48,
          }}
        >
          <span style={{ color: "#4ade80" }}>~</span>/rafeed.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
