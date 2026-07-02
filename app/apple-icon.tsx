import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0a0f1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22%",
      }}
    >
      <div style={{ fontSize: 90, color: "#00ff88", fontWeight: 900, lineHeight: 1 }}>R</div>
      <div style={{ fontSize: 32, color: "#00ff88", fontWeight: 700, marginTop: -8, letterSpacing: 4 }}>IA</div>
    </div>,
    size
  )
}
