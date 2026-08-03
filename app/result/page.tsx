"use client";

import { jsPDF } from "jspdf";

export default function ResultPage() {
  function downloadPDF() {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("PropertySure AI", 20, 20);

  doc.setFontSize(16);
  doc.text("Property Verification Certificate", 20, 35);

  doc.setFontSize(12);
  doc.text("Owner: John Doe", 20, 55);
  doc.text("Document: Certificate of Occupancy", 20, 65);
  doc.text("Property ID: PS-2026-0001", 20, 75);
  doc.text("Location: Lagos, Nigeria", 20, 85);
  doc.text("Trust Score: 98/100", 20, 95);
  doc.text("AI Confidence: 98.7%", 20, 105);
  doc.text("Verification Status: VERIFIED", 20, 115);

  doc.save("PropertySure-Verification.pdf");
}
async function shareVerification() {
  try {
    await navigator.share({
      title: "PropertySure AI Verification",
      text: "This property document has been verified successfully by PropertySure AI.",
      url: window.location.href,
    });
  } catch (error) {
    console.log(error);
  }
}
return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A1224",
        color: "white",
        fontFamily: "Arial, sans-serif",
      padding: "30px 16px 60px",
overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "50px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#2EA8FF",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              PropertySure AI
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#94A3B8",
                fontSize: "14px",
              }}
            >
              AI Property Verification Platform
            </p>
          </div>

         
        </nav>

       {/* Hero */}
<section
  style={{
    background: "#111827",
    borderRadius: "24px",
   padding: "32px 20px",
    border: "1px solid rgba(255,255,255,.06)",
    marginBottom: "40px",
  }}
>
  <div
    style={{
      display: "grid",
   gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
     gap: "25px",
      alignItems: "center",
    }}
  >
    {/* Verification Circle */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
         width: "min(270px, 75vw)",
height: "min(270px, 75vw)",
          borderRadius: "50%",
          border: "8px solid #22C55E",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(circle,#153B2C 0%,#0F172A 75%)",
          boxShadow:
            "0 0 35px rgba(34,197,94,.45),0 0 90px rgba(34,197,94,.15)",
        }}
      >
        <div
          style={{
           fontSize: "60px",
            color: "#4ADE80",
            marginBottom: "12px",
          }}
        >
          ✓
        </div>

        <div
          style={{
            fontWeight: 700,
           fontSize: "22px",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Verification
          <br />
          Complete
        </div>
      </div>
    </div>

   {/* Hero Content */}
<div
  style={{
    textAlign: "center",
  }}
>
      <div
        style={{
          display: "inline-block",
        padding: "8px 16px",
          borderRadius: "999px",
          background: "rgba(34,197,94,.12)",
          border: "1px solid rgba(34,197,94,.35)",
          color: "#4ADE80",
          fontWeight: 700,
          fontSize: "15px",
          marginBottom: "20px",
        }}
      >
        Document Authenticity: VERIFIED
      </div>

      <h1
        style={{
          margin: 0,
         fontSize: "clamp(36px, 6vw, 52px)",
          lineHeight: 1.15,
        }}
      >
        Verification Complete!
      </h1>

      <p
        style={{
        margin: "20px auto 0",
          color: "#CBD5E1",
          lineHeight: 1.8,
         fontSize: "16px",
          maxWidth: "620px",
        }}
      >
        Your property document has been successfully verified by
        PropertySure AI using artificial intelligence, ownership
        validation, fraud detection and blockchain verification.
      </p>

      <div
        style={{
          marginTop: "30px",
          background: "#16213A",
          borderRadius: "18px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#94A3B8",
                fontSize: "14px",
              }}
            >
              TRUST SCORE
            </div>

            <div
              style={{
               fontSize: "54px",
                color: "#4ADE80",
                fontWeight: 700,
              }}
            >
              98
              <span
                style={{
                  color: "#94A3B8",
                 fontSize: "28px",
                }}
              >
                /100
              </span>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "18px" }}>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "14px",
                }}
              >
                Confidence Level
              </div>

              <strong
                style={{
                  color: "#4ADE80",
                 fontSize: "24px",
                }}
              >
                98.7%
              </strong>
            </div>

            <div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "14px",
                }}
              >
                Risk Level
              </div>

              <strong
                style={{
                  color: "#4ADE80",
                 fontSize: "22px",
                }}
              >
                Very Low
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    <section
  style={{
    display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "24px",
    marginTop: "10px",
  }}
