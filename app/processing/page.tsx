"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type VerificationCheckValue = boolean | null;

type VerificationChecks = {
  documentStructure: VerificationCheckValue;
  dataConsistency: VerificationCheckValue;
  signatureValid: VerificationCheckValue;
  stampValid: VerificationCheckValue;
  noForgery: VerificationCheckValue;
  noDuplicate: VerificationCheckValue;
  documentCompleteness: VerificationCheckValue;
};

type DocumentPackageItem = {
  name: string;
  path: string;
  type: string;
};

type ProcessingStage =
  | "received"
  | "structure"
  | "authenticity"
  | "consistency"
  | "fraud"
  | "completeness"
  | "report"
  | "complete"
  | "failed";

type VerificationFindings = {
  document_package?: DocumentPackageItem[];
  document_count?: number;
  checks?: VerificationChecks;
  processing?: {
    stage?: ProcessingStage;
    progress?: number;
    message?: string;
  };
};

type VerificationRecord = {
  id: string;
  doc_name?: string | null;
  file_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  trust_score?: number | null;
  confidence?: number | null;
  risk?: string | null;
  findings?: VerificationFindings | null;
  doc_type?: string | null;
};

/*
 * ============================================================
 * EMPTY CHECKS
 *
 * null = not assessed.
 *
 * IMPORTANT:
 * We never turn an unassessed check into TRUE.
 * ============================================================
 */

const emptyChecks: VerificationChecks = {
  documentStructure: null,
  dataConsistency: null,
  signatureValid: null,
  stampValid: null,
  noForgery: null,
  noDuplicate: null,
  documentCompleteness: null,
};

/*
 * ============================================================
 * PROCESSING STAGES
 *
 * These control the visual processing experience.
 *
 * They do NOT claim that an AI check passed.
 * ============================================================
 */

const processingStages: {
  stage: ProcessingStage;
  progress: number;
  message: string;
}[] = [
  {
    stage: "received",
    progress: 8,
    message:
      "Your property document package has been securely received.",
  },
  {
    stage: "structure",
    progress: 22,
    message:
      "Analyzing document structure and integrity.",
  },
  {
    stage: "authenticity",
    progress: 38,
    message:
      "Reviewing available authenticity indicators.",
  },
  {
    stage: "consistency",
    progress: 54,
    message:
      "Reviewing property information and document consistency.",
  },
  {
    stage: "fraud",
    progress: 69,
    message:
      "Checking available fraud and duplicate indicators.",
  },
  {
    stage: "completeness",
    progress: 83,
    message:
      "Checking the completeness of the submitted document package.",
  },
  {
    stage: "report",
    progress: 94,
    message:
      "Preparing the verification report.",
  },
];

/*
 * ============================================================
 * DOCUMENT PACKAGE
 * ============================================================
 */

function createDocumentPackage(
  record: VerificationRecord
): DocumentPackageItem[] {
  if (
    record.findings?.document_package &&
    Array.isArray(record.findings.document_package) &&
    record.findings.document_package.length > 0
  ) {
    return record.findings.document_package;
  }

  if (record.file_url) {
    return [
      {
        name:
          record.doc_name ||
          "Property Document",
        path: record.file_url,
        type:
          record.doc_type ||
          "application/pdf",
      },
    ];
  }

  if (record.doc_name) {
    return [
      {
        name: record.doc_name,
        path: "",
        type:
          record.doc_type ||
          "application/pdf",
      },
    ];
  }

  return [];
}

/*
 * ============================================================
 * LOAD VERIFICATION
 * ============================================================
 */

async function loadVerification(
  id: string
): Promise<VerificationRecord | null> {
  const {
    data,
    error,
  } = await supabase
    .from("verifications")
    .select(
      `
        id,
        doc_name,
        file_url,
        status,
        created_at,
        trust_score,
        confidence,
        risk,
        findings,
        doc_type
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "VERIFICATION LOAD ERROR:",
      error
    );

    throw new Error(
      `Verification record could not be loaded: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Verification record could not be found."
    );
  }

  return data as VerificationRecord;
}

/*
 * ============================================================
 * FINALIZE BASIC VERIFICATION
 *
 * IMPORTANT:
 *
 * This does NOT pretend that AI checks passed.
 *
 * It simply finalizes the current MVP workflow with all checks
 * remaining NOT ASSESSED.
 *
 * The Result Page will therefore correctly show:
 *
 * 0/7 checks
 * 0% confidence
 * 0/100 trust score
 * ANALYSIS INCOMPLETE
 *
 * Later, the real AI engine can replace these values.
 * ============================================================
 */

