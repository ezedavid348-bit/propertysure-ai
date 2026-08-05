"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function AboutPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050B18",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HERO SECTION */}

     <section
  style={{
    position: "relative",
    padding: "120px 30px",
    backgroundImage:
      "linear-gradient(rgba(5,11,24,0.78), rgba(5,11,24,0.78)), url('/about-hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
  }}
>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "60px",
          }}
        >
          {/* LEFT */}

          <div
            style={{
              flex: "1",
              minWidth: "320px",
            }}
          >
            <p
              style={{
                color: "#2EA8FF",
                fontWeight: "700",
                letterSpacing: "4px",
                marginBottom: "18px",
              }}
            >
              ABOUT PROPERTYSURE AI
            </p>

            <h1
              style={{
                fontSize: "58px",
                lineHeight: "1.1",
                marginBottom: "28px",
                fontWeight: "800",
              }}
            >
              Building Trust in Nigerian Real Estate.
            </h1>

            <p
              style={{
                color: "#B6C2D2",
                fontSize: "20px",
                lineHeight: "1.8",
                maxWidth: "620px",
                marginBottom: "40px",
              }}
            >
              PropertySure AI helps property buyers, investors, and real estate
              professionals verify land and property documents before making any
              payment using Artificial Intelligence and secure verification
              technology.
            </p>

            <button
              onClick={() => router.push("/verify")}
              style={{
                background: "#2EA8FF",
                color: "white",
                border: "none",
                padding: "18px 40px",
                borderRadius: "12px",
                fontSize: "18px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Verify Property
            </button>
          </div>

          {/* RIGHT */}

          <div
            style={{
              flex: "1",
              minWidth: "320px",
              textAlign: "center",
            }}
          >
            <img
  src="/about-office.jpg"
  alt="PropertySure AI"
  style={{
    width: "100%",
    maxWidth: "520px",
    borderRadius: "20px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
  }}
/>
          </div>
        </div>
      </section>
     <section
  style={{
    padding: "100px 30px",
    backgroundImage:
      "linear-gradient(rgba(7,16,31,0.86), rgba(7,16,31,0.86)), url('/our-purpose.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <p
      style={{
        color: "#2EA8FF",
        fontWeight: "700",
        letterSpacing: "4px",
        marginBottom: "18px",
      }}
    >
      OUR PURPOSE
    </p>

    <h2
      style={{
        fontSize: "48px",
        fontWeight: "800",
        marginBottom: "24px",
      }}
    >
      Building Trust Through Technology
    </h2>

    <p
      style={{
        maxWidth: "760px",
        margin: "0 auto 70px",
        color: "#B6C2D2",
        fontSize: "20px",
        lineHeight: "1.8",
      }}
    >
      PropertySure AI combines Artificial Intelligence, document analysis,
      and secure verification technology to help property buyers make informed
      decisions before making any payment.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px",
      }}
    >
      <div
        style={{
          background: "#0B162A",
          padding: "40px 30px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3
          style={{
            color: "#2EA8FF",
            marginBottom: "18px",
            fontSize: "28px",
          }}
        >
          Our Mission
        </h3>

        <p
          style={{
            color: "#B6C2D2",
            lineHeight: "1.8",
          }}
        >
          Protect property buyers by verifying land and property documents
          before payment using Artificial Intelligence and secure verification
          technology.
        </p>
      </div>

      <div
        style={{
          background: "#0B162A",
          padding: "40px 30px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3
          style={{
            color: "#2EA8FF",
            marginBottom: "18px",
            fontSize: "28px",
          }}
        >
          Our Vision
        </h3>

        <p
          style={{
            color: "#B6C2D2",
            lineHeight: "1.8",
          }}
        >
          To become Africa's most trusted AI-powered property verification
          platform, reducing fraud and increasing confidence in real estate
          transactions.
        </p>
      </div>

      <div
        style={{
          background: "#0B162A",
          padding: "40px 30px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3
          style={{
            color: "#2EA8FF",
            marginBottom: "18px",
            fontSize: "28px",
          }}
        >
          Why PropertySure AI
        </h3>

        <p
          style={{
            color: "#B6C2D2",
            lineHeight: "1.8",
          }}
        >
          AI-powered verification, secure document analysis, blockchain-backed
          verification reports, and fast results that help buyers make informed
          decisions.
        </p>
      </div>
    </div>
  </div>
</section>
{/* HOW IT WORKS SECTION */}

<section
  style={{
    padding: "100px 30px",
    backgroundImage:
      "linear-gradient(rgba(7,18,36,0.88), rgba(7,18,36,0.88)), url('/how-it-works.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <p
      style={{
        color: "#2EA8FF",
        fontWeight: "700",
        letterSpacing: "4px",
        marginBottom: "18px",
      }}
    >
      HOW IT WORKS
    </p>

    <h2
      style={{
        fontSize: "46px",
        marginBottom: "20px",
      }}
    >
      Verify Property Documents in Four Simple Steps
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        maxWidth: "760px",
        margin: "0 auto 70px",
        lineHeight: "1.8",
        fontSize: "18px",
      }}
    >
      PropertySure AI combines Artificial Intelligence and secure verification
      technology to help buyers verify documents before making any payment.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
        gap: "28px",
      }}
    >
      <div
        style={{
          background: "#0D1B33",
          padding: "35px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.18)",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "20px" }}>📄</div>

        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          Upload Documents
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Upload your Certificate of Occupancy, Survey Plan, Deed of Assignment,
          Building Approval and other property documents.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "35px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.18)",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "20px" }}>🤖</div>

        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          AI Verification
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Artificial Intelligence analyzes documents for inconsistencies,
          forgery indicators and authenticity.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "35px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.18)",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "20px" }}>🏛️</div>

        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          Cross-check Records
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          PropertySure AI compares available information with trusted property
          records and verification sources.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "35px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.18)",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "20px" }}>✅</div>

        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          Receive Report
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Get a detailed verification report so you can make informed property
          decisions with confidence.
        </p>
      </div>
    </div>
  </div>
