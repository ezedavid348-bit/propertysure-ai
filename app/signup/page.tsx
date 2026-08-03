"use client";

import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050B18",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111827",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            color: "#2EA8FF",
            textAlign: "center",
            fontSize: "36px",
            marginBottom: "10px",
          }}
        >
          Create Your Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            marginBottom: "30px",
            lineHeight: "1.6",
          }}
        >
          Join PropertySure AI and verify properties with confidence.
        </p>

        <button
          style={{
            width: "100%",
            padding: "15px",
            background: "#FFFFFF",
            color: "#111827",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          Continue with Google
        </button>

        <div
          style={{
            textAlign: "center",
            color: "#7A8797",
            marginBottom: "25px",
          }}
        >
          ───────── OR ─────────
        </div>

        <label style={{ color: "white", fontWeight: "bold" }}>
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your full name"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "white", fontWeight: "bold" }}>
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "white", fontWeight: "bold" }}>
          Password
        </label>

        <input
          type="password"
          placeholder="Create a password"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "white", fontWeight: "bold" }}>
          Confirm Password
        </label>

        <input
          type="password"
          placeholder="Confirm your password"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "30px",
            borderRadius: "10px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "15px",
            background: "#2EA8FF",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            marginTop: "30px",
            lineHeight: "1.6",
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => router.push("/signin")}
            style={{
              color: "#2EA8FF",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign In
          </span>
        </p>
      </div>
    </main>
  );
}