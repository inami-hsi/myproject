import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "企業リスト - 企業情報検索・リスト作成ツール"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          企業リスト
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a0a0a0",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.5,
          }}
        >
          企業情報を簡単に検索・リスト化
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {["業種検索", "地域検索", "CSV/Excel出力"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 24,
                color: "#d0d0d0",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
