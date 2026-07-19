export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050B18",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "25px 80px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ color: "#2EA8FF", margin: 0 }}>
          PropertySure AI
        </h2>

        <div
          style={{
            display: "flex",
            gap: "35px",
            alignItems: "center",
          }}
        >
          <a href="#" style={{ color: "white", textDecoration: "none" }}>
            Home
          </a>

          <a href="#" style={{ color: "white", textDecoration: "none" }}>
            Features
          </a>

          <a href="#" style={{ color: "white", textDecoration: "none" }}>
            Pricing
          </a>

          <button
            style={{
              background: "#2EA8FF",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 30px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            marginBottom: "20px",
            color: "#2EA8FF",
          }}
        >
          Verify Property Documents with AI
        </h1>

        <p
          style={{
            maxWidth: "700px",
            fontSize: "22px",
            color: "#cbd5e1",
            lineHeight: 1.7,
          }}
        >
          AI-powered property verification, blockchain receipts, fraud
          detection, and trusted property intelligence for buyers, sellers,
          lawyers, and diaspora investors.
        </p>

        <button
          style={{
            marginTop: "40px",
            background: "#2EA8FF",
            color: "white",
            border: "none",
            padding: "18px 40px",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Verify a Property
        </button>
      </section>
      <section
  style={{
    padding: "80px",
    background: "#0A1224",
  }}
>
  <h2
    style={{
      textAlign: "center",
      fontSize: "42px",
      marginBottom: "60px",
      color: "#2EA8FF",
    }}
  >
    Why Choose PropertySure AI?
  </h2>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "16px",
        width: "300px",
      }}
    >
      <h3>🤖 AI Verification</h3>
      <p>
        Instantly analyze land documents using artificial intelligence to detect inconsistencies.
      </p>
    </div>

    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "16px",
        width: "300px",
      }}
    >
      <h3>🔗 Blockchain Receipt</h3>
      <p>
        Every successful verification receives a secure blockchain verification receipt.
      </p>
    </div>

    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "16px",
        width: "300px",
      }}
    >
      <h3>🛡 Fraud Detection</h3>
      <p>
        Detect forged documents, fake ownership records, and suspicious property transactions.
      </p>
    </div>
  </div>
</section>
<section
  style={{
    padding: "80px",
    background: "#0B0F19",
    textAlign: "center",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      color: "#2EA8FF",
      marginBottom: "20px",
    }}
  >
    Ready to Verify Your Property?
  </h2>

  <p
    style={{
      maxWidth: "700px",
      margin: "0 auto",
      color: "#CBD5E1",
      fontSize: "20px",
      lineHeight: 1.7,
    }}
  >
    Upload your land documents and receive an AI-powered verification report in minutes.
  </p>

  <button
    style={{
      marginTop: "40px",
      background: "#2EA8FF",
      color: "white",
      border: "none",
      padding: "18px 45px",
      borderRadius: "10px",
      fontSize: "18px",
      cursor: "pointer",
    }}
  >
    Get Started
  </button>
</section>
<footer
  style={{
    background: "#050B14",
    padding: "40px",
    textAlign: "center",
    borderTop: "1px solid #1E293B",
  }}
>
  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    PropertySure AI
  </h3>

  <p
    style={{
      color: "#94A3B8",
      marginBottom: "20px",
    }}
  >
    AI-powered property verification you can trust.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      color: "#CBD5E1",
      fontSize: "15px",
      marginBottom: "20px",
    }}
  >
    <span>Privacy Policy</span>
    <span>Terms of Service</span>
    <span>Contact</span>
  </div>

  <p
    style={{
      color: "#64748B",
      fontSize: "14px",
    }}
  >
    © 2026 PropertySure AI. All rights reserved.
  </p>
</footer>
    </main>
  );
}