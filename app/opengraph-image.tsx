import { ImageResponse } from "next/og"

export const alt = "Whitehat Rescue Ops // Secure Asset Recovery"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute",
          top: 40, left: 40, right: 40, bottom: 40,
          border: "2px solid #222",
          borderRadius: 20,
        }} />

        <div style={{
          position: "absolute",
          top: 80,
          color: "#555",
          fontSize: 24,
          letterSpacing: "0.2em",
        }}>
          /// WHITEHAT_RESCUE_OPS
        </div>

        <div style={{
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "#ffffff",
          marginBottom: 10,
          textShadow: "0 0 40px rgba(255,255,255,0.2)",
        }}>
          WHITEHAT
        </div>

        <div style={{
          fontSize: 48,
          color: "#666",
        }}>
          RESCUE OPS.
        </div>

        <div style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          padding: "16px 40px",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 50,
        }}>
          <div style={{
            width: 16, height: 16, background: "#e5e5e5", borderRadius: "50%", marginRight: 20,
          }} />
          <div style={{ fontSize: 28, color: "#e5e5e5", letterSpacing: "0.1em" }}>
            SECURE ASSET RECOVERY
          </div>
        </div>

        <div style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 20,
          color: "#444",
          letterSpacing: "0.15em",
        }}>
          whitehat.codeesura.dev
        </div>
      </div>
    ),
    { ...size }
  )
}
