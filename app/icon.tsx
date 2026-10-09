import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
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
        borderRadius: "20%",
      }}
    >
      <div style={{ fontSize: 260, color: "#00ff88", fontWeight: 900, lineHeight: 1 }}>R</div>
      <div style={{ fontSize: 90, color: "#00ff88", fontWeight: 700, marginTop: -20, letterSpacing: 10 }}>IA</div>
    </div>,
    size
  )
}
