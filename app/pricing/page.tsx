"use client";

export default function PricingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0E2348 0%, #08111F 45%, #050B18 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          textAlign: "center",
          padding: "90px 20px 60px",
        }}
      >
        <p
          style={{
            color: "#2EA8FF",
            letterSpacing: "3px",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          PROPERTYSURE AI PRICING
        </p>

        <h1
          style={{
            fontSize: "60px",
            fontWeight: "800",
            marginBottom: "25px",
            lineHeight: "1.1",
          }}
        >
          Choose Your
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
          Whether you're buying your first property or investing hundreds of
          millions of naira, PropertySure AI provides professional property
          verification and due diligence to help you make informed decisions.
        </p>
      </section>

      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          padding: "20px 30px 80px",
        }}
      >
        {/* BASIC PLAN */}

        <div
          style={{
            width: "340px",
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "35px",
          }}
        >
          <h2
            style={{
              color: "#2EA8FF",
              fontSize: "32px",
              marginBottom: "10px",
            }}
          >
            Basic
          </h2>

          <p
            style={{
              color: "#B6C2D2",
              marginBottom: "25px",
            }}
          >
            Ideal for individual property buyers.
          </p>

          <h1
            style={{
              fontSize: "52px",
              margin: 0,
            }}
          >
            ₦49,999
          </h1>

          <p
            style={{
              color: "#8FA3B8",
              marginTop: "10px",
              marginBottom: "30px",
            }}
          >
            Per Property Verification
          </p>

          <div
            style={{
              lineHeight: "2.2",
              color: "#E5E7EB",
            }}
          >
            <p>✅ AI Document Verification</p>
            <p>✅ Document Authenticity Check</p>
            <p>✅ Fraud Risk Analysis</p>
            <p>✅ AI Verification Report</p>
            <p>✅ Downloadable PDF Report</p>
          </div>

        <button
 onClick={() => window.location.href = "/signup"}
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "30px",
              background: "#2EA8FF",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
        {/* STANDARD PLAN */}

<div
  style={{
    width: "340px",
    background: "#16213A",
    border: "2px solid #2EA8FF",
    borderRadius: "20px",
    padding: "35px",
    transform: "scale(1.05)",
    boxShadow: "0 20px 45px rgba(46,168,255,0.25)",
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
      padding: "6px 14px",
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
      fontSize: "32px",
      marginBottom: "10px",
    }}
  >
    Standard
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      marginBottom: "25px",
    }}
  >
    Best for serious property investors.
  </p>

  <h1
    style={{
      fontSize: "52px",
      margin: 0,
    }}
  >
 ₦199,999
  </h1>

  <p
    style={{
      color: "#8FA3B8",
      marginTop: "10px",
      marginBottom: "30px",
    }}
  >
    Per Property Verification
  </p>

  <div
    style={{
      lineHeight: "2.2",
      color: "#E5E7EB",
    }}
  >
    <p>✅ Everything in Basic</p>
    <p>✅ Physical Document Review</p>
    <p>✅ Government Registry Search</p>
    <p>✅ Ownership Verification</p>
    <p>✅ Property History Report</p>
    <p>✅ Priority Support</p>
  </div>

 <button
 onClick={() => window.location.href = "/signup"}
    style={{
      width: "100%",
      padding: "15px",
      marginTop: "30px",
      background: "#2EA8FF",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    Choose Standard
  </button>
</div>
{/* PREMIUM PLAN */}

<div
  style={{
    width: "340px",
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "35px",
  }}
>
  <h2
    style={{
      color: "#2EA8FF",
      fontSize: "32px",
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
    Complete due diligence for high-value property transactions.
  </p>

  <h1
    style={{
      fontSize: "52px",
      margin: 0,
    }}
  >
  ₦549,999
  </h1>

  <p
    style={{
      color: "#8FA3B8",
      marginTop: "10px",
      marginBottom: "30px",
    }}
  >
    Per Property Investigation
  </p>

  <div
    style={{
      lineHeight: "2.2",
      color: "#E5E7EB",
    }}
  >
    <p>✅ Everything in Standard</p>
    <p>✅ Physical Site Inspection</p>
    <p>✅ Property Lawyer Verification</p>
    <p>✅ Government Land Registry Search</p>
    <p>✅ Ownership & Litigation Check</p>
    <p>✅ GPS & Boundary Verification</p>
    <p>✅ Detailed Due Diligence Report</p>
    <p>✅ Dedicated Verification Consultant</p>
  </div>

 <button
 onClick={() => window.location.href = "/signup"}
    style={{
      width: "100%",
      padding: "15px",
      marginTop: "30px",
      background: "#2EA8FF",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    Contact Sales
 </button>
 <p
  style={{
    marginTop: "20px",
    color: "#9CA3AF",
    fontSize: "13px",
    lineHeight: "1.6",
    textAlign: "center",
  }}
>
  * Premium pricing covers properties within our standard service area.
  Additional travel, accommodation, surveying, government fees, legal
  expenses, or other special requirements may require a custom quotation.
</p>
</div>

</section>



{/* Paste the code below here */}

<section
  style={{
    textAlign: "center",
    padding: "80px 20px 100px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      marginBottom: "20px",
    }}
  >
    Need a Custom Verification?
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      fontSize: "20px",
      maxWidth: "700px",
      margin: "0 auto 35px",
      lineHeight: "1.8",
    }}
  >
    Large estates, commercial properties, government allocations, and diaspora investments may require a customised verification process. Our specialists are ready to help.
  </p>

  <button
    onClick={() => window.location.href = "/contact"}
    style={{
      background: "#2EA8FF",
      color: "#fff",
      padding: "18px 40px",
      border: "none",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    Contact Our Experts
  </button>
</section>

</main>
  );
}