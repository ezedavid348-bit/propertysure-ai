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
 * PROPERTYSURE AI — PROCESSING PAGE
 * ============================================================
 *
 * Route:
 *
 *   /processing?id=<verificationId>
 *
 * Workflow:
 *
 * 1. Get authenticated Supabase session.
 * 2. Load verification through the status API.
 * 3. Determine the paid verification plan.
 * 4. Start the correct verification engine.
 * 5. Poll the verification status.
 * 6. Show the Processing screen long enough to be visible.
 * 7. Redirect to the correct report.
 *
 * ============================================================
 */

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

  professional?: {
    plan?: string;
    completed_at?: string;
    document_results?: unknown[];
    summary?: string;
  };

  premium?: {
    plan?: string;
    completed_at?: string;
    document_results?: unknown[];
    summary?: string;
  };

  plan?: string;

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

  user_id?: string | null;

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

  created_at?: string | null;
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
 */

async function getAuthenticatedSession() {
  for (
    let attempt = 0;
    attempt < 4;
    attempt += 1
  ) {
    const {
      data: {
        session,
      },
      error,
    } =
      await supabase.auth.getSession();

    if (error) {
      console.error(
        "PROCESSING SESSION ERROR:",
        error,
      );
    }

    if (session?.access_token) {
      return session;
    }

    if (attempt < 3) {
      const {
        data: {
          session:
            refreshedSession,
        },
        error:
          refreshError,
      } =
        await supabase.auth.refreshSession();

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

      await new Promise<void>(
        (resolve) => {
          setTimeout(
            resolve,
            500,
          );
        },
      );
    }
  }

  throw new Error(
    "Your session has expired. Please sign in again.",
  );
}

/*
 * ============================================================
 * NORMALIZE PLAN
 * ============================================================
 */

