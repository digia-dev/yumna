import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Yumna | Asisten Keuangan Keluarga Islami";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#fdfdfd",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Geometric Background Element */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            background: "#064e3b",
            borderRadius: "100px",
            opacity: 0.05,
            transform: "rotate(45deg)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Logo Placeholder (Star) */}
          <div
            style={{
              width: "100px",
              height: "100px",
              background: "#064e3b",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(6, 78, 59, 0.2)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #d4af37",
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#1a1c1e",
              letterSpacing: "-0.05em",
              margin: 0,
            }}
          >
            Yumna
          </h1>
        </div>

        <p
          style={{
            fontSize: "36px",
            color: "#64748b",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            fontWeight: 500,
            margin: 0,
          }}
        >
          Kelola Keuangan Keluarga dengan Penuh Keberkahan dan Kedamaian
        </p>

        <div
          style={{
            marginTop: "60px",
            background: "#064e3b",
            color: "white",
            padding: "16px 40px",
            borderRadius: "100px",
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          Mulai Perjalanan Barakah
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
