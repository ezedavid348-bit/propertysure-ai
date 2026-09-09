"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";

import styles from "./processing.module.css";

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

  /*
   * These fields are produced by the Review Package page.
   *
   * documentType is the AI/manual identity of the document.
   * name is only the uploaded filename.
   */
  documentType?: string;

  classificationStatus?:
    | "classifying"
    | "identified"
    | "uncertain"
    | "failed"
    | "idle";

  classificationConfidence?: number;

  classificationSource?:
    | "ai"
    | "manual"
    | "existing"
    | "unknown";

  documentTitleDetected?: string;

  nameDetected?: string;

  classificationMessage?: string;

  size?: number;
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
      "Reviewing document structure and integrity.",
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
      "Analyzing property information and document consistency.",
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
      "Preparing your verification report.",
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
  const storedPackage =
    record.findings?.document_package;

  if (
    Array.isArray(storedPackage) &&
    storedPackage.length > 0
  ) {
    return storedPackage;
  }

  /*
   * Fallback for older verification records.
   *
   * The reviewed package above is always preferred.
   */
  if (record.file_url) {
    return [
      {
        name:
          record.doc_name ||
          "Property Document",

        path:
          record.file_url,

        type:
          record.doc_type ||
          "application/pdf",

        documentType:
          record.doc_type ||
          undefined,
      },
    ];
  }

  if (record.doc_name) {
    return [
      {
        name:
          record.doc_name,

        path:
          "",

        type:
          "application/pdf",

        documentType:
          record.doc_type ||
          undefined,
      },
    ];
  }

  return [];
}

/*
 * ============================================================
 * DOCUMENT DISPLAY TITLE
 * ============================================================
 *
 * IMPORTANT:
 *
 * The Review Package page stores the actual identified
 * document type in documentType.
 *
 * Therefore a random uploaded UUID filename must NOT replace
 * the identified document name.
 * ============================================================
 */

