"use client";

import { useRouter } from "next/navigation";

export default function SignInPage() {
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
          maxWidth: "430px",
          background: "#111827",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            color: "#2EA8FF",
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "36px",
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            marginBottom: "35px",
          }}
        >
          Sign in to PropertySure AI
        </p>

        <button
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#FFFFFF",
            color: "#111827",
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
          ─────── OR ───────
        </div>

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
          placeholder="Enter your password"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            borderRadius: "10px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "18px",
            marginBottom: "28px",
            color: "#B6C2D2",
            fontSize: "14px",
          }}
        >
          <label>
            <input type="checkbox" /> Remember me
          </label>

          <span style={{ cursor: "pointer", color: "#2EA8FF" }}>
            Forgot Password?
          </span>
        </div>

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
          Sign In
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            marginTop: "30px",
          }}
        >
          Don't have an account?{" "}
          <span
          onClick={() => router.push("/signup")}
            style={{
              color: "#2EA8FF",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Create an account
          </span>
        </p>
      </div>
    </main>
  );
}