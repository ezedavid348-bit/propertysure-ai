"use client";
import { useState } from "react";
export default function VerifyPage() {
const [file, setFile] = useState<File | null>(null);
  return (
    <main
      style={{
        minHeight: "100vh",
      background: `
linear-gradient(rgba(5,11,24,0.40), rgba(5,11,24,0.50)),
url("/verify-blueprint.png") center/cover no-repeat,
radial-gradient(circle at top, #0E2348 0%, #08111F 45%, #050B18 100%)
`,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "500px",
          background: "#111827",
          padding: "40px",
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
       <h1
  style={{
    color: "#2EA8FF",
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "20px",
  }}
>
        Upload Your Property Document
        </h1>

       <p
  style={{
    color: "#CBD5E1",
    fontSize: "17px",
    lineHeight: "1.7",
    marginBottom: "36px",
  }}
>
        Upload your property document below. PropertySure AI will automatically extract the document details and verify its authenticity using AI.
        </p>

        

       <label
 style={{
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
maxWidth: "640px",
width: "100%",
minHeight: "320px",
padding: "40px 20px",
 border: "2px dashed rgba(46,168,255,0.7)",
 
 borderRadius: "18px",
  background: "#16213A",
  boxShadow: "0 0 35px rgba(46,168,255,0.18)",
  cursor: "pointer",
  transition: "all 0.25s ease",
  marginBottom: "25px",
}} 
>
  <input
    type="file"
    style={{ display: "none" }}
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    }}
  />

<div
  style={{
    background: "#1E3A8A",
    alignSelf: "center",
    color: "#93C5FD",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "18px",
    width: "fit-content",
  }}
>
  AI READY
</div>
 <div
  style={{
    width: "120px",
    height: "120px",
    margin: "0 auto 24px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(46,168,255,0.25), rgba(46,168,255,0.08))",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 35px rgba(46,168,255,0.35)",
    fontSize: "58px",
  }}
>
  ⬆️
</div>

  <h3 style={{ marginBottom: "10px", color: "#2EA8FF" }}>
   Drop your document here
  </h3>

  <p style={{ color: "#CBD5E1", fontSize: "14px" }}>
   or tap to browse
  </p>
</label>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "28px",
  }}
>
  {[
    "🔒 Secure Upload",
    "🤖 AI Analysis",
    "⏱️ 2–5 Min",
    "🛡️ Fraud Detection",
  ].map((item) => (
    <div
      key={item}
      style={{
        background: "rgba(46,168,255,0.12)",
        border: "1px solid rgba(46,168,255,0.25)",
        color: "#D9F2FF",
        padding: "8px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {item}
    </div>
  ))}
</div>
{file && (
  <div
    style={{
      background: "#1A2338",
      padding: "18px",
      borderRadius: "12px",
      marginBottom: "20px",
      textAlign: "left",
      border: "1px solid #2EA8FF",
    }}
  >
    <p style={{ color: "#2EA8FF", margin: 0, fontWeight: "bold" }}>
      ✓ Document Selected
    </p>

    <p style={{ color: "white", marginTop: "8px", marginBottom: 0 }}>
      📄 {file.name}
    </p>
  </div>
)}
<button
  disabled={!file}
  onClick={() => {
    window.location.href = "/processing";
  }}
  style={{
    width: "100%",
  padding: "18px",
background: "linear-gradient(90deg, #1D4ED8, #38BDF8)",
color: "white",
border: "none",
borderRadius: "12px",
fontSize: "18px",
fontWeight: "700",
letterSpacing: "0.3px",
boxShadow: "0 8px 20px rgba(46,168,255,0.35)",
cursor: file ? "pointer" : "not-allowed",
transition: "all 0.25s ease",
    opacity: file ? 1 : 0.6,
  }}
>
 Verify Property
</button>
<p
  style={{
    marginTop: "22px",
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: "1.8",
    textAlign: "center",
  }}
>
  🔒 Your documents are encrypted and handled securely. PropertySure AI
  never shares your files with third parties. Verification usually takes
  2–5 minutes, depending on document complexity.
</p>
      </div>
    </main>
  );
}