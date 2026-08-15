"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, #071B3A 0%, #020817 45%, #01040C 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px 60px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(46,168,255,0.08)",
          filter: "blur(100px)",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Brand */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "35px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            marginBottom: "10px",
          }}
        >
          {/* Shield Logo */}
          <div
            style={{
              width: "58px",
              height: "66px",
              border: "3px solid #2EA8FF",
              borderRadius: "18px 18px 24px 24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#2EA8FF",
              fontSize: "27px",
              boxShadow: "0 0 25px rgba(46,168,255,0.25)",
              transform: "scaleX(0.85)",
            }}
          >
            🏠
          </div>

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "34px",
                fontWeight: "700",
                letterSpacing: "-1px",
              }}
            >
              PropertySure{" "}
              <span style={{ color: "#2EA8FF" }}>AI</span>
            </div>

            <div
              style={{
                color: "#AAB7C9",
                fontSize: "15px",
                marginTop: "4px",
              }}
            >
              Verify. Protect. Pay with Confidence.
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "675px",
          margin: "0 auto",
          padding: "55px 60px",
          boxSizing: "border-box",
          background:
            "linear-gradient(145deg, rgba(8,24,51,0.96), rgba(2,12,28,0.98))",
          border: "1px solid rgba(46,168,255,0.45)",
          borderRadius: "25px",
          boxShadow:
            "0 0 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(46,168,255,0.025)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Heading */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "52px",
            lineHeight: "1.1",
            margin: "0 0 12px",
            fontWeight: "700",
            letterSpacing: "-1px",
          }}
        >
          Welcome{" "}
          <span
            style={{
              color: "#2EA8FF",
            }}
          >
            Back
          </span>
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            fontSize: "19px",
            margin: "0 0 38px",
          }}
        >
          Sign in to continue to PropertySure AI
        </p>

        {/* Google Button */}
        <button
          type="button"
          style={{
            width: "100%",
            height: "68px",
            borderRadius: "14px",
            border: "none",
            background: "#FFFFFF",
            color: "#111827",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            G
          </span>

          Continue with Google
        </button>

        {/* OR Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            margin: "35px 0",
            color: "#8A97A9",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.2)",
            }}
          />

          <span style={{ fontSize: "16px" }}>OR</span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* Email */}
        <label
          style={{
            display: "block",
            color: "white",
            fontSize: "17px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Email Address
        </label>

        <div
          style={{
            position: "relative",
            marginBottom: "25px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8FA0B5",
              fontSize: "21px",
            }}
          >
            ✉
          </span>

          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: "100%",
              height: "62px",
              padding: "0 18px 0 55px",
              boxSizing: "border-box",
              borderRadius: "13px",
              border: "1px solid #43546B",
              background: "rgba(8,20,39,0.8)",
              color: "white",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </div>

        {/* Password */}
        <label
          style={{
            display: "block",
            color: "white",
            fontSize: "17px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Password
        </label>

        <div
          style={{
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8FA0B5",
              fontSize: "21px",
            }}
          >
            🔒
          </span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            style={{
              width: "100%",
              height: "62px",
              padding: "0 55px",
              boxSizing: "border-box",
              borderRadius: "13px",
              border: "1px solid #43546B",
              background: "rgba(8,20,39,0.8)",
              color: "white",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "17px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "#8FA0B5",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </div>

        {/* Remember / Forgot */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            fontSize: "15px",
          }}
        >
          <label
            style={{
              color: "#C3CDDA",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              style={{
                width: "18px",
                height: "18px",
                accentColor: "#2EA8FF",
              }}
            />

            Remember me
          </label>

          <span
            style={{
              color: "#2EA8FF",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Forgot Password?
          </span>
        </div>

        {/* Sign In */}
        <button
          type="button"
          style={{
            width: "100%",
            height: "68px",
            background:
              "linear-gradient(90deg, #168CF0 0%, #245DEB 100%)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "20px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(46,168,255,0.25)",
          }}
        >
          Sign In&nbsp;&nbsp; →
        </button>

        {/* Create Account */}
        <p
          style={{
            textAlign: "center",
            color: "#B6C2D2",
            marginTop: "32px",
            marginBottom: "0",
            fontSize: "16px",
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            style={{
              color: "#2EA8FF",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            Create an account
          </span>
        </p>
      </div>

      {/* Trust Features */}
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          margin: "45px auto 0",
          display: "flex",
          justifyContent: "space-between",
          gap: "30px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Feature 1 */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "rgba(46,168,255,0.1)",
              border: "1px solid rgba(46,168,255,0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "26px",
              color: "#2EA8FF",
            }}
          >
            🛡️
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "17px",
            }}
          >
            AI-Powered Verification
          </h3>

          <p
            style={{
              margin: 0,
              color: "#8997AA",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Smart detection with
            <br />
            advanced AI
          </p>
        </div>

        {/* Feature 2 */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "rgba(46,168,255,0.1)",
              border: "1px solid rgba(46,168,255,0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "26px",
              color: "#2EA8FF",
            }}
          >
            🔒
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "17px",
            }}
          >
            Secure & Private
          </h3>

          <p
            style={{
              margin: 0,
              color: "#8997AA",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Your data is encrypted
            <br />
            and protected
          </p>
        </div>

        {/* Feature 3 */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "rgba(46,168,255,0.1)",
              border: "1px solid rgba(46,168,255,0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "26px",
              color: "#2EA8FF",
            }}
          >
            ✓
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "17px",
            }}
          >
            Trusted by Thousands
          </h3>

          <p
            style={{
              margin: 0,
              color: "#8997AA",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Verified by professionals
            <br />
            you can trust
          </p>
        </div>
      </div>
    </main>
  );
}