"use client";

export default function PricingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
      background: `
linear-gradient(rgba(5,11,24,0.88), rgba(5,11,24,0.92)),
url("/pricing-blueprint.png") center/cover no-repeat,
radial-gradient(circle at top, #0E2348 0%, #08111F 45%, #050B18 100%)
`,
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
{/* HERO SECTION */}

<section
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "110px 20px 80px",
    textAlign: "center",
  }}
>
  <div
    style={{
      display: "inline-block",
      padding: "10px 22px",
      borderRadius: "999px",
      background: "rgba(46,168,255,0.12)",
      border: "1px solid rgba(46,168,255,0.25)",
      color: "#A7D9FF",
      fontWeight: "700",
      letterSpacing: "2px",
      fontSize: "14px",
      marginBottom: "28px",
    }}
  >
    PRICING PLANS
  </div>

  <h1
    style={{
      fontSize: "clamp(42px,7vw,72px)",
      fontWeight: "800",
      lineHeight: "1.1",
      marginBottom: "28px",
    }}
  >
    Choose the Right
    <br />
    Verification Plan
  </h1>

  <p
    style={{
      maxWidth: "760px",
      margin: "0 auto",
      color: "#B6C2D2",
      fontSize: "20px",
      lineHeight: "1.8",
    }}
  >
    Whether you're buying your first property, investing from abroad,
    or purchasing high-value real estate, PropertySure AI provides
    professional verification and due diligence before you pay.
  </p>

  <div
    style={{
      marginTop: "45px",
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        background: "rgba(46,168,255,0.12)",
        border: "1px solid rgba(46,168,255,0.25)",
        padding: "12px 20px",
        borderRadius: "999px",
        color: "#D9F2FF",
      }}
    >
      ⚡ Fast Turnaround
    </div>

    <div
      style={{
        background: "rgba(46,168,255,0.12)",
        border: "1px solid rgba(46,168,255,0.25)",
        padding: "12px 20px",
        borderRadius: "999px",
        color: "#D9F2FF",
      }}
    >
      🛡️ Fraud Protection
    </div>

    <div
      style={{
        background: "rgba(46,168,255,0.12)",
        border: "1px solid rgba(46,168,255,0.25)",
        padding: "12px 20px",
        borderRadius: "999px",
        color: "#D9F2FF",
      }}
    >
      📄 Professional Reports
    </div>
  </div>
  {/* PRICING CARDS */}

<section
  style={{
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "20px 20px 100px",
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
  }}