function normalizePlan(
  value: unknown,
): PlanKey | null {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "essential" ||
    normalized === "professional" ||
    normalized === "premium"
  ) {
    return normalized;
  }

  return null;
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
  payment:
    | VerificationStatusPayment
    | null;
}> {
  const session =
    await getAuthenticatedSession();

  const response =
    await fetch(
      `/api/verify-document/status?id=${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${session.access_token}`,

          Accept:
            "application/json",

          "Cache-Control":
            "no-cache",
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
  } catch (error) {
    console.error(
      "PROCESSING STATUS RESPONSE JSON ERROR:",
      error,
    );
  }

  console.log(
    "PROCESSING STATUS RESPONSE:",
    {
      verificationId:
        id,

      httpStatus:
        response.status,

      success:
        payload.success,

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

      error:
        payload.error,

      message:
        payload.message,
    },
  );

  if (
    !response.ok ||
    !payload.verification
  ) {
    throw new Error(
      payload.error ||
        payload.message ||
        "Verification status could not be loaded.",
    );
  }

  const verification =
    payload.verification;

  /*
   * Determine the plan from the server response.
   *
   * Priority:
   *
   * 1. status API plan
   * 2. payment plan
   * 3. premium findings
   * 4. professional findings
   * 5. essential findings
   * 6. general findings plan
   */

  const plan: PlanKey | null =
    normalizePlan(
      payload.plan ||
        payload.payment?.plan ||
        verification
          .findings
          ?.premium
          ?.plan ||
        verification
          .findings
          ?.professional
          ?.plan ||
        verification
          .findings
          ?.essential
          ?.plan ||
        verification
          .findings
          ?.plan,
    );

  return {
    verification,

    plan,

    payment:
      payload.payment ||
      null,
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

  switch (plan) {
    case "premium":
      return `/premium-report?id=${encodedId}`;

    case "professional":
      return `/professional-report?id=${encodedId}`;

    case "essential":
    default:
      return `/result?id=${encodedId}`;
  }
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

  const started =
    useRef(false);

  const redirecting =
    useRef(false);

  /*
   * ----------------------------------------------------------
   * IMPORTANT:
   *
   * The Processing page must remain visible for at least
   * 3 seconds before redirecting to a completed report.
   *
   * This prevents a completed verification from appearing
   * to skip the Processing page completely.
   * ----------------------------------------------------------
   */

  const processingScreenShownAt =
    useRef<number | null>(null);

  const minimumProcessingDisplayMs =
    3000;

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
    documentPackage.length === 1
      ? "1 document"
      : `${documentPackage.length} documents`;

  /*
   * ============================================================
   * PROCESSING SCREEN TIMING
   * ============================================================
   */

  function showProcessingScreen() {
    if (
      processingScreenShownAt.current ===
      null
    ) {
      processingScreenShownAt.current =
        Date.now();
    }

    setLoading(false);
  }

  async function waitForMinimumProcessingDisplay() {
    const shownAt =
      processingScreenShownAt.current;

    if (shownAt === null) {
      return;
    }

    const elapsed =
      Date.now() - shownAt;

    const remaining =
      minimumProcessingDisplayMs -
      elapsed;

    if (remaining > 0) {
      await new Promise<void>(
        (resolve) => {
          setTimeout(
            resolve,
            remaining,
          );
        },
      );
    }
  }

  /*
   * ============================================================
   * MAIN WORKFLOW
   * ============================================================
   */

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    let cancelled = false;

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const id =
      params.get("id");

    /*
     * ----------------------------------------------------------
     * VERIFY ID
     * ----------------------------------------------------------
     */

    if (!id) {
      window.location.href =
        "/verify";

      return;
    }

    const verificationIdValue: string =
      id;

    setVerificationId(
      verificationIdValue,
    );

    /*
     * ----------------------------------------------------------
     * APPLY VERIFICATION STATE
     * ----------------------------------------------------------
     */

    function applyVerificationState(
      verification: VerificationRecord,
    ) {
      const packageItems =
        createDocumentPackage(
          verification,
        );

      if (
        packageItems.length > 0
      ) {
        setDocumentPackage(
          packageItems,
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
    }

    /*
     * ----------------------------------------------------------
     * POLL VERIFICATION
     * ----------------------------------------------------------
     */

    async function pollVerification() {
      while (!cancelled) {
        try {
          const loaded =
            await loadVerification(
              verificationIdValue,
            );

          if (cancelled) {
            return;
          }

          const verification =
            loaded.verification;

          applyVerificationState(
            verification,
          );

          const currentStage =
            getProcessingStage(
              verification,
            );

          /*
           * If the verification completes during polling,
           * show the completed state but DO NOT immediately
           * redirect.
           *
           * The redirect is handled centrally after the
           * minimum display time.
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

            showProcessingScreen();

            return;
          }

          if (
            verification.status ===
              "failed" ||
            currentStage ===
              "failed"
          ) {
            setProcessingStage(
              "failed",
            );

            setLoading(false);

            return;
          }

          await new Promise<void>(
            (resolve) => {
              setTimeout(
                resolve,
                1200,
              );
            },
          );
        } catch (error) {
          console.error(
            "PROCESSING POLL ERROR:",
            error,
          );

          await new Promise<void>(
            (resolve) => {
              setTimeout(
                resolve,
                1500,
              );
            },
          );
        }
      }
    }

    /*
     * ----------------------------------------------------------
     * START VERIFICATION
     * ----------------------------------------------------------
     */

    async function processVerification() {
      try {
        /*
         * ------------------------------------------------------
         * LOAD INITIAL VERIFICATION
         * ------------------------------------------------------
         */

        const loaded =
          await loadVerification(
            verificationIdValue,
          );

        if (cancelled) {
          return;
        }

        const verification =
          loaded.verification;

        /*
         * ------------------------------------------------------
         * DETERMINE PLAN
         * ------------------------------------------------------
         */

        const selectedPlan:
          | PlanKey
          | null =
          loaded.plan;

        if (
          selectedPlan ===
          null
        ) {
          throw new Error(
            "The paid verification plan could not be determined.",
          );
        }

        const verifiedPlan:
          PlanKey =
          selectedPlan;

        /*
         * ------------------------------------------------------
         * INITIAL STATE
         * ------------------------------------------------------
         */

        applyVerificationState(
          verification,
        );

        /*
         * ------------------------------------------------------
         * ALREADY COMPLETE
         * ------------------------------------------------------
         *
         * This is the important fix.
         *
         * Previously, an already-processed verification could
         * redirect after only 900ms.
         *
         * Now the Processing page becomes visible first and
         * remains visible for at least 3 seconds.
         * ------------------------------------------------------
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

          showProcessingScreen();

          await waitForMinimumProcessingDisplay();

          if (
            cancelled ||
            redirecting.current
          ) {
            return;
          }

          redirecting.current =
            true;

          window.location.href =
            getReportUrl(
              verifiedPlan,
              verificationIdValue,
            );

          return;
        }

        /*
         * ------------------------------------------------------
         * ALREADY FAILED
         * ------------------------------------------------------
         */

        if (
          verification.status ===
          "failed"
        ) {
          throw new Error(
            verification
              .findings
              ?.processing
              ?.message ||
              "The verification could not be completed.",
          );
        }

        /*
         * ------------------------------------------------------
         * SHOW PROCESSING PAGE
         * ------------------------------------------------------
         *
         * From this point onward, the actual Processing UI
         * becomes visible while the verification engine runs.
         * ------------------------------------------------------
         */

        setProgress(
          Math.max(
            8,
            getProcessingProgress(
              verification,
            ),
          ),
        );

        showProcessingScreen();

        /*
         * ------------------------------------------------------
         * START POLLING
         * ------------------------------------------------------
         */

        void pollVerification();

        /*
         * ------------------------------------------------------
         * SELECT ENGINE
         * ------------------------------------------------------
         */

        const endpoint =
          verifiedPlan ===
          "premium"
            ? "/api/verify-document/premium"
            : verifiedPlan ===
                "professional"
              ? "/api/verify-document/professional"
              : "/api/verify-document/essential";

        /*
         * ------------------------------------------------------
         * GET CURRENT AUTHENTICATED SESSION
         * ------------------------------------------------------
         */

        const session =
          await getAuthenticatedSession();

        if (cancelled) {
          return;
        }

        /*
         * ------------------------------------------------------
         * START SERVER VERIFICATION
         * ------------------------------------------------------
         */

        const response =
          await fetch(
            endpoint,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                JSON.stringify({
                  verificationId:
                    verificationIdValue,
                }),

              cache:
                "no-store",
            },
          );

        let result:
          | {
              success?: boolean;
              error?: string;
              message?: string;
              verificationId?: string;
              trustScore?: number;
              confidence?: number;
              risk?: string;
              plan?: string;
            }
          | null =
          null;

        try {
          result =
            (await response.json()) as {
              success?: boolean;
              error?: string;
              message?: string;
              verificationId?: string;
              trustScore?: number;
              confidence?: number;
              risk?: string;
              plan?: string;
            };
        } catch {
          result = null;
        }

        console.log(
          "PROCESSING ENGINE RESPONSE:",
          {
            endpoint,

            verificationId:
              verificationIdValue,

            httpStatus:
              response.status,

            success:
              result?.success,

            error:
              result?.error,

            message:
              result?.message,
          },
        );

        if (
          !response.ok ||
          !result?.success
        ) {
          const planName =
            verifiedPlan ===
            "premium"
              ? "Premium"
              : verifiedPlan ===
                  "professional"
                ? "Professional"
                : "Essential";

          throw new Error(
            result?.error ||
              result?.message ||
              `${planName} verification could not be completed.`,
          );
        }

        /*
         * ------------------------------------------------------
         * RELOAD FINAL STATE
         * ------------------------------------------------------
         */

        const completed =
          await loadVerification(
            verificationIdValue,
          );

        if (cancelled) {
          return;
        }

        applyVerificationState(
          completed.verification,
        );

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

        showProcessingScreen();

        /*
         * ------------------------------------------------------
         * WAIT BEFORE REDIRECT
         * ------------------------------------------------------
         *
         * The Processing page must remain visible for at least
         * 3 seconds from the moment it was first displayed.
         * ------------------------------------------------------
         */

        await waitForMinimumProcessingDisplay();

        if (
          cancelled ||
          redirecting.current
        ) {
          return;
        }

        redirecting.current =
          true;

        window.location.href =
          getReportUrl(
            verifiedPlan,
            verificationIdValue,
          );
      } catch (error) {
        console.error(
          "PROCESSING ERROR:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unknown verification error.",
          );

          setProcessingStage(
            "failed",
          );

          setLoading(false);
        }
      }
    }

    void processVerification();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * ============================================================
   * ERROR
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
   * MAIN PROCESSING PAGE
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

          <section
            className={
              styles.hero
            }
          >
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
 * PROCESSING STEP
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
 * FEATURE CARD
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