>
  {/* Verification Summary */}
  <div
    style={{
      background: "#111827",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid rgba(255,255,255,.06)",
    }}
  >
    <h3
      style={{
        marginTop: 0,
        marginBottom: "24px",
        color: "#3B82F6",
      }}
    >
      Verification Summary
    </h3>

    <div
      style={{
        display: "grid",
        rowGap: "18px",
      }}
    >
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Owner Name</strong>
        <span style={{color:"#CBD5E1"}}>John Doe</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Document Type</strong>
        <span style={{color:"#CBD5E1"}}>Certificate of Occupancy</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Property ID</strong>
        <span style={{color:"#CBD5E1"}}>PS-2026-0001</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Location</strong>
        <span style={{color:"#CBD5E1"}}>Lagos, Nigeria</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Verification Date</strong>
        <span style={{color:"#CBD5E1"}}>19 July 2026</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <strong>Reference ID</strong>
        <span style={{color:"#CBD5E1"}}>PSAI-VER-2026-0719-1256</span>
      </div>
    </div>
  </div>

  {/* AI Analysis Results */}
  <div
    style={{
      background:"#111827",
      borderRadius:"20px",
      padding:"30px",
      border:"1px solid rgba(255,255,255,.06)"
    }}
  >
    <h3
      style={{
        marginTop:0,
        marginBottom:"24px",
        color:"#3B82F6"
      }}
    >
      AI Analysis Results
    </h3>

    <div style={{display:"grid",rowGap:"16px"}}>

      <div>✅ Document structure is valid</div>

      <div>✅ Text and data consistency verified</div>

      <div>✅ Signature matches official records</div>

      <div>✅ Stamp and seal validated</div>

      <div>✅ No signs of forgery or tampering</div>

      <div>✅ No duplicate property detected</div>

      <div>✅ Land registry cross-check passed</div>

    </div>

    <div
      style={{
        marginTop:"28px",
        paddingTop:"18px",
        borderTop:"1px solid rgba(255,255,255,.08)"
      }}
    >
      <div
        style={{
          color:"#94A3B8",
          marginBottom:"10px"
        }}
      >
        AI Confidence Score
      </div>

      <div
        style={{
          fontSize:"36px",
          fontWeight:700,
          color:"#4ADE80"
        }}
      >
        98.7%
      </div>
    </div>
 </div>
</section>

{/* Blockchain Verification + Document Preview */}
<section
  style={{
    display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "25px",
    marginTop: "25px",
  }}
>
  {/* Blockchain Verification */}
  <div
    style={{
      background: "#111827",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid rgba(255,255,255,.06)",
    }}
  >
    <h3
      style={{
        marginTop: 0,
        marginBottom: "24px",
        color: "#2EA8FF",
      }}
    >
      Blockchain Verification
    </h3>

    <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#94A3B8" }}>Network</span>
      <strong>Ethereum Mainnet</strong>
    </div>

    <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#94A3B8" }}>Status</span>
      <strong style={{ color: "#4ADE80" }}>Confirmed</strong>
    </div>

    <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#94A3B8" }}>Block Number</span>
      <strong>18,925,364</strong>
    </div>

    <div style={{ marginBottom: "22px" }}>
      <div style={{ color: "#94A3B8", marginBottom: "8px" }}>
        Transaction Hash
      </div>

      <div
        style={{
          background: "#16213A",
          padding: "14px",
          borderRadius: "10px",
          color: "#CBD5E1",
          overflowX: "auto",
        }}
      >
        0x8A7F4E92B31CDB9F47A65DE...
      </div>
    </div>

    <button
      style={{
        background: "#1D4ED8",
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      View on Etherscan
    </button>
  </div>

  {/* Document Preview */}
  <div
    style={{
      background: "#111827",
      borderRadius: "20px",
      padding: "30px",
      border: "1px solid rgba(255,255,255,.06)",
    }}
  >
    <h3
      style={{
        marginTop: 0,
        marginBottom: "24px",
        color: "#2EA8FF",
      }}
    >
      Document Preview
    </h3>

    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "120px",
          height: "160px",
          background: "#16213A",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#94A3B8",
          fontWeight: 600,
        }}
      >
        PDF
      </div>

      <div>
        <h4
          style={{
            margin: 0,
            marginBottom: "10px",
          }}
        >
          Certificate of Occupancy.pdf
        </h4>

        <div
          style={{
            color: "#94A3B8",
            marginBottom: "22px",
          }}
        >
          2.4 MB
        </div>

        <button
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.2)",
            padding: "12px 18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Preview Document
        </button>
      </div>
    </div>
  </div>
</section>
{/* Final Verification Actions */}
<section
  style={{
    marginTop: "40px",
    background: "#111827",
    borderRadius: "22px",
    padding: "45px",
    border: "1px solid rgba(255,255,255,.06)",
    textAlign: "center",
  }}
>
  <div
    style={{
      fontSize: "64px",
      marginBottom: "18px",
    }}
  >
    🔒
  </div>

  <h2
    style={{
      marginTop: 0,
      marginBottom: "18px",
      fontSize: "34px",
    }}
  >
    Your Document is Securely Verified & Stored
  </h2>

  <p
    style={{
      color: "#94A3B8",
      fontSize: "17px",
      lineHeight: 1.8,
      maxWidth: "760px",
      margin: "0 auto 35px",
    }}
  >
    This verification has been completed successfully and securely recorded.
    You can download the verification certificate, share the verification
    result, or verify another property document at any time.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "18px",
      flexWrap: "wrap",
    }}
  >
    <button
    onClick={downloadPDF}
      style={{
        background: "#2563EB",
        color: "#fff",
        border: "none",
        padding: "14px 26px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      Download Verification PDF
    </button>

    <button
    onClick={shareVerification}
   style={{
  background: "#16A34A",
  color: "#fff",
  border: "none",
  padding: "16px 28px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
  maxWidth: "360px",
}}
    >
      Share Verification
    </button>

    <button
      onClick={() => (window.location.href = "/verify")}
     style={{
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,.2)",
  padding: "16px 28px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
  maxWidth: "360px",
}}
    >
      Verify Another Property
    </button>
  </div>
</section>
      </div>
    </main>
  );
}