</section>
{/* SUPPORTED DOCUMENTS */}

<section
  style={{
    padding: "100px 30px",
    backgroundImage:
      "linear-gradient(rgba(5,11,24,0.90), rgba(5,11,24,0.90)), url('/supported-documents.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <p
      style={{
        color: "#2EA8FF",
        fontWeight: "700",
        letterSpacing: "4px",
        marginBottom: "18px",
      }}
    >
      SUPPORTED DOCUMENTS
    </p>

    <h2
      style={{
        fontSize: "46px",
        marginBottom: "20px",
      }}
    >
      Documents PropertySure AI Can Verify
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        maxWidth: "760px",
        margin: "0 auto 70px",
        lineHeight: "1.8",
        fontSize: "18px",
      }}
    >
      Verify the authenticity and integrity of important property documents
      before making any real estate transaction.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
        gap: "25px",
      }}
    >
      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>📜</div>
        <h3 style={{ color: "#2EA8FF" }}>Certificate of Occupancy</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Verify ownership, issuance details and authenticity.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>📄</div>
        <h3 style={{ color: "#2EA8FF" }}>Deed of Assignment</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Confirm legal ownership transfer documents.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>🗺️</div>
        <h3 style={{ color: "#2EA8FF" }}>Survey Plan</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Validate land boundaries and survey information.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>🏗️</div>
        <h3 style={{ color: "#2EA8FF" }}>Building Approval</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Check planning permits and building approvals.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>📋</div>
        <h3 style={{ color: "#2EA8FF" }}>Registered Survey</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Verify registered survey records and coordinates.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          borderRadius: "18px",
          padding: "30px",
          border: "1px solid rgba(46,168,255,0.15)",
        }}
      >
        <div style={{ fontSize: "46px", marginBottom: "18px" }}>📑</div>
        <h3 style={{ color: "#2EA8FF" }}>Governor's Consent</h3>
        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Confirm legal approval and ownership documentation.
        </p>
      </div>
    </div>
  </div>