>
  {/* ESSENTIAL */}

  <div
    style={{
      width: "340px",
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "35px",
    }}
  >
    <h2
      style={{
        color: "#2EA8FF",
        fontSize: "30px",
        marginBottom: "10px",
      }}
    >
      Essential
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        marginBottom: "25px",
      }}
    >
      Perfect for first-time property buyers.
    </p>

    <h1
      style={{
        fontSize: "54px",
        margin: 0,
      }}
    >
      ₦149,999
    </h1>

    <p
      style={{
        color: "#8FA3B8",
        marginTop: "10px",
        marginBottom: "30px",
      }}
    >
      Per Verification
    </p>

    <div style={{ lineHeight: "2.1" }}>
      <p>✅ AI Document Verification</p>
      <p>✅ Authenticity Check</p>
      <p>✅ Fraud Risk Analysis</p>
      <p>✅ AI Verification Report</p>
      <p>✅ Downloadable PDF</p>
    </div>

    <button
      onClick={() => window.location.href="/signup"}
      style={{
        width: "100%",
        padding: "16px",
        marginTop: "30px",
        background: "#2EA8FF",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "18px",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Choose Essential
    </button>
  </div>

  {/* PROFESSIONAL */}

  <div
    style={{
      width: "340px",
      background: "#16213A",
      border: "2px solid #2EA8FF",
      borderRadius: "24px",
      padding: "35px",
      transform: "scale(1.05)",
      boxShadow: "0 25px 60px rgba(46,168,255,.28)",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: "-14px",
        right: "20px",
        background: "#2EA8FF",
        color: "#fff",
        padding: "6px 16px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "700",
      }}
    >
      MOST POPULAR
    </div>

    <h2
      style={{
        color: "#2EA8FF",
        fontSize: "30px",
        marginBottom: "10px",
      }}
    >
      Professional
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        marginBottom: "25px",
      }}
    >
      Designed for property buyers, diaspora investors, and anyone purchasing high-value real estate.
    </p>

    <h1
      style={{
        fontSize: "54px",
        margin: 0,
      }}
    >
      ₦299,999
    </h1>

    <p
      style={{
        color: "#8FA3B8",
        marginTop: "10px",
        marginBottom: "30px",
      }}
    >
      Per Verification
    </p>

    <div style={{ lineHeight: "2.1" }}>
      <p>✅ Everything in Essential</p>
      <p>✅ Government Registry Search</p>
      <p>✅ Ownership Verification</p>
      <p>✅ Property History Report</p>
      <p>✅ Priority Support</p>
    </div>

    <button
      onClick={() => window.location.href="/signup"}
      style={{
        width: "100%",
        padding: "16px",
        marginTop: "30px",
        background: "#2EA8FF",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "18px",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Choose Professional
    </button>
  </div>

  {/* PREMIUM */}

  <div
    style={{
      width: "340px",
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "35px",
    }}
  >
    <h2
      style={{
        color: "#2EA8FF",
        fontSize: "30px",
        marginBottom: "10px",
      }}
    >
      Premium
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        marginBottom: "25px",
      }}
    >
      Complete due diligence for premium property transactions.
    </p>

    <h1
      style={{
        fontSize: "54px",
        margin: 0,
      }}
    >
      ₦699,999
    </h1>

    <p
      style={{
        color: "#8FA3B8",
        marginTop: "10px",
        marginBottom: "30px",
      }}
    >
      Custom Investigation
    </p>

    <div style={{ lineHeight: "2.1" }}>
      <p>✅ Everything in Professional</p>
      <p>✅ Physical Site Inspection</p>
      <p>✅ GPS Boundary Verification</p>
      <p>✅ Lawyer Review</p>
      <p>✅ Litigation Check</p>
      <p>✅ Dedicated Consultant</p>
    </div>

    <button
      onClick={() => window.location.href="/contact"}
      style={{
        width: "100%",
        padding: "16px",
        marginTop: "30px",
        background: "#2EA8FF",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "18px",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Contact Sales
    </button>
  </div>
</section>
</section>
{/* CUSTOM VERIFICATION CTA */}

<section
  style={{
   padding: "90px 20px 140px",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    marginTop: "30px",
  }}
>
  <h2
    style={{
      fontSize: "clamp(32px,5vw,48px)",
      fontWeight: "800",
      marginBottom: "20px",
    }}
  >
    Need a Custom Verification?
  </h2>

  <p
    style={{
      maxWidth: "760px",
      margin: "0 auto",
      color: "#B6C2D2",
      fontSize: "18px",
      lineHeight: "1.8",
      marginBottom: "40px",
    }}
  >
    Large estates, commercial properties, government allocations,
    diaspora investments, and complex transactions may require a
    customised verification process. Speak with our specialists for
    a tailored verification package.
  </p>

  <button
    onClick={() => (window.location.href = "/contact")}
    style={{
      background: "#2EA8FF",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "18px 40px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 15px 40px rgba(46,168,255,0.25)",
    }}
  >
    Contact Our Experts
  </button>

  <p
    style={{
      marginTop: "35px",
      color: "#8FA3B8",
     fontSize: "13px",
      lineHeight: "1.8",
      maxWidth: "900px",
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    Premium pricing covers properties within our standard service area.
    Additional travel, accommodation, government fees, legal expenses,
    surveying, or special requirements may require a separate quotation.
  </p>
</section>
</main>
  );
}