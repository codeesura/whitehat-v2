import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Whitehat Rescue Ops — Secure Asset Recovery"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#050505",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            opacity: 0.5,
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#333",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#666",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            CODEESURA // V2
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#e5e5e5",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            WHITEHAT
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#222",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            RESCUE OPS.
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#888",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: 16,
            }}
          >
            Secure Asset Recovery for Compromised EVM Wallets
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#555",
            letterSpacing: "0.2em",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#e5e5e5",
            }}
          />
          whitehat.codeesura.dev
        </div>
      </div>
    ),
    { ...size }
  )
}