</section>
{/* WHY TRUST PROPERTYSURE AI */}

     <section
  style={{
    padding: "120px 30px",
    backgroundImage:
      "linear-gradient(rgba(7,17,34,0.90), rgba(7,17,34,0.90)), url('/why-trust.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#2EA8FF",
              fontWeight: "700",
              letterSpacing: "4px",
              marginBottom: "20px",
            }}
          >
            WHY TRUST PROPERTYSURE AI
          </p>

          <h2
            style={{
              fontSize: "48px",
              marginBottom: "25px",
              fontWeight: "800",
            }}
          >
            Trusted by Property Buyers Across Nigeria
          </h2>

          <p
            style={{
              color: "#B6C2D2",
              fontSize: "20px",
              lineHeight: "1.8",
              maxWidth: "760px",
              margin: "0 auto 70px",
            }}
          >
            PropertySure AI combines Artificial Intelligence, secure document
            verification, blockchain technology, and trusted verification
            processes to help buyers make confident property decisions.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
           >
            <div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>🤖</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    AI Verification
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    Advanced AI analyzes property documents for authenticity and potential
    fraud.
  </p>
</div>

<div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>🔒</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    Blockchain Security
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    Every verification report is protected with secure blockchain-backed
    records.
  </p>
</div>

<div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>⚡</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    Fast Results
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    Receive your verification report in minutes instead of days.
  </p>
</div>

<div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>🛡️</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    Fraud Protection
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    Reduce the risk of fake documents and fraudulent property transactions.
  </p>
</div>

<div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>🇳🇬</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    Built for Nigeria
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    Designed specifically around Nigerian land and property verification
    processes.
  </p>
</div>

<div
  style={{
    background: "#0D1B33",
    border: "1px solid rgba(46,168,255,0.15)",
    borderRadius: "18px",
    padding: "35px",
  }}
>
  <div style={{ fontSize: "48px", marginBottom: "18px" }}>✅</div>

  <h3
    style={{
      color: "#2EA8FF",
      marginBottom: "15px",
    }}
  >
    Trusted Process
  </h3>

  <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
    A transparent verification process that gives buyers confidence before
    making payment.
  </p>
</div>

</div>

