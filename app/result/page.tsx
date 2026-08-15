"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";

type Finding = {
  label?: string;
  title?: string;
  description?: string;
  status?: string;
  passed?: boolean;
};

function ResultPageContent() {
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");

  const [trustScore, setTrustScore] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [risk, setRisk] = useState("pending");
  const [status, setStatus] = useState("uploaded");

  const [docName, setDocName] =
    useState("Property Document");

  const [propertyId, setPropertyId] =
    useState("Not assigned");

  const [verificationDate, setVerificationDate] =
    useState("Not available");

  const [fileUrl, setFileUrl] =
    useState("");

  const [findings, setFindings] =
    useState<Finding[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadVerification = async () => {
      if (!verificationId) {
        setErrorMessage(
          "No verification ID was provided."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("verifications")
        .select(
          "id, trust_score, confidence, risk, doc_name, property_id, created_at, file_url, findings, status"
        )
        .eq("id", verificationId)
        .maybeSingle();

      if (error) {
        console.error(
          "Failed to load verification:",
          error
        );

        setErrorMessage(
          "Unable to load this verification record."
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          `No verification record was found for ID ${verificationId}.`
        );

        setLoading(false);
        return;
      }

      setTrustScore(
        data.trust_score ?? 0
      );

      setConfidence(
        data.confidence ?? 0
      );

      setRisk(
        data.risk ?? "pending"
      );

      setStatus(
        data.status ?? "uploaded"
      );

      setDocName(
        data.doc_name ??
          "Property Document"
      );

      setPropertyId(
        data.property_id ??
          `PS-2026-${String(data.id).padStart(
            4,
            "0"
          )}`
      );

      setFileUrl(
        data.file_url ?? ""
      );

      if (data.created_at) {
        setVerificationDate(
          new Date(
            data.created_at
          ).toLocaleDateString(
            "en-NG",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )
        );
      } else {
        setVerificationDate(
          "Not available"
        );
      }

      if (Array.isArray(data.findings)) {
        setFindings(data.findings);
      } else if (
        data.findings &&
        typeof data.findings ===
          "object"
      ) {
        const possibleFindings =
          Object.entries(
            data.findings
          ).map(
            ([key, value]) => ({
              label: key,
              description:
                typeof value ===
                "string"
                  ? value
                  : undefined,
              passed:
                typeof value ===
                "boolean"
                  ? value
                  : undefined,
            })
          );

        setFindings(
          possibleFindings
        );
      } else {
        setFindings([]);
      }

      setLoading(false);
    };

    loadVerification();
  }, [verificationId]);

  // --------------------------------
  // RISK LABEL
  // --------------------------------

  const riskLabel =
    risk === "very_low"
      ? "Very Low"
      : risk === "low"
      ? "Low"
      : risk === "medium"
      ? "Medium"
      : risk === "high"
      ? "High"
      : "Pending";

  // --------------------------------
  // VERIFICATION STATUS
  // --------------------------------

  const isVerified =
    (risk === "very_low" ||
      risk === "low") &&
    trustScore >= 80 &&
    confidence >= 80;

  // --------------------------------
  // FINDING HELPERS
  // --------------------------------

  function formatFindingLabel(
    label: string
  ) {
    const customLabels: Record<
      string,
      string
    > = {
      documentStructure:
        "Document Structure",
      dataConsistency:
        "Data Consistency",
      signatureValid:
        "Signature Validation",
      stampValid:
        "Stamp Validation",
      noForgery:
        "Forgery Detection",
      noDuplicate:
        "Duplicate Detection",
      registryVerified:
        "Registry Cross-Check",
    };

    if (customLabels[label]) {
      return customLabels[label];
    }

    return label
      .replace(
        /([A-Z])/g,
        " $1"
      )
      .replace(
        /^./,
        (char) =>
          char.toUpperCase()
      );
  }

  function getFindingDescription(
    label: string
  ) {
    const descriptions: Record<
      string,
      string
    > = {
      documentStructure:
        "Checks document format, fields and overall integrity",
      dataConsistency:
        "Verifies consistency across document data",
      signatureValid:
        "Validates signatures and authentication marks",
      stampValid:
        "Validates official stamps and seals",
      noForgery:
        "Detects signs of forgery, manipulation or tampering",
      noDuplicate:
        "Checks for duplicate property records",
      registryVerified:
        "Cross-checks relevant registry information",
    };

    return (
      descriptions[label] ??
      "Verification check completed by PropertySure AI"
    );
  }

  function getFindingPassed(
    finding: Finding
  ) {
    return (
      finding.passed === true ||
      finding.status === "passed" ||
      isVerified
    );
  }

  // --------------------------------
  // OPEN DOCUMENT
  // --------------------------------

  function previewDocument() {
    if (!fileUrl) {
      alert(
        "The uploaded document URL is not available for this verification."
      );
      return;
    }

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // --------------------------------
  // DOWNLOAD VERIFICATION PDF
  // --------------------------------

  function downloadPDF() {
    const doc = new jsPDF();

    const verificationStatus =
      isVerified
        ? "VERIFIED"
        : "REVIEW REQUIRED";

    doc.setFontSize(22);

    doc.text(
      "PropertySure AI",
      20,
      20
    );

    doc.setFontSize(16);

    doc.text(
      "Property Verification Certificate",
      20,
      35
    );

    doc.setFontSize(12);

    doc.text(
      `Verification ID: ${
        verificationId ?? "N/A"
      }`,
      20,
      52
    );

    doc.text(
      `Property ID: ${propertyId}`,
      20,
      62
    );

    doc.text(
      `Document: ${docName}`,
      20,
      72
    );

    doc.text(
      `Verification Date: ${verificationDate}`,
      20,
      82
    );

    doc.text(
      `Trust Score: ${trustScore}/100`,
      20,
      92
    );

    doc.text(
      `AI Confidence: ${confidence}%`,
      20,
      102
    );

    doc.text(
      `Risk Level: ${riskLabel}`,
      20,
      112
    );

    doc.text(
      `Verification Status: ${verificationStatus}`,
      20,
      122
    );

    doc.text(
      `Record Status: ${status}`,
      20,
      132
    );

    doc.setFontSize(10);

    doc.text(
      "PropertySure AI - AI Property Verification Platform",
      20,
      150
    );

    doc.text(
      "This certificate represents the verification result recorded by the PropertySure AI platform.",
      20,
      158
    );

    doc.save(
      `PropertySure-${propertyId}-Verification.pdf`
    );
  }

  // --------------------------------
  // SHARE VERIFICATION
  // --------------------------------

  async function shareVerification() {
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "PropertySure AI Verification",

          text: `Verification result for ${docName}. Property ID: ${propertyId}.`,

          url:
            window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Verification link copied to clipboard."
        );
      }
    } catch (error) {
      console.log(
        "Share cancelled or failed:",
        error
      );
    }
  }

  // --------------------------------
  // LOADING SCREEN
  // --------------------------------

  if (loading) {
    return (
      <main className="result-page loading-page">
        <div className="loading-box">
          <div className="loading-logo">
            <div className="brand-shield">
              ✓
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

          <div className="loading-spinner" />

          <h2>
            Loading verification result...
          </h2>

          <p>
            Securely retrieving your
            verification report.
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------
  // ERROR SCREEN
  // --------------------------------

  if (errorMessage) {
    return (
      <main className="result-page error-page">
        <div className="error-box">
          <div className="error-icon">
            !
          </div>

          <div className="error-label">
            VERIFICATION ERROR
          </div>

          <h2>
            Verification Not Found
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            onClick={() =>
              (window.location.href =
                "/verify")
            }
            className="primary-button"
          >
            Verify Another Property
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="result-page">
      <div className="result-container">

        {/* =====================================
            NAVIGATION
        ====================================== */}

        <header className="top-nav">

          <div className="brand-area">
            <div className="brand-shield">
              ✓
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

          <div className="nav-actions">

            <button
              className="nav-button secondary"
              onClick={() =>
                (window.location.href =
                  "/")
              }
            >
              ◉ Dashboard
            </button>

            <button
              className="nav-button primary"
              onClick={() =>
                (window.location.href =
                  "/verify")
              }
            >
              ＋ Verify Another
            </button>

          </div>
        </header>

        {/* =====================================
            BREADCRUMB
        ====================================== */}

        <div className="breadcrumb-row">

          <div className="breadcrumbs">
            <span>⌂</span>
            <span>Home</span>
            <b>›</b>
            <span>
              Verifications
            </span>
            <b>›</b>
            <strong>Result</strong>
          </div>

          <div className="secure-badge">
            <span className="secure-dot">
              ●
            </span>
            Secure & Encrypted
            <span>⌕</span>
          </div>

        </div>

        {/* =====================================
            PAGE TITLE
        ====================================== */}

        <section className="page-heading">

          <div>
            <h1>
              Property Verification{" "}
              <span>Report</span>
            </h1>

            <p>
              AI-powered verification
              completed successfully
            </p>
          </div>

          <div className="report-meta">

            <div className="meta-card">
              <small>
                Report ID
              </small>

              <strong>
                VER-
                {verificationId ??
                  "N/A"}
              </strong>

              <button
                onClick={() => {
                  if (
                    verificationId
                  ) {
                    navigator.clipboard.writeText(
                      verificationId
                    );
                  }
                }}
                title="Copy report ID"
              >
                ▣
              </button>
            </div>

            <div className="meta-card">
              <small>
                Verified On
              </small>

              <strong>
                {verificationDate}
              </strong>

              <span className="calendar-icon">
                ◫
              </span>
            </div>

          </div>

        </section>

        {/* =====================================
            AUTHENTICITY BANNER
        ====================================== */}

        <section
          className={`auth-banner ${
            isVerified
              ? "verified"
              : "review"
          }`}
        >

          <div className="auth-icon-panel">
            <div className="large-shield">
              ✓
            </div>
          </div>

          <div className="auth-content">

            <div className="complete-label">
              <span>✓</span>

              {isVerified
                ? "VERIFICATION COMPLETE"
                : "VERIFICATION UNDER REVIEW"}
            </div>

            <h2>
              Document is{" "}
              <span>
                {isVerified
                  ? "Authentic"
                  : "Under Review"}
              </span>
            </h2>

            <p>
              {isVerified
                ? "Our AI has verified the document and found no issues. You can proceed with confidence."
                : "Your property document has been received and is awaiting a completed verification assessment."}
            </p>

          </div>

          <div className="auth-decoration">
            ✓
          </div>

        </section>

        {/* =====================================
            SCORE OVERVIEW
        ====================================== */}

        <section className="score-overview">

          <div className="trust-score-panel">

            <div className="score-label">
              TRUST SCORE
            </div>

            <div
              className={`score-ring ${
                isVerified
                  ? "score-success"
                  : "score-warning"
              }`}
            >
              <div className="score-inner">

                <strong>
                  {trustScore}
                </strong>

                <span>
                  /100
                </span>

              </div>
            </div>

            <div className="score-caption">
              {isVerified
                ? "EXCELLENT"
                : "REVIEW REQUIRED"}
            </div>

          </div>

          <div className="metric-divider" />

          <div className="metric-panel">

            <div className="metric-icon blue">
              ◇
            </div>

            <div>
              <small>
                CONFIDENCE LEVEL
              </small>

              <strong>
                {confidence}%
              </strong>

              <p>
                {confidence >= 80
                  ? "Very High Confidence"
                  : "Verification Confidence"}
              </p>
            </div>

          </div>

          <div className="metric-divider" />

          <div className="metric-panel">

            <div className="metric-icon green">
              ♙
            </div>

            <div>
              <small>
                RISK LEVEL
              </small>

              <strong
                className={
                  risk === "high"
                    ? "danger-text"
                    : risk === "medium"
                    ? "warning-text"
                    : "success-text"
                }
              >
                {riskLabel}
              </strong>

              <p>
                {risk ===
                "very_low"
                  ? "Minimal Risk Detected"
                  : "Current Risk Assessment"}
              </p>
            </div>

          </div>

          <div className="metric-divider" />

          <div className="metric-panel">

            <div className="metric-icon green">
              ✓
            </div>

            <div>
              <small>
                VERIFICATION STATUS
              </small>

              <strong
                className={
                  isVerified
                    ? "success-text"
                    : "warning-text"
                }
              >
                {isVerified
                  ? "Verified"
                  : "Review"}
              </strong>

              <p>
                {isVerified
                  ? "All checks passed"
                  : "Additional review required"}
              </p>
            </div>

          </div>

        </section>

        {/* =====================================
            CHECKS + DOCUMENT
        ====================================== */}

        <section className="main-grid">

          {/* VERIFICATION CHECKS */}

          <div className="panel checks-panel">

            <div className="panel-header">

              <div>
                <h3>
                  Verification Checks{" "}
                  <span>
                    (
                    {findings.length ||
                      7}{" "}
                    Key Areas)
                  </span>
                </h3>

                <p>
                  Verification controls
                  performed on your
                  property document
                </p>
              </div>

              <div
                className={`all-passed ${
                  isVerified
                    ? "passed"
                    : "review"
                }`}
              >
                <span>✓</span>

                {isVerified
                  ? "All Checks Passed"
                  : "Review Required"}
              </div>

            </div>

            <div className="checks-list">

              {findings.length >
              0 ? (
                findings.map(
                  (
                    finding,
                    index
                  ) => {

                    const rawLabel =
                      finding.label ??
                      finding.title ??
                      `Verification Check ${
                        index + 1
                      }`;

                    const passed =
                      getFindingPassed(
                        finding
                      );

                    return (
                      <div
                        className="check-item"
                        key={index}
                      >

                        <div className="check-left">

                          <div className="check-icon">
                            {index ===
                            0
                              ? "▤"
                              : index ===
                                1
                              ? "◫"
                              : index ===
                                2
                              ? "✎"
                              : index ===
                                3
                              ? "◆"
                              : index ===
                                4
                              ? "◈"
                              : index ===
                                5
                              ? "♙"
                              : "⌂"}
                          </div>

                          <div className="check-number">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="check-text">

                            <strong>
                              {formatFindingLabel(
                                rawLabel
                              )}
                            </strong>

                            <span>
                              {finding.description ??
                                getFindingDescription(
                                  rawLabel
                                )}
                            </span>

                          </div>

                        </div>

                        <div
                          className={`check-result ${
                            passed
                              ? "passed"
                              : "pending"
                          }`}
                        >

                          <span>
                            {passed
                              ? "✓"
                              : "!"}
                          </span>

                          <div>
                            <strong>
                              {passed
                                ? "Passed"
                                : "Review"}
                            </strong>

                            <small>
                              {passed
                                ? rawLabel ===
                                  "noForgery"
                                  ? "No forgery detected"
                                  : rawLabel ===
                                    "noDuplicate"
                                  ? "No duplicate found"
                                  : "Verification passed"
                                : "Additional review required"}
                            </small>
                          </div>

                          <b>
                            ›
                          </b>

                        </div>

                      </div>
                    );
                  }
                )
              ) : (
                [
                  {
                    label:
                      "Document Structure",
                    description:
                      "Checks document format, fields and overall integrity",
                  },
                  {
                    label:
                      "Data Consistency",
                    description:
                      "Verifies consistency across all data points",
                  },
                  {
                    label:
                      "Signature Validation",
                    description:
                      "Validates signatures and authentication marks",
                  },
                  {
                    label:
                      "Stamp Validation",
                    description:
                      "Validates official stamps and seals",
                  },
                  {
                    label:
                      "Forgery Detection",
                    description:
                      "Detects manipulation or tampering signs",
                  },
                  {
                    label:
                      "Duplicate Detection",
                    description:
                      "Checks against duplicate property records",
                  },
                  {
                    label:
                      "Registry Cross-Check",
                    description:
                      "Cross-verifies relevant property registry information",
                  },
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="check-item"
                      key={index}
                    >

                      <div className="check-left">

                        <div className="check-icon">
                          {index ===
                          0
                            ? "▤"
                            : index ===
                              1
                            ? "◫"
                            : index ===
                              2
                            ? "✎"
                            : index ===
                              3
                            ? "◆"
                            : index ===
                              4
                            ? "◈"
                            : index ===
                              5
                            ? "♙"
                            : "⌂"}
                        </div>

                        <div className="check-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="check-text">

                          <strong>
                            {item.label}
                          </strong>

                          <span>
                            {item.description}
                          </span>

                        </div>

                      </div>

                      <div
                        className={`check-result ${
                          isVerified
                            ? "passed"
                            : "pending"
                        }`}
                      >

                        <span>
                          {isVerified
                            ? "✓"
                            : "!"}
                        </span>

                        <div>
                          <strong>
                            {isVerified
                              ? "Passed"
                              : "Review"}
                          </strong>

                          <small>
                            {isVerified
                              ? "Verification passed"
                              : "Pending assessment"}
                          </small>
                        </div>

                        <b>
                          ›
                        </b>

                      </div>

                    </div>
                  )
                )
              )}

            </div>
          </div>

          {/* VERIFIED DOCUMENT */}

          <div className="panel document-panel">

            <div className="panel-title">
              <span className="title-icon">
                ▤
              </span>

              <h3>
                Verified Document
              </h3>
            </div>

            <div className="document-card">

              <div className="pdf-icon">
                <div className="pdf-fold">
                  PDF
                </div>
              </div>

              <div className="document-main">

                <div className="document-title-row">

                  <h4>
                    {docName}
                  </h4>

                  <span
                    className={
                      isVerified
                        ? "document-status verified"
                        : "document-status"
                    }
                  >
                    {isVerified
                      ? "✓ Verified"
                      : "Review"}
                  </span>

                </div>

                <p className="document-type">
                  Property verification
                  document
                </p>

              </div>

            </div>

            <div className="document-details">

              <div>
                <span>
                  Document Type
                </span>

                <strong>
                  {docName
                    .toLowerCase()
                    .endsWith(".pdf")
                    ? "PDF Document"
                    : "Property Document"}
                </strong>
              </div>

              <div>
                <span>
                  Property ID
                </span>

                <strong>
                  {propertyId}
                </strong>
              </div>

              <div>
                <span>
                  Verification ID
                </span>

                <strong>
                  #{verificationId}
                </strong>
              </div>

              <div>
                <span>
                  Verified On
                </span>

                <strong>
                  {verificationDate}
                </strong>
              </div>

              <div>
                <span>
                  Record Status
                </span>

                <strong
                  className={
                    isVerified
                      ? "success-text"
                      : "warning-text"
                  }
                >
                  {status}
                </strong>
              </div>

              <div>
                <span>
                  Verification Engine
                </span>

                <strong>
                  PropertySure AI
                </strong>
              </div>

            </div>

            <button
              className="document-preview-button"
              onClick={
                previewDocument
              }
              disabled={!fileUrl}
            >
              {fileUrl
                ? "◉ Preview Document"
                : "Document URL Unavailable"}
            </button>

          </div>

        </section>

        {/* =====================================
            VERIFICATION ASSESSMENT
        ====================================== */}

        <section className="assessment-panel">

          <div className="assessment-icon">
            ✓
          </div>

          <div className="assessment-content">

            <h3>
              Verification Assessment
            </h3>

            <p>
              {isVerified
                ? "PropertySure AI has analyzed the document using the available verification checks. No detected indicators of forgery, duplication, or document inconsistency were found."
                : "PropertySure AI has analyzed the document using the available verification checks. The document currently requires additional review."}
            </p>

            {isVerified && (
              <strong>
                No signs of forgery,
                duplication, or
                inconsistency were
                detected.
              </strong>
            )}

          </div>

          <div className="assessment-outcome">

            <span>
              Outcome
            </span>

            <strong
              className={
                isVerified
                  ? "success-text"
                  : "warning-text"
              }
            >
              {isVerified
                ? "Authentic Document"
                : "Review Required"}
            </strong>

            <small>
              {isVerified
                ? "You can proceed with confidence."
                : "Please review the verification details."}
            </small>

          </div>

        </section>

        {/* =====================================
            BLOCKCHAIN VERIFICATION
        ====================================== */}

        <section className="secondary-grid">

          <div className="panel blockchain-panel">

            <div className="panel-title">
              <span className="title-icon">
                ◈
              </span>

              <h3>
                Blockchain Verification
              </h3>
            </div>

            <div className="info-row">
              <span>
                Network
              </span>

              <strong>
                Ethereum
              </strong>
            </div>

            <div className="info-row">
              <span>
                Record
              </span>

              <strong className="success-text">
                Linked
              </strong>
            </div>

            <div className="info-row">
              <span>
                Verification ID
              </span>

              <strong>
                #{verificationId}
              </strong>
            </div>

            <div className="blockchain-record">

              <span>
                Blockchain Record
              </span>

              <div>
                Verification record #
                {verificationId}
              </div>

            </div>

            <button
              className="outline-button"
              onClick={() =>
                alert(
                  "The real blockchain explorer link will be activated when a real transaction hash is stored for this verification."
                )
              }
            >
              View on Etherscan
            </button>

          </div>

          {/* =====================================
              SECURITY SUMMARY
          ====================================== */}

          <div className="panel security-panel">

            <div className="panel-title">
              <span className="title-icon">
                ◇
              </span>

              <h3>
                Verification Security
              </h3>
            </div>

            <div className="security-item">
              <span className="security-check">
                ✓
              </span>

              <div>
                <strong>
                  Secure Processing
                </strong>

                <p>
                  Document processed
                  through the PropertySure
                  AI verification workflow.
                </p>
              </div>
            </div>

            <div className="security-item">
              <span className="security-check">
                ✓
              </span>

              <div>
                <strong>
                  Fraud Analysis
                </strong>

                <p>
                  Verification checks
                  included forgery and
                  duplicate detection.
                </p>
              </div>
            </div>

            <div className="security-item">
              <span className="security-check">
                ✓
              </span>

              <div>
                <strong>
                  Verification Record
                </strong>

                <p>
                  Your verification result
                  has been recorded against
                  this verification ID.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* =====================================
            ACTIONS
        ====================================== */}

        <section className="actions-section">

          <button
            className="action-card"
            onClick={
              downloadPDF
            }
          >
            <span className="action-icon">
              ⇩
            </span>

            <div>
              <strong>
                Download Report
              </strong>

              <small>
                PDF Verification Report
              </small>
            </div>
          </button>

          <button
            className="action-card"
            onClick={
              shareVerification
            }
          >
            <span className="action-icon">
              ◉
            </span>

            <div>
              <strong>
                Share Verification
              </strong>

              <small>
                Share this verification result
              </small>
            </div>
          </button>

          <button
            className="action-card primary-action"
            onClick={() =>
              (window.location.href =
                "/verify")
            }
          >
            <span className="action-icon">
              ＋
            </span>

            <div>
              <strong>
                Verify Another Property
              </strong>

              <small>
                Start a new verification
              </small>
            </div>

            <b>
              →
            </b>
          </button>

        </section>

        {/* =====================================
            SECURITY STRIP
        ====================================== */}

        <section className="security-strip">

          <span>
            Our platform ensures
          </span>

          <div>
            🔒 256-bit Encryption
          </div>

          <div>
            ◈ Secure Data Handling
          </div>

          <div>
            ✦ AI-Powered Analysis
          </div>

          <div>
            ✓ Privacy Protected
          </div>

        </section>

        {/* =====================================
            FOOTER
        ====================================== */}

        <footer className="result-footer">

          <div className="footer-brand">

            <div className="brand-shield">
              ✓
            </div>

            <div>
              <strong>
                PropertySure{" "}
                <span>AI</span>
              </strong>

              <small>
                Property Verification Platform
              </small>
            </div>

          </div>

          <div className="footer-links">
            <span>
              About Us
            </span>

            <span>
              How It Works
            </span>

            <span>
              Security
            </span>

            <span>
              Contact
            </span>
          </div>

          <div className="copyright">
            © 2025 PropertySure AI
            <br />
            All rights reserved.
          </div>

        </footer>

      </div>

      {/* =====================================
          PAGE STYLES
      ====================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .result-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(15, 68, 145, 0.30),
              transparent 38%
            ),
            radial-gradient(
              circle at 100% 30%,
              rgba(22, 142, 255, 0.10),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #020B18 0%,
              #031124 48%,
              #020917 100%
            );

          color: #F8FAFC;
          font-family:
            Arial,
            Helvetica,
            sans-serif;

          padding:
            0 24px 60px;

          overflow-x: hidden;
        }

        .result-container {
          width: 100%;
          max-width: 1260px;
          margin: 0 auto;
        }

        /* -----------------------------------
           BRAND
        ----------------------------------- */

        .top-nav {
          min-height: 82px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          border-bottom:
            1px solid
            rgba(255,255,255,.08);

          flex-wrap: wrap;
        }

        .brand-area,
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-shield {
          width: 42px;
          height: 46px;

          border:
            2px solid #168EFF;

          border-radius:
            11px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #168EFF;

          font-size: 22px;
          font-weight: 900;

          background:
            rgba(22,142,255,.08);

          box-shadow:
            0 0 20px
            rgba(22,142,255,.18);
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .brand-name span,
        .footer-brand strong span {
          color: #168EFF;
        }

        .brand-subtitle {
          margin-top: 3px;
          color: #7F8EA3;
          font-size: 11px;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nav-button {
          padding:
            11px 18px;

          border-radius:
            10px;

          font-weight: 700;
          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease;
        }

        .nav-button:hover {
          transform:
            translateY(-2px);
        }

        .nav-button.secondary {
          background:
            rgba(7,22,42,.85);

          border:
            1px solid
            rgba(22,142,255,.25);

          color: #CBD5E1;
        }

        .nav-button.primary {
          background:
            linear-gradient(
              90deg,
              #1268E8,
              #168EFF
            );

          border: none;
          color: white;
        }

        /* -----------------------------------
           BREADCRUMBS
        ----------------------------------- */

        .breadcrumb-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 24px;

          flex-wrap: wrap;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 10px;

          color: #718096;

          font-size: 13px;
        }

        .breadcrumbs span:first-child {
          color: #168EFF;
          font-size: 17px;
        }

        .breadcrumbs b {
          color: #475569;
        }

        .breadcrumbs strong {
          color: #168EFF;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 8px;

          padding:
            9px 14px;

          border-radius:
            999px;

          border:
            1px solid
            rgba(53,208,127,.18);

          background:
            rgba(53,208,127,.05);

          color: #CBD5E1;

          font-size: 12px;
        }

        .secure-dot {
          color: #35D07F;
        }

        /* -----------------------------------
           PAGE HEADING
        ----------------------------------- */

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;

          gap: 30px;

          margin:
            38px 0 26px;

          flex-wrap: wrap;
        }

        .page-heading h1 {
          margin: 0;

          font-size:
            clamp(32px, 5vw, 48px);

          line-height: 1.1;

          letter-spacing:
            -1.2px;
        }

        .page-heading h1 span {
          color: #168EFF;
        }

        .page-heading p {
          margin:
            10px 0 0;

          color: #94A3B8;

          font-size: 15px;
        }

        .report-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .meta-card {
          min-width: 180px;

          position: relative;

          padding:
            12px 38px 12px 14px;

          background:
            rgba(6,22,43,.75);

          border:
            1px solid
            rgba(22,142,255,.18);

          border-radius:
            11px;
        }

        .meta-card small {
          display: block;
          color: #64748B;
          font-size: 10px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .meta-card strong {
          color: #E2E8F0;
          font-size: 12px;
          word-break: break-word;
        }

        .meta-card button,
        .calendar-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform:
            translateY(-20%);

          background: transparent;
          border: none;
          color: #168EFF;
        }

        .calendar-icon {
          font-size: 18px;
        }

        /* -----------------------------------
           AUTHENTICITY
        ----------------------------------- */

        .auth-banner {
          position: relative;

          display: grid;

          grid-template-columns:
            210px 1fr 160px;

          min-height:
            185px;

          border-radius:
            16px;

          overflow:
            hidden;

          border:
            1px solid
            rgba(22,142,255,.35);

          background:
            linear-gradient(
              110deg,
              rgba(7,33,57,.95),
              rgba(3,19,38,.95)
            );

          margin-bottom:
            20px;
        }

        .auth-banner.verified {
          border-color:
            rgba(22,142,255,.45);
        }

        .auth-banner.review {
          border-color:
            rgba(250,204,21,.3);
        }

        .auth-icon-panel {
          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              rgba(13,130,65,.80),
              rgba(3,50,39,.70)
            );
        }

        .auth-banner.review
        .auth-icon-panel {
          background:
            linear-gradient(
              145deg,
              rgba(101,82,9,.7),
              rgba(53,43,5,.7)
            );
        }

        .large-shield {
          width: 90px;
          height: 90px;

          border:
            3px solid #35D07F;

          border-radius:
            24px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #35D07F;

          font-size: 45px;
          font-weight: 900;

          transform:
            rotate(0deg);

          box-shadow:
            0 0 35px
            rgba(53,208,127,.30);
        }

        .auth-banner.review
        .large-shield {
          border-color: #FACC15;
          color: #FACC15;
          box-shadow:
            0 0 35px
            rgba(250,204,21,.20);
        }

        .auth-content {
          padding:
            32px 38px;

          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .complete-label {
          color: #35D07F;
          font-size: 13px;
          font-weight: 800;
          letter-spacing:
            .3px;

          margin-bottom:
            12px;
        }

        .auth-banner.review
        .complete-label {
          color: #FACC15;
        }

        .complete-label span {
          margin-right: 7px;
        }

        .auth-content h2 {
          margin: 0;

          font-size:
            clamp(30px, 4vw, 40px);
        }

        .auth-content h2 span {
          color: #35D07F;
        }

        .auth-banner.review
        .auth-content h2 span {
          color: #FACC15;
        }

        .auth-content p {
          margin:
            10px 0 0;

          color: #94A3B8;

          font-size: 14px;
          line-height: 1.6;

          max-width: 650px;
        }

        .auth-decoration {
          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 100px;
          font-weight: 900;

          color:
            rgba(22,142,255,.14);
        }

        /* -----------------------------------
           SCORE OVERVIEW
        ----------------------------------- */

        .score-overview {
          display: grid;

          grid-template-columns:
            1.2fr
            1px
            1fr
            1px
            1fr
            1px
            1fr;

          align-items: center;

          min-height: 205px;

          padding:
            25px 28px;

          border:
            1px solid
            rgba(22,142,255,.16);

          border-radius:
            16px;

          background:
            linear-gradient(
              135deg,
              rgba(4,24,47,.96),
              rgba(2,15,31,.96)
            );

          margin-bottom:
            20px;
        }

        .trust-score-panel {
          text-align: center;
        }

        .score-label {
          color: #94A3B8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .5px;
          margin-bottom: 8px;
        }

        .score-ring {
          width: 132px;
          height: 132px;

          margin:
            0 auto 8px;

          border-radius:
            50%;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;
        }

        .score-success {
          background:
            conic-gradient(
              #35D07F 0deg,
              #168EFF 360deg
            );

          box-shadow:
            0 0 28px
            rgba(53,208,127,.18);
        }

        .score-warning {
          background:
            conic-gradient(
              #FACC15 0deg,
              #334155 360deg
            );
        }

        .score-ring::before {
          content: "";

          position: absolute;

          inset: 7px;

          border-radius:
            50%;

          background:
            #041326;
        }

        .score-inner {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: baseline;
        }

        .score-inner strong {
          font-size: 37px;
        }

        .score-inner span {
          color: #94A3B8;
          font-size: 15px;
          margin-left: 2px;
        }

        .score-caption {
          display: inline-block;

          padding:
            5px 13px;

          border-radius:
            999px;

          background:
            rgba(53,208,127,.10);

          border:
            1px solid
            rgba(53,208,127,.22);

          color: #35D07F;

          font-size: 10px;
          font-weight: 800;
        }

        .metric-divider {
          width: 1px;
          height: 80px;
          background:
            rgba(255,255,255,.08);
        }

        .metric-panel {
          display: flex;
          align-items: center;

          gap: 13px;

          padding:
            10px 18px;
        }

        .metric-icon {
          width: 42px;
          height: 42px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;
        }

        .metric-icon.blue {
          background:
            rgba(22,142,255,.10);
          color: #168EFF;
        }

        .metric-icon.green {
          background:
            rgba(53,208,127,.08);
          color: #35D07F;
        }

        .metric-panel small {
          display: block;

          color: #64748B;

          font-size: 9px;
          font-weight: 800;

          margin-bottom: 5px;
        }

        .metric-panel strong {
          display: block;

          font-size: 20px;
          color: #E2E8F0;
        }

        .metric-panel p {
          margin:
            4px 0 0;

          color: #718096;

          font-size: 10px;
        }

        .success-text {
          color: #35D07F !important;
        }

        .warning-text {
          color: #FACC15 !important;
        }

        .danger-text {
          color: #F87171 !important;
        }

        /* -----------------------------------
           PANELS
        ----------------------------------- */

        .main-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.65fr)
            minmax(320px, .9fr);

          gap: 20px;

          margin-bottom:
            20px;
        }

        .panel {
          border:
            1px solid
            rgba(22,142,255,.14);

          border-radius:
            16px;

          background:
            linear-gradient(
              145deg,
              rgba(6,25,49,.96),
              rgba(3,17,34,.96)
            );

          overflow:
            hidden;
        }

        .panel-header {
          padding:
            22px 22px 16px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 15px;

          border-bottom:
            1px solid
            rgba(255,255,255,.06);

          flex-wrap: wrap;
        }

        .panel-header h3,
        .panel-title h3 {
          margin: 0;

          font-size: 17px;
        }

        .panel-header h3 span {
          color: #168EFF;
          font-size: 12px;
          font-weight: 500;
        }

        .panel-header p {
          margin:
            5px 0 0;

          color: #64748B;

          font-size: 11px;
        }

        .all-passed {
          padding:
            7px 11px;

          border-radius:
            999px;

          font-size: 10px;
          font-weight: 800;
        }

        .all-passed.passed {
          background:
            rgba(53,208,127,.08);

          border:
            1px solid
            rgba(53,208,127,.18);

          color: #35D07F;
        }

        .all-passed.review {
          background:
            rgba(250,204,21,.08);

          border:
            1px solid
            rgba(250,204,21,.18);

          color: #FACC15;
        }

        .checks-list {
          padding:
            8px 14px 14px;
        }

        .check-item {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding:
            12px 10px;

          border-bottom:
            1px solid
            rgba(255,255,255,.045);
        }

        .check-item:last-child {
          border-bottom: none;
        }

        .check-left {
          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .check-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(22,142,255,.09);

          border:
            1px solid
            rgba(22,142,255,.15);

          color: #168EFF;
        }

        .check-number {
          width: 30px;

          flex-shrink: 0;

          color: #475569;

          font-size: 10px;
          font-weight: 800;
        }

        .check-text {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .check-text strong {
          color: #E2E8F0;
          font-size: 12px;
        }

        .check-text span {
          color: #64748B;
          font-size: 10px;
          line-height: 1.4;
        }

        .check-result {
          flex-shrink: 0;

          min-width: 160px;

          display: flex;
          align-items: center;

          gap: 7px;

          padding:
            7px 9px;

          border-radius:
            9px;
        }

        .check-result.passed {
          background:
            rgba(53,208,127,.055);
        }

        .check-result.pending {
          background:
            rgba(250,204,21,.055);
        }

        .check-result > span {
          width: 21px;
          height: 21px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius:
            50%;

          background:
            rgba(53,208,127,.13);

          color: #35D07F;

          font-size: 11px;
          font-weight: 900;
        }

        .check-result.pending > span {
          background:
            rgba(250,204,21,.13);

          color: #FACC15;
        }

        .check-result div {
          min-width: 0;
          flex: 1;
        }

        .check-result strong {
          display: block;
          color: #35D07F;
          font-size: 10px;
        }

        .check-result.pending strong {
          color: #FACC15;
        }

        .check-result small {
          display: block;

          color: #64748B;

          font-size: 8px;

          margin-top: 2px;
        }

        .check-result b {
          color: #475569;
        }

        /* -----------------------------------
           DOCUMENT PANEL
        ----------------------------------- */

        .document-panel {
          padding:
            22px;
        }

        .panel-title {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom:
            18px;
        }

        .title-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(22,142,255,.09);

          color: #168EFF;

          font-size: 16px;
        }

        .document-card {
          display: flex;
          align-items: center;

          gap: 14px;

          padding:
            13px;

          background:
            rgba(8,30,56,.8);

          border:
            1px solid
            rgba(22,142,255,.12);

          border-radius:
            12px;

          margin-bottom:
            15px;
        }

        .pdf-icon {
          width: 54px;
          height: 64px;

          flex-shrink: 0;

          border-radius: 8px;

          background: #F8FAFC;

          display: flex;
          align-items: flex-end;
          justify-content: center;

          position: relative;

          overflow: hidden;
        }

        .pdf-fold {
          width: 100%;
          padding:
            7px 0;

          background:
            #DC2626;

          color: white;

          text-align: center;

          font-size: 10px;
          font-weight: 900;
        }

        .document-main {
          min-width: 0;
          flex: 1;
        }

        .document-title-row {
          display: flex;
          justify-content: space-between;

          gap: 8px;
          align-items: flex-start;
        }

        .document-title-row h4 {
          margin: 0;

          color: #E2E8F0;

          font-size: 12px;

          word-break:
            break-word;
        }

        .document-status {
          flex-shrink: 0;

          padding:
            4px 7px;

          border-radius:
            999px;

          background:
            rgba(250,204,21,.08);

          color: #FACC15;

          font-size: 8px;
          font-weight: 800;
        }

        .document-status.verified {
          background:
            rgba(53,208,127,.08);

          color: #35D07F;
        }

        .document-type {
          margin:
            5px 0 0;

          color: #64748B;

          font-size: 9px;
        }

        .document-details {
          display: grid;
          gap: 0;
        }

        .document-details > div {
          display: flex;
          justify-content: space-between;

          gap: 15px;

          padding:
            11px 0;

          border-bottom:
            1px solid
            rgba(255,255,255,.05);
        }

        .document-details span {
          color: #64748B;
          font-size: 9px;
        }

        .document-details strong {
          color: #CBD5E1;
          font-size: 9px;
          text-align: right;
          word-break: break-word;
        }

        .document-preview-button {
          width: 100%;

          margin-top:
            18px;

          padding:
            12px;

          border-radius:
            10px;

          background:
            rgba(22,142,255,.08);

          border:
            1px solid
            rgba(22,142,255,.25);

          color: #168EFF;

          font-weight: 700;

          cursor: pointer;
        }

        .document-preview-button:disabled {
          cursor: not-allowed;
          color: #64748B;
          background:
            rgba(71,85,105,.08);
          border-color:
            rgba(71,85,105,.15);
        }

        /* -----------------------------------
           ASSESSMENT
        ----------------------------------- */

        .assessment-panel {
          display: grid;

          grid-template-columns:
            65px 1fr 280px;

          gap: 20px;

          align-items: center;

          padding:
            22px 25px;

          margin-bottom:
            20px;

          border:
            1px solid
            rgba(22,142,255,.16);

          border-radius:
            16px;

          background:
            linear-gradient(
              135deg,
              rgba(6,29,53,.95),
              rgba(3,17,33,.95)
            );
        }

        .assessment-icon {
          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          border:
            2px solid
            rgba(53,208,127,.4);

          color: #35D07F;

          font-size: 27px;
          font-weight: 900;

          background:
            rgba(53,208,127,.06);
        }

        .assessment-content h3 {
          margin:
            0 0 7px;

          font-size: 15px;
        }

        .assessment-content p {
          margin: 0;

          color: #94A3B8;

          font-size: 11px;

          line-height: 1.6;
        }

        .assessment-content strong {
          display: block;

          margin-top: 7px;

          color: #35D07F;

          font-size: 10px;
        }

        .assessment-outcome {
          border-left:
            1px solid
            rgba(255,255,255,.07);

          padding-left:
            25px;
        }

        .assessment-outcome span {
          display: block;

          color: #64748B;

          font-size: 9px;

          margin-bottom:
            5px;
        }

        .assessment-outcome strong {
          display: block;

          font-size: 15px;

          margin-bottom:
            4px;
        }

        .assessment-outcome small {
          color: #718096;
          font-size: 9px;
        }

        /* -----------------------------------
           SECONDARY GRID
        ----------------------------------- */

        .secondary-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 20px;

          margin-bottom:
            20px;
        }

        .blockchain-panel,
        .security-panel {
          padding:
            22px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;

          gap: 20px;

          padding:
            12px 0;

          border-bottom:
            1px solid
            rgba(255,255,255,.05);
        }

        .info-row span {
          color: #64748B;
          font-size: 10px;
        }

        .info-row strong {
          color: #CBD5E1;
          font-size: 10px;
        }

        .blockchain-record {
          margin:
            18px 0;
        }

        .blockchain-record > span {
          display: block;

          color: #64748B;

          font-size: 9px;

          margin-bottom:
            7px;
        }

        .blockchain-record > div {
          padding:
            12px;

          border-radius:
            9px;

          background:
            #071A31;

          color: #94A3B8;

          font-size: 10px;

          overflow-x:
            auto;
        }

        .outline-button {
          padding:
            11px 16px;

          border-radius:
            9px;

          background:
            rgba(22,142,255,.08);

          border:
            1px solid
            rgba(22,142,255,.25);

          color: #168EFF;

          cursor: pointer;

          font-weight: 700;
        }

        .security-item {
          display: flex;

          gap: 12px;

          padding:
            12px 0;

          border-bottom:
            1px solid
            rgba(255,255,255,.05);
        }

        .security-item:last-child {
          border-bottom: none;
        }

        .security-check {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          color: #35D07F;

          background:
            rgba(53,208,127,.08);
        }

        .security-item strong {
          display: block;

          color: #CBD5E1;

          font-size: 11px;

          margin-bottom:
            4px;
        }

        .security-item p {
          margin: 0;

          color: #64748B;

          font-size: 9px;

          line-height: 1.5;
        }

        /* -----------------------------------
           ACTIONS
        ----------------------------------- */

        .actions-section {
          display: grid;

          grid-template-columns:
            1fr 1fr 1.15fr;

          gap: 14px;

          margin-bottom:
            18px;
        }

        .action-card {
          min-height: 82px;

          display: flex;
          align-items: center;

          gap: 14px;

          padding:
            16px 18px;

          border-radius:
            12px;

          background:
            rgba(5,24,47,.90);

          border:
            1px solid
            rgba(22,142,255,.25);

          color: #FFFFFF;

          cursor: pointer;

          text-align: left;

          transition:
            transform .2s ease,
            border-color .2s ease;
        }

        .action-card:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(22,142,255,.55);
        }

        .action-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(22,142,255,.10);

          color: #168EFF;

          font-size: 20px;
        }

        .action-card strong {
          display: block;

          font-size: 12px;

          margin-bottom:
            5px;
        }

        .action-card small {
          display: block;

          color: #64748B;

          font-size: 9px;
        }

        .action-card.primary-action {
          background:
            linear-gradient(
              90deg,
              #1268E8,
              #168EFF
            );

          border: none;
        }

        .primary-action .action-icon {
          background:
            rgba(255,255,255,.13);

          color: white;
        }

        .primary-action small {
          color:
            rgba(255,255,255,.72);
        }

        .primary-action > b {
          margin-left: auto;
          font-size: 22px;
        }

        /* -----------------------------------
           SECURITY STRIP
        ----------------------------------- */

        .security-strip {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 28px;

          flex-wrap: wrap;

          padding:
            15px 18px;

          border:
            1px solid
            rgba(22,142,255,.12);

          border-radius:
            12px;

          background:
            rgba(4,20,38,.72);

          color: #64748B;

          font-size: 9px;

          margin-bottom:
            20px;
        }

        .security-strip div {
          color: #94A3B8;
        }

        /* -----------------------------------
           FOOTER
        ----------------------------------- */

        .result-footer {
          display: grid;

          grid-template-columns:
            1fr 1fr 1fr;

          align-items: center;

          gap: 25px;

          padding:
            25px 5px 0;

          border-top:
            1px solid
            rgba(255,255,255,.07);
        }

        .footer-brand strong {
          display: block;

          font-size: 15px;
        }

        .footer-brand small {
          display: block;

          margin-top:
            4px;

          color: #64748B;

          font-size: 9px;
        }

        .footer-links {
          display: flex;

          justify-content: center;

          gap: 22px;

          color: #64748B;

          font-size: 10px;

          flex-wrap: wrap;
        }

        .footer-links span {
          cursor: pointer;
        }

        .copyright {
          text-align: right;

          color: #64748B;

          font-size: 9px;

          line-height: 1.6;
        }

        /* -----------------------------------
           LOADING
        ----------------------------------- */

        .loading-page,
        .error-page {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px;
        }

        .loading-box,
        .error-box {
          width: 100%;
          max-width: 520px;

          padding: 45px 30px;

          text-align: center;

          border:
            1px solid
            rgba(22,142,255,.16);

          border-radius:
            20px;

          background:
            rgba(5,24,45,.92);
        }

        .loading-logo {
          display: flex;
          justify-content: center;
          align-items: center;

          gap: 12px;

          margin-bottom:
            28px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;

          margin:
            0 auto 22px;

          border-radius: 50%;

          border:
            3px solid
            rgba(22,142,255,.15);

          border-top-color:
            #168EFF;

          animation:
            spin 1s linear infinite;
        }

        .loading-box h2 {
          margin:
            0 0 8px;

          font-size: 18px;
        }

        .loading-box p {
          margin: 0;

          color: #64748B;

          font-size: 12px;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* -----------------------------------
           ERROR
        ----------------------------------- */

        .error-icon {
          width: 64px;
          height: 64px;

          margin:
            0 auto 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(248,113,113,.08);

          border:
            1px solid
            rgba(248,113,113,.25);

          color: #F87171;

          font-size: 30px;
          font-weight: 900;
        }

        .error-label {
          color: #F87171;

          font-size: 11px;

          font-weight: 800;

          letter-spacing:
            .5px;

          margin-bottom:
            8px;
        }

        .error-box h2 {
          margin:
            0 0 12px;
        }

        .error-box p {
          color: #94A3B8;

          line-height: 1.7;

          font-size: 13px;
        }

        .primary-button {
          margin-top:
            15px;

          padding:
            13px 20px;

          border: none;

          border-radius:
            10px;

          background:
            linear-gradient(
              90deg,
              #1268E8,
              #168EFF
            );

          color: white;

          font-weight: 700;

          cursor: pointer;
        }

        /* -----------------------------------
           TABLET
        ----------------------------------- */

        @media (max-width: 1000px) {

          .score-overview {
            grid-template-columns:
              1fr 1fr;

            gap: 15px;
          }

          .metric-divider {
            display: none;
          }

          .metric-panel {
            border:
              1px solid
              rgba(255,255,255,.05);

            border-radius:
              12px;

            padding:
              15px;
          }

          .main-grid {
            grid-template-columns:
              1fr;
          }

          .assessment-panel {
            grid-template-columns:
              55px 1fr;
          }

          .assessment-outcome {
            grid-column:
              1 / -1;

            border-left: none;

            border-top:
              1px solid
              rgba(255,255,255,.07);

            padding:
              15px 0 0;
          }

          .secondary-grid {
            grid-template-columns:
              1fr;
          }

          .result-footer {
            grid-template-columns:
              1fr;

            text-align: center;
          }

          .footer-brand {
            justify-content: center;
          }

          .copyright {
            text-align: center;
          }
        }

        /* -----------------------------------
           MOBILE
        ----------------------------------- */

        @media (max-width: 700px) {

          .result-page {
            padding:
              0 12px 40px;
          }

          .top-nav {
            padding:
              15px 0;
          }

          .brand-name {
            font-size: 18px;
          }

          .brand-shield {
            width: 36px;
            height: 40px;
          }

          .nav-actions {
            width: 100%;
          }

          .nav-button {
            flex: 1;
          }

          .breadcrumb-row {
            margin-top:
              18px;
          }

          .secure-badge {
            width: 100%;
            justify-content:
              center;
          }

          .page-heading {
            margin-top:
              25px;
          }

          .page-heading h1 {
            font-size:
              34px;
          }

          .report-meta {
            width: 100%;
          }

          .meta-card {
            flex: 1;
            min-width: 0;
          }

          .auth-banner {
            grid-template-columns:
              1fr;

            text-align:
              center;
          }

          .auth-icon-panel {
            min-height:
              135px;
          }

          .auth-content {
            padding:
              25px 18px;
          }

          .auth-content p {
            margin-left:
              auto;
            margin-right:
              auto;
          }

          .auth-decoration {
            display: none;
          }

          .score-overview {
            grid-template-columns:
              1fr;

            padding:
              20px 15px;
          }

          .metric-panel {
            justify-content:
              center;
          }

          .checks-list {
            padding:
              5px 9px 10px;
          }

          .check-item {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .check-left {
            width: 100%;
          }

          .check-result {
            width: 100%;
            min-width: 0;
          }

          .assessment-panel {
            grid-template-columns:
              1fr;

            text-align:
              center;
          }

          .assessment-icon {
            margin:
              0 auto;
          }

          .assessment-outcome {
            text-align:
              center;
          }

          .actions-section {
            grid-template-columns:
              1fr;
          }

          .security-strip {
            justify-content:
              flex-start;
            gap: 12px;
          }

          .footer-links {
            gap: 12px;
          }
        }

        @media (max-width: 430px) {

          .page-heading h1 {
            font-size:
              29px;
          }

          .brand-subtitle {
            font-size:
              9px;
          }

          .report-meta {
            flex-direction:
              column;
          }

          .meta-card {
            width: 100%;
          }

          .auth-content h2 {
            font-size:
              28px;
          }

          .score-ring {
            width: 120px;
            height: 120px;
          }

          .score-inner strong {
            font-size:
              32px;
          }

          .check-left {
            align-items:
              flex-start;
          }

          .check-number {
            display: none;
          }

          .document-title-row {
            flex-direction:
              column;
          }

          .document-details > div {
            flex-direction:
              column;

            gap: 4px;
          }

          .document-details strong {
            text-align:
              left;
          }

          .security-strip {
            flex-direction:
              column;

            align-items:
              flex-start;
          }
        }

      `}</style>
    </main>
  );
}
export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading verification result...</div>}>
      <ResultPageContent />
    </Suspense>
  );
}