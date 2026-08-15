"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type VerificationChecks = {
  documentStructure: boolean;
  dataConsistency: boolean;
  signatureValid: boolean;
  stampValid: boolean;
  noForgery: boolean;
  noDuplicate: boolean;
  registryVerified: boolean;
};

function calculateVerificationScore(
  checks: VerificationChecks
) {
  const weights = {
    documentStructure: 10,
    dataConsistency: 15,
    signatureValid: 15,
    stampValid: 10,
    noForgery: 20,
    noDuplicate: 10,
    registryVerified: 20,
  };

  let score = 0;

  if (checks.documentStructure)
    score += weights.documentStructure;

  if (checks.dataConsistency)
    score += weights.dataConsistency;

  if (checks.signatureValid)
    score += weights.signatureValid;

  if (checks.stampValid)
    score += weights.stampValid;

  if (checks.noForgery)
    score += weights.noForgery;

  if (checks.noDuplicate)
    score += weights.noDuplicate;

  if (checks.registryVerified)
    score += weights.registryVerified;

  let risk:
    | "very_low"
    | "low"
    | "medium"
    | "high"
    | "critical";

  if (score >= 90) {
    risk = "very_low";
  } else if (score >= 75) {
    risk = "low";
  } else if (score >= 50) {
    risk = "medium";
  } else if (score >= 25) {
    risk = "high";
  } else {
    risk = "critical";
  }

  return {
    trustScore: score,
    confidence: score,
    risk,
  };
}