<button
  onClick={() => router.push("/verify")}
  style={{
    marginTop: "70px",
    background: "#2EA8FF",
    color: "white",
    border: "none",
    padding: "20px 50px",
    borderRadius: "14px",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  Verify Your Property Now
</button>

</div>
</section>
{/* FAQ SECTION */}

<section
  style={{
    padding: "120px 30px",
    backgroundImage:
      "linear-gradient(rgba(5,11,24,0.88), rgba(5,11,24,0.88)), url('/faq-section-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div
    style={{
      maxWidth: "1000px",
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <p
      style={{
        color: "#2EA8FF",
        fontWeight: "700",
        letterSpacing: "4px",
        marginBottom: "20px",
      }}
    >
      FREQUENTLY ASKED QUESTIONS
    </p>

    <h2
      style={{
        fontSize: "48px",
        fontWeight: "800",
        marginBottom: "25px",
      }}
    >
      Got Questions?
    </h2>

    <p
      style={{
        color: "#B6C2D2",
        fontSize: "20px",
        lineHeight: "1.8",
        maxWidth: "760px",
        margin: "0 auto 70px",
      }}
    >
      Here are answers to some of the most common questions about
      PropertySure AI.
    </p>
    <div
  style={{
    margin: "60px auto",
    maxWidth: "1000px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  }}
>
  <img
    src="/faq-help.jpg"
    alt="Frequently Asked Questions"
    style={{
      width: "100%",
      display: "block",
      borderRadius: "24px",
    }}
  />
</div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "22px",
      }}
    >
      <div
        style={{
          background: "#0D1B33",
          padding: "30px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.15)",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          What documents can PropertySure AI verify?
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          We verify documents such as Certificates of Occupancy,
          Survey Plans, Deeds of Assignment, Governor's Consent,
          Building Approval documents and other property-related records.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "30px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.15)",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          How long does verification take?
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Verification time depends on the document type and available
          records. Our goal is to provide results as quickly as possible.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "30px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.15)",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          Is my document secure?
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          Yes. Documents are handled using secure verification processes
          and protected throughout the verification workflow.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "30px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.15)",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          Does PropertySure AI guarantee ownership?
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          No. PropertySure AI provides document verification and analysis
          to help buyers make informed decisions. Users should still carry
          out all necessary legal and professional due diligence before
          completing any property transaction.
        </p>
      </div>

      <div
        style={{
          background: "#0D1B33",
          padding: "30px",
          borderRadius: "18px",
          border: "1px solid rgba(46,168,255,0.15)",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: "#2EA8FF", marginBottom: "15px" }}>
          How do I receive my verification report?
        </h3>

        <p style={{ color: "#B6C2D2", lineHeight: "1.8" }}>
          After verification is completed, your report will be made
          available through your PropertySure AI account for review and
          download.
        </p>
      </div>
    </div>
  </div>
</section>
{/* FOOTER */}

<footer
  style={{
    backgroundImage:
      "linear-gradient(rgba(5,11,24,0.92), rgba(5,11,24,0.92)), url('/footer-contact-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "80px 30px 40px",
    borderTop: "1px solid rgba(46,168,255,0.15)",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
      gap: "40px",
    }}
  >
    <div>
      <h2
        style={{
          color: "#2EA8FF",
          marginBottom: "20px",
        }}
      >
        PropertySure AI
      </h2>

      <p
        style={{
          color: "#B6C2D2",
          lineHeight: "1.8",
        }}
      >
        AI-powered property document verification platform helping buyers,
        investors and real estate professionals make informed decisions.
      </p>
    </div>

    <div>
      <h3 style={{ marginBottom: "20px" }}>Quick Links</h3>

      <Link
  href="/"
  style={{
    display: "block",
    color: "#B6C2D2",
    marginBottom: "12px",
    textDecoration: "none",
  }}
>
  Home
</Link>

<Link
  href="/about"
  style={{
    display: "block",
    color: "#B6C2D2",
    marginBottom: "12px",
    textDecoration: "none",
  }}
>
  About
</Link>

<Link
  href="/pricing"
  style={{
    display: "block",
    color: "#B6C2D2",
    marginBottom: "12px",
    textDecoration: "none",
  }}
>
  Pricing
</Link>

<Link
  href="/contact"
  style={{
    display: "block",
    color: "#B6C2D2",
    textDecoration: "none",
  }}
>
  Contact
</Link>
    </div>

    <div>
      <h3 style={{ marginBottom: "20px" }}>Services</h3>

      <p style={{ color: "#B6C2D2", marginBottom: "12px" }}>
        Document Verification
      </p>

      <p style={{ color: "#B6C2D2", marginBottom: "12px" }}>
        AI Analysis
      </p>

      <p style={{ color: "#B6C2D2", marginBottom: "12px" }}>
        Verification Reports
      </p>

      <p style={{ color: "#B6C2D2" }}>
        Property Due Diligence
      </p>
    </div>

    <div>
      <h3 style={{ marginBottom: "20px" }}>Contact</h3>

      <p style={{ color: "#B6C2D2", marginBottom: "12px" }}>
        support@propertysure.ai
      </p>

      <p style={{ color: "#B6C2D2", marginBottom: "12px" }}>
        Nigeria
      </p>

      <p style={{ color: "#B6C2D2" }}>
        Available 24/7
      </p>
    </div>
  </div>

  <div
    style={{
      marginTop: "60px",
      paddingTop: "25px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      textAlign: "center",
      color: "#8FA2BC",
      fontSize: "15px",
    }}
  >
    © {new Date().getFullYear()} PropertySure AI. All rights reserved.
  </div>
</footer>

</main>
);
}