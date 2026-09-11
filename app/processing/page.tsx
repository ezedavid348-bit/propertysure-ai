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

  essential?: {
    plan?: string;
    completed_at?: string;
    document_results?: unknown[];
    summary?: string;
  };

  processing?: {
    stage?: ProcessingStage;

    progress?: number;

    message?: string;
  };
};

type PlanKey =
  | "essential"
  | "professional"
  | "premium";

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
 * DOCUMENT PACKAGE
 * ============================================================
 */

function createDocumentPackage(
  record: VerificationRecord,
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
 */

function getDocumentIdentity(
  document: DocumentPackageItem,
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
 *
 * IMPORTANT:
 *
 * This function either:
 *
 * 1. returns a VerificationRecord, OR
 * 2. throws an error.
 *
 * Therefore it must NOT be typed as
 * Promise<VerificationRecord | null>.
 * ============================================================
 */

type VerificationStatusPayment = {
  id?: string | number;
  verification_id?: string | number;
  user_id?: string;
  plan?: string | null;
  amount?: number | null;
  currency?: string | null;
  provider?: string | null;
  provider_reference?: string | null;
  status?: string | null;
  payment_method?: string | null;
  paid_at?: string | null;
};

type VerificationStatusResponse = {
  success?: boolean;
  verification?: VerificationRecord;
  plan?: string | null;
  payment?: VerificationStatusPayment | null;
  error?: string;
  message?: string;
};

async function loadVerification(
  id: string,
): Promise<{
  verification: VerificationRecord;
  plan: PlanKey | null;
}> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(
      "PROCESSING SESSION ERROR:",
      sessionError,
    );

    throw new Error(
      "Your session could not be verified. Please sign in again.",
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const response = await fetch(
    `/api/verify-document/status?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Cache-Control": "no-cache",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  let payload: VerificationStatusResponse = {};

  try {
    payload =
      (await response.json()) as VerificationStatusResponse;
  } catch (jsonError) {
    console.error(
      "PROCESSING STATUS JSON ERROR:",
      jsonError,
    );
  }

  console.log(
    "PROCESSING STATUS RESPONSE:",
    {
      httpStatus: response.status,
      success: payload.success,
      verificationId: id,
      hasVerification: Boolean(
        payload.verification,
      ),
      verificationStatus:
        payload.verification?.status,
      plan: payload.plan,
      paymentPlan:
        payload.payment?.plan,
      paymentStatus:
        payload.payment?.status,
      paymentProvider:
        payload.payment?.provider,
      paymentCurrency:
        payload.payment?.currency,
      paymentAmount:
        payload.payment?.amount,
      error: payload.error,
      message: payload.message,
    },
  );

  if (!response.ok) {
    throw new Error(
      payload.error ||
        payload.message ||
        `Verification status request failed (${response.status}).`,
    );
  }

  /*
   * The status API is the primary source. However, if an older
   * response shape or a deployment mismatch returns HTTP 200
   * without the verification object, recover the record directly
   * from Supabase using the already authenticated browser session.
   *
   * This fallback intentionally selects only fields that are known
   * to exist on the verification record. In particular, it does not
   * require created_at.
   */
  let verification =
    payload.verification ||
    null;

  if (!verification) {
    console.warn(
      "PROCESSING STATUS FALLBACK: status API returned no verification record; loading the record directly from Supabase.",
    );

    const {
      data: directVerification,
      error: directVerificationError,
    } = await supabase
      .from("verifications")
      .select(
        "id, doc_name, file_url, doc_type, status, trust_score, confidence, risk, findings",
      )
      .eq("id", id)
      .maybeSingle();

    if (directVerificationError) {
      console.error(
        "PROCESSING DIRECT VERIFICATION LOAD ERROR:",
        directVerificationError,
      );

      throw new Error(
        `Verification record could not be loaded: ${directVerificationError.message}`,
      );
    }

    if (!directVerification) {
      throw new Error(
        payload.error ||
          payload.message ||
          "Verification record could not be found.",
      );
    }

    verification =
      directVerification as VerificationRecord;
  }

  const rawPlan =
    payload.plan ||
    payload.payment?.plan ||
    verification.findings?.essential?.plan ||
    null;

  const normalizedPlan =
    String(rawPlan || "")
      .trim()
      .toLowerCase();

  const plan:
    | PlanKey
    | null =
    normalizedPlan === "essential" ||
    normalizedPlan === "professional" ||
    normalizedPlan === "premium"
      ? normalizedPlan
      : null;

  return {
    verification,
    plan,
  };
}

/*
 * ============================================================
 * PROCESSING STAGE HELPERS
 * ============================================================
 */

function getProcessingProgress(
  record: VerificationRecord,
): number {
  const storedProgress =
    record.findings?.processing?.progress;

  if (
    typeof storedProgress ===
    "number"
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        storedProgress,
      ),
    );
  }

  return 8;
}

function getProcessingStage(
  record: VerificationRecord,
): ProcessingStage {
  return (
    record.findings?.processing?.stage ||
    (record.status ===
    "processed"
      ? "complete"
      : record.status ===
          "failed"
        ? "failed"
        : "received")
  );
}

function getProcessingMessage(
  record: VerificationRecord,
): string {
  return (
    record.findings?.processing
      ?.message ||
    "PropertySure AI is preparing your verification analysis..."
  );
}

/*
 * ============================================================
 * VISUAL PROCESSING STAGE
 * ============================================================
 */

function getVisualStepState(
  step:
    | "received"
    | "identification"
    | "analysis"
    | "fraud"
    | "report",
  progress: number,
  processingComplete: boolean,
): "complete" | "active" | "pending" {
  if (processingComplete) {
    return "complete";
  }

  if (step === "received") {
    return "complete";
  }

  if (step === "identification") {
    return progress >= 8
      ? "complete"
      : "active";
  }

  if (step === "analysis") {
    if (progress >= 69) {
      return "complete";
    }

    if (progress >= 22) {
      return "active";
    }

    return "pending";
  }

  if (step === "fraud") {
    if (progress >= 83) {
      return "complete";
    }

    if (progress >= 69) {
      return "active";
    }

    return "pending";
  }

  if (step === "report") {
    if (processingComplete) {
      return "complete";
    }

    if (progress >= 94) {
      return "active";
    }

    return "pending";
  }

  return "pending";
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
    "received",
  );

  const [
    processingMessage,
    setProcessingMessage,
  ] = useState(
    "Preparing secure verification...",
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
    "Processing...",
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
        primaryDocument,
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
   * MAIN PROCESSING WORKFLOW
   * ============================================================
   *
   * The Processing page is only the user-facing processing
   * experience.
   *
   * The actual verification is performed by:
   *
   * POST /api/verify-document/essential
   *
   * That API:
   *
   * - verifies the Essential payment
   * - loads the submitted document package
   * - downloads the actual documents
   * - sends them to the AI verification engine
   * - performs the Essential checks
   * - calculates trust score
   * - calculates confidence
   * - calculates risk
   * - saves the completed result
   *
   * This page does NOT create a fake 0/100 result.
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
        window.location.search,
      );

    const id =
      params.get("id");

    if (!id) {
      window.location.href =
        "/verify";

      return;
    }

    const verificationIdFromUrl =
      id;

    setVerificationId(
      verificationIdFromUrl,
    );

    let cancelled = false;

    /*
     * ==========================================================
     * PROCESSING PROGRESS POLLER
     * ==========================================================
     *
     * The Essential API performs the actual analysis.
     *
     * While it is running, this poller reads the processing
     * progress saved by that API so the Processing page can
     * reflect the real server-side stage.
     *
     * It does NOT perform verification itself.
     * ==========================================================
     */

    async function pollVerification(
      idToPoll: string,
    ) {
      while (!cancelled) {
        try {
          const loaded =
            await loadVerification(
              idToPoll,
            );

          const verification =
            loaded.verification;

          if (cancelled) {
            return;
          }

          const currentPackage =
            createDocumentPackage(
              verification,
            );

          if (
            currentPackage.length >
            0
          ) {
            setDocumentPackage(
              currentPackage,
            );
          }

          if (
            verification.created_at
          ) {
            setUploadDate(
              new Date(
                verification.created_at,
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
                },
              ),
            );
          }

          const currentProgress =
            getProcessingProgress(
              verification,
            );

          const currentStage =
            getProcessingStage(
              verification,
            );

          const currentMessage =
            getProcessingMessage(
              verification,
            );

          setProgress(
            currentProgress,
          );

          setProcessingStage(
            currentStage,
          );

          setProcessingMessage(
            currentMessage,
          );

          /*
           * If the server has completed, show the completed
           * state. The main workflow remains responsible for
           * the final redirect.
           */

          if (
            verification.status ===
              "processed" ||
            currentStage ===
              "complete"
          ) {
            setProgress(100);

            setProcessingStage(
              "complete",
            );

            setProcessingMessage(
              "Verification completed successfully.",
            );

            setProcessingComplete(
              true,
            );

            return;
          }

          /*
           * If the server has failed, stop polling.
           *
           * The main verification request will also receive
           * the API error and display it to the user.
           */

          if (
            verification.status ===
              "failed" ||
            currentStage ===
              "failed"
          ) {
            return;
          }

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                800,
              ),
          );
        } catch (
          pollError
        ) {
          /*
           * Polling is supplementary UI functionality.
           *
           * If a temporary polling request fails, do not
           * destroy the actual verification request.
           */

          console.error(
            "PROCESSING POLL ERROR:",
            pollError,
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1200,
              ),
          );
        }
      }
    }

    async function processVerification() {
      try {
        /*
         * ======================================================
         * LOAD VERIFICATION
         * ======================================================
         */

        const loaded =
          await loadVerification(
            verificationIdFromUrl,
          );

        const verification =
          loaded.verification;

        const selectedPlan =
          loaded.plan;

        if (!selectedPlan) {
          throw new Error(
            "The paid verification plan could not be determined from the payment record.",
          );
        }

        /*
         * ======================================================
         * PRESERVE REVIEWED PACKAGE
         * ======================================================
         */

        const reviewedPackage =
          createDocumentPackage(
            verification,
          );

        setDocumentPackage(
          reviewedPackage,
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
              verification.created_at,
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
              },
            ),
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
          setProgress(100);

          setProcessingStage(
            "complete",
          );

          setProcessingMessage(
            "Verification completed successfully.",
          );

          setProcessingComplete(
            true,
          );

          setLoading(false);

          redirecting.current =
            true;

          setTimeout(() => {
            if (!cancelled) {
              window.location.href =
                selectedPlan === "professional"
                  ? `/professional-report?id=${encodeURIComponent(
                      verificationIdFromUrl,
                    )}`
                  : `/result?id=${encodeURIComponent(
                      verificationIdFromUrl,
                    )}`;
            }
          }, 900);

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
          throw new Error(
            verification.findings
              ?.processing
              ?.message ||
              "The verification could not be completed.",
          );
        }

        /*
         * ======================================================
         * INITIAL UI STATE
         * ======================================================
         */

        setProgress(
          Math.max(
            8,
            getProcessingProgress(
              verification,
            ),
          ),
        );

        setProcessingStage(
          getProcessingStage(
            verification,
          ),
        );

        setProcessingMessage(
          getProcessingMessage(
            verification,
          ),
        );

        setLoading(false);

        /*
         * ======================================================
         * START PROGRESS POLLING
         * ======================================================
         *
         * This runs alongside the real paid-plan verification
         * request.
         * ======================================================
         */

        void pollVerification(
          verificationIdFromUrl,
        );

        /*
         * ======================================================
         * START THE PAID VERIFICATION ENGINE
         * ======================================================
         *
         * The status endpoint tells us which plan was actually
         * paid for. The Processing page must never guess the plan
         * or default a Professional customer to Essential.
         *
         * Essential      -> Essential engine
         * Professional   -> Professional engine
         * Premium        -> blocked until Premium engine exists
         * ======================================================
         */

        if (selectedPlan === "premium") {
          throw new Error(
            "Premium verification is not yet available in the current verification engine.",
          );
        }

        const verificationEndpoint =
          selectedPlan === "professional"
            ? "/api/verify-document/professional"
            : "/api/verify-document/essential";

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!currentSession?.access_token) {
          throw new Error(
            "Your session could not be verified. Please sign in again.",
          );
        }

        const response =
          await fetch(
            verificationEndpoint,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${currentSession.access_token}`,
              },

              body: JSON.stringify({
                verificationId:
                  verificationIdFromUrl,
              }),

              cache: "no-store",
            },
          );

        let data:
          | {
              success?: boolean;
              error?: string;
              verificationId?: string;
              trustScore?: number;
              confidence?: number;
              risk?: string;
              plan?: string;
            }
          | null =
          null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.error ||
              `${selectedPlan === "professional" ? "Professional" : "Essential"} verification could not be completed.`,
          );
        }

        /*
         * ======================================================
         * SERVER HAS COMPLETED THE AI VERIFICATION
         * ======================================================
         *
         * The API has already saved:
         *
         * status
         * trust_score
         * confidence
         * risk
         * findings
         *
         * Reload the record so the Result page receives the
         * exact final database state.
         * ======================================================
         */

        const completedLoaded =
          await loadVerification(
            verificationIdFromUrl,
          );

        const completedVerification =
          completedLoaded.verification;

        const completedPackage =
          createDocumentPackage(
            completedVerification,
          );

        if (
          completedPackage.length >
          0
        ) {
          setDocumentPackage(
            completedPackage,
          );
        }

        setProgress(100);

        setProcessingStage(
          "complete",
        );

        setProcessingMessage(
          "Verification completed successfully.",
        );

        setProcessingComplete(
          true,
        );

        redirecting.current =
          true;

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              900,
            ),
        );

        if (!cancelled) {
          window.location.href =
            selectedPlan === "professional"
              ? `/professional-report?id=${encodeURIComponent(
                  verificationIdFromUrl,
                )}`
              : `/result?id=${encodeURIComponent(
                  verificationIdFromUrl,
                )}`;
        }
      } catch (
        error
      ) {
        console.error(
          "PROCESSING ERROR:",
          error,
        );

        /*
         * ======================================================
         * IMPORTANT
         * ======================================================
         *
         * If the real Essential API fails:
         *
         * - do NOT create a fake result
         * - do NOT save 0/100
         * - do NOT mark the verification processed
         *
         * Show the actual error instead.
         * ======================================================
         */

        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown verification error.";

          setProcessingStage(
            "failed",
          );

          setErrorMessage(
            message,
          );

          setLoading(false);
        }
      }
    }

    /*
     * ==========================================================
     * RUN REAL VERIFICATION
     * ==========================================================
     */

    void processVerification();

    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    return () => {
      cancelled = true;

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
                      : processingMessage}
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
                state={getVisualStepState(
                  "received",
                  progress,
                  processingComplete,
                )}
                title="Document package received"
                description="Your submitted documents have been securely received."
                status="100%"
              />

              <ProcessingStep
                state={getVisualStepState(
                  "identification",
                  progress,
                  processingComplete,
                )}
                title="Document identification"
                description={
                  documentPackage.length > 0
                    ? `PropertySure AI identified ${packageLabel} during package review.`
                    : "PropertySure AI is identifying and categorizing your documents."
                }
                status="100%"
              />

              <ProcessingStep
                state={getVisualStepState(
                  "analysis",
                  progress,
                  processingComplete,
                )}
                title="Verification analysis"
                description="AI is examining document content, structure and consistency."
                status={
                  processingComplete
                    ? "Complete"
                    : progress >= 22
                      ? "In progress..."
                      : "Pending"
                }
              />

              <ProcessingStep
                state={getVisualStepState(
                  "fraud",
                  progress,
                  processingComplete,
                )}
                title="Fraud & authenticity checks"
                description="Checking for suspicious alterations and inconsistencies."
                status={
                  processingComplete
                    ? "Complete"
                    : progress >= 83
                      ? "Complete"
                      : progress >= 69
                        ? "In progress..."
                        : "Pending"
                }
              />

              <ProcessingStep
                state={getVisualStepState(
                  "report",
                  progress,
                  processingComplete,
                )}
                title="Verification report"
                description="Your verification findings are being prepared."
                status={
                  processingComplete
                    ? "Ready"
                    : progress >= 94
                      ? "In progress..."
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
              ©️ 2026 PropertySure AI. All rights reserved.
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