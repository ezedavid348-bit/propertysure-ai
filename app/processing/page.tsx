"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";
import { supabase } from "../lib/supabase";
import VerificationWorkflow from "../verify/components/VerificationWorkflow";

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

  if (document.name) {
    return document.name;
  }

  return "Property Document";
}

/*
 * ============================================================
 * AUTHENTICATED SESSION
 * ============================================================
 *
 * First try the existing browser session.
 *
 * If Supabase has not restored the session yet, refresh it.
 *
 * A few short retries protect the Processing page from a
 * temporary session-restoration race immediately after payment.
 * ============================================================
 */

async function getAuthenticatedSession() {
  for (
    let attempt = 0;
    attempt < 3;
    attempt += 1
  ) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "PROCESSING GET SESSION ERROR:",
        sessionError,
      );
    }

    if (session?.access_token) {
      return session;
    }

    /*
     * The browser may still be restoring the Supabase session.
     * Give Supabase a chance to refresh it.
     */

    const {
      data: {
        session: refreshedSession,
      },
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.error(
        "PROCESSING SESSION REFRESH ERROR:",
        refreshError,
      );
    }

    if (
      refreshedSession?.access_token
    ) {
      return refreshedSession;
    }

    /*
     * Short delay before another attempt.
     */

    if (attempt < 2) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500,
          ),
      );
    }
  }

  throw new Error(
    "Your session has expired. Please sign in again.",
  );
}

/*
 * ============================================================
 * LOAD VERIFICATION
 * ============================================================
 */

