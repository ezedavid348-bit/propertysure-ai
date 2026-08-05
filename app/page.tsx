"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
 const [isMenuOpen, setIsMenuOpen] = useState(false);
const [openFAQ, setOpenFAQ] = useState<number | null>(null);
const router = useRouter();
const heroImages = [
  "/hero-property.jpg",
  "/hero-documents.jpg",
  "/hero-documents-2.jpg",
  "/hero-documents-3.jpg",
  "/hero-documents-4.jpg",
];

const [currentHero, setCurrentHero] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentHero((prev) => (prev + 1) % heroImages.length);
  }, 3000);

  return () => clearInterval(interval);
}, []);
 return (
  <main
  style={{
    minHeight: "100vh",
    background: "#050B18",
    color: "white",
    fontFamily: "Arial, sans-serif",
  }}
>
      <nav
       style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "28px 30px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  position: "relative",
  zIndex: 1000,
}}
      >
       <h2
  style={{
    color: "#2EA8FF",
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "-1px",
  }}
>
  PropertySure AI
</h2>

      <button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  style={{
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "38px",
fontWeight: "bold",
    cursor: "pointer",
  }}
>
  ☰
</button>

{isMenuOpen && (
  <div
   style={{
  position: "absolute",
  top: "70px",
  right: "20px",
  background: "#111827",
  borderRadius: "10px",
  padding: "20px",
  minWidth: "180px",
  minHeight: "320px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
  zIndex: 1001,
  backdropFilter: "blur(12px)",
}}
  >
  <p
  onClick={() => router.push("/")}
  style={{ margin: "10px 0", cursor: "pointer" }}
>
  Home
</p>
<p
  onClick={() => router.push("/verify")}
  style={{ margin: "10px 0", cursor: "pointer" }}
>
  Verify
</p>
<p
  onClick={() => router.push("/pricing")}
  style={{ margin: "10px 0", cursor: "pointer" }}
>
  Pricing
</p>
<p
  onClick={() => router.push("/about")}
  style={{ margin: "10px 0", cursor: "pointer" }}
>
  About
</p>
<p
  onClick={() => router.push("/contact")}
  style={{ margin: "10px 0", cursor: "pointer" }}
>
  Contact
</p>

<hr
  style={{
    border: "1px solid rgba(255,255,255,0.08)",
    margin: "15px 0",
  }}
/>

<p
  onClick={() => router.push("/signin")}
  style={{
    margin: "10px 0",
    cursor: "pointer",
    color: "#B6C2D2",
  }}
>
  Sign In
</p>

<button
  onClick={() => router.push("/signin")}
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    background: "#2EA8FF",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Get Started
</button>
  </div>
)}
      </nav>

      <section
 style={{
  padding: "140px 30px",
  textAlign: "center",
  position: "relative",
  backgroundImage:
  `linear-gradient(rgba(5,11,24,0.72), rgba(5,11,24,0.72)), url('${heroImages[currentHero]}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden",
}}
>
  <p
    style={{
      color: "#4DA3FF",
      letterSpacing: "3px",
      fontWeight: "700",
      marginBottom: "20px",
    }}
  >
    AI PROPERTY VERIFICATION
  </p>

  <h1
    style={{
      fontSize: "clamp(40px, 8vw, 72px)",
      lineHeight: "1.1",
      fontWeight: "800",
      margin: "0",
    }}
  >
    Verify Property
    <br />
    Documents Before
    <br />
    You Pay.
  </h1>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "700px",
      margin: "30px auto",
      fontSize: "clamp(18px, 4vw, 20px)",
      lineHeight: "1.7",
    }}
  >
    Protect yourself from land fraud using AI-powered
    document verification before making any payment.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      marginTop: "24px",
    }}
  >
    <button
    onClick={() => router.push("/verify")}
      style={{
        background: "#2EA8FF",
        color: "white",
        border: "none",
        padding: "16px 32px",
        borderRadius: "12px",
        fontSize: "18px",
        cursor: "pointer",
      }}
    >
      Verify Property
    </button>

    <button
      style={{
        background: "transparent",
        color: "white",
        border: "1px solid rgba(255,255,255,0.25)",
        padding: "16px 32px",
        borderRadius: "12px",
        fontSize: "18px",
        cursor: "pointer",
      }}
    >
      Learn More
    </button>
  </div>

  <p
    style={{
     marginTop: "28px",
      color: "#9FB3C8",
      fontSize: "16px",
    }}
  >
    ⭐⭐⭐⭐⭐ Trusted by Property Buyers & Investors
  </p>
</section>
<section
  style={{
padding: "90px 30px",

backgroundImage:
  "linear-gradient(rgba(8,17,31,0.85), rgba(8,17,31,0.85)), url('/how-it-works-background.jpg')",

backgroundSize: "cover",
backgroundPosition: "top",
backgroundRepeat: "no-repeat",

textAlign: "center",
  }}>
   <h2
  style={{
    fontSize: "42px",
    marginBottom: "30px",
    fontWeight: "800",
  }}
>
  How It Works
</h2>

<p
  style={{
    color: "#B6C2D2",
    maxWidth: "700px",
    margin: "0 auto",
    fontSize: "18px",
    lineHeight: "1.7",
  }}
>
  Our AI-powered verification process ensures the authenticity of property
  documents, giving buyers confidence before making payment.
</p>
<div
 style={{
  marginTop: "60px",
  display: "flex",
  justifyContent: "center",
  gap: "24px",
  flexWrap: "wrap",
}}
>
  <div
    style={{
      maxWidth: "320px",
      background: "#111827",
      padding: "30px",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ fontSize: "48px", marginBottom: "20px" }}>
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
        lineHeight: "1.7",
      }}
    >
      Upload your Certificate of Occupancy or any property document securely.
    </p>
  </div>
  <div
  style={{
    maxWidth: "320px",
    background: "#111827",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
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
      lineHeight: "1.7",
    }}
  >
    Our AI analyzes the document for authenticity and detects possible fraud.
  </p>
</div>
<div
  style={{
    maxWidth: "320px",
    background: "#111827",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
    🔒
  </div>

  <h3
    style={{
      fontSize: "24px",
      marginBottom: "15px",
    }}
  >
    Blockchain Verification
  </h3>

  <p
    style={{
      color: "#B6C2D2",
      lineHeight: "1.7",
    }}
  >
    Every verification result is secured with blockchain technology to prevent tampering.
  </p>
</div>
</div> 
</section>
<section
 style={{
  padding: "90px 30px",

  backgroundImage:
    "linear-gradient(rgba(5,8,27,0.85), rgba(5,8,27,0.85)), url('/why-choose-background.jpg')",

  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",

  textAlign: "center",
}}
>
  <h2
    style={{
      fontSize: "42px",
      marginBottom: "20px",
      fontWeight: "800",
    }}
  >
    Why Choose PropertySure AI?
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "700px",
      margin: "0 auto 60px",
      fontSize: "18px",
      lineHeight: "1.7",
    }}
  >
    Built with AI and blockchain to help property buyers avoid fraud and verify documents with confidence.
  </p>
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px",
    marginTop: "60px",
  }}
>
  <div
  style={{
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "30px",
    maxWidth: "320px",
    textAlign: "center",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "20px" }}>🛡️</div>

  <h3 style={{ fontSize: "24px", marginBottom: "15px" }}>
    Trusted Verification
  </h3>

  <p
    style={{
      color: "#B6C2D2",
      lineHeight: "1.7",
    }}
  >
    Every report is checked by AI to help detect fake or altered property documents.
  </p>
</div>
<div
  style={{
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "30px",
    maxWidth: "320px",
    textAlign: "center",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚡</div>

  <h3 style={{ fontSize: "24px", marginBottom: "15px" }}>
    Fast AI Analysis
  </h3>

  <p
    style={{
      color: "#B6C2D2",
      lineHeight: "1.7",
    }}
  >
    Get verification results within minutes instead of waiting days for manual checks.
  </p>
</div>
<div
  style={{
    maxWidth: "320px",
    background: "#111827",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>

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
      lineHeight: "1.7",
    }}
  >
    Your uploaded documents are encrypted and stored securely for maximum protection.
  </p>
</div>
<section
  style={{
   padding: "80px 20px 40px",
    textAlign: "center",
    background: "#0A1224",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      marginBottom: "20px",
    }}
  >
    Ready to Verify Your Property?
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "700px",
      margin: "0 auto 40px",
      fontSize: "18px",
      lineHeight: "1.7",
    }}
  >
    Upload your property document and receive an AI-powered verification report in minutes.
  </p>

  <button
    style={{
      background: "#2EA8FF",
      color: "white",
      padding: "16px 36px",
      border: "none",
      borderRadius: "12px",
      fontSize: "18px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Verify Now
  </button>
</section>
</div>
</section>
<section
  style={{
   padding: "90px 30px",

backgroundImage:
  "linear-gradient(rgba(5,8,27,0.85), rgba(5,8,27,0.85)), url('/early-users-background.jpg')",

backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",

textAlign: "center",
  }}
>
  <p
    style={{
      color: "#2EA8FF",
      letterSpacing: "3px",
      fontWeight: "700",
      marginBottom: "15px",
    }}
  >
    EARLY FEEDBACK
  </p>

  <h2
    style={{
      fontSize: "42px",
      fontWeight: "800",
      marginBottom: "20px",
    }}
  >
    What Early Users Say
  </h2>

  <p
    style={{
      maxWidth: "700px",
      margin: "0 auto",
      color: "#B6C2D2",
      fontSize: "18px",
      lineHeight: "1.7",
    }}
  >
    Feedback from early users and beta testers of PropertySure AI.
    These testimonials will be replaced with verified customer reviews after launch.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "30px",
      marginTop: "60px",
    }}
  ></div>
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px",
    marginTop: "60px",
  }}
>
  <div
    style={{
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "25px",
      maxWidth: "320px",
      textAlign: "left",
    }}
  >
    <p style={{ color: "#B6C2D2", lineHeight: "1.7" }}>
      "The interface is simple and the verification process is very
      straightforward. It gave me more confidence before proceeding with my
      property purchase."
    </p>

    <h4 style={{ marginTop: "20px", color: "#2EA8FF" }}>
      — Beta User
    </h4>
  </div>

  <div
    style={{
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "25px",
      maxWidth: "320px",
      textAlign: "left",
    }}
  >
    <p style={{ color: "#B6C2D2", lineHeight: "1.7" }}>
      "PropertySure AI has the potential to become an essential tool for
      property buyers looking to reduce fraud risks."
    </p>

    <h4 style={{ marginTop: "20px", color: "#2EA8FF" }}>
      — Early Reviewer
    </h4>
  </div>

  <div
    style={{
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      padding: "25px",
      maxWidth: "320px",
      textAlign: "left",
    }}
  >
    <p style={{ color: "#B6C2D2", lineHeight: "1.7" }}>
      "Looking forward to seeing nationwide property verification become easier
      through AI."
    </p>

    <h4 style={{ marginTop: "20px", color: "#2EA8FF" }}>
      — Property Investor
    </h4>
  </div>
</div>

</section>
<section
  style={{
   padding: "90px 30px",

backgroundImage:
  "linear-gradient(rgba(8,17,31,0.88), rgba(8,17,31,0.88)), url('/faq-background.jpg')",

backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",

textAlign: "center",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      fontWeight: "800",
      marginBottom: "20px",
    }}
  >
    Frequently Asked Questions
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "700px",
      margin: "0 auto 50px",
      lineHeight: "1.7",
      fontSize: "18px",
    }}
  >
    Everything you need to know about PropertySure AI.
  </p>

  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto",
      textAlign: "left",
    }}
  >
  <div
  style={{
    background: "#111827",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
    cursor: "pointer",
  }}
  onClick={() => setOpenFAQ(openFAQ === 1 ? null : 1)}
>
 <h3
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
  }}
>
  <span>{openFAQ === 1 ? "▼" : "▶"}</span>
  <span>How long does verification take?</span>
</h3>

  {openFAQ === 1 && (
    <p
      style={{
        color: "#B6C2D2",
        lineHeight: "1.7",
        marginTop: "15px",
      }}
    >
      Most document verifications are completed within a few minutes,
      depending on the document quality, file size, and verification
      checks being performed.
    </p>
  )}
</div>
  <div
  style={{
    background: "#111827",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
    cursor: "pointer",
  }}
  onClick={() => setOpenFAQ(openFAQ === 2 ? null : 2)}
>
  <h3>
    {openFAQ === 2 ? "▼" : "▶"} Which documents can I verify?
  </h3>

  {openFAQ === 2 && (
    <p
      style={{
        color: "#B6C2D2",
        lineHeight: "1.7",
        marginTop: "15px",
      }}
    >
      You can verify Allocation Documents, Certificates of Occupancy (C of O),
      Survey Plans, Deeds of Assignment, Governor's Consent, Gazette,
      Excision Documents, Registered Deeds, Land Title Documents,
      Building Approval and other supported property documents.
    </p>
  )}
</div>
    <div
  style={{
    background: "#111827",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
    cursor: "pointer",
  }}
  onClick={() => setOpenFAQ(openFAQ === 3 ? null : 3)}
>
  <h3>
    {openFAQ === 3 ? "▼" : "▶"} Is PropertySure AI available across Nigeria?
  </h3>

  {openFAQ === 3 && (
    <p
      style={{
        color: "#B6C2D2",
        lineHeight: "1.7",
        marginTop: "15px",
      }}
    >
      We are building nationwide coverage, with support expanding across
      Nigerian states as more land records and verification data sources become
      available.
    </p>
  )}
</div>

   <div
  style={{
    background: "#111827",
    padding: "20px",
    borderRadius: "15px",
    cursor: "pointer",
  }}
  onClick={() => setOpenFAQ(openFAQ === 4 ? null : 4)}
>
  <h3>
    {openFAQ === 4 ? "▼" : "▶"} What happens if fraud is detected?
  </h3>

  {openFAQ === 4 && (
    <p
      style={{
        color: "#B6C2D2",
        lineHeight: "1.7",
        marginTop: "15px",
      }}
    >
      You'll receive a detailed AI verification report highlighting suspicious
      findings, possible inconsistencies, and potential fraud risks. This helps
      you make an informed decision before making any payment.
    </p>
  )}
</div>
  </div>
</section>

<section
  style={{
    padding: "90px 30px",

   backgroundImage:
  "linear-gradient(rgba(8,17,31,0.80), rgba(8,17,31,0.80)), url('/supported-documents-background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",

    textAlign: "center",
  }}
>
  <p
    style={{
      color: "#2EA8FF",
      letterSpacing: "3px",
      fontWeight: "700",
      marginBottom: "15px",
    }}
  >
    SUPPORTED DOCUMENTS
  </p>

  <h2
    style={{
    fontSize: "40px",
      fontWeight: "800",
      marginBottom: "20px",
    }}
  >
    Documents You Can Verify
  </h2>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "700px",
      margin: "0 auto 60px",
      fontSize: "18px",
      lineHeight: "1.7",
    }}
  >
    PropertySure AI supports verification of major land and property documents
    commonly used across Nigeria.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "25px",
    }}
  >
{[
  "📄 Allocation Document",
  "🏡 Certificate of Occupancy (C of O)",
  "📐 Survey Plan",
  "📝 Deed of Assignment",
  "🏛 Governor's Consent",
  "📜 Gazette",
  "📋 Excision Documents",
  "📑 Registered Deed",
  "📚 Land Title Documents",
  "🏢 Building Approval",
].map((doc) => (
      <div
        key={doc}
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "25px",
          width: "300px",
          fontWeight: "600",
          fontSize: "18px",
        }}
      >
        {doc}
      </div>
    ))}
  </div>
</section>
<footer
  style={{
    padding: "40px 20px",
    background: "#050B18",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
    marginTop: "80px",
  }}
>
  <h3
    style={{
      fontSize: "24px",
      marginBottom: "15px",
    }}
  >
    PropertySure AI
  </h3>

  <p
    style={{
      color: "#B6C2D2",
      maxWidth: "600px",
      margin: "0 auto 25px",
      lineHeight: "1.7",
    }}
  >
    AI-powered property verification helping buyers avoid fraud and purchase
    with confidence.
  </p>

  <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    flexWrap: "wrap",
    fontSize: "15px",
    marginTop: "25px",
  }}
>
  <span
    style={{ cursor: "pointer" }}
    onClick={() => router.push("/")}
  >
    Home
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => router.push("/verify")}
  >
    Verify
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => router.push("/pricing")}
  >
    Pricing
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => router.push("/contact")}
  >
    Contact
  </span>

  <a
    href="https://www.linkedin.com/in/property-sure-ai-963429421"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "#2EA8FF",
      textDecoration: "none",
      fontWeight: "600",
    }}
  >
    LinkedIn
  </a>
</div>

  <p
    style={{
      marginTop: "30px",
      color: "#7A8797",
      fontSize: "14px",
    }}
  >
    © 2026 PropertySure AI. All rights reserved.
  </p>
</footer>
    </main>
    
  );
}