function getDocumentIdentity(
  document: DocumentPackageItem
): string {
  const documentType =
    typeof document.documentType ===
    "string"
      ? document.documentType.trim()
      : "";

  if (documentType) {
    return documentType;
  }

  const detectedTitle =
    typeof document.documentTitleDetected ===
    "string"
      ? document.documentTitleDetected.trim()
      : "";

  if (detectedTitle) {
    return detectedTitle;
  }

  /*
   * Only use the uploaded filename as a final fallback
   * for old/unclassified records.
   */
  if (document.name) {
    return document.name;
  }

  return "Property Document";
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
 * ============================================================
 */

async function finalizeBasicVerification(
  id: string,
  documentPackage: DocumentPackageItem[]
) {
  const findings: VerificationFindings = {
    document_package:
      documentPackage,

    document_count:
      documentPackage.length,

    checks: {
      ...emptyChecks,
    },

    processing: {
      stage:
        "complete",

      progress:
        100,

      message:
        "Verification workflow completed. Detailed verification checks remain unassessed.",
    },
  };

  const {
    error,
  } = await supabase
    .from("verifications")
    .update({
      status:
        "processed",

      trust_score:
        0,

      confidence:
        0,

      risk:
        null,

      findings,
    })
    .eq(
      "id",
      id
    );

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

export default function ProcessingPage() {
  /*
   * ============================================================
   * PAGE LOADING
   *
   * This controls the standard PropertySure AI loading screen.
   * ============================================================
   */

  const [
    loading,
    setLoading,
  ] = useState(true);

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
    verificationId,
    setVerificationId,
  ] = useState("");

  const [
    documentPackage,
    setDocumentPackage,
  ] = useState<
    DocumentPackageItem[]
  >([]);

  const [
    uploadDate,
    setUploadDate,
  ] = useState(
    "Processing..."
  );

  const [
    processingComplete,
    setProcessingComplete,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const processingStarted =
    useRef(false);

  const redirecting =
    useRef(false);

  /*
   * ============================================================
   * PRIMARY DOCUMENT IDENTITY
   * ============================================================
   */

  const primaryDocument =
    documentPackage[0];

  const primaryDocumentIdentity =
    useMemo(() => {
      if (!primaryDocument) {
        return "Property Documents";
      }

      return getDocumentIdentity(
        primaryDocument
      );
    }, [
      primaryDocument,
    ]);

  /*
   * ============================================================
   * PACKAGE LABEL
   * ============================================================
   */

  const packageLabel =
    documentPackage.length === 1
      ? "1 document"
      : `${documentPackage.length} documents`;

  /*
   * ============================================================
   * VISUAL PROCESSING STAGE
   * ============================================================
   */

  const visualStepState = (
    step:
      | "received"
      | "identification"
      | "analysis"
      | "fraud"
      | "report"
  ) => {
    if (
      processingComplete
    ) {
      return "complete";
    }

    if (
      step === "received"
    ) {
      return "complete";
    }

    if (
      step === "identification"
    ) {
      return "complete";
    }

    if (
      step === "analysis"
    ) {
      if (
        progress >= 22 &&
        progress < 69
      ) {
        return "active";
      }

      if (
        progress >= 69
      ) {
        return "complete";
      }

      return "active";
    }

    if (
      step === "fraud"
    ) {
      if (
        progress >= 69
      ) {
        return "active";
      }

      return "pending";
    }

    if (
      step === "report"
    ) {
      if (
        progress >= 94
      ) {
        return "active";
      }

      return "pending";
    }

    return "pending";
  };

  /*
   * ============================================================
   * MAIN PROCESSING WORKFLOW
   * ============================================================
   */

  useEffect(() => {
    if (
      processingStarted.current
    ) {
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

    /*
     * TypeScript now knows this is definitely a string.
     */
    const verificationIdFromUrl =
      id;

    setVerificationId(
      verificationIdFromUrl
    );

    async function processVerification() {
      try {
        /*
         * ======================================================
         * LOAD VERIFICATION
         * ======================================================
         */

        const verification =
          await loadVerification(
            verificationIdFromUrl
          );

        if (!verification) {
          setLoading(false);

          return;
        }

        /*
         * ======================================================
         * DOCUMENT PACKAGE
         * ======================================================
         *
         * IMPORTANT:
         *
         * We use the exact package saved by Review Package.
         *
         * This preserves:
         *
         * - documentType
         * - documentTitleDetected
         * - nameDetected
         * - classification confidence
         * - original uploaded filename
         *
         * The AI identity therefore carries forward.
         * ======================================================
         */

        const reviewedPackage =
          createDocumentPackage(
            verification
          );

        setDocumentPackage(
          reviewedPackage
        );

        /*
         * ======================================================
         * UPLOAD DATE
         * ======================================================
         */

        if (
          verification.created_at
        ) {
          setUploadDate(
            new Date(
              verification.created_at
            ).toLocaleString(
              "en-NG",
              {
                day:
                  "2-digit",

                month:
                  "short",

                year:
                  "numeric",

                hour:
                  "2-digit",

                minute:
                  "2-digit",
              }
            )
          );
        }

        /*
         * ======================================================
         * ALREADY PROCESSED
         * ======================================================
         */

        if (
          verification.status ===
          "processed"
        ) {
          setProgress(
            100
          );

          setProcessingStage(
            "complete"
          );

          setProcessingMessage(
            "Verification completed successfully."
          );

          setProcessingComplete(
            true
          );

          setLoading(false);

          redirecting.current =
            true;

          setTimeout(() => {
            window.location.href =
              `/result?id=${encodeURIComponent(
                verificationIdFromUrl
              )}`;
          }, 800);

          return;
        }

        /*
         * ======================================================
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

          setLoading(false);

          return;
        }

        /*
         * ======================================================
         * START PROCESSING
         * ======================================================
         */

        const {
          error:
            processingError,
        } =
          await supabase
            .from(
              "verifications"
            )
            .update({
              status:
                "processing",

              findings: {
                ...(verification.findings ||
                  {}),

                document_package:
                  reviewedPackage,

                document_count:
                  reviewedPackage.length,

                checks: {
                  ...emptyChecks,
                },

                processing: {
                  stage:
                    "received",

                  progress:
                    8,

                  message:
                    processingStages[0]
                      .message,
                },
              },
            })
            .eq(
              "id",
              verificationIdFromUrl
            );

        if (
          processingError
        ) {
          throw new Error(
            `Could not start verification: ${processingError.message}`
          );
        }

        /*
         * ======================================================
         * THE STANDARD LOADING SCREEN ENDS HERE.
         *
         * Processing page now becomes visible.
         * ======================================================
         */

        setLoading(false);

        /*
         * ======================================================
         * PROCESSING STAGES
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

          await supabase
            .from(
              "verifications"
            )
            .update({
              findings: {
                document_package:
                  reviewedPackage,

                document_count:
                  reviewedPackage.length,

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
            .eq(
              "id",
              verificationIdFromUrl
            );

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
         * FINALIZE
         * ======================================================
         */

        setProcessingMessage(
          "Finalizing your verification report..."
        );

        setProgress(
          97
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              700
            )
        );

        await finalizeBasicVerification(
          verificationIdFromUrl,
          reviewedPackage
        );

        /*
         * ======================================================
         * COMPLETE
         * ======================================================
         */

        setProcessingStage(
          "complete"
        );

        setProgress(
          100
        );

        setProcessingMessage(
          "Verification workflow completed successfully."
        );

        setProcessingComplete(
          true
        );

        redirecting.current =
          true;

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              900
            )
        );

        window.location.href =
          `/result?id=${encodeURIComponent(
            verificationIdFromUrl
          )}`;
      } catch (
        error
      ) {
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

        setLoading(false);
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
   * STANDARD PROPERTYSURE AI LOADING SCREEN
   * ============================================================
   */

  if (loading) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong>
              {" "}
              AI
            </strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
        </p>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR SCREEN
   * ============================================================
   */

  if (
    errorMessage
  ) {
    return (
      <main
        className={
          styles.errorPage
        }
      >
        <div
          className={
            styles.errorCard
          }
        >
          <div
            className={
              styles.errorIcon
            }
          >
            !
          </div>

          <div
            className={
              styles.errorLabel
            }
          >
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
      </main>
    );
  }

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  return (
    <AppShell
      activePath="/verify"
      headerPath="/processing"
    >
      <main
        className={
          styles.processingPage
        }
      >
        <div
          className={
            styles.backgroundShapeOne
          }
        />

        <div
          className={
            styles.backgroundShapeTwo
          }
        />

        <div
          className={
            styles.pageContainer
          }
        >
          {/* ==================================================
              PAGE BRAND
              ================================================== */}

          <header
            className={
              styles.pageBrand
            }
          >
            <div
              className={
                styles.brandLogo
              }
            >
              <div
                className={
                  styles.brandLogoInner
                }
              />
            </div>

            <div>
              <div
                className={
                  styles.brandName
                }
              >
                PropertySure{" "}
                <span>
                  AI
                </span>
              </div>

              <div
                className={
                  styles.brandSubtitle
                }
              >
                PROPERTY VERIFICATION
              </div>
            </div>
          </header>

          {/* ==================================================
              HERO
              ================================================== */}

          <section
            className={
              styles.hero
            }
          >
            {/* DOCUMENT SCANNER */}

            <div
              className={
                styles.scanner
              }
            >
              <div
                className={
                  styles.scannerDots
                }
              />

              <div
                className={
                  styles.scannerRingOuter
                }
              >
                <div
                  className={
                    styles.scannerProgressArc
                  }
                />
              </div>

              <div
                className={
                  styles.scannerRingMiddle
                }
              />

              <div
                className={
                  styles.scannerCore
                }
              >
                <div
                  className={
                    styles.documentIcon
                  }
                >
                  <div
                    className={
                      styles.documentFold
                    }
                  />

                  <div
                    className={
                      styles.houseRoof
                    }
                  />

                  <div
                    className={
                      styles.houseBody
                    }
                  >
                    <div
                      className={
                        styles.houseDoor
                      }
                    />
                  </div>

                  <div
                    className={
                      styles.documentLineOne
                    }
                  />

                  <div
                    className={
                      styles.documentLineTwo
                    }
                  />

                  <div
                    className={
                      styles.documentLineThree
                    }
                  />
                </div>
              </div>

              {/* FLOATING ICONS */}

              <div
                className={`${styles.floatingIcon} ${styles.floatingDocument}`}
              >
                ▤
              </div>

              <div
                className={`${styles.floatingIcon} ${styles.floatingShield}`}
              >
                ◇
              </div>

              <div
                className={`${styles.floatingIcon} ${styles.floatingChart}`}
              >
                ▥
              </div>

              <div
                className={`${styles.floatingIcon} ${styles.floatingSpark}`}
              >
                ✦
              </div>
            </div>

            <div
              className={
                styles.statusLabel
              }
            >
              {processingComplete
                ? "VERIFICATION COMPLETE"
                : "VERIFICATION IN PROGRESS"}
            </div>

            <h1>
              {processingComplete
                ? "Verification Complete"
                : "Verifying Your Property Documents"}
            </h1>

            <p
              className={
                styles.heroDescription
              }
            >
              {processingComplete
                ? "Your verification workflow has been completed. Your result is now ready for review."
                : "PropertySure AI is securely processing your submitted property document package. This may take a few moments."}
            </p>

            {/* ==================================================
                PROGRESS CARD
                ================================================== */}

            <div
              className={
                styles.progressCard
              }
            >
              <div
                className={
                  styles.progressInfo
                }
              >
                <div
                  className={
                    processingComplete
                      ? `${styles.progressSpinner} ${styles.progressSpinnerComplete}`
                      : styles.progressSpinner
                  }
                >
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div
                  className={
                    styles.progressCopy
                  }
                >
                  <strong>
                    {processingComplete
                      ? "Verification complete"
                      : primaryDocumentIdentity !==
                        "Property Documents"
                        ? `Analyzing ${primaryDocumentIdentity}...`
                        : "Analyzing documents..."}
                  </strong>

                  <span>
                    {processingComplete
                      ? "Your verification result is ready."
                      : "Our AI is examining your files for key details, structure and authenticity."}
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.progressValue
                }
              >
                <strong>
                  {progress}%
                </strong>

                <span>
                  Overall Progress
                </span>
              </div>
            </div>

            {/* ==================================================
                PROCESSING STEPS
                ================================================== */}

            <div
              className={
                styles.stepsCard
              }
            >
              <ProcessingStep
                state={
                  visualStepState(
                    "received"
                  )
                }
                title="Document package received"
                description="Your submitted documents have been securely received."
                status="100%"
              />

              <ProcessingStep
                state={
                  visualStepState(
                    "identification"
                  )
                }
                title="Document identification"
                description={
                  documentPackage.length > 0
                    ? `PropertySure AI identified ${packageLabel} during package review.`
                    : "PropertySure AI is identifying and categorizing your documents."
                }
                status="100%"
              />

              <ProcessingStep
                state={
                  visualStepState(
                    "analysis"
                  )
                }
                title="Verification analysis"
                description="AI is examining document content, structure and consistency."
                status={
                  progress >= 69
                    ? "Complete"
                    : "In progress..."
                }
              />

              <ProcessingStep
                state={
                  visualStepState(
                    "fraud"
                  )
                }
                title="Fraud & authenticity checks"
                description="Checking for suspicious alterations and inconsistencies."
                status={
                  progress >= 83
                    ? "Complete"
                    : "Pending"
                }
              />

              <ProcessingStep
                state={
                  visualStepState(
                    "report"
                  )
                }
                title="Verification report"
                description="Your verification findings are being prepared."
                status={
                  processingComplete
                    ? "Ready"
                    : "Pending"
                }
                last
              />
            </div>

            {/* ==================================================
                SECURITY
                ================================================== */}

            <div
              className={
                styles.securityCard
              }
            >
              <div
                className={
                  styles.securityIcon
                }
              >
                ◇
              </div>

              <div>
                <strong>
                  Your data is secure
                </strong>

                <span>
                  All documents are encrypted and processed in a secure environment.
                </span>
              </div>
            </div>

            {/* ==================================================
                SLOGAN
                ================================================== */}

            <div
              className={
                styles.slogan
              }
            >
              <span />

              <p>
                SMARTER PROPERTY DECISIONS.
                {" "}
                SAFER INVESTMENTS.
              </p>

              <span />
            </div>
          </section>

          {/* ==================================================
              FEATURE CARDS
              ================================================== */}

          <section
            className={
              styles.featureGrid
            }
          >
            <FeatureCard
              icon="▤"
              title="Intelligent Analysis"
              description="Our AI reads and understands your documents just like an expert, identifying key details and verifying authenticity."
              variant="blue"
            />

            <FeatureCard
              icon="◇"
              title="Secure Processing"
              description="Your documents are encrypted and processed in a secure environment with enterprise-grade protection."
              variant="green"
            />

            <FeatureCard
              icon="ϟ"
              title="Accurate Results"
              description="We analyze structure, consistency, signatures, stamps and more to deliver a comprehensive verification report."
              variant="purple"
            />
          </section>

          {/* ==================================================
              FOOTER BRAND
              ================================================== */}

          <footer
            className={
              styles.footer
            }
          >
            <div
              className={
                styles.footerBrand
              }
            >
              <div
                className={
                  styles.footerLogo
                }
              >
                <div
                  className={
                    styles.footerLogoInner
                  }
                />
              </div>

              <strong>
                PropertySure{" "}
                <span>
                  AI
                </span>
              </strong>
            </div>

            <p>
              Smarter Property Decisions.
              {" "}
              Safer Investments.
            </p>

            <small>
              © 2026 PropertySure AI. All rights reserved.
            </small>
          </footer>
        </div>
      </main>
    </AppShell>
  );
}

/*
 * ============================================================
 * PROCESSING STEP COMPONENT
 * ============================================================
 */

function ProcessingStep({
  state,
  title,
  description,
  status,
  last = false,
}: {
  state:
    | "complete"
    | "active"
    | "pending";

  title: string;

  description: string;

  status: string;

  last?: boolean;
}) {
  return (
    <div
      className={
        last
          ? `${styles.step} ${styles.stepLast}`
          : styles.step
      }
    >
      <div
        className={
          styles.stepIndicatorColumn
        }
      >
        <div
          className={`${styles.stepIndicator} ${
            state === "complete"
              ? styles.stepComplete
              : state === "active"
                ? styles.stepActive
                : styles.stepPending
          }`}
        >
          {state === "complete"
            ? "✓"
            : ""}
        </div>

        {!last && (
          <div
            className={`${styles.stepLine} ${
              state === "complete"
                ? styles.stepLineComplete
                : ""
            }`}
          />
        )}
      </div>

      <div
        className={
          styles.stepContent
        }
      >
        <div
          className={
            styles.stepTitleRow
          }
        >
          <strong>
            {title}
          </strong>

          <span
            className={
              state === "complete"
                ? styles.stepStatusComplete
                : state === "active"
                  ? styles.stepStatusActive
                  : styles.stepStatusPending
            }
          >
            {status}
          </span>
        </div>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * FEATURE CARD COMPONENT
 * ============================================================
 */

function FeatureCard({
  icon,
  title,
  description,
  variant,
}: {
  icon: string;

  title: string;

  description: string;

  variant:
    | "blue"
    | "green"
    | "purple";
}) {
  return (
    <article
      className={
        styles.featureCard
      }
    >
      <div
        className={`${styles.featureIcon} ${
          variant === "blue"
            ? styles.featureIconBlue
            : variant === "green"
              ? styles.featureIconGreen
              : styles.featureIconPurple
        }`}
      >
        {icon}
      </div>

      <h2>
        {title}
      </h2>

      <p>
        {description}
      </p>
    </article>
  );
}