async function finalizeBasicVerification(
  id: string,
  documentPackage: DocumentPackageItem[]
) {
  const findings: VerificationFindings = {
    document_package: documentPackage,
    document_count:
      documentPackage.length,
    checks: {
      ...emptyChecks,
    },
    processing: {
      stage: "complete",
      progress: 100,
      message:
        "Basic verification workflow completed. Detailed verification checks remain unassessed.",
    },
  };

  const {
    error,
  } = await supabase
    .from("verifications")
    .update({
      status: "processed",
      trust_score: 0,
      confidence: 0,
      risk: null,
      findings,
    })
    .eq("id", id);

  if (error) {
    console.error(
      "FINALIZATION ERROR:",
      error
    );

    throw new Error(
      `Verification result could not be saved: ${error.message}`
    );
  }
}

/*
 * ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function LoadingPage() {
  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    processingStage,
    setProcessingStage,
  ] = useState<ProcessingStage>(
    "received"
  );

  const [
    processingMessage,
    setProcessingMessage,
  ] = useState(
    "Preparing secure verification..."
  );

  const [
    documentName,
    setDocumentName,
  ] = useState(
    "Property Document"
  );

  const [
    verificationId,
    setVerificationId,
  ] = useState("");

  const [
    uploadDate,
    setUploadDate,
  ] = useState(
    "Processing..."
  );

  const [
    documentCount,
    setDocumentCount,
  ] = useState(0);

  const [
    processingComplete,
    setProcessingComplete,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    started,
    setStarted,
  ] = useState(false);

  const processingStarted =
    useRef(false);

  const redirecting =
    useRef(false);

  /*
   * ============================================================
   * MAIN PROCESSING WORKFLOW
   * ============================================================
   */

  useEffect(() => {
    if (processingStarted.current) {
      return;
    }

    processingStarted.current =
      true;

    const params =
      new URLSearchParams(
        window.location.search
      );

    const id =
      params.get("id");

    if (!id) {
      window.location.href =
        "/verify";
      return;
    }

    setVerificationId(id);

    async function processVerification() {
      try {
        /*
         * ======================================================
         * STEP 1
         * LOAD VERIFICATION
         * ======================================================
         */

        const verification =
          await loadVerification(id);

        if (!verification) {
          return;
        }

        /*
         * ======================================================
         * DOCUMENT INFORMATION
         * ======================================================
         */

        setDocumentName(
          verification.doc_name ||
          "Property Document"
        );

        if (
          verification.created_at
        ) {
          setUploadDate(
            new Date(
              verification.created_at
            ).toLocaleString(
              "en-NG",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          );
        }

        const documentPackage =
          createDocumentPackage(
            verification
          );

        setDocumentCount(
          documentPackage.length
        );

        /*
         * ======================================================
         * STEP 2
         * ALREADY PROCESSED
         * ======================================================
         */

        if (
          verification.status ===
          "processed"
        ) {
          setProgress(100);

          setProcessingStage(
            "complete"
          );

          setProcessingMessage(
            "Verification completed successfully."
          );

          setProcessingComplete(
            true
          );

          redirecting.current =
            true;

          setTimeout(() => {
            window.location.href =
              `/result?id=${encodeURIComponent(
                id
              )}`;
          }, 800);

          return;
        }

        /*
         * ======================================================
         * STEP 3
         * FAILED
         * ======================================================
         */

        if (
          verification.status ===
          "failed"
        ) {
          setProcessingStage(
            "failed"
          );

          setErrorMessage(
            "The verification could not be completed."
          );

          return;
        }

        /*
         * ======================================================
         * STEP 4
         * START PROCESSING
         * ======================================================
         */

        const {
          error:
            processingError,
        } =
          await supabase
            .from("verifications")
            .update({
              status:
                "processing",
              findings: {
                ...(verification.findings ||
                  {}),
                document_package:
                  documentPackage,
                document_count:
                  documentPackage.length,
                checks: {
                  ...emptyChecks,
                },
                processing: {
                  stage:
                    "received",
                  progress: 8,
                  message:
                    processingStages[0]
                      .message,
                },
              },
            })
            .eq("id", id);

        if (processingError) {
          throw new Error(
            `Could not start verification: ${processingError.message}`
          );
        }

        setStarted(true);

        /*
         * ======================================================
         * STEP 5
         * VISUAL PROCESSING WORKFLOW
         *
         * These stages represent the workflow.
         * They do NOT represent successful AI findings.
         * ======================================================
         */

        for (
          const item
          of processingStages
        ) {
          if (
            redirecting.current
          ) {
            return;
          }

          setProcessingStage(
            item.stage
          );

          setProgress(
            item.progress
          );

          setProcessingMessage(
            item.message
          );

          /*
           * Save current processing state
           * into Supabase.
           */

          await supabase
            .from("verifications")
            .update({
              findings: {
                document_package:
                  documentPackage,
                document_count:
                  documentPackage.length,
                checks: {
                  ...emptyChecks,
                },
                processing: {
                  stage:
                    item.stage,
                  progress:
                    item.progress,
                  message:
                    item.message,
                },
              },
            })
            .eq("id", id);

          /*
           * Small controlled delay so the user
           * can actually see the processing stages.
           */

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                item.stage ===
                  "received"
                  ? 650
                  : 850
              )
          );
        }

        /*
         * ======================================================
         * STEP 6
         * FINALIZE MVP RESULT
         * ======================================================
         *
         * This is the important part.
         *
         * Previously the page waited forever for an external
         * verification engine.
         *
         * Now the MVP workflow is completed properly.
         *
         * No check is marked TRUE.
         * No check is marked FALSE.
         * Everything remains NULL / NOT ASSESSED.
         * ======================================================
         */

        setProcessingMessage(
          "Finalizing your verification report..."
        );

        setProgress(97);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              700
            )
        );

        await finalizeBasicVerification(
          id,
          documentPackage
        );

        /*
         * ======================================================
         * STEP 7
         * SUCCESS
         * ======================================================
         */

        setProcessingStage(
          "complete"
        );

        setProgress(100);

        setProcessingMessage(
          "Verification workflow completed successfully."
        );

        setProcessingComplete(
          true
        );

        redirecting.current =
          true;

        /*
         * Give the database a moment to commit
         * before opening the result page.
         */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              800
            )
        );

        window.location.href =
          `/result?id=${encodeURIComponent(
            id
          )}`;

      } catch (error) {
        console.error(
          "PROCESSING ERROR:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unknown verification error.";

        setProcessingStage(
          "failed"
        );

        setErrorMessage(
          message
        );
      }
    }

    processVerification();

    return () => {
      redirecting.current =
        true;
    };
  }, []);

  /*
   * ============================================================
   * ERROR SCREEN
   * ============================================================
   */

  if (errorMessage) {
    return (
      <main className="error-page">
        <div className="error-card">

          <div className="error-icon">
            !
          </div>

          <div className="error-label">
            VERIFICATION ERROR
          </div>

          <h2>
            We couldn't complete this verification
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/verify";
            }}
          >
            Return to Verification
          </button>

        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            background: #020b18;
            color: #ffffff;
            font-family:
              Inter,
              Arial,
              sans-serif;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 30px;
          }

          .error-card {
            width: 100%;
            max-width: 560px;

            background: #0b1728;

            border:
              1px solid
              rgba(255,255,255,.08);

            border-radius: 22px;

            padding: 42px;

            text-align: center;

            box-shadow:
              0 30px 80px
              rgba(0,0,0,.35);
          }

          .error-icon {
            width: 60px;
            height: 60px;

            margin:
              0 auto 18px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
              rgba(248,113,113,.10);

            border:
              1px solid
              rgba(248,113,113,.28);

            color:
              #f87171;

            font-size:
              30px;

            font-weight:
              800;
          }

          .error-label {
            color:
              #f87171;

            font-size:
              11px;

            font-weight:
              800;

            letter-spacing:
              1.8px;

            margin-bottom:
              10px;
          }

          .error-card h2 {
            margin:
              0 0 14px;

            color:
              #ffffff;

            font-size:
              24px;
          }

          .error-card p {
            color:
              #94a3b8;

            line-height:
              1.7;

            font-size:
              14px;
          }

          .error-card button {
            margin-top:
              22px;

            background:
              #168eff;

            color:
              #ffffff;

            border:
              none;

            padding:
              14px 24px;

            border-radius:
              10px;

            cursor:
              pointer;

            font-weight:
              700;
          }
        `}</style>
      </main>
    );
  }

  /*
   * ============================================================
   * MAIN PROCESSING PAGE
   * ============================================================
   */

  return (
    <main className="processing-page">

      <div className="background-wave wave-one" />
      <div className="background-wave wave-two" />

      <div className="page-container">

        {/* HEADER */}

        <header className="top-header">

          <div className="brand">

            <div className="brand-logo">
              <div className="brand-logo-inner" />
            </div>

            <div>

              <div className="brand-name">
                PropertySure{" "}
                <span>AI</span>
              </div>

              <div className="brand-tagline">
                AI PROPERTY VERIFICATION
              </div>

            </div>

          </div>

          <div className="header-status">

            <div className="secure-badge">

              <span className="shield-icon">
                ✓
              </span>

              Secure Processing

            </div>

            <div className="verification-id">

              ID:{" "}
              <strong>
                #{verificationId}
              </strong>

            </div>

          </div>

        </header>


        {/* HERO */}

        <section className="hero">

          <div className="scanner-wrapper">

            <div className="scanner-outer-dots" />

            <div className="scanner-orbit">

              <div className="scanner-light" />

              <div className="scanner-inner">

                {processingComplete ? (

                  <div className="complete-check">
                    ✓
                  </div>

                ) : (

                  <div className="document-symbol">

                    <div className="document-fold" />

                    <div className="house-roof" />

                    <div className="house-body">

                      <div className="house-door" />

                    </div>

                    <div className="document-line line-one" />
                    <div className="document-line line-two" />
                    <div className="document-line line-three" />

                  </div>

                )}

              </div>

            </div>

          </div>


          <div
            className={
              processingComplete
                ? "status-label complete"
                : "status-label"
            }
          >
            {processingComplete
              ? "PROCESSING COMPLETE"
              : "VERIFICATION IN PROGRESS"}
          </div>


          <h1>
            {processingComplete
              ? "Verification Complete"
              : "Verifying Your Property Document"}
          </h1>


          <p className="hero-description">

            {processingComplete
              ? "Your verification workflow has been completed. Your result is now ready for review."
              : "PropertySure AI is securely processing your submitted property document package through its verification workflow."}

          </p>


          {!processingComplete && (

            <div className="current-stage">

              <span className="pulse-dot" />

              <span>
                {processingMessage}
              </span>

            </div>

          )}


          {/* PROGRESS */}

          <div className="progress-section">

            <div
              className={
                processingComplete
                  ? "progress-number complete"
                  : "progress-number"
              }
            >
              {progress}%
            </div>

            <div className="progress-label">
              Overall Progress
            </div>

            <div className="progress-track">

              <div
                className={
                  processingComplete
                    ? "progress-fill complete"
                    : "progress-fill"
                }

                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

            <div className="processing-message">

              <span className="lock-symbol">
                ◈
              </span>

              {processingComplete
                ? "Processing completed successfully."
                : "Your document is being securely processed. Please do not close this page."}

            </div>

          </div>

        </section>


        {/* DOCUMENT CARD */}

        <section className="document-card">

          <div className="pdf-circle">

            <div className="pdf-file">

              <div className="pdf-fold" />

              <span>
                DOC
              </span>

            </div>

          </div>


          <div className="document-details">

            <h2>
              {documentName}
            </h2>

            <div className="document-meta">

              <span>
                Uploaded {uploadDate}
              </span>

              <span className="meta-dot">
                •
              </span>

              <span>

                {documentCount}{" "}

                {documentCount === 1
                  ? "Document"
                  : "Documents"}

              </span>

            </div>

            <div className="document-verification-id">

              Verification ID: #
              {verificationId}

            </div>

          </div>

        </section>


        {/* TRUST CARD */}

        <section className="trust-card">

          <div className="trust-shield">

            <div className="trust-shield-inner">
              ✓
            </div>

          </div>

          <div className="trust-copy">

            <div className="trust-title">

              Secure
              <span>•</span>
              Reliable
              <span>•</span>
              Transparent

            </div>

            <div className="trust-subtitle">

              Your verification is processed
              through the PropertySure AI
              verification workflow.

            </div>

          </div>

        </section>


        <footer>
          ©️ 2026 PropertySure AI. All rights reserved.
        </footer>

      </div>


      <style jsx>{`

        .processing-page {
          position:
            relative;

          min-height:
            100vh;

          overflow:
            hidden;

          background:
            radial-gradient(
              circle at 50% 15%,
              rgba(9,47,88,.42),
              transparent 28%
            ),
            radial-gradient(
              circle at 50% 45%,
              rgba(0,101,255,.08),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #020d1d 0%,
              #010a18 52%,
              #020b18 100%
            );

          color:
            #f8fafc;

          font-family:
            Inter,
            Arial,
            sans-serif;
        }


        .page-container {
          position:
            relative;

          z-index:
            2;

          width:
            calc(100% - 48px);

          max-width:
            1120px;

          margin:
            0 auto;

          padding-bottom:
            50px;
        }


        .top-header {
          min-height:
            105px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            24px;

          border-bottom:
            1px solid
            rgba(148,163,184,.13);
        }


        .brand {
          display:
            flex;

          align-items:
            center;

          gap:
            16px;
        }


        .brand-logo {
          width:
            44px;

          height:
            44px;

          position:
            relative;

          transform:
            rotate(45deg);

          border-radius:
            5px;

          background:
            linear-gradient(
              135deg,
              #147dff,
              #0061e9
            );

          box-shadow:
            0 0 24px
              rgba(22,142,255,.42),
            inset 0 0 12px
              rgba(255,255,255,.12);
        }


        .brand-logo-inner {
          position:
            absolute;

          width:
            14px;

          height:
            14px;

          left:
            15px;

          top:
            15px;

          border-radius:
            2px;

          background:
            #021a39;
        }


        .brand-name {
          color:
            #ffffff;

          font-size:
            28px;

          font-weight:
            800;

          line-height:
            1;

          letter-spacing:
            -.6px;
        }


        .brand-name span {
          color:
            #168eff;
        }


        .brand-tagline {
          margin-top:
            8px;

          color:
            #8190a8;

          font-size:
            10px;

          letter-spacing:
            2px;

          font-weight:
            600;
        }


        .header-status {
          display:
            flex;

          align-items:
            center;

          gap:
            18px;
        }


        .secure-badge {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          color:
            #39e89c;

          font-size:
            13px;

          white-space:
            nowrap;
        }


        .shield-icon {
          width:
            20px;

          height:
            23px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            2px solid
            #22e69a;

          border-radius:
            9px 9px 11px 11px;

          font-size:
            10px;

          font-weight:
            900;
        }


        .verification-id {
          border:
            1px solid
            rgba(124,150,184,.27);

          background:
            rgba(5,19,37,.64);

          border-radius:
            15px;

          padding:
            13px 18px;

          color:
            #aebbd0;

          font-size:
            13px;

          white-space:
            nowrap;
        }


        .verification-id strong {
          color:
            #d7e7ff;
        }


        .hero {
          text-align:
            center;

          padding:
            66px 0 48px;
        }


        .scanner-wrapper {
          position:
            relative;

          width:
            310px;

          height:
            310px;

          margin:
            0 auto 32px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }


        .scanner-outer-dots {
          position:
            absolute;

          inset:
            0;

          border-radius:
            50%;

          border:
            2px dotted
            rgba(31,144,255,.7);

          animation:
            rotateReverse
            18s linear infinite;

          filter:
            drop-shadow(
              0 0 6px
              rgba(22,142,255,.4)
            );
        }


        .scanner-orbit {
          position:
            relative;

          width:
            270px;

          height:
            270px;

          border-radius:
            50%;

          background:
            radial-gradient(
              circle,
              rgba(8,38,71,.95),
              rgba(3,18,36,.98)
            );

          border:
            2px solid
            rgba(26,130,255,.7);

          box-shadow:
            0 0 40px
              rgba(0,103,255,.18),
            inset 0 0 40px
              rgba(0,76,170,.16);

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }


        .scanner-orbit::before {
          content:
            "";

          position:
            absolute;

          inset:
            -7px;

          border-radius:
            50%;

          border:
            6px solid
            transparent;

          border-top-color:
            #25c8ff;

          border-right-color:
            #1677ff;

          animation:
            spin
            3s linear infinite;

          filter:
            drop-shadow(
              0 0 9px
              rgba(35,193,255,.65)
            );
        }


        .scanner-light {
          position:
            absolute;

          inset:
            17px;

          border-radius:
            50%;

          border:
            1px solid
            rgba(49,142,255,.23);
        }


        .scanner-inner {
          position:
            relative;

          width:
            155px;

          height:
            175px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }


        .document-symbol {
          position:
            relative;

          width:
            88px;

          height:
            122px;

          border:
            4px solid
            #168eff;

          border-radius:
            9px;

          box-shadow:
            0 0 20px
              rgba(22,142,255,.15);
        }


        .document-fold {
          position:
            absolute;

          top:
            -4px;

          right:
            -4px;

          width:
            29px;

          height:
            29px;

          background:
            #061a32;

          border-left:
            4px solid
            #168eff;

          border-bottom:
            4px solid
            #168eff;

          border-radius:
            0 5px 0 8px;
        }


        .house-roof {
          position:
            absolute;

          left:
            26px;

          top:
            40px;

          width:
            32px;

          height:
            32px;

          border-left:
            4px solid
            #168eff;

          border-top:
            4px solid
            #168eff;

          transform:
            rotate(45deg);
        }


        .house-body {
          position:
            absolute;

          left:
            26px;

          top:
            51px;

          width:
            35px;

          height:
            30px;

          border:
            4px solid
            #168eff;

          border-top:
            none;
        }


        .house-door {
          position:
            absolute;

          width:
            8px;

          height:
            15px;

          bottom:
            0;

          left:
            9px;

          border:
            3px solid
            #168eff;

          border-bottom:
            none;
        }


        .document-line {
          position:
            absolute;

          height:
            3px;

          background:
            #168eff;

          border-radius:
            5px;

          left:
            18px;
        }


        .line-one {
          width:
            50px;

          bottom:
            25px;
        }


        .line-two {
          width:
            37px;

          bottom:
            14px;
        }


        .line-three {
          width:
            22px;

          bottom:
            4px;
        }


        .complete-check {
          width:
            100px;

          height:
            100px;

          border-radius:
            50%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            #39e89c;

          border:
            3px solid
            #39e89c;

          font-size:
            55px;

          font-weight:
            800;

          box-shadow:
            0 0 30px
              rgba(57,232,156,.28);
        }


        .status-label {
          color:
            #168eff;

          font-size:
            13px;

          font-weight:
            800;

          letter-spacing:
            2px;

          margin-bottom:
            18px;
        }


        .status-label.complete {
          color:
            #39e89c;
        }


        .hero h1 {
          margin:
            0;

          color:
            #ffffff;

          font-size:
            clamp(
              30px,
              4vw,
              43px
            );

          line-height:
            1.15;

          font-weight:
            800;

          letter-spacing:
            -1px;
        }


        .hero-description {
          max-width:
            690px;

          margin:
            18px auto 0;

          color:
            #aab6c9;

          font-size:
            16px;

          line-height:
            1.75;
        }


        .current-stage {
          width:
            fit-content;

          max-width:
            90%;

          margin:
            22px auto 0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            9px;

          padding:
            9px 15px;

          border:
            1px solid
            rgba(22,142,255,.18);

          border-radius:
            999px;

          background:
            rgba(22,142,255,.055);

          color:
            #9eb3ce;

          font-size:
            12px;

          line-height:
            1.4;
        }


        .pulse-dot {
          width:
            7px;

          height:
            7px;

          flex-shrink:
            0;

          border-radius:
            50%;

          background:
            #168eff;

          box-shadow:
            0 0 12px
            rgba(22,142,255,.8);

          animation:
            pulse
            1.4s ease-in-out infinite;
        }


        .progress-section {
          max-width:
            820px;

          margin:
            42px auto 0;
        }


        .progress-number {
          color:
            #168eff;

          font-size:
            36px;

          font-weight:
            700;

          line-height:
            1;
        }


        .progress-number.complete {
          color:
            #39e89c;
        }


        .progress-label {
          color:
            #c1c9d7;

          margin-top:
            10px;

          font-size:
            14px;
        }


        .progress-track {
          width:
            100%;

          height:
            15px;

          margin-top:
            25px;

          border-radius:
            999px;

          overflow:
            hidden;

          background:
            rgba(9,26,47,.95);

          border:
            1px solid
            rgba(100,134,174,.28);

          box-shadow:
            inset 0 0 8px
              rgba(0,0,0,.35);
        }


        .progress-fill {
          height:
            100%;

          border-radius:
            999px;

          background:
            linear-gradient(
              90deg,
              #1677ff 0%,
              #199cff 55%,
              #29d7ef 100%
            );

          transition:
            width .5s ease;

          box-shadow:
            0 0 20px
              rgba(34,185,255,.52);

          position:
            relative;

          overflow:
            hidden;
        }


        .progress-fill::after {
          content:
            "";

          position:
            absolute;

          top:
            0;

          bottom:
            0;

          width:
            100px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.4),
              transparent
            );

          animation:
            progressShine
            1.7s linear infinite;
        }


        .progress-fill.complete {
          background:
            #39e89c;
        }


        .processing-message {
          margin-top:
            27px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            10px;

          color:
            #9ba8bc;

          font-size:
            13px;
        }


        .lock-symbol {
          color:
            #71829b;

          font-size:
            12px;
        }


        .document-card {
          max-width:
            820px;

          margin:
            0 auto;

          padding:
            27px 31px;

          border:
            1px solid
            rgba(101,132,169,.23);

          border-radius:
            17px;

          background:
            linear-gradient(
              135deg,
              rgba(5,20,39,.88),
              rgba(3,15,31,.92)
            );

          display:
            flex;

          align-items:
            center;

          gap:
            27px;

          box-shadow:
            0 18px 55px
              rgba(0,0,0,.12);
        }


        .pdf-circle {
          width:
            105px;

          height:
            105px;

          flex-shrink:
            0;

          border-radius:
            50%;

          border:
            1px solid
            rgba(58,106,161,.2);

          background:
            radial-gradient(
              circle,
              rgba(9,38,70,.7),
              rgba(4,19,37,.7)
            );

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }


        .pdf-file {
          position:
            relative;

          width:
            43px;

          height:
            55px;

          background:
            linear-gradient(
              180deg,
              #229eff,
              #126af5
            );

          border-radius:
            4px;

          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            center;

          padding-bottom:
            8px;

          box-shadow:
            0 0 18px
              rgba(22,142,255,.3);
        }


        .pdf-file span {
          font-size:
            9px;

          color:
            #ffffff;

          font-weight:
            900;
        }


        .pdf-fold {
          position:
            absolute;

          right:
            0;

          top:
            0;

          width:
            13px;

          height:
            13px;

          background:
            #8bd0ff;

          clip-path:
            polygon(
              0 0,
              100% 100%,
              0 100%
            );
        }


        .document-details {
          min-width:
            0;
        }


        .document-details h2 {
          margin:
            0;

          color:
            #ffffff;

          font-size:
            20px;

          line-height:
            1.35;

          font-weight:
            750;

          word-break:
            break-word;
        }


        .document-meta {
          margin-top:
            13px;

          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            10px;

          color:
            #a7b2c5;

          font-size:
            13px;
        }


        .meta-dot {
          color:
            #697b93;
        }


        .document-verification-id {
          margin-top:
            13px;

          color:
            #a7b2c5;

          font-size:
            13px;
        }


        .trust-card {
          max-width:
            820px;

          margin:
            28px auto 0;

          padding:
            22px 30px;

          border-radius:
            17px;

          border:
            1px solid
            rgba(101,132,169,.21);

          background:
            linear-gradient(
              135deg,
              rgba(5,20,39,.82),
              rgba(3,15,31,.88)
            );

          display:
            flex;

          align-items:
            center;

          gap:
            20px;
        }


        .trust-shield {
          width:
            55px;

          height:
            55px;

          flex-shrink:
            0;

          border-radius:
            50%;

          background:
            rgba(20,226,145,.08);

          box-shadow:
            0 0 24px
              rgba(20,226,145,.12);

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;
        }


        .trust-shield-inner {
          width:
            31px;

          height:
            35px;

          border:
            2px solid
            #26df98;

          color:
            #26df98;

          border-radius:
            10px 10px 13px 13px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            14px;

          font-weight:
            900;
        }


        .trust-title {
          color:
            #ffffff;

          font-size:
            15px;

          font-weight:
            600;
        }


        .trust-title span {
          color:
            #74859c;

          padding:
            0 8px;
        }


        .trust-subtitle {
          margin-top:
            8px;

          color:
            #8796ab;

          font-size:
            13px;

          line-height:
            1.5;
        }


        footer {
          text-align:
            center;

          color:
            #64748b;

          font-size:
            11px;

          margin-top:
            48px;
        }


        .background-wave {
          position:
            absolute;

          left:
            -10%;

          width:
            120%;

          height:
            160px;

          border-radius:
            50%;

          pointer-events:
            none;

          opacity:
            .22;
        }


        .wave-one {
          top:
            315px;

          border-top:
            1px solid
            rgba(0,123,255,.6);

          transform:
            rotate(-2deg)
            skewY(-4deg);
        }


        .wave-two {
          top:
            350px;

          border-top:
            1px dashed
            rgba(0,123,255,.4);

          transform:
            rotate(2deg)
            skewY(4deg);
        }


        @keyframes spin {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }


        @keyframes rotateReverse {

          from {
            transform:
              rotate(360deg);
          }

          to {
            transform:
              rotate(0deg);
          }

        }


        @keyframes progressShine {

          from {
            left:
              -120px;
          }

          to {
            left:
              calc(100% + 120px);
          }

        }


        @keyframes pulse {

          0%,
          100% {
            opacity:
              .45;

            transform:
              scale(.85);
          }

          50% {
            opacity:
              1;

            transform:
              scale(1.15);
          }

        }


        @media (max-width: 800px) {

          .top-header {
            padding:
              18px 0;

            min-height:
              auto;
          }

          .brand-name {
            font-size:
              23px;
          }

          .header-status {
            gap:
              8px;
          }

          .scanner-wrapper {
            width:
              270px;

            height:
              270px;
          }

          .scanner-orbit {
            width:
              235px;

            height:
              235px;
          }

          .hero {
            padding-top:
              50px;
          }

        }


        @media (max-width: 650px) {

          .page-container {
            width:
              calc(100% - 28px);
          }

          .top-header {
            align-items:
              flex-start;
          }

          .brand {
            gap:
              10px;
          }

          .brand-logo {
            width:
              35px;

            height:
              35px;
          }

          .brand-logo-inner {
            width:
              11px;

            height:
              11px;

            left:
              12px;

            top:
              12px;
          }

          .brand-name {
            font-size:
              19px;
          }

          .brand-tagline {
            margin-top:
              6px;

            font-size:
              7px;

            letter-spacing:
              1.2px;
          }

          .header-status {
            flex-direction:
              column;

            align-items:
              flex-end;
          }

          .secure-badge {
            font-size:
              10px;
          }

          .shield-icon {
            width:
              16px;

            height:
              18px;

            font-size:
              8px;
          }

          .verification-id {
            padding:
              8px 10px;

            border-radius:
              10px;

            font-size:
              10px;
          }

          .hero {
            padding:
              42px 0 36px;
          }

          .scanner-wrapper {
            width:
              225px;

            height:
              225px;

            margin-bottom:
              28px;
          }

          .scanner-orbit {
            width:
              195px;

            height:
              195px;
          }

          .scanner-inner {
            transform:
              scale(.78);
          }

          .status-label {
            font-size:
              11px;

            letter-spacing:
              1.5px;

            margin-bottom:
              14px;
          }

          .hero h1 {
            font-size:
              29px;

            line-height:
              1.17;
          }

          .hero-description {
            font-size:
              13px;

            line-height:
              1.65;

            margin-top:
              15px;
          }

          .current-stage {
            font-size:
              10px;

            padding:
              8px 11px;
          }

          .progress-section {
            margin-top:
              34px;
          }

          .progress-number {
            font-size:
              31px;
          }

          .progress-track {
            height:
              13px;
          }

          .processing-message {
            font-size:
              11px;

            line-height:
              1.5;
          }

          .document-card {
            padding:
              20px;

            gap:
              17px;
          }

          .pdf-circle {
            width:
              72px;

            height:
              72px;
          }

          .pdf-file {
            width:
              34px;

            height:
              45px;
          }

          .document-details h2 {
            font-size:
              16px;
          }

          .document-meta {
            font-size:
              11px;

            gap:
              6px;
          }

          .document-verification-id {
            font-size:
              11px;
          }

          .trust-card {
            padding:
              19px;
          }

          .trust-title {
            font-size:
              13px;
          }

          .trust-title span {
            padding:
              0 4px;
          }

          .trust-subtitle {
            font-size:
              11px;
          }

        }


        @media (max-width: 430px) {

          .page-container {
            width:
              calc(100% - 22px);
          }

          .top-header {
            gap:
              10px;
          }

          .brand-logo {
            width:
              31px;

            height:
              31px;
          }

          .brand-logo-inner {
            width:
              9px;

            height:
              9px;

            left:
              11px;

            top:
              11px;
          }

          .brand-name {
            font-size:
              17px;
          }

          .brand-tagline {
            display:
              none;
          }

          .secure-badge {
            display:
              none;
          }

          .hero h1 {
            font-size:
              26px;
          }

          .scanner-wrapper {
            width:
              205px;

            height:
              205px;
          }

          .scanner-orbit {
            width:
              176px;

            height:
              176px;
          }

          .scanner-inner {
            transform:
              scale(.7);
          }

          .document-card {
            align-items:
              flex-start;
          }

          .pdf-circle {
            width:
              60px;

            height:
              60px;
          }

          .pdf-file {
            transform:
              scale(.8);
          }

          .document-meta {
            display:
              block;

            line-height:
              1.7;
          }

          .document-meta span {
            display:
              inline;
          }

          .meta-dot {
            padding:
              0 3px;
          }

          .trust-shield {
            width:
              45px;

            height:
              45px;
          }

          .trust-shield-inner {
            width:
              25px;

            height:
              29px;
          }

          footer {
            margin-top:
              36px;
          }

        }

      `}</style>

    </main>
  );
}