import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon — the terminal prompt glyph on black, matching icon.svg.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "monospace",
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: "-6px",
          paddingBottom: 12,
        }}
      >
        {">_"}
      </div>
    ),
    { ...size }
  );
}