export default function VerifyPage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [uploadError, setUploadError] =
    useState("");

  function handleFileSelection(
    selectedFile: File | null
  ) {
    if (!selectedFile) return;

    setUploadError("");
    setFile(selectedFile);
  }

  async function handleVerification() {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      /*
       * ==========================================
       * STEP 1 — UPLOAD DOCUMENT TO SUPABASE
       * ==========================================
       */

      const filePath =
        `${Date.now()}-${file.name}`;

      const {
        data,
        error,
      } = await supabase.storage
        .from("property-documents")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (error) {
        console.error(
          "SUPABASE ERROR:",
          error
        );

        setUploadError(
          `Upload failed: ${error.message}`
        );

        setIsUploading(false);
        return;
      }

      /*
       * ==========================================
       * STEP 2 — DEMONSTRATION VERIFICATION CHECKS
       *
       * These remain the same prototype values
       * from your original verification page.
       * ==========================================
       */

      const checks: VerificationChecks = {
        documentStructure: true,
        dataConsistency: true,
        signatureValid: true,
        stampValid: true,
        noForgery: true,
        noDuplicate: true,
        registryVerified: true,
      };

      const verificationScore =
        calculateVerificationScore(
          checks
        );

      /*
       * ==========================================
       * STEP 3 — CREATE VERIFICATION RECORD
       * ==========================================
       */

      const {
        data: verificationRecord,
        error: verificationError,
      } = await supabase
        .from("verifications")
        .insert({
          doc_name: file.name,
          file_url: filePath,
          status: "uploaded",

          trust_score:
            verificationScore.trustScore,

          confidence:
            verificationScore.confidence,

          risk:
            verificationScore.risk,

          findings: {},

          doc_type: file.type,
        })
        .select()
        .single();

      if (verificationError) {
        console.error(
          "VERIFICATION ERROR:",
          verificationError
        );

        setUploadError(
          `Verification record failed: ${verificationError.message}`
        );

        setIsUploading(false);
        return;
      }

      /*
       * ==========================================
       * STEP 4 — GO TO PROCESSING PAGE
       * ==========================================
       */

      window.location.href =
        `/processing?id=${verificationRecord.id}`;

    } catch (error) {
      console.error(
        "VERIFICATION ERROR:",
        error
      );

      setUploadError(
        "Something went wrong while starting verification."
      );

      setIsUploading(false);
    }
  }

  return (
    <main className="verify-page">

      {/* =========================================
          BACKGROUND DECORATION
      ========================================== */}

      <div className="background-grid" />
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="page-container">

        {/* =========================================
            HEADER
        ========================================== */}

        <header className="top-header">

          <div className="brand">

            <div className="brand-icon">
              <span>✓</span>
            </div>

            <div>
              <div className="brand-name">
                PropertySure{" "}
                <span>AI</span>
              </div>

              <div className="brand-subtitle">
                Property Verification Platform
              </div>
            </div>

          </div>

          <div className="secure-environment">
            <span className="secure-dot" />
            <span>
              Secure Environment
            </span>
            <span className="lock-icon">
              ♧
            </span>
          </div>

        </header>


        {/* =========================================
            HERO
        ========================================== */}

        <section className="hero-section">

          <div className="hero-badge">
            <span>✦</span>
            AI-POWERED VERIFICATION
          </div>

          <h1 className="hero-title">
            Verify Your Property
            <br />
            With{" "}
            <span>
              Confidence
            </span>
          </h1>

          <p className="hero-description">
            Upload your property document and let
            PropertySure AI analyze its authenticity,
            ownership details, and potential risks
            using advanced AI technology.
          </p>

        </section>


        {/* =========================================
            FEATURE STRIP
        ========================================== */}

        <section className="feature-strip">

          <div className="feature-item">

            <div className="feature-icon">
              ♧
            </div>

            <div>
              <strong>
                Secure Upload
              </strong>

              <span>
                256-bit encrypted
              </span>
            </div>

          </div>


          <div className="feature-divider" />


          <div className="feature-item">

            <div className="feature-icon">
              ◉
            </div>

            <div>
              <strong>
                AI Analysis
              </strong>

              <span>
                Multi-layer verification
              </span>
            </div>

          </div>


          <div className="feature-divider" />


          <div className="feature-item">

            <div className="feature-icon">
              ◷
            </div>

            <div>
              <strong>
                2–5 Minutes
              </strong>

              <span>
                Average completion
              </span>
            </div>

          </div>


          <div className="feature-divider" />


          <div className="feature-item">

            <div className="feature-icon">
              ◇
            </div>

            <div>
              <strong>
                Fraud Detection
              </strong>

              <span>
                Advanced risk checks
              </span>
            </div>

          </div>

        </section>


        {/* =========================================
            UPLOAD CARD
        ========================================== */}

        <section className="upload-card">

          <label
            className={`upload-zone ${
              isDragging
                ? "dragging"
                : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => {
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);

              const droppedFile =
                event.dataTransfer.files?.[0];

              handleFileSelection(
                droppedFile || null
              );
            }}
          >

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{
                display: "none",
              }}
              onChange={(event) => {
                const selectedFile =
                  event.target.files?.[0];

                handleFileSelection(
                  selectedFile || null
                );
              }}
            />


            {/* AI READY */}

            <div className="ai-ready">
              AI READY
            </div>


            {/* UPLOAD ICON */}

            <div className="upload-icon-circle">
              <div className="upload-arrow">
                ↑
              </div>

              <div className="upload-tray" />
            </div>


            <h2>
              Drop your document here
            </h2>

            <p>
              or click to{" "}
              <span>
                browse files
              </span>
            </p>


            {/* FILE TYPES */}

            <div className="file-types">

              <span>
                <b className="pdf-dot">
                  ▣
                </b>
                PDF
              </span>

              <span>
                <b className="jpg-dot">
                  ▣
                </b>
                JPG
              </span>

              <span>
                <b className="png-dot">
                  ▣
                </b>
                PNG
              </span>

            </div>

            <div className="file-limit">
              Maximum file size: 20 MB
            </div>

          </label>


          {/* =====================================
              SELECTED FILE
          ====================================== */}

          {file && (

            <div className="selected-file">

              <div className="selected-file-left">

                <div className="file-preview">
                  <div className="paper-fold" />
                  <span>
                    PDF
                  </span>
                </div>

                <div className="selected-file-info">

                  <div className="selected-label">
                    <span className="check-circle">
                      ✓
                    </span>

                    Document Selected
                  </div>

                  <div className="selected-name">
                    {file.name}
                  </div>

                  <div className="selected-meta">
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                    {" • "}
                    {file.type ||
                      "application/octet-stream"}
                  </div>

                </div>

              </div>


              <label className="change-file">

                Change file

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{
                    display: "none",
                  }}
                  onChange={(event) => {
                    const selectedFile =
                      event.target.files?.[0];

                    handleFileSelection(
                      selectedFile || null
                    );
                  }}
                />

              </label>

            </div>

          )}

        </section>


        {/* =========================================
            ERROR MESSAGE
        ========================================== */}

        {uploadError && (

          <div className="upload-error">
            <span>
              ⚠
            </span>

            <div>
              {uploadError}
            </div>

          </div>

        )}


        {/* =========================================
            BENEFIT CARDS
        ========================================== */}

        <section className="benefit-grid">

          <div className="benefit-card">

            <div className="benefit-icon">
              ♧
            </div>

            <h3>
              Encrypted & Secure
            </h3>

            <p>
              Your documents are encrypted
              and protected at every step.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              ◉
            </div>

            <h3>
              AI-Powered Analysis
            </h3>

            <p>
              Our AI verifies document
              structure, authenticity and
              ownership details.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon shield-icon">
              ◇
            </div>

            <h3>
              Fraud Detection
            </h3>

            <p>
              Advanced algorithms detect
              forgery, duplicates and
              suspicious patterns.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon report-icon">
              ▤
            </div>

            <h3>
              Verified Report
            </h3>

            <p>
              Get a comprehensive verification
              report with trust score and risk level.
            </p>

          </div>

        </section>


        {/* =========================================
            WHAT WE ANALYZE
        ========================================== */}

        <section className="analysis-card">

          <div className="analysis-header">

            <h2>
              What We Analyze{" "}
              <span>
                (7 Key Checks)
              </span>
            </h2>

          </div>


          <div className="checks-grid">

            {/* 01 */}

            <div className="check-item">

              <div className="check-number">
                01
              </div>

              <div>
                <h3>
                  Document Structure
                </h3>

                <p>
                  Checks format, fields,
                  and overall integrity
                </p>
              </div>

            </div>


            {/* 02 */}

            <div className="check-item">

              <div className="check-number">
                02
              </div>

              <div>
                <h3>
                  Data Consistency
                </h3>

                <p>
                  Verifies consistency
                  across all data points
                </p>
              </div>

            </div>


            {/* 03 */}

            <div className="check-item">

              <div className="check-number">
                03
              </div>

              <div>
                <h3>
                  Signature & Stamp
                </h3>

                <p>
                  Validates signatures
                  and official stamps
                </p>
              </div>

            </div>


            {/* 04 */}

            <div className="check-item">

              <div className="check-number">
                04
              </div>

              <div>
                <h3>
                  Forgery Detection
                </h3>

                <p>
                  Detects manipulation
                  or tampering signs
                </p>
              </div>

            </div>


            {/* 05 */}

            <div className="check-item">

              <div className="check-number">
                05
              </div>

              <div>
                <h3>
                  Duplicate Detection
                </h3>

                <p>
                  Checks against duplicate
                  property records
                </p>
              </div>

            </div>


            {/* 06 */}

            <div className="check-item">

              <div className="check-number">
                06
              </div>

              <div>
                <h3>
                  Ownership Validation
                </h3>

                <p>
                  Verifies ownership and
                  party information
                </p>
              </div>

            </div>


            {/* 07 */}

            <div className="check-item check-item-last">

              <div className="check-number">
                07
              </div>

              <div>
                <h3>
                  Registry Cross-Check
                </h3>

                <p>
                  Cross-verifies with relevant
                  government registries
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            VERIFY BUTTON
        ========================================== */}

        <button
          disabled={
            !file || isUploading
          }
          onClick={
            handleVerification
          }
          className={`verify-button ${
            !file ||
            isUploading
              ? "disabled"
              : ""
          }`}
        >

          <span className="button-sparkle">
            ✦
          </span>

          <span>
            {isUploading
              ? "Starting Verification..."
              : "Verify Property Document"}
          </span>

          {!isUploading && (
            <span className="button-arrow">
              →
            </span>
          )}

        </button>


        {/* =========================================
            PROCESSING NOTICE
        ========================================== */}

        <div className="processing-notice">

          <span className="notice-shield">
            ♢
          </span>

          Your document will be securely processed
          through the PropertySure AI verification workflow.

        </div>


        {/* =========================================
            FOOTER
        ========================================== */}

        <footer className="footer">

          <div className="footer-brand">

            <div className="footer-logo">
              ✓
            </div>

            <div>
              <div className="footer-name">
                PropertySure{" "}
                <span>
                  AI
                </span>
              </div>

              <div className="footer-subtitle">
                Property Verification Platform
              </div>
            </div>

          </div>


          <div className="footer-badges">

            <span>
              <b>
                ♧
              </b>
              Secure
            </span>

            <span>
              <b>
                ✓
              </b>
              Reliable
            </span>

            <span>
              <b>
                ◇
              </b>
              Transparent
            </span>

          </div>


          <div className="copyright">

            © 2025 PropertySure AI
            <br />
            All rights reserved.

          </div>

        </footer>

      </div>


      {/* =========================================
          STYLES
      ========================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .verify-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(13, 71, 135, 0.35),
              transparent 38%
            ),
            linear-gradient(
              180deg,
              #020B18 0%,
              #031126 45%,
              #020A17 100%
            );
          color: #F8FAFC;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* =====================================
           BACKGROUND
        ====================================== */

        .background-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.25;
          background-image:
            linear-gradient(
              rgba(35, 139, 230, 0.07) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(35, 139, 230, 0.07) 1px,
              transparent 1px
            );
          background-size:
            80px 80px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 75%
            );
        }


        .background-glow {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(100px);
        }


        .glow-one {
          width: 420px;
          height: 420px;
          top: 250px;
          left: -220px;
          background:
            rgba(0, 110, 255, 0.08);
        }


        .glow-two {
          width: 420px;
          height: 420px;
          top: 500px;
          right: -220px;
          background:
            rgba(0, 150, 255, 0.06);
        }


        /* =====================================
           MAIN CONTAINER
        ====================================== */

        .page-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          padding:
            0 28px 45px;
        }


        /* =====================================
           HEADER
        ====================================== */

        .top-header {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom:
            1px solid
            rgba(148, 163, 184, 0.12);
        }


        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }


        .brand-icon {
          width: 43px;
          height: 43px;
          border:
            2px solid #168EFF;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #168EFF;
          font-size: 25px;
          font-weight: 900;
          background:
            rgba(22, 142, 255, 0.06);
          box-shadow:
            0 0 25px
            rgba(22, 142, 255, 0.15);
        }


        .brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }


        .brand-name span {
          color: #20A7FF;
        }


        .brand-subtitle {
          margin-top: 3px;
          color: #94A3B8;
          font-size: 11px;
        }


        .secure-environment {
          display: flex;
          align-items: center;
          gap: 9px;
          border:
            1px solid
            rgba(40, 146, 255, 0.25);
          background:
            rgba(7, 25, 48, 0.75);
          border-radius: 999px;
          padding:
            10px 16px;
          color: #CBD5E1;
          font-size: 12px;
        }


        .secure-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #21D67B;
          box-shadow:
            0 0 10px
            rgba(33, 214, 123, 0.7);
        }


        .lock-icon {
          color: #94A3B8;
          font-size: 15px;
        }


        /* =====================================
           HERO
        ====================================== */

        .hero-section {
          text-align: center;
          padding:
            55px 0 35px;
        }


        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding:
            8px 15px;
          border-radius: 999px;
          background:
            rgba(15, 102, 178, 0.12);
          border:
            1px solid
            rgba(25, 142, 255, 0.12);
          color: #19A7FF;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }


        .hero-badge span {
          font-size: 15px;
        }


        .hero-title {
          margin:
            20px 0 16px;
          font-size:
            clamp(38px, 6vw, 58px);
          line-height: 1.04;
          letter-spacing: -2px;
          font-weight: 800;
        }


        .hero-title span {
          color: #20A7FF;
          text-shadow:
            0 0 25px
            rgba(32, 167, 255, 0.18);
        }


        .hero-description {
          max-width: 730px;
          margin:
            0 auto;
          color: #AAB8CB;
          font-size: 15px;
          line-height: 1.75;
        }


        /* =====================================
           FEATURE STRIP
        ====================================== */

        .feature-strip {
          display: grid;
          grid-template-columns:
            1fr
            auto
            1fr
            auto
            1fr
            auto
            1fr;
          align-items: center;
          gap: 20px;
          margin:
            0 auto 30px;
          max-width: 900px;
        }


        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }


        .feature-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(30, 148, 255, 0.2);
          border-radius: 10px;
          color: #168EFF;
          font-size: 20px;
          background:
            rgba(18, 88, 155, 0.08);
        }


        .feature-item strong {
          display: block;
          color: #F1F5F9;
          font-size: 12px;
          margin-bottom: 4px;
        }


        .feature-item span {
          display: block;
          color: #718096;
          font-size: 10px;
        }


        .feature-divider {
          width: 1px;
          height: 38px;
          background:
            rgba(148, 163, 184, 0.18);
        }


        /* =====================================
           UPLOAD CARD
        ====================================== */

        .upload-card {
          padding: 18px;
          border:
            1px solid
            rgba(32, 154, 255, 0.5);
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(8, 28, 55, 0.95),
              rgba(3, 17, 35, 0.94)
            );
          box-shadow:
            0 20px 70px
            rgba(0, 0, 0, 0.28),
            0 0 35px
            rgba(22, 142, 255, 0.04);
        }


        .upload-zone {
          min-height: 350px;
          border:
            1.5px dashed
            rgba(26, 147, 255, 0.75);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          padding:
            40px 20px;
          background:
            radial-gradient(
              circle at center,
              rgba(22, 142, 255, 0.08),
              rgba(5, 20, 39, 0.18)
            );
          transition:
            all 0.25s ease;
        }


        .upload-zone:hover,
        .upload-zone.dragging {
          border-color: #38BDF8;
          background:
            radial-gradient(
              circle at center,
              rgba(22, 142, 255, 0.15),
              rgba(5, 20, 39, 0.28)
            );
          box-shadow:
            inset 0 0 35px
            rgba(22, 142, 255, 0.04);
        }


        .ai-ready {
          padding:
            6px 13px;
          border-radius: 999px;
          background:
            rgba(18, 112, 195, 0.35);
          border:
            1px solid
            rgba(32, 154, 255, 0.15);
          color: #39B8FF;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
          margin-bottom: 20px;
        }


        .upload-icon-circle {
          position: relative;
          width: 132px;
          height: 132px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border:
            1px solid
            rgba(41, 175, 255, 0.9);
          background:
            radial-gradient(
              circle,
              rgba(31, 126, 206, 0.2),
              rgba(15, 42, 76, 0.25)
            );
          box-shadow:
            0 0 35px
            rgba(22, 142, 255, 0.2);
        }


        .upload-arrow {
          position: absolute;
          top: 25px;
          color: #36B5FF;
          font-size: 58px;
          line-height: 1;
          font-weight: 300;
        }


        .upload-tray {
          position: absolute;
          bottom: 29px;
          width: 42px;
          height: 22px;
          border:
            4px solid #36B5FF;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }


        .upload-zone h2 {
          margin:
            0 0 7px;
          font-size: 23px;
          color: #F8FAFC;
        }


        .upload-zone p {
          margin: 0;
          color: #A6B4C7;
          font-size: 15px;
        }


        .upload-zone p span {
          color: #20A7FF;
          font-weight: 600;
        }


        .file-types {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }


        .file-types span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding:
            5px 9px;
          border:
            1px solid
            rgba(148, 163, 184, 0.13);
          border-radius: 6px;
          background:
            rgba(15, 37, 65, 0.65);
          color: #CBD5E1;
          font-size: 10px;
          font-weight: 700;
        }


        .pdf-dot {
          color: #EF4444;
        }


        .jpg-dot {
          color: #22C55E;
        }


        .png-dot {
          color: #3B82F6;
        }


        .file-limit {
          margin-top: 14px;
          color: #718096;
          font-size: 11px;
        }


        /* =====================================
           SELECTED FILE
        ====================================== */

        .selected-file {
          margin-top: 14px;
          min-height: 104px;
          padding:
            16px 18px;
          border:
            1px solid
            rgba(72, 127, 191, 0.25);
          border-radius: 13px;
          background:
            rgba(9, 29, 53, 0.8);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }


        .selected-file-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }


        .file-preview {
          position: relative;
          width: 55px;
          height: 65px;
          flex-shrink: 0;
          border-radius: 6px;
          background: #F8FAFC;
          color: #DC2626;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          box-shadow:
            0 5px 18px
            rgba(0, 0, 0, 0.2);
        }


        .paper-fold {
          position: absolute;
          top: 0;
          right: 0;
          width: 15px;
          height: 15px;
          background:
            #CBD5E1;
          clip-path:
            polygon(
              0 0,
              100% 0,
              100% 100%
            );
        }


        .selected-file-info {
          min-width: 0;
        }


        .selected-label {
          color: #20D981;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 5px;
        }


        .check-circle {
          display: inline-flex;
          width: 18px;
          height: 18px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #20D981;
          color: #04150D;
          margin-right: 6px;
          font-size: 11px;
        }


        .selected-name {
          color: #F8FAFC;
          font-size: 15px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 550px;
        }


        .selected-meta {
          color: #718096;
          font-size: 11px;
          margin-top: 5px;
        }


        .change-file {
          flex-shrink: 0;
          border:
            1px solid
            rgba(63, 137, 218, 0.25);
          border-radius: 8px;
          padding:
            10px 14px;
          color: #CBD5E1;
          background:
            rgba(9, 27, 49, 0.7);
          font-size: 11px;
          cursor: pointer;
          transition:
            all 0.2s ease;
        }


        .change-file:hover {
          border-color: #168EFF;
          color: #168EFF;
        }


        /* =====================================
           ERROR
        ====================================== */

        .upload-error {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding:
            13px 16px;
          border:
            1px solid
            rgba(248, 113, 113, 0.25);
          background:
            rgba(127, 29, 29, 0.16);
          border-radius: 10px;
          color: #FCA5A5;
          font-size: 12px;
        }


        /* =====================================
           BENEFIT CARDS
        ====================================== */

        .benefit-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 9px;
          margin-top: 16px;
        }


        .benefit-card {
          min-height: 125px;
          padding: 16px;
          border:
            1px solid
            rgba(47, 137, 220, 0.24);
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              rgba(8, 29, 54, 0.9),
              rgba(4, 20, 38, 0.85)
            );
        }


        .benefit-icon {
          width: 33px;
          height: 33px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #168EFF;
          background:
            rgba(22, 142, 255, 0.1);
          border:
            1px solid
            rgba(22, 142, 255, 0.15);
          font-size: 18px;
          margin-bottom: 10px;
        }


        .benefit-card h3 {
          margin:
            0 0 7px;
          color: #29AFFF;
          font-size: 12px;
        }


        .benefit-card p {
          margin: 0;
          color: #8FA0B4;
          font-size: 10px;
          line-height: 1.5;
        }


        /* =====================================
           ANALYSIS
        ====================================== */

        .analysis-card {
          margin-top: 16px;
          border:
            1px solid
            rgba(47, 137, 220, 0.45);
          border-radius: 12px;
          background:
            rgba(4, 21, 41, 0.86);
          overflow: hidden;
        }


        .analysis-header {
          padding:
            18px 20px 12px;
        }


        .analysis-header h2 {
          margin: 0;
          color: #F8FAFC;
          font-size: 16px;
        }


        .analysis-header h2 span {
          color: #168EFF;
          font-weight: 500;
        }


        .checks-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
        }


        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding:
            16px 20px;
          border-top:
            1px solid
            rgba(148, 163, 184, 0.1);
          border-right:
            1px solid
            rgba(148, 163, 184, 0.1);
        }


        .check-item:nth-child(3n) {
          border-right: none;
        }


        .check-item-last {
          grid-column: 1 / 2;
        }


        .check-number {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #168EFF;
          background:
            radial-gradient(
              circle,
              rgba(22, 142, 255, 0.14),
              rgba(22, 142, 255, 0.04)
            );
          border:
            1px solid
            rgba(22, 142, 255, 0.18);
          font-size: 13px;
          font-weight: 700;
        }


        .check-item h3 {
          margin:
            1px 0 6px;
          color: #F8FAFC;
          font-size: 12px;
        }


        .check-item p {
          margin: 0;
          color: #7E90A5;
          font-size: 10px;
          line-height: 1.5;
        }


        /* =====================================
           VERIFY BUTTON
        ====================================== */

        .verify-button {
          width: 100%;
          margin-top: 14px;
          height: 58px;
          border: none;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          background:
            linear-gradient(
              90deg,
              #168EFF,
              #0868E8
            );
          box-shadow:
            0 10px 30px
            rgba(22, 142, 255, 0.25);
          transition:
            all 0.25s ease;
        }


        .verify-button:hover:not(.disabled) {
          transform:
            translateY(-1px);
          box-shadow:
            0 14px 35px
            rgba(22, 142, 255, 0.38);
        }


        .verify-button.disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }


        .button-sparkle {
          font-size: 18px;
        }


        .button-arrow {
          position: absolute;
          right: 28px;
          font-size: 23px;
          font-weight: 300;
        }


        /* =====================================
           NOTICE
        ====================================== */

        .processing-notice {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #8797AB;
          font-size: 11px;
          text-align: center;
          padding:
            17px 0 30px;
        }


        .notice-shield {
          color: #168EFF;
          font-size: 15px;
        }


        /* =====================================
           FOOTER
        ====================================== */

        .footer {
          min-height: 80px;
          padding-top: 20px;
          border-top:
            1px solid
            rgba(148, 163, 184, 0.12);
          display: grid;
          grid-template-columns:
            1fr auto 1fr;
          align-items: center;
          gap: 25px;
        }


        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }


        .footer-logo {
          width: 36px;
          height: 36px;
          border:
            2px solid #168EFF;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #168EFF;
          font-size: 20px;
          font-weight: 800;
        }


        .footer-name {
          color: #F8FAFC;
          font-size: 16px;
          font-weight: 800;
        }


        .footer-name span {
          color: #168EFF;
        }


        .footer-subtitle {
          margin-top: 2px;
          color: #64748B;
          font-size: 9px;
        }


        .footer-badges {
          display: flex;
          gap: 7px;
        }


        .footer-badges span {
          display: flex;
          align-items: center;
          gap: 6px;
          padding:
            8px 12px;
          border:
            1px solid
            rgba(45, 122, 202, 0.2);
          border-radius: 7px;
          color: #CBD5E1;
          background:
            rgba(9, 30, 55, 0.55);
          font-size: 10px;
        }


        .footer-badges b {
          color: #20D981;
        }


        .copyright {
          text-align: right;
          color: #64748B;
          font-size: 9px;
          line-height: 1.7;
        }


        /* =====================================
           TABLET
        ====================================== */

        @media (max-width: 850px) {

          .page-container {
            padding-left: 18px;
            padding-right: 18px;
          }


          .feature-strip {
            grid-template-columns:
              repeat(2, 1fr);
          }


          .feature-divider {
            display: none;
          }


          .benefit-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }


          .checks-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }


          .check-item:nth-child(3n) {
            border-right:
              1px solid
              rgba(148, 163, 184, 0.1);
          }


          .check-item:nth-child(2n) {
            border-right: none;
          }


          .check-item-last {
            grid-column: auto;
          }


          .footer {
            grid-template-columns:
              1fr;
            justify-items: center;
            text-align: center;
          }


          .copyright {
            text-align: center;
          }

        }


        /* =====================================
           MOBILE
        ====================================== */

        @media (max-width: 600px) {

          .page-container {
            padding:
              0 12px 30px;
          }


          .top-header {
            min-height: 76px;
          }


          .brand-name {
            font-size: 18px;
          }


          .brand-subtitle {
            font-size: 9px;
          }


          .brand-icon {
            width: 38px;
            height: 38px;
            font-size: 21px;
          }


          .secure-environment {
            padding:
              8px 11px;
            font-size: 9px;
          }


          .hero-section {
            padding:
              40px 5px 28px;
          }


          .hero-title {
            font-size:
              clamp(34px, 10vw, 48px);
            letter-spacing: -1.5px;
          }


          .hero-description {
            font-size: 13px;
          }


          .feature-strip {
            grid-template-columns:
              1fr 1fr;
            gap: 15px;
          }


          .feature-item {
            gap: 8px;
          }


          .feature-icon {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }


          .feature-item strong {
            font-size: 10px;
          }


          .feature-item span {
            font-size: 8px;
          }


          .upload-card {
            padding: 10px;
          }


          .upload-zone {
            min-height: 310px;
            padding:
              25px 15px;
          }


          .upload-icon-circle {
            width: 105px;
            height: 105px;
          }


          .upload-arrow {
            top: 18px;
            font-size: 48px;
          }


          .upload-tray {
            bottom: 22px;
            width: 36px;
          }


          .upload-zone h2 {
            font-size: 19px;
          }


          .upload-zone p {
            font-size: 13px;
          }


          .selected-file {
            align-items: flex-start;
            flex-direction: column;
          }


          .selected-name {
            max-width: 210px;
          }


          .change-file {
            width: 100%;
            text-align: center;
          }


          .benefit-grid {
            grid-template-columns:
              1fr 1fr;
          }


          .benefit-card {
            min-height: 145px;
            padding: 13px;
          }


          .analysis-header {
            padding:
              16px;
          }


          .checks-grid {
            grid-template-columns:
              1fr;
          }


          .check-item,
          .check-item:nth-child(2n),
          .check-item:nth-child(3n) {
            border-right: none;
          }


          .check-item-last {
            grid-column: auto;
          }


          .verify-button {
            height: 56px;
            font-size: 14px;
          }


          .button-arrow {
            right: 17px;
          }


          .processing-notice {
            padding:
              15px 10px 25px;
            font-size: 9px;
          }


          .footer-badges {
            flex-wrap: wrap;
            justify-content: center;
          }

        }

      `}</style>

    </main>
  );
}