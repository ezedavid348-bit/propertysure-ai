"use client";

import { useEffect, useState } from "react";

export default function LoadingPage() {
  const [step, setStep] = useState("Analyzing document...");
const [progress, setProgress] = useState(0);
 useEffect(() => {
 setTimeout(() => {
  setStep("Detecting forgery...");
  setProgress(20);
}, 500);

setTimeout(() => {
  setStep("Verifying ownership...");
  setProgress(40);
}, 1000);

setTimeout(() => {
  setStep("Checking government records...");
  setProgress(60);
}, 1500);

setTimeout(() => {
  setStep("Generating blockchain receipt...");
  setProgress(80);
}, 2000);

setTimeout(() => {
  setStep("Finalizing verification...");
  setProgress(100);
}, 2500);
  const timer = setTimeout(() => {
    window.location.href = "/result";
  }, 3000);

  return () => clearTimeout(timer);
}, []);

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
          textAlign: "center",
          background: "#111827",
          padding: "50px",
          borderRadius: "16px",
          width: "500px",
        }}
      >
        <h1 style={{ color: "#2EA8FF" }}>
          🤖 AI Verification in Progress
        </h1>

        <p style={{ color: "#CBD5E1", marginTop: "20px" }}>
          Analyzing document...
        </p>

        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#1F2937",
            borderRadius: "20px",
            marginTop: "30px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
             width: progress + "%",
              height: "100%",
              background: "#2EA8FF",
            }}
          />
        </div>

        <p style={{ marginTop: "25px", color: "#94A3B8" }}>
          {step}
        </p>
      </div>
    </main>
  );
}