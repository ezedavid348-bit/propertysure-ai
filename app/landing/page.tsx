"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 const router = useRouter();
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0F2A5A 0%, #08111F 40%, #050B18 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ================= NAVBAR ================= */}

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
         padding: "20px clamp(16px, 5vw, 32px)",
          position: "fixed",
top: 0,
left: 0,
right: 0,
width: "100%",
boxSizing: "border-box",
          backdropFilter: "blur(14px)",
          background: "rgba(5,11,24,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          zIndex: 1000,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#4DA3FF",
           fontSize: "clamp(24px, 5vw, 30px)",
            fontWeight: 800,
          }}
        >
          PropertySure AI
        </h2>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              fontSize: "34px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "55px",
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                overflow: "hidden",
                minWidth: "200px",
                boxShadow: "0 20px 50px rgba(0,0,0,.45)",
              }}
            >
             {[
  "Home",
  "Verify",
  "Pricing",
  "About",
  "Contact",
  "Sign In",
  "Get Started",
].map((item) => (
               <div
  key={item}
  onClick={() => {
    if (item === "Sign In") {
      router.push("/signing");
    }

    if (item === "Get Started") {
      router.push("/signup");
    }
  }}
  style={{
    padding: "16px 20px",
    borderBottom:
      item !== "Get Started"
        ? "1px solid rgba(255,255,255,.05)"
        : "none",
    cursor: "pointer",
  }}
>
  {item}
</div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section
        style={{
         padding: "140px clamp(20px, 5vw, 30px) 70px",
          textAlign: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#4DA3FF",
            letterSpacing: "4px",
            fontWeight: 700,
            marginBottom: "22px",
          }}
        >
          AI PROPERTY VERIFICATION
        </p>

        <h1
          style={{
           fontSize: "clamp(36px, 8vw, 78px)",
lineHeight: 1.15,
            fontWeight: 800,
            margin: 0,
          }}
        >
          Verify Property
          <br />
          Documents
          <br />
          Before You Pay.
        </h1>

        <p
          style={{
            maxWidth: "760px",
            margin: "35px auto",
            color: "#B6C2D2",
            fontSize: "clamp(16px, 2.5vw, 20px)",
lineHeight: 1.7,
          }}
        >
          Protect yourself from land fraud using AI-powered document
          verification backed by blockchain technology before making any
          payment.
        </p>

        <div
          style={{
           display: "flex",
justifyContent: "center",
alignItems: "center",
flexWrap: "wrap",
gap: "16px",
          }}
        >
          <button
onClick={() => router.push("/signup")}
  style={{
              background:
                "linear-gradient(135deg,#2EA8FF,#0077FF)",
              color: "white",
              border: "none",
              padding: "16px clamp(28px, 8vw, 38px)",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Verify Property
          </button>

          <button
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,.20)",
             padding: "16px clamp(28px, 8vw, 38px)",
              borderRadius: "14px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Learn More
          </button>
        </div>

        <p
          style={{
          marginTop: "30px",
color: "#9FB3C8",
fontSize: "clamp(15px, 2.5vw, 18px)",
lineHeight: 1.7,
padding: "0 12px",
          }}
        >
          ⭐⭐⭐⭐⭐ Trusted by Property Buyers & Investors
        </p>
      </section>
      {/* ================= HOW IT WORKS ================= */}

      <section
        style={{
          padding: "80px clamp(20px, 5vw, 30px)",
          background: "#08111F",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(34px, 7vw, 42px)",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          How It Works
        </h2>

        <p
          style={{
            color: "#B6C2D2",
            maxWidth: "720px",
            margin: "0 auto",
            fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.7,
padding: "0 12px",
          }}
        >
          PropertySure AI combines artificial intelligence with blockchain
          technology to help buyers verify property documents before making
          payment.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "28px",
           marginTop: "50px",
          }}
        >
          {/* Card 1 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
             width: "100%",
maxWidth: "340px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                marginBottom: "20px",
              }}
            >
              📄
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              Upload Document
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Upload your Certificate of Occupancy or any other property
              document securely for analysis.
            </p>
          </div>

          {/* Card 2 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
              maxWidth: "320px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                marginBottom: "20px",
              }}
            >
              🤖
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              AI Verification
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Our AI checks for alterations, inconsistencies and possible fraud
              within minutes.
            </p>
          </div>

          {/* Card 3 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
              width: "100%",
maxWidth: "340px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                marginBottom: "20px",
              }}
            >
              🔒
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              Blockchain Security
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Every verification result is securely recorded to help prevent
              tampering and build trust.
            </p>
          </div>
        </div>
      </section>
      {/* ================= WHY CHOOSE ================= */}

      <section
        style={{
         padding: "80px clamp(20px, 5vw, 30px)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(34px, 7vw, 42px)",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Why Choose PropertySure AI?
        </h2>

        <p
          style={{
            color: "#B6C2D2",
            maxWidth: "720px",
            margin: "0 auto",
           fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.7,
padding: "0 12px",
          }}
        >
          Built with cutting-edge AI and blockchain technology to help
          property buyers verify documents with confidence before making
          payment.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "28px",
            marginTop: "60px",
          }}
        >
          {/* Card 1 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
              maxWidth: "320px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "20px" }}>
              🛡️
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              Trusted Verification
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Every property report is analyzed by AI to help detect fake,
              altered or suspicious documents before you pay.
            </p>
          </div>

          {/* Card 2 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
              maxWidth: "320px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "20px" }}>
              ⚡
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              Fast AI Analysis
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Receive verification results in minutes instead of waiting days
              for manual document reviews.
            </p>
          </div>

          {/* Card 3 */}

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "32px",
             width: "100%",
maxWidth: "340px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "20px" }}>
              🔐
            </div>

            <h3
              style={{
                fontSize: "24px",
                marginBottom: "15px",
              }}
            >
              Secure Storage
            </h3>

            <p
              style={{
                color: "#B6C2D2",
                lineHeight: 1.8,
              }}
            >
              Your uploaded documents are encrypted and securely stored,
              ensuring privacy and maximum protection.
            </p>
          </div>
        </div>
      </section>
      {/* ================= CTA ================= */}

      <section
        style={{
         padding: "110px clamp(20px, 5vw, 30px)",
          textAlign: "center",
          background:
            "linear-gradient(180deg,#08111F 0%,#050B18 100%)",
        }}
      >
        <h2
          style={{
           fontSize: "clamp(34px, 7vw, 44px)",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Ready to Verify Your Property?
        </h2>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto 40px",
            color: "#B6C2D2",
fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.7,
padding: "0 12px",
          }}
        >
          Upload your property document today and receive an AI-powered
          verification report within minutes. Make smarter and safer
          property decisions with confidence.
        </p>

        <button
          style={{
            background:
              "linear-gradient(135deg,#2EA8FF,#0077FF)",
            color: "white",
            border: "none",
           padding: "18px clamp(28px, 6vw, 42px)",
borderRadius: "14px",
fontSize: "clamp(16px, 2.5vw, 18px)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Verify Now
        </button>
      </section>

      {/* ================= FOOTER ================= */}

      <footer
        style={{
         padding: "50px clamp(20px, 5vw, 30px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            color: "#4DA3FF",
           fontSize: "clamp(24px, 5vw, 28px)",
            marginBottom: "15px",
          }}
        >
          PropertySure AI
        </h3>

        <p
          style={{
           color: "#B6C2D2",
maxWidth: "620px",
margin: "0 auto 30px",
fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.8,
          }}
        >
          AI-powered property verification helping buyers avoid fraud,
          verify ownership and purchase property with confidence.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
           gap: "clamp(16px, 4vw, 24px)",
            flexWrap: "wrap",
            color: "#B6C2D2",
            marginBottom: "30px",
          }}
        >
          <span>Home</span>
          <span>Verify</span>
          <span>Pricing</span>
          <span>Contact</span>
        </div>

        <p
          style={{
            color: "#7E8B9C",
            fontSize: "14px",
          }}
        >
          © 2026 PropertySure AI. All rights reserved.
        </p>
      </footer>

    </main>
  );
}