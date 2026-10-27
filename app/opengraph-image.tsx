import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = "LAST 60 — free neon arcade survival game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #050a18 0%, #0c1f5c 55%, #1646d9 100%)",
        color: "#ecebff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 200,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: -4,
        }}
      >
        <span style={{ color: "#2d7bff", textShadow: "8px 8px 0 #0a1f7a" }}>
          LAST&nbsp;
        </span>
        <span style={{ color: "#8fd0ff", textShadow: "8px 8px 0 #1646d9" }}>
          60
        </span>
      </div>
      <div
        style={{
          fontSize: 40,
          letterSpacing: 8,
          color: "#bfe9ff",
          textTransform: "uppercase",
        }}
      >
        {SITE_TAGLINE}
      </div>
      <div style={{ marginTop: 36, fontSize: 30, color: "#5aa8ff" }}>
        {`${SITE_NAME} · Free browser arcade survival game · agentstacks.in`}
      </div>
    </div>,
    size,
  );
}