async function loadVerification(
  id: string,
): Promise<{
  verification: VerificationRecord;
  plan: PlanKey | null;
}> {
  const session =
    await getAuthenticatedSession();

  const response =
    await fetch(
      `/api/verify-document/status?id=${encodeURIComponent(
        id,
      )}`,
      {
        method:
          "GET",

        headers: {
          Authorization:
            `Bearer ${session.access_token}`,

          "Cache-Control":
            "no-cache",

          Accept:
            "application/json",
        },

        cache:
          "no-store",
      },
    );

  let payload:
    VerificationStatusResponse =
    {};

  try {
    payload =
      (await response.json()) as VerificationStatusResponse;
  } catch (
    jsonError
  ) {
    console.error(
      "PROCESSING STATUS JSON ERROR:",
      jsonError,
    );
  }

  console.log(
    "PROCESSING STATUS RESPONSE:",
    {
      httpStatus:
        response.status,

      success:
        payload.success,

      verificationId:
        id,

      hasVerification:
        Boolean(
          payload.verification,
        ),

      verificationStatus:
        payload.verification
          ?.status,

      plan:
        payload.plan,

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

      error:
        payload.error,

      message:
        payload.message,
    },
  );

  if (!response.ok) {
    throw new Error(
      payload.error ||
        payload.message ||
        `Verification status request failed (${response.status}).`,
    );
  }

  let verification =
    payload.verification ||
    null;

  /*
   * Fallback for older status API responses.
   */

  if (!verification) {
    console.warn(
      "PROCESSING STATUS FALLBACK: status API returned no verification record; loading the record directly from Supabase.",
    );

    const {
      data:
        directVerification,
      error:
        directVerificationError,
    } =
      await supabase
        .from("verifications")
        .select(
          "id, doc_name, file_url, doc_type, status, trust_score, confidence, risk, findings, created_at",
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (
      directVerificationError
    ) {
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
    verification.findings
      ?.essential?.plan ||
    null;

  const normalizedPlan =
    String(
      rawPlan || "",
    )
      .trim()
      .toLowerCase();

  const plan:
    | PlanKey
    | null =
    normalizedPlan ===
        "essential" ||
    normalizedPlan ===
        "professional" ||
    normalizedPlan ===
        "premium"
      ? normalizedPlan
      : null;

  return {
    verification,
    plan,
  };
}

/*
 * ============================================================
 * PROCESSING HELPERS
 * ============================================================
 */

function getProcessingProgress(
  record: VerificationRecord,
): number {
  const storedProgress =
    record.findings
      ?.processing?.progress;

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
    record.findings
      ?.processing?.stage ||
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
    record.findings
      ?.processing?.message ||
    "PropertySure AI is preparing your verification analysis..."
  );
}

/*
 * ============================================================
 * VISUAL PROCESSING STAGES
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
    if (progress >= 94) {
      return "active";
    }

    return "pending";
  }

  return "pending";
}

/*
 * ============================================================
 * REPORT ROUTING
 * ============================================================
 */

function getReportUrl(
  plan: PlanKey,
  verificationId: string,
): string {
  const encodedId =
    encodeURIComponent(
      verificationId,
    );

  if (plan === "premium") {
    return `/premium-report?id=${encodedId}`;
  }

  if (plan === "professional") {
    return `/professional-report?id=${encodedId}`;
  }

  return `/result?id=${encodedId}`;
}

/*
 * ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function ProcessingPage() {
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
   * PRIMARY DOCUMENT
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

  const packageLabel =
    documentPackage.length ===
    1
      ? "1 document"
      : `${documentPackage.length} documents`;

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

    let cancelled =
      false;

    /*
     * ==========================================================
     * PROGRESS POLLER
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

          if (
            verification.status ===
              "processed" ||
            currentStage ===
              "complete"
          ) {
            setProgress(
              100,
            );

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
           * Polling errors are supplementary.
           * Do not terminate the actual verification request.
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

    /*
     * ==========================================================
     * REAL VERIFICATION
     * ==========================================================
     */

    async function processVerification() {
      try {
        /*
         * LOAD VERIFICATION
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
         * PRESERVE REVIEWED PACKAGE
         */

        const reviewedPackage =
          createDocumentPackage(
            verification,
          );

        setDocumentPackage(
          reviewedPackage,
        );

        /*
         * UPLOAD DATE
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
         * ALREADY PROCESSED
         */

        if (
          verification.status ===
          "processed"
        ) {
          setProgress(
            100,
          );

          setProcessingStage(
            "complete",
          );

          setProcessingMessage(
            "Verification completed successfully.",
          );

          setProcessingComplete(
            true,
          );

          setLoading(
            false,
          );

          redirecting.current =
            true;

          setTimeout(
            () => {
              if (!cancelled) {
                window.location.href =
                  getReportUrl(
                    selectedPlan,
                    verificationIdFromUrl,
                  );
              }
            },
            900,
          );

          return;
        }

        /*
         * FAILED
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
         * INITIAL UI STATE
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

        setLoading(
          false,
        );

        /*
         * START POLLING
         */

        void pollVerification(
          verificationIdFromUrl,
        );

        /*
         * SELECT PAID VERIFICATION ENGINE
         */

        const verificationEndpoint =
          selectedPlan ===
          "premium"
            ? "/api/verify-document/premium"
            : selectedPlan ===
                "professional"
              ? "/api/verify-document/professional"
              : "/api/verify-document/essential";

        /*
         * GET AUTHENTICATED SESSION
         *
         * Use the resilient session helper.
         */

        const currentSession =
          await getAuthenticatedSession();

        /*
         * START SERVER-SIDE VERIFICATION
         */

        const response =
          await fetch(
            verificationEndpoint,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${currentSession.access_token}`,
              },

              body:
                JSON.stringify({
                  verificationId:
                    verificationIdFromUrl,
                }),

              cache:
                "no-store",
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
          const planName =
            selectedPlan ===
            "premium"
              ? "Premium"
              : selectedPlan ===
                  "professional"
                ? "Professional"
                : "Essential";

          throw new Error(
            data?.error ||
              `${planName} verification could not be completed.`,
          );
        }

        /*
         * RELOAD FINAL DATABASE STATE
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

        setProgress(
          100,
        );

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
            getReportUrl(
              selectedPlan,
              verificationIdFromUrl,
            );
        }
      } catch (
        error
      ) {
        console.error(
          "PROCESSING ERROR:",
          error,
        );

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

          setLoading(
            false,
          );
        }
      }
    }

    /*
     * RUN REAL VERIFICATION
     */

    void processVerification();

    /*
     * CLEANUP
     */

    return () => {
      cancelled =
        true;

      redirecting.current =
        true;
    };
  }, []);

  /*
   * ============================================================
   * SHARED PROPERTYSURE AI LOADING SCREEN
   * ============================================================
   *
   * This is intentionally the same loading component used
   * throughout the application.
   *
   * Do not use the old page-specific loading markup here.
   * ============================================================
   */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * ============================================================
   * ERROR SCREEN
   * ============================================================
   */

  if (errorMessage) {
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
              7-STEP VERIFICATION WORKFLOW
              STEP 7 — VERIFICATION
              ================================================== */}

          <VerificationWorkflow
            activeStep={7}
            backHref={
              `/verify/checkout?id=${encodeURIComponent(
                verificationId,
              )}`
            }
            backLabel="Back to Secure Checkout"
            showTopBack={false}
            showBottomActions={false}
            showSecurityNote={false}
          />

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
                  documentPackage.length >
                  0
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
                    : progress >=
                        22
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
                    : progress >=
                        83
                      ? "Complete"
                      : progress >=
                          69
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
                    : progress >=
                        94
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