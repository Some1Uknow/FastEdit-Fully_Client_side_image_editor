import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "FastEdit - Professional Online Photo Editor";
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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #262626 2%, transparent 0%), radial-gradient(circle at 75px 75px, #262626 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          position: "relative",
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            background: "rgba(139, 92, 246, 0.15)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: "rgba(217, 70, 239, 0.15)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Logo / Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              marginBottom: "32px",
              boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.5)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              textShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            FastEdit
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 500,
              marginBottom: "48px",
            }}
          >
            Professional Online Photo Editing
          </div>

          {/* Feature Pills */}
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            {["Privacy Focused", "Client-Side", "No Uploads"].map((text) => (
              <div
                key={text}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
