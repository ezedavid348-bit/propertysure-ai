"use client";

import { useEffect, useRef, useState } from "react";
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

type StageStatus = "pending" | "active" | "complete";

type VerificationStage = {
  title: string;
  description: string;
};

const verificationStages: VerificationStage[] = [
  {
    title: "Document Received",
    description: "File successfully uploaded and secured",
  },
  {
    title: "Document Structure Analysis",
    description: "Checking pages, fields and document integrity",
  },
  {
    title: "AI Authenticity Analysis",
    description:
      "Analyzing text, signatures, stamps and security features",
  },
  {
    title: "Ownership & Property Validation",
    description:
      "Validating ownership details and property identifiers",
  },
  {
    title: "Fraud & Duplicate Detection",
    description:
      "Checking for inconsistencies and duplicate property records",
  },
  {
    title: "Registry Cross-Check",
    description:
      "Verifying relevant land/property registry information",
  },
  {
    title: "Generating Verification Report",
    description:
      "Compiling verification results and preparing your report",
  },
];

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

  if (checks.documentStructure) {
    score += weights.documentStructure;
  }

  if (checks.dataConsistency) {
    score += weights.dataConsistency;
  }

  if (checks.signatureValid) {
    score += weights.signatureValid;
  }

  if (checks.stampValid) {
    score += weights.stampValid;
  }

  if (checks.noForgery) {
    score += weights.noForgery;
  }

  if (checks.noDuplicate) {
    score += weights.noDuplicate;
  }

  if (checks.registryVerified) {
    score += weights.registryVerified;
  }

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

