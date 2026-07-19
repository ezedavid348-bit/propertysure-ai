"use client";
import { useState } from "react";
export default function VerifyPage() {
const [file, setFile] = useState<File | null>(null);
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A1224",
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
        <h1 style={{ color: "#2EA8FF", marginBottom: "20px" }}>
          Verify Property
        </h1>

        <p style={{ color: "#CBD5E1", marginBottom: "30px" }}>
          Upload your property document for AI verification.
        </p>

        <input
          type="text"
          placeholder="Property ID"
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #374151",
            background: "#1F2937",
            color: "white",
          }}
        />

        <input
  type="file"
  onChange={(e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }}
  style={{
    width: "100%",
    marginBottom: "25px",
    color: "white",
  }}
/>
{file && (
  <div
    style={{
      background: "#1A2338",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
      textAlign: "left",
    }}
  >
    <p><strong>📄 File:</strong> {file.name}</p>
    <p><strong>📦 Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
    <p><strong>📑 Type:</strong> {file.type}</p>
  </div>
)}
<button
  disabled={!file}
  onClick={() => {
    window.location.href = "/processing";
  }}
  style={{
    width: "100%",
    padding: "15px",
    background: "#2EA8FF",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    cursor: file ? "pointer" : "not-allowed",
    opacity: file ? 1 : 0.6,
  }}
>
  Verify Document
</button>
      </div>
    </main>
  );
}