export default function LoadingPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const [documentName, setDocumentName] =
    useState("Property Document");

  const [verificationId, setVerificationId] =
    useState("");

  const [uploadDate, setUploadDate] =
    useState("Processing...");

  const [processingComplete, setProcessingComplete] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * Prevent Next.js development mode from
   * accidentally running the verification
   * process twice.
   */
  const processingStarted = useRef(false);

  useEffect(() => {
    if (processingStarted.current) {
      return;
    }

    processingStarted.current = true;

    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get("id");

    if (!id) {
      window.location.href = "/verify";
      return;
    }

    setVerificationId(id);

    async function processVerification() {
      try {
        /*
         * ============================================
         * STEP 1 — LOAD VERIFICATION RECORD
         * ============================================
         */

        const {
          data: record,
          error: fetchError,
        } = await supabase
          .from("verifications")
          .select(
            "id, doc_name, created_at, status, file_url"
          )
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          console.error(
            "FETCH ERROR:",
            fetchError
          );

          setErrorMessage(
            `Verification record could not be loaded: ${fetchError.message}`
          );

          return;
        }

        if (!record) {
          console.error(
            "NO VERIFICATION RECORD FOUND FOR ID:",
            id
          );

          setErrorMessage(
            "Verification record could not be found."
          );

          return;
        }

        console.log(
          "VERIFICATION RECORD LOADED:",
          record
        );

        setDocumentName(
          record.doc_name ||
            "Property Document"
        );

        if (record.created_at) {
          setUploadDate(
            new Date(
              record.created_at
            ).toLocaleString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }

        /*
         * ============================================
         * STEP 2 — CHANGE STATUS TO PROCESSING
         * ============================================
         */

        console.log(
          "SETTING STATUS TO PROCESSING..."
        );

        const {
          error: processingUpdateError,
        } = await supabase
          .from("verifications")
          .update({
            status: "processing",
          })
          .eq("id", id);

        if (processingUpdateError) {
          console.error(
            "PROCESSING STATUS UPDATE ERROR:",
            processingUpdateError
          );

          setErrorMessage(
            `Could not start verification: ${processingUpdateError.message}`
          );

          return;
        }

        /*
         * ============================================
         * STEP 3 — CONFIRM PROCESSING STATUS
         *
         * IMPORTANT:
         * We use maybeSingle() instead of single()
         * so Supabase does not throw the
         * "Cannot coerce the result to a single
         * JSON object" error when no row is returned.
         * ============================================
         */

        const {
          data: processingRecord,
          error: processingCheckError,
        } = await supabase
          .from("verifications")
          .select("id, status")
          .eq("id", id)
          .maybeSingle();

        if (processingCheckError) {
          console.error(
            "PROCESSING STATUS CHECK ERROR:",
            processingCheckError
          );

          setErrorMessage(
            `The verification status could not be confirmed: ${processingCheckError.message}`
          );

          return;
        }

        if (!processingRecord) {
          console.error(
            "PROCESSING RECORD WAS NOT RETURNED."
          );

          setErrorMessage(
            "The verification record could not be confirmed after starting verification."
          );

          return;
        }

        console.log(
          "STATUS AFTER START:",
          processingRecord.status
        );

        /*
         * If Supabase did not actually change the
         * status to processing, stop here.
         */

        if (
          processingRecord.status !==
          "processing"
        ) {
          console.error(
            "STATUS DID NOT CHANGE TO PROCESSING:",
            processingRecord.status
          );

          setErrorMessage(
            `The verification status was not changed to processing. Current status: "${processingRecord.status}".`
          );

          return;
        }

        /*
         * ============================================
         * STAGE 1 — DOCUMENT RECEIVED
         * ============================================
         */

        setCurrentStage(0);
        setProgress(8);

        await new Promise((resolve) =>
          setTimeout(resolve, 700)
        );

        /*
         * ============================================
         * STAGE 2 — DOCUMENT STRUCTURE
         * ============================================
         */

        setCurrentStage(1);
        setProgress(20);

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        /*
         * ============================================
         * STAGE 3 — AI AUTHENTICITY
         * ============================================
         */

        setCurrentStage(2);
        setProgress(38);

        await new Promise((resolve) =>
          setTimeout(resolve, 1200)
        );

        /*
         * ============================================
         * STAGE 4 — OWNERSHIP VALIDATION
         * ============================================
         */

        setCurrentStage(3);
        setProgress(55);

        await new Promise((resolve) =>
          setTimeout(resolve, 1100)
        );

        /*
         * ============================================
         * STAGE 5 — FRAUD & DUPLICATE DETECTION
         * ============================================
         */

        setCurrentStage(4);
        setProgress(70);

        await new Promise((resolve) =>
          setTimeout(resolve, 1100)
        );

        /*
         * ============================================
         * STAGE 6 — REGISTRY CROSS-CHECK
         * ============================================
         */

        setCurrentStage(5);
        setProgress(84);

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        /*
         * ============================================
         * DEMONSTRATION VERIFICATION CHECKS
         *
         * TEMPORARY PROTOTYPE VALUES
         * ============================================
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

        const result =
          calculateVerificationScore(checks);

        /*
         * ============================================
         * STAGE 7 — GENERATE VERIFICATION REPORT
         * ============================================
         */

        setCurrentStage(6);
        setProgress(94);

        await new Promise((resolve) =>
          setTimeout(resolve, 900)
        );

        /*
         * ============================================
         * FINAL DATABASE UPDATE
         *
         * THIS IS THE IMPORTANT FIX.
         *
         * We DO NOT use:
         *
         * .select(...).single()
         *
         * directly after the update.
         *
         * First we perform the UPDATE.
         * Then we separately read the record.
         * ============================================
         */

        console.log(
          "===================================="
        );

        console.log(
          "FINAL DATABASE UPDATE STARTING"
        );

        console.log(
          "VERIFICATION ID:",
          id
        );

        console.log(
          "NEW STATUS:",
          "processed"
        );

        console.log(
          "TRUST SCORE:",
          result.trustScore
        );

        console.log(
          "CONFIDENCE:",
          result.confidence
        );

        console.log(
          "RISK:",
          result.risk
        );

        /*
         * Perform the actual UPDATE.
         */

        const {
          error: updateError,
        } = await supabase
          .from("verifications")
          .update({
            trust_score:
              result.trustScore,

            confidence:
              result.confidence,

            risk:
              result.risk,

            findings:
              checks,

            status:
              "processed",
          })
          .eq("id", id);

        /*
         * Check whether Supabase reported
         * an update error.
         */

        if (updateError) {
          console.error(
            "FINAL DATABASE UPDATE ERROR:",
            updateError
          );

          setErrorMessage(
            `Verification update failed: ${updateError.message}`
          );

          return;
        }

        console.log(
          "FINAL UPDATE REQUEST COMPLETED."
        );

        /*
         * ============================================
         * STEP 8 — READ THE DATABASE AGAIN
         *
         * This is separate from the UPDATE.
         *
         * This avoids the previous:
         *
         * "Cannot coerce the result to a single
         * JSON object"
         *
         * error caused by update().select().single().
         * ============================================
         */

        const {
          data: finalRecord,
          error: finalCheckError,
        } = await supabase
          .from("verifications")
          .select(
            "id, status, trust_score, confidence, risk"
          )
          .eq("id", id)
          .maybeSingle();

        if (finalCheckError) {
          console.error(
            "FINAL DATABASE CHECK ERROR:",
            finalCheckError
          );

          setErrorMessage(
            `The verification was updated, but the final database status could not be confirmed: ${finalCheckError.message}`
          );

          return;
        }

        /*
         * Make sure a record actually came back.
         */

        if (!finalRecord) {
          console.error(
            "FINAL DATABASE RECORD NOT FOUND."
          );

          setErrorMessage(
            "The verification update was sent, but the verification record could not be read back from the database."
          );

          return;
        }

        console.log(
          "===================================="
        );

        console.log(
          "FINAL DATABASE RECORD:",
          finalRecord
        );

        console.log(
          "FINAL DATABASE STATUS:",
          finalRecord.status
        );

        console.log(
          "===================================="
        );

        /*
         * ============================================
         * CRITICAL STATUS CONFIRMATION
         * ============================================
         */

        if (
          finalRecord.status !==
          "processed"
        ) {
          console.error(
            "STATUS WAS NOT SAVED AS PROCESSED.",
            "CURRENT DATABASE STATUS:",
            finalRecord.status
          );

          setErrorMessage(
            `The verification result was saved, but the database status is still "${finalRecord.status}".`
          );

          return;
        }

        /*
         * ============================================
         * SUCCESS
         *
         * At this point we have independently
         * confirmed that Supabase says:
         *
         * status = processed
         * ============================================
         */

        console.log(
          "VERIFICATION SUCCESSFULLY PROCESSED."
        );

        console.log(
          "DATABASE STATUS CONFIRMED:",
          finalRecord.status
        );

        /*
         * Complete all visual stages.
         */

        setCurrentStage(
          verificationStages.length
        );

        setProgress(100);

        setProcessingComplete(true);

        /*
         * Give the user a moment to see
         * the completed verification.
         */

        await new Promise((resolve) =>
          setTimeout(resolve, 1200)
        );

        /*
         * ============================================
         * REDIRECT TO RESULT PAGE
         * ============================================
         */

        window.location.href =
          `/result?id=${id}`;
      } catch (error) {
        console.error(
          "PROCESSING ERROR:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unknown verification error.";

        setErrorMessage(
          `Something went wrong during verification: ${message}`
        );
      }
    }

    processVerification();
  }, []);

  /*
   * ============================================
   * DETERMINE STAGE STATUS
   * ============================================
   */

  function getStageStatus(
    index: number
  ): StageStatus {
    if (processingComplete) {
      return "complete";
    }

    if (index < currentStage) {
      return "complete";
    }

    if (index === currentStage) {
      return "active";
    }

    return "pending";
  }

  /*
   * ============================================
   * ERROR SCREEN
   * ============================================
   */

  if (errorMessage) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020B18",
          color: "#fff",
          fontFamily:
            "Arial, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "#0B1728",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "20px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              margin:
                "0 0 15px",
              color: "#F87171",
            }}
          >
            Verification Error
          </h2>

          <p
            style={{
              color: "#94A3B8",
              lineHeight: 1.7,
            }}
          >
            {errorMessage}
          </p>

          <button
            onClick={() =>
              (window.location.href =
                "/verify")
            }
            style={{
              marginTop: "20px",
              background: "#2563EB",
              color: "#fff",
              border: "none",
              padding:
                "14px 24px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Return to Verification
          </button>
        </div>
      </main>
    );
  }

  /*
   * ============================================
   * MAIN PROCESSING PAGE
   * ============================================
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top,#071A32 0%,#020B18 48%,#010713 100%)",
        color: "#F8FAFC",
        fontFamily:
          "Arial, sans-serif",
        padding:
          "24px 18px 50px",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            paddingBottom: "22px",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                border:
                  "2px solid #168EFF",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                color: "#168EFF",
                fontSize: "24px",
                background:
                  "rgba(22,142,255,.08)",
                boxShadow:
                  "0 0 20px rgba(22,142,255,.18)",
              }}
            >
              ✓
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#FFFFFF",
                  fontSize: "24px",
                  fontWeight: 800,
                }}
              >
                PropertySure{" "}
                <span
                  style={{
                    color: "#168EFF",
                  }}
                >
                  AI
                </span>
              </h1>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color: "#94A3B8",
                  fontSize: "12px",
                }}
              >
                AI Property Verification
                Platform
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                border:
                  "1px solid rgba(255,255,255,.1)",
                background:
                  "rgba(8,22,40,.75)",
                borderRadius: "10px",
                padding:
                  "10px 14px",
                fontSize: "13px",
                color: "#CBD5E1",
              }}
            >
              Verification ID:{" "}
              <strong
                style={{
                  color: "#FFFFFF",
                }}
              >
                #{verificationId}
              </strong>
            </div>

            <div
              style={{
                border:
                  "1px solid rgba(53,208,127,.18)",
                background:
                  "rgba(53,208,127,.05)",
                borderRadius: "10px",
                padding:
                  "10px 14px",
                fontSize: "13px",
                color: "#4ADE80",
              }}
            >
              🛡 Secure Processing
            </div>
          </div>
        </header>

        {/* HERO */}

        <section
          style={{
            padding:
              "42px 10px 30px",
          }}
        >
          <div
            className="processing-hero"
            style={{
              display: "grid",
              gridTemplateColumns:
                "190px 1fr",
              gap: "35px",
              alignItems: "center",
            }}
          >
            {/* Animated document icon */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <div
                style={{
                  width: "155px",
                  height: "155px",
                  borderRadius:
                    "50%",
                  border:
                    `5px solid ${
                      processingComplete
                        ? "#35D07F"
                        : "#168EFF"
                    }`,
                  background:
                    "radial-gradient(circle,#0B294A 0%,#061526 70%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  position:
                    "relative",
                  boxShadow:
                    processingComplete
                      ? "0 0 35px rgba(53,208,127,.25)"
                      : "0 0 35px rgba(22,142,255,.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "62px",
                    color:
                      processingComplete
                        ? "#35D07F"
                        : "#168EFF",
                  }}
                >
                  {processingComplete
                    ? "✓"
                    : "◫"}
                </div>

                {!processingComplete && (
                  <div
                    style={{
                      position:
                        "absolute",
                      inset: "-10px",
                      borderRadius:
                        "50%",
                      border:
                        "1px dashed rgba(22,142,255,.45)",
                      animation:
                        "spin 8s linear infinite",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Hero text */}

            <div>
              <div
                style={{
                  color:
                    processingComplete
                      ? "#35D07F"
                      : "#168EFF",
                  fontWeight: 800,
                  fontSize: "14px",
                  letterSpacing:
                    "0.5px",
                  marginBottom:
                    "10px",
                }}
              >
                {processingComplete
                  ? "VERIFICATION COMPLETE"
                  : "VERIFICATION IN PROGRESS"}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "clamp(30px,5vw,42px)",
                  lineHeight: 1.15,
                  fontWeight: 800,
                }}
              >
                {processingComplete
                  ? "Verification Complete"
                  : "Verifying Your Property Document"}
              </h2>

              <p
                style={{
                  color: "#94A3B8",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  maxWidth:
                    "650px",
                  margin:
                    "14px 0 0",
                }}
              >
                {processingComplete
                  ? "Your verification process has been completed successfully. Your verification result is being prepared."
                  : "Our verification engine is analyzing your document through multiple verification layers to assess document integrity, authenticity, property information and fraud indicators."}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}

          <div
            style={{
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "10px",
              }}
            >
              <span
                style={{
                  color: "#CBD5E1",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Overall Progress
              </span>

              <strong
                style={{
                  color:
                    processingComplete
                      ? "#35D07F"
                      : "#168EFF",
                  fontSize: "20px",
                }}
              >
                {progress}%
              </strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background:
                  "#102036",
                borderRadius:
                  "20px",
                overflow:
                  "hidden",
                border:
                  "1px solid rgba(255,255,255,.04)",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    processingComplete
                      ? "#35D07F"
                      : "linear-gradient(90deg,#1677FF,#32B7FF)",
                  borderRadius:
                    "20px",
                  transition:
                    "width .7s ease",
                  boxShadow:
                    processingComplete
                      ? "0 0 15px rgba(53,208,127,.45)"
                      : "0 0 15px rgba(22,142,255,.45)",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "12px",
                color: "#7F8EA3",
                fontSize: "12px",
              }}
            >
              🛡{" "}
              {processingComplete
                ? "Verification completed successfully."
                : "Your document is being securely processed. Please do not close this page."}
            </div>
          </div>
        </section>

        {/* DOCUMENT CARD */}

        <section
          style={{
            background:
              "linear-gradient(135deg,rgba(10,30,52,.9),rgba(7,20,36,.9))",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "64px",
              borderRadius: "9px",
              background:
                "#F8FAFC",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontWeight: 900,
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            PDF
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "16px",
                wordBreak:
                  "break-word",
              }}
            >
              {documentName}
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#94A3B8",
                fontSize: "12px",
              }}
            >
              Uploaded{" "}
              {uploadDate}
              {"  "}•{"  "}
              Verification #
              {verificationId}
            </div>
          </div>
        </section>

        {/* VERIFICATION STEPS */}

        <section
          style={{
            background:
              "rgba(7,21,38,.9)",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius: "16px",
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              padding:
                "20px 22px",
              borderBottom:
                "1px solid rgba(255,255,255,.07)",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
              }}
            >
              Verification Steps
            </h3>

            <div
              style={{
                display: "flex",
                gap: "14px",
                color: "#94A3B8",
                fontSize: "11px",
              }}
            >
              <span>
                <b
                  style={{
                    color: "#35D07F",
                  }}
                >
                  ●
                </b>{" "}
                Completed
              </span>

              <span>
                <b
                  style={{
                    color: "#168EFF",
                  }}
                >
                  ●
                </b>{" "}
                In Progress
              </span>

              <span>
                <b
                  style={{
                    color: "#475569",
                  }}
                >
                  ●
                </b>{" "}
                Pending
              </span>
            </div>
          </div>

          <div>
            {verificationStages.map(
              (stage, index) => {
                const status =
                  getStageStatus(
                    index
                  );

                return (
                  <div
                    key={
                      stage.title
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "15px",
                      padding:
                        "18px 22px",
                      borderBottom:
                        index <
                        verificationStages.length -
                          1
                          ? "1px solid rgba(255,255,255,.055)"
                          : "none",
                      background:
                        status ===
                        "active"
                          ? "rgba(22,142,255,.08)"
                          : status ===
                            "complete"
                          ? "rgba(53,208,127,.025)"
                          : "transparent",
                      transition:
                        "all .4s ease",
                    }}
                  >
                    {/* STATUS ICON */}

                    <div
                      style={{
                        width:
                          "34px",
                        height:
                          "34px",
                        borderRadius:
                          "50%",
                        flexShrink: 0,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontWeight: 800,
                        fontSize:
                          "13px",
                        color:
                          status ===
                          "complete"
                            ? "#06140D"
                            : status ===
                              "active"
                            ? "#168EFF"
                            : "#64748B",
                        background:
                          status ===
                          "complete"
                            ? "#35D07F"
                            : status ===
                              "active"
                            ? "transparent"
                            : "#0C1A2C",
                        border:
                          status ===
                          "active"
                            ? "3px solid #168EFF"
                            : status ===
                              "pending"
                            ? "2px solid #334155"
                            : "none",
                        boxShadow:
                          status ===
                          "active"
                            ? "0 0 18px rgba(22,142,255,.45)"
                            : status ===
                              "complete"
                            ? "0 0 12px rgba(53,208,127,.25)"
                            : "none",
                      }}
                    >
                      {status ===
                      "complete"
                        ? "✓"
                        : index + 1}
                    </div>

                    {/* TEXT */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize:
                            "14px",
                          color:
                            status ===
                            "pending"
                              ? "#CBD5E1"
                              : "#FFFFFF",
                        }}
                      >
                        {stage.title}
                      </div>

                      <div
                        style={{
                          color:
                            "#718096",
                          fontSize:
                            "12px",
                          marginTop:
                            "5px",
                          lineHeight:
                            1.4,
                        }}
                      >
                        {
                          stage.description
                        }
                      </div>
                    </div>

                    {/* STATUS PILL */}

                    <div
                      style={{
                        flexShrink: 0,
                        minWidth:
                          "82px",
                        textAlign:
                          "center",
                        padding:
                          "7px 10px",
                        borderRadius:
                          "999px",
                        fontSize:
                          "11px",
                        fontWeight: 700,
                        background:
                          status ===
                          "complete"
                            ? "rgba(53,208,127,.1)"
                            : status ===
                              "active"
                            ? "rgba(22,142,255,.1)"
                            : "rgba(71,85,105,.18)",
                        color:
                          status ===
                          "complete"
                            ? "#35D07F"
                            : status ===
                              "active"
                            ? "#168EFF"
                            : "#94A3B8",
                        border:
                          `1px solid ${
                            status ===
                            "complete"
                              ? "rgba(53,208,127,.2)"
                              : status ===
                                "active"
                              ? "rgba(22,142,255,.25)"
                              : "rgba(71,85,105,.2)"
                          }`,
                      }}
                    >
                      {status ===
                      "complete"
                        ? "Completed"
                        : status ===
                          "active"
                        ? "In Progress"
                        : "Pending"}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* SECURITY CARD */}

        <section
          style={{
            marginTop: "18px",
            background:
              "linear-gradient(135deg,rgba(7,24,43,.95),rgba(6,17,31,.95))",
            border:
              "1px solid rgba(22,142,255,.16)",
            borderRadius: "16px",
            padding: "22px",
            display: "grid",
            gridTemplateColumns:
              "1fr auto",
            gap: "25px",
            alignItems:
              "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems:
                "center",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius:
                  "50%",
                background:
                  "rgba(22,142,255,.1)",
                border:
                  "1px solid rgba(22,142,255,.25)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "25px",
                flexShrink: 0,
              }}
            >
              🔒
            </div>

            <div>
              <h3
                style={{
                  margin:
                    "0 0 7px",
                  color: "#168EFF",
                  fontSize:
                    "16px",
                }}
              >
                Secure Verification Processing
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#94A3B8",
                  fontSize:
                    "12px",
                  lineHeight:
                    1.6,
                }}
              >
                Your verification record
                is being processed through
                the PropertySure AI
                verification workflow.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "9px",
              color: "#CBD5E1",
              fontSize: "12px",
              minWidth:
                "190px",
            }}
          >
            <div>
              🔐 Secure document processing
            </div>

            <div>
              🛡 Fraud analysis
            </div>

            <div>
              📋 Verification audit trail
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer
          style={{
            textAlign: "center",
            marginTop: "28px",
            color: "#64748B",
            fontSize: "11px",
          }}
        >
          <span
            style={{
              color: "#168EFF",
              fontWeight: 700,
            }}
          >
            ◇ PropertySure AI
          </span>

          {"  •  "}
          Secure
          {"  •  "}
          Reliable
          {"  •  "}
          Transparent
        </footer>
      </div>

      {/* RESPONSIVE + ANIMATION STYLES */}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          main {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .processing-hero {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .processing-hero > div:last-child {
            text-align: center;
          }
        }

        @media (max-width: 560px) {
          header {
            align-items: flex-start !important;
          }

          header > div:last-child {
            width: 100%;
          }

          header > div:last-child > div {
            flex: 1;
          }

          section {
            border-radius: 13px !important;
          }

          section div {
            max-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}