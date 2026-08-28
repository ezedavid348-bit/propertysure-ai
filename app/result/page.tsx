"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type VerificationRecord = {
  id: string;

  doc_name?: string;

  file_url?: string;

  status?: string;

  trust_score?: number;

  confidence?: number;

  risk?: string;

  findings?: {
    document_package?: {
      name: string;
      path: string;
      type: string;
    }[];

    document_count?: number;

    checks?: {
      documentStructure?: boolean;
      dataConsistency?: boolean;
      signatureValid?: boolean;
      stampValid?: boolean;
      noForgery?: boolean;
      noDuplicate?: boolean;
      documentCompleteness?: boolean;
    };
  };

  doc_type?: string;

  created_at?: string;
};

type CheckStatus =
  | "passed"
  | "review"
  | "not_assessed";

type CheckItem = {
  title: string;
  description: string;
  status: CheckStatus;
};

type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "incomplete";

/*
 * ============================================================
 * SMALL SVG ICONS
 * ============================================================
 */

function ShieldIcon({
  size = 28,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4L39 10V21C39 31.5 32.8 39.2 24 44C15.2 39.2 9 31.5 9 21V10L24 4Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M24 6L37 11.2V21C37 30.3 31.6 37.1 24 41.5C16.4 37.1 11 30.3 11 21V11.2L24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M17.5 24L22 28.5L31 19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon({
  size = 28,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 5H29L37 13V42H13V5Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M13 5H29L37 13V42H13V5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M29 5V14H37"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 22H31M19 28H31M19 34H27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlertDocumentIcon({
  size = 56,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 7H39L49 17V48H16V7Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M16 7H39L49 17V48H16V7Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M39 7V18H49"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M32.5 25V35"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        cx="32.5"
        cy="41"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="47"
        cy="45"
        r="10"
        fill="currentColor"
      />
      <path
        d="M47 40V46"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="47"
        cy="50"
        r="1.4"
        fill="white"
      />
    </svg>
  );
}

function CheckCircleIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 12L10.7 14.7L16.5 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3L21 20H3L12 3Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M12 3L21 20H3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="16.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function InfoIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 10V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="7"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function BellIcon({
  size = 21,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 9C18 5.7 15.8 3 12 3C8.2 3 6 5.7 6 9C6 15 3.8 17 3.8 17H20.2C20.2 17 18 15 18 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20C10.1 20.7 11 21 12 21C13 21 13.9 20.7 14.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5L12 4L20 10.5V20H4V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 20V14H15V20"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ReportIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 8H16M8 12H16M8 16H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PropertyIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20V10L12 4L20 10V20H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 20V14H15V20"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UserIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20C5.8 16.5 8.2 14.5 12 14.5C15.8 14.5 18.2 16.5 19 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19 13.5L21 15L19 18L16.7 17.3C16 18 15.2 18.5 14.2 18.8L13.5 21H10L9.3 18.8C8.3 18.5 7.5 18 6.8 17.3L4.5 18L2.5 15L4.5 13.5C4.3 13 4.2 12.5 4.2 12C4.2 11.5 4.3 11 4.5 10.5L2.5 9L4.5 6L6.8 6.7C7.5 6 8.3 5.5 9.3 5.2L10 3H13.5L14.2 5.2C15.2 5.5 16 6 16.7 6.7L19 6L21 9L19 10.5C19.2 11 19.3 11.5 19.3 12C19.3 12.5 19.2 13 19 13.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 11L12 15L16 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShareIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="18"
        cy="5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="6"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="19"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.3 10.8L15.7 6.3M8.3 13.2L15.7 17.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PlusIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/*
 * ============================================================
 * HERO ILLUSTRATION
 * ============================================================
 */

function HeroIllustration() {
  return (
    <div className="heroIllustration" aria-hidden="true">
      <div className="heroGlow heroGlowOne" />
      <div className="heroGlow heroGlowTwo" />

      <div className="heroClipboard">
        <div className="clipboardTop" />

        <div className="clipboardSheet">
          <div className="sheetTitle" />
          <div className="sheetLine long" />
          <div className="sheetLine medium" />
          <div className="sheetCheck">
            <span>✓</span>
            <i />
          </div>
          <div className="sheetCheck">
            <span>✓</span>
            <i />
          </div>
          <div className="sheetCheck">
            <span>!</span>
            <i />
          </div>
        </div>

        <div className="magnifier">
          <div />
        </div>
      </div>

      <div className="heroBars">
        <span />
        <span />
        <span />
      </div>

      <div className="heroAlert">
        <WarningIcon size={19} />
      </div>
    </div>
  );
}

/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function ResultPage() {
  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [verification, setVerification] =
    useState<VerificationRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * LOAD VERIFICATION
   * ============================================================
   */

  useEffect(() => {
    async function loadVerification() {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const verificationId =
          params.get("id");

        if (!verificationId) {
          setError(
            "Verification record was not found."
          );

          setLoading(false);

          return;
        }

        /*
         * AUTHENTICATION
         */

        const {
          data: { user },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError || !user) {
          window.location.href =
            "/signin";

          return;
        }

        /*
         * LOAD VERIFICATION
         */

        const {
          data,
          error: verificationError,
        } =
          await supabase
            .from("verifications")
            .select("*")
            .eq(
              "id",
              verificationId
            )
            .single();

        if (
          verificationError ||
          !data
        ) {
          console.error(
            "RESULT PAGE ERROR:",
            verificationError
          );

          setError(
            "We could not load this verification result."
          );

          setLoading(false);

          return;
        }

        setVerification(
          data as VerificationRecord
        );

        setLoading(false);
      } catch (err) {
        console.error(
          "RESULT LOAD ERROR:",
          err
        );

        setError(
          "Something went wrong while loading the result."
        );

        setLoading(false);
      }
    }

    loadVerification();
  }, []);

  /*
   * ============================================================
   * LOADING PAGE
   * ============================================================
   */

  if (loading) {
    return (
      <main className="statePage">
        <div className="loadingSpinner" />

        <h2>
          Loading Verification Result
        </h2>

        <p>
          Please wait while we retrieve
          your PropertySure AI report.
        </p>

        <style jsx>{`
          .statePage {
            min-height: 100vh;
            background: #f6f9fe;
            color: #12264a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .loadingSpinner {
            width: 46px;
            height: 46px;
            border: 4px solid #dcecff;
            border-top-color: #1268f3;
            border-radius: 50%;
            animation:
              spin 0.8s linear infinite;
            margin-bottom: 20px;
          }

          h2 {
            margin: 0;
            font-size: 21px;
          }

          p {
            max-width: 340px;
            color: #71809a;
            font-size: 14px;
            line-height: 1.6;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR PAGE
   * ============================================================
   */

  if (
    error ||
    !verification
  ) {
    return (
      <main className="statePage">
        <div className="errorIcon">
          !
        </div>

        <h2>
          Result Unavailable
        </h2>

        <p>
          {error ||
            "This verification result could not be found."}
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
        >
          Back to Dashboard
        </button>

        <style jsx>{`
          .statePage {
            min-height: 100vh;
            background: #f6f9fe;
            color: #12264a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .errorIcon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #fff0f0;
            color: #e53935;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 29px;
            font-weight: 800;
            margin-bottom: 18px;
          }

          h2 {
            margin: 0 0 8px;
          }

          p {
            max-width: 350px;
            color: #718096;
            line-height: 1.6;
          }

          button {
            margin-top: 15px;
            padding: 13px 22px;
            border: none;
            border-radius: 9px;
            background: #1268f3;
            color: white;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  /*
   * ============================================================
   * VERIFICATION DATA
   * ============================================================
   */

  const trustScore =
    typeof verification.trust_score ===
    "number"
      ? Math.max(
          0,
          Math.min(
            100,
            verification.trust_score
          )
        )
      : 0;

  const confidence =
    typeof verification.confidence ===
    "number"
      ? Math.max(
          0,
          Math.min(
            100,
            verification.confidence
          )
        )
      : 0;

  const checks =
    verification.findings?.checks || {};

  /*
   * ============================================================
   * CHECK STATUS
   * ============================================================
   */

  function getCheckStatus(
    value: boolean | undefined
  ): CheckStatus {
    if (value === true) {
      return "passed";
    }

    if (value === false) {
      return "review";
    }

    return "not_assessed";
  }

  /*
   * ============================================================
   * SEVEN BASIC AI CHECKS
   * ============================================================
   */

  const checkItems: CheckItem[] = [
    {
      title:
        "Document Authenticity",

      description:
        "Checks the submitted document structure and authenticity indicators.",

      status:
        getCheckStatus(
          checks.documentStructure
        ),
    },

    {
      title:
        "Forgery & Manipulation Detection",

      description:
        "Looks for signs of alteration, tampering or suspicious modification.",

      status:
        getCheckStatus(
          checks.noForgery
        ),
    },

    {
      title:
        "Data Consistency",

      description:
        "Checks whether important information within the document is consistent.",

      status:
        getCheckStatus(
          checks.dataConsistency
        ),
    },

    {
      title:
        "Signature Analysis",

      description:
        "Reviews visible signatures and authentication marks within the document.",

      status:
        getCheckStatus(
          checks.signatureValid
        ),
    },

    {
      title:
        "Stamp & Seal Validation",

      description:
        "Reviews visible stamps, seals and related document indicators.",

      status:
        getCheckStatus(
          checks.stampValid
        ),
    },

    {
      title:
        "Duplicate Detection",

      description:
        "Checks for duplicate or repeated document indicators.",

      status:
        getCheckStatus(
          checks.noDuplicate
        ),
    },

    {
      title:
        "Document Completeness",

      description:
        "Checks whether the submitted document package is complete for this verification.",

      status:
        getCheckStatus(
          checks.documentCompleteness
        ),
    },
  ];

  /*
   * ============================================================
   * DYNAMIC CHECK COUNTS
   * ============================================================
   */

  const passedChecks =
    checkItems.filter(
      (item) =>
        item.status === "passed"
    ).length;

  const reviewChecks =
    checkItems.filter(
      (item) =>
        item.status === "review"
    ).length;

  const notAssessedChecks =
    checkItems.filter(
      (item) =>
        item.status ===
        "not_assessed"
    ).length;

  const totalChecks =
    checkItems.length;

  /*
   * ============================================================
   * ANALYSIS STATE
   * ============================================================
   */

  const allChecksAssessed =
    notAssessedChecks === 0;

  const noChecksAssessed =
    passedChecks === 0 &&
    reviewChecks === 0 &&
    notAssessedChecks ===
      totalChecks;

  /*
   * ============================================================
   * DATABASE RISK NORMALIZATION
   * ============================================================
   */

  function normalizeRisk(
    value: string | undefined
  ):
    | "low"
    | "medium"
    | "high"
    | null {
    if (!value) {
      return null;
    }

    const normalized =
      value
        .toLowerCase()
        .trim();

    if (
      normalized.includes("high")
    ) {
      return "high";
    }

    if (
      normalized.includes(
        "medium"
      ) ||
      normalized.includes(
        "moderate"
      )
    ) {
      return "medium";
    }

    if (
      normalized.includes("low")
    ) {
      return "low";
    }

    return null;
  }

  const databaseRisk =
    normalizeRisk(
      verification.risk
    );

  /*
   * ============================================================
   * DYNAMIC RISK ENGINE
   * ============================================================
   */

  let riskLevel: RiskLevel;

  if (noChecksAssessed) {
    riskLevel = "incomplete";
  } else if (
    databaseRisk === "high"
  ) {
    riskLevel = "high";
  } else if (
    reviewChecks > 0
  ) {
    riskLevel = "medium";
  } else if (
    databaseRisk === "medium"
  ) {
    riskLevel = "medium";
  } else if (
    allChecksAssessed &&
    passedChecks === totalChecks
  ) {
    riskLevel = "low";
  } else {
    riskLevel = "incomplete";
  }

  /*
   * ============================================================
   * DISPLAY VALUES
   * ============================================================
   */

  const riskTitle =
    riskLevel === "high"
      ? "HIGH RISK"
      : riskLevel === "medium"
      ? "MEDIUM RISK"
      : riskLevel === "low"
      ? "LOW RISK"
      : "ANALYSIS INCOMPLETE";

  const riskShort =
    riskLevel === "high"
      ? "HIGH"
      : riskLevel === "medium"
      ? "MEDIUM"
      : riskLevel === "low"
      ? "LOW"
      : "INCOMPLETE";

  const riskIcon =
    riskLevel === "low"
      ? "✓"
      : riskLevel === "incomplete"
      ? "i"
      : "!";

  const displayTrustScore =
    noChecksAssessed
      ? 0
      : trustScore;

  const displayConfidence =
    noChecksAssessed
      ? 0
      : confidence;

  /*
   * ============================================================
   * RISK DESCRIPTION
   * ============================================================
   */

  let riskDescription = "";

  if (riskLevel === "high") {
    riskDescription =
      "Significant risk indicators were identified during the verification checks. Do not proceed with the transaction until further due-diligence is completed.";
  } else if (
    riskLevel === "medium"
  ) {
    riskDescription =
      "One or more risk indicators were identified during the verification checks. Further due-diligence is recommended before proceeding with the transaction.";
  } else if (
    riskLevel === "low"
  ) {
    riskDescription =
      "All Basic AI checks were assessed and no major risk indicators were identified.";
  } else {
    riskDescription =
      "The Basic AI analysis is incomplete because the verification checks have not yet produced sufficient results to determine a risk level.";
  }

  /*
   * ============================================================
   * STATUS PILL
   * ============================================================
   */

  let statusText = "";

  if (riskLevel === "high") {
    statusText =
      "HIGH RISK — DO NOT PROCEED";
  } else if (
    riskLevel === "medium"
  ) {
    statusText =
      "REVIEW RECOMMENDED";
  } else if (
    riskLevel === "low"
  ) {
    statusText =
      "VERIFICATION PASSED";
  } else {
    statusText =
      "ANALYSIS INCOMPLETE";
  }

  /*
   * ============================================================
   * SUMMARY
   * ============================================================
   */

  let summary = "";

  if (riskLevel === "high") {
    summary =
      `PropertySure AI analyzed your submitted property document package. ${reviewChecks} ${
        reviewChecks === 1
          ? "check requires"
          : "checks require"
      } further review. Significant risk indicators were identified, so additional due-diligence is required before proceeding with the transaction.`;
  } else if (
    riskLevel === "medium"
  ) {
    summary =
      `PropertySure AI analyzed your submitted property document package. ${passedChecks} of ${totalChecks} Basic AI checks passed, while ${reviewChecks} ${
        reviewChecks === 1
          ? "check requires"
          : "checks require"
      } further review${
        notAssessedChecks > 0
          ? ` and ${notAssessedChecks} ${
              notAssessedChecks === 1
                ? "check was"
                : "checks were"
            } not assessed`
          : ""
      }. Further due-diligence is recommended before proceeding with the transaction.`;
  } else if (
    riskLevel === "low"
  ) {
    summary =
      `PropertySure AI analyzed your submitted property document package. All ${totalChecks} Basic AI checks were assessed and passed. No major risk indicators were identified in the Basic AI analysis.`;
  } else {
    summary =
      `PropertySure AI analyzed your submitted property document package, but the Basic AI checks have not yet produced sufficient results to determine a risk level. No risk conclusion should be relied upon until the analysis is completed.`;
  }

  const assessmentText =
    riskTitle;

  /*
   * ============================================================
   * RECOMMENDATION
   * ============================================================
   */

  let recommendationTitle =
    "RECOMMENDED NEXT STEP";

  let recommendationText = "";

  if (riskLevel === "high") {
    recommendationText =
      "Significant risk indicators were identified. Do not make payment or proceed with the transaction based on this Basic AI result. We recommend Premium Verification for deeper due-diligence, including professional legal review where applicable, together with appropriate official verification.";
  } else if (
    riskLevel === "medium"
  ) {
    recommendationText =
      "Risk indicators were identified during the Basic AI checks. Before making payment or proceeding with the transaction, we recommend Professional Verification for additional official Ministry or registry verification of the property's title and ownership records.";
  } else if (
    riskLevel === "low"
  ) {
    recommendationText =
      "All Basic AI checks were assessed without major risk indicators. However, Basic Verification does not replace official title searches or professional due-diligence. Confirm the property's title and ownership through appropriate official searches before making a payment.";
  } else {
    recommendationText =
      "The Basic AI analysis is incomplete. Do not rely on this result as a Low, Medium or High Risk conclusion until the verification checks have been completed.";
  }

  const recommendationStatus =
    riskLevel === "high"
      ? "high"
      : riskLevel === "medium"
      ? "review"
      : riskLevel === "low"
      ? "passed"
      : "not_assessed";

  /*
   * ============================================================
   * VERIFIED DATE
   * ============================================================
   */

  const verifiedDate =
    verification.created_at
      ? new Date(
          verification.created_at
        ).toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Not available";

  /*
   * ============================================================
   * DOCUMENT COUNT
   * ============================================================
   */

  const documentCount =
    verification.findings
      ?.document_count ??
    verification.findings
      ?.document_package?.length ??
    0;

  /*
   * ============================================================
   * SHARE REPORT
   * ============================================================
   */

  async function shareReport() {
    const shareData = {
      title:
        "PropertySure AI Verification Result",

      text:
        `PropertySure AI result: ${riskTitle}. Trust Score: ${displayTrustScore}/100.`,

      url:
        window.location.href,
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        );

        return;
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Verification link copied."
        );
      }
    } catch (shareError) {
      console.error(
        "SHARE ERROR:",
        shareError
      );
    }
  }

  /*
   * ============================================================
   * DOWNLOAD PDF
   * ============================================================
   */

  function downloadReport() {
    window.open(
      `/api/report?id=${encodeURIComponent(
        verification.id
      )}`,
      "_blank"
    );
  }

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  function goTo(
    path: string
  ) {
    window.location.href = path;
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main className="resultPage">
      {/* ======================================================
          DESKTOP SIDEBAR
          ====================================================== */}

      <aside className="desktopSidebar">
        <button
          type="button"
          className="sidebarBrand"
          onClick={() =>
            goTo("/dashboard")
          }
        >
          <span className="brandMark">
            ◆
          </span>

          <span>
            PropertySure{" "}
            <strong>AI</strong>
          </span>
        </button>

        <button
          type="button"
          className="newVerificationButton"
          onClick={() =>
            goTo("/verify")
          }
        >
          <PlusIcon size={17} />
          New Verification
        </button>

        <nav className="sidebarNav">
          <button
            type="button"
            onClick={() =>
              goTo("/dashboard")
            }
          >
            <HomeIcon />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="sidebarActive"
            onClick={() =>
              goTo("/reports")
            }
          >
            <ReportIcon />
            <span>Verifications</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/properties")
            }
          >
            <PropertyIcon />
            <span>Properties</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/reports")
            }
          >
            <ReportIcon />
            <span>Reports</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/fraud-watch")
            }
          >
            <WarningIcon size={17} />
            <span>Watchlist</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/properties")
            }
          >
            <span className="simpleHeart">
              ♡
            </span>
            <span>Favorites</span>
          </button>
        </nav>

        <div className="sidebarSectionLabel">
          ACCOUNT
        </div>

        <nav className="sidebarNav accountNav">
          <button
            type="button"
            onClick={() =>
              goTo("/account")
            }
          >
            <UserIcon />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/account")
            }
          >
            <span className="simpleCard">
              ▱
            </span>
            <span>Subscription</span>
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/account")
            }
          >
            <span className="simpleCard">
              ▣
            </span>
            <span>Billing</span>
          </button>

          <button
            type="button"
            className="sidebarSettingsActive"
            onClick={() =>
              goTo("/settings")
            }
          >
            <SettingsIcon />
            <span>Settings</span>
            <span className="settingsChevron">
              ⌃
            </span>
          </button>

          <div className="settingsSubNav">
            <button type="button">
              Account Settings
            </button>

            <button type="button">
              Security
            </button>

            <button type="button">
              Notification
            </button>

            <button type="button">
              Team Management
            </button>

            <button type="button">
              Plans & Limits
            </button>

            <button type="button">
              Integrations
            </button>

            <button type="button">
              Documents & Data
            </button>
          </div>
        </nav>

        <div className="sidebarBottom">
          <button
            type="button"
            onClick={() =>
              goTo("/contact")
            }
          >
            <InfoIcon size={17} />
            Help & Support
          </button>

          <button
            type="button"
            onClick={() =>
              goTo("/signin")
            }
          >
            <span className="logoutIcon">
              ↪
            </span>
            Logout
          </button>
        </div>

        <div className="expertCard">
          <div className="expertIllustration">
            ◉
          </div>

          <strong>
            Need Professional Help?
          </strong>

          <p>
            Talk to our property
            verification experts for
            complex cases.
          </p>

          <button
            type="button"
            onClick={() =>
              goTo("/contact")
            }
          >
            Contact an Expert
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN AREA
          ====================================================== */}

      <div className="mainArea">
        {/* ====================================================
            HEADER
            ==================================================== */}

        <header className="topHeader">
          <div className="mobileBrand">
            <span className="brandMark">
              ◆
            </span>

            <span>
              PropertySure{" "}
              <strong>AI</strong>
            </span>
          </div>

          <div className="desktopBreadcrumb">
            <button
              type="button"
              onClick={() =>
                goTo("/dashboard")
              }
            >
              Home
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={() =>
                goTo("/reports")
              }
            >
              Verifications
            </button>

            <span>›</span>

            <strong>Result</strong>
          </div>

          <div className="headerRight">
            <button
              type="button"
              className="notificationButton"
              aria-label="Notifications"
              onClick={() =>
                goTo("/notifications")
              }
            >
              <BellIcon />
              <span className="notificationDot" />
            </button>

            <div className="userSummary">
              <div>
                <strong>
                  Eze Ifebu David
                </strong>

                <span>
                  Premium Plan
                </span>
              </div>

              <div className="avatar">
                ED
              </div>
            </div>
          </div>
        </header>

        {/* ====================================================
            MOBILE BREADCRUMB
            ==================================================== */}

        <div className="mobileBreadcrumb">
          <button
            type="button"
            onClick={() =>
              goTo("/dashboard")
            }
          >
            Home
          </button>

          <span>›</span>

          <button
            type="button"
            onClick={() =>
              goTo("/reports")
            }
          >
            Verifications
          </button>

          <span>›</span>

          <strong>
            Result
          </strong>
        </div>

        <div className="content">
          {/* ==================================================
              HERO
              ================================================== */}

          <section
            className={`resultHero ${riskLevel}`}
          >
            <div className="resultHeroIcon">
              {riskLevel === "incomplete" ? (
                <AlertDocumentIcon size={60} />
              ) : riskLevel === "low" ? (
                <ShieldIcon size={60} />
              ) : (
                <WarningIcon size={54} />
              )}
            </div>

            <div className="resultHeroContent">
              <span className="eyebrow">
                PROPERTY VERIFICATION RESULT
              </span>

              <h1>
                {riskLevel ===
                "incomplete"
                  ? "Analysis Incomplete"
                  : riskLevel === "high"
                  ? "High Risk"
                  : riskLevel ===
                    "medium"
                  ? "Medium Risk"
                  : "Low Risk"}
              </h1>

              <div className="statusPill">
                <span>
                  {riskIcon}
                </span>

                {statusText}
              </div>

              <p>
                {riskDescription}
              </p>
            </div>

            <HeroIllustration />
          </section>

          {/* ==================================================
              PRIMARY GRID
              ================================================== */}

          <div className="primaryGrid">
            {/* ==================================================
                LEFT COLUMN
                ================================================== */}

            <div className="leftColumn">
              {/* ==================================================
                  RESULT SUMMARY
                  ================================================== */}

              <section className="card summaryCard">
                <div className="sectionHeader">
                  <div className="sectionHeaderIcon blueIcon">
                    <DocumentIcon size={19} />
                  </div>

                  <div>
                    <h2>
                      RESULT SUMMARY
                    </h2>
                  </div>
                </div>

                <p className="summaryText">
                  {summary}
                </p>

                <div className="assessment">
                  Overall assessment:
                  <strong
                    className={`assessment-${riskLevel}`}
                  >
                    {" "}
                    {assessmentText}
                  </strong>
                </div>
              </section>

              {/* ==================================================
                  QUICK RESULT
                  ================================================== */}

              <section className="card quickResultCard">
                <div className="cardTopLine">
                  <div>
                    <h2>
                      QUICK RESULT
                    </h2>
                  </div>

                  <span className="verificationType">
                    Basic AI Verification
                  </span>
                </div>

                <div className="quickGrid">
                  <div className="quickItem">
                    <span>Risk</span>

                    <strong
                      className={`riskValue ${riskLevel}`}
                    >
                      {riskShort}
                    </strong>

                    <div
                      className={`quickIcon ${riskLevel}`}
                    >
                      {riskLevel ===
                      "incomplete" ? (
                        <WarningIcon
                          size={16}
                        />
                      ) : riskLevel ===
                        "low" ? (
                        <CheckCircleIcon
                          size={16}
                        />
                      ) : (
                        <WarningIcon
                          size={16}
                        />
                      )}
                    </div>
                  </div>

                  <div className="quickItem">
                    <span>
                      Trust Score
                    </span>

                    <strong className="blueValue">
                      {displayTrustScore}
                      /100
                    </strong>

                    <div className="quickIcon blue">
                      <ShieldIcon
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="quickItem">
                    <span>
                      Confidence
                    </span>

                    <strong className="blueValue">
                      {displayConfidence}%
                    </strong>

                    <div className="confidenceBars">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="quickItem">
                    <span>
                      Checks Passed
                    </span>

                    <strong
                      className={
                        reviewChecks >
                          0 ||
                        notAssessedChecks >
                          0
                          ? "orangeValue"
                          : "greenValue"
                      }
                    >
                      {passedChecks}/
                      {totalChecks}
                    </strong>

                    <div className="quickIcon neutral">
                      <CheckCircleIcon
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  WHAT WE CHECKED
                  ================================================== */}

              <section className="card checksCard">
                <div className="checksHeader">
                  <div>
                    <h2>
                      WHAT WE CHECKED
                    </h2>

                    <p>
                      Basic AI document
                      verification
                    </p>
                  </div>
                </div>

                <div className="checksList">
                  {checkItems.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="checkRow"
                        key={`${item.title}-${index}`}
                      >
                        <div
                          className={`checkStatus ${item.status}`}
                        >
                          {item.status ===
                          "passed" ? (
                            <CheckCircleIcon
                              size={20}
                            />
                          ) : item.status ===
                            "review" ? (
                            <WarningIcon
                              size={20}
                            />
                          ) : (
                            <PlusIcon
                              size={18}
                            />
                          )}
                        </div>

                        <div className="checkInfo">
                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {item.description}
                          </span>
                        </div>

                        <div
                          className={`checkResult ${item.status}`}
                        >
                          {item.status ===
                          "passed"
                            ? "Passed"
                            : item.status ===
                              "review"
                            ? "Review"
                            : "Not Assessed"}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="checksFooter">
                  {reviewChecks >
                  0 ? (
                    <>
                      {passedChecks} of{" "}
                      {totalChecks}{" "}
                      checks passed
                      {" • "}
                      {reviewChecks}{" "}
                      require review
                      {notAssessedChecks >
                      0
                        ? ` • ${notAssessedChecks} not assessed`
                        : ""}
                    </>
                  ) : notAssessedChecks >
                    0 ? (
                    <>
                      {passedChecks} of{" "}
                      {totalChecks}{" "}
                      checks passed
                      {" • "}
                      {
                        notAssessedChecks
                      }{" "}
                      not assessed
                    </>
                  ) : (
                    <>
                      ✓{" "}
                      {passedChecks} of{" "}
                      {totalChecks}{" "}
                      checks passed
                    </>
                  )}
                </div>
              </section>

              {/* ==================================================
                  RECOMMENDATION + SCOPE
                  ================================================== */}

              <div className="bottomInfoGrid">
                <section
                  className={`recommendationCard ${recommendationStatus}`}
                >
                  <div
                    className={`recommendationIcon ${recommendationStatus}`}
                  >
                    {riskLevel ===
                    "high" ? (
                      <WarningIcon
                        size={18}
                      />
                    ) : riskLevel ===
                      "medium" ? (
                      <WarningIcon
                        size={18}
                      />
                    ) : riskLevel ===
                      "low" ? (
                      <CheckCircleIcon
                        size={18}
                      />
                    ) : (
                      <InfoIcon size={18} />
                    )}
                  </div>

                  <div>
                    <strong>
                      {recommendationTitle}
                    </strong>

                    <p>
                      {recommendationText}
                    </p>
                  </div>
                </section>

                <section className="notIncludedCard">
                  <div className="scopeIcon">
                    <WarningIcon
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      BASIC VERIFICATION
                      SCOPE
                    </strong>

                    <p>
                      This result is based
                      on AI-assisted document
                      analysis. It does not
                      include an official
                      Ministry or registry
                      search, lawyer review,
                      physical inspection,
                      surveyor assessment or
                      engineer assessment.
                    </p>
                  </div>
                </section>
              </div>

              {/* ==================================================
                  UPGRADE
                  ================================================== */}

              <section
                className={`upgradeCard ${riskLevel}`}
              >
                <div className="upgradeVisual">
                  <div className="upgradeClipboard">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="upgradeText">
                  <strong>
                    {riskLevel ===
                    "high"
                      ? "Further verification strongly recommended"
                      : riskLevel ===
                        "medium"
                      ? "Professional verification recommended"
                      : riskLevel ===
                        "incomplete"
                      ? "Complete the verification"
                      : "Need deeper verification?"}
                  </strong>

                  <span>
                    {riskLevel ===
                    "high"
                      ? "Consider Premium Verification for deeper due-diligence before proceeding with the transaction."
                      : riskLevel ===
                        "medium"
                      ? "Professional Verification can provide additional official Ministry or registry verification."
                      : riskLevel ===
                        "incomplete"
                      ? "The Basic AI checks have not produced enough results to determine the property's risk level."
                      : "Professional and Premium plans can provide additional official and professional verification services."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/pricing")
                  }
                >
                  {riskLevel ===
                  "high"
                    ? "View Premium"
                    : riskLevel ===
                      "medium"
                    ? "View Professional"
                    : "View Plans"}

                  <span>→</span>
                </button>
              </section>
            </div>

            {/* ==================================================
                RIGHT COLUMN
                ================================================== */}

            <div className="rightColumn">
              {/* ==================================================
                  VERIFICATION OVERVIEW
                  ================================================== */}

              <section className="card overviewCard">
                <h2>
                  VERIFICATION
                  OVERVIEW
                </h2>

                <div className="scoreArea">
                  <div className="scoreRing">
                    <div className="scoreRingInner">
                      <ShieldIcon
                        size={34}
                      />
                    </div>
                  </div>

                  <div>
                    <strong>
                      {displayTrustScore}
                      /100
                    </strong>

                    <span>
                      Trust Score
                    </span>
                  </div>
                </div>

                <div className="overviewRows">
                  <div className="overviewRow">
                    <span>
                      <span className="overviewRowIcon">
                        ◔
                      </span>
                      Confidence
                    </span>

                    <strong>
                      {displayConfidence}%
                    </strong>
                  </div>

                  <div className="overviewRow">
                    <span>
                      <span className="overviewRowIcon">
                        ✣
                      </span>
                      Checks Passed
                    </span>

                    <strong>
                      {passedChecks}/
                      {totalChecks}
                    </strong>
                  </div>

                  <div className="overviewRow">
                    <span>
                      <span className="overviewRowIcon">
                        ◈
                      </span>
                      Risk Level
                    </span>

                    <strong
                      className={`overviewRisk ${riskLevel}`}
                    >
                      {riskLevel ===
                      "incomplete"
                        ? "—"
                        : riskShort}
                    </strong>
                  </div>
                </div>

                <div className="overviewType">
                  <DocumentIcon
                    size={18}
                  />

                  <span>
                    Basic AI Verification
                  </span>
                </div>
              </section>

              {/* ==================================================
                  REPORT DETAILS
                  ================================================== */}

              <section className="card detailsCard">
                <h2>
                  REPORT DETAILS
                </h2>

                <div className="detailRow">
                  <span>
                    Verification ID
                  </span>

                  <strong>
                    #{verification.id}
                  </strong>
                </div>

                <div className="detailRow">
                  <span>
                    Verified On
                  </span>

                  <strong>
                    {verifiedDate}
                  </strong>
                </div>

                <div className="detailRow">
                  <span>
                    Documents Submitted
                  </span>

                  <strong>
                    {documentCount}
                  </strong>
                </div>

                <div className="detailRow">
                  <span>
                    Risk Assessment
                  </span>

                  <strong
                    className={`detailRisk ${riskLevel}`}
                  >
                    {riskTitle}
                  </strong>
                </div>

                <div className="detailRow">
                  <span>
                    Verification Type
                  </span>

                  <strong>
                    Basic AI Verification
                  </strong>
                </div>

                <div className="detailRow">
                  <span>
                    Verification Engine
                  </span>

                  <strong>
                    PropertySure AI
                  </strong>
                </div>

                <div className="actionStack">
                  <button
                    type="button"
                    className="downloadButton"
                    onClick={
                      downloadReport
                    }
                  >
                    <DownloadIcon />
                    Download PDF Report
                  </button>

                  <button
                    type="button"
                    className="shareButton"
                    onClick={
                      shareReport
                    }
                  >
                    <ShareIcon />
                    Share Report
                  </button>
                </div>

                <div className="securityNotice">
                  <div className="securityLock">
                    ◈
                  </div>

                  <div>
                    <strong>
                      Your data is secure
                    </strong>

                    <p>
                      All documents and
                      verification results
                      are encrypted and
                      protected with
                      enterprise-grade
                      security.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ==================================================
              DISCLAIMER
              ================================================== */}

          <p className="reportDisclaimer">
            PropertySure AI Basic Verification
            provides AI-assisted document
            analysis. It does not replace
            official government registry
            searches or professional legal,
            surveying or engineering advice.
          </p>
        </div>

        {/* ====================================================
            FOOTER
            ==================================================== */}

        <footer className="desktopFooter">
          <span>
            © 2026 PropertySure AI. All
            rights reserved.
          </span>

          <div>
            <button type="button">
              Terms of Service
            </button>

            <button type="button">
              Privacy Policy
            </button>

            <button type="button">
              Security
            </button>
          </div>
        </footer>
      </div>

      {/* ======================================================
          MOBILE BOTTOM NAV
          ====================================================== */}

      <nav className="bottomNav">
        <button
          type="button"
          onClick={() =>
            goTo("/dashboard")
          }
        >
          <HomeIcon size={20} />
          <small>
            Dashboard
          </small>
        </button>

        <button
          type="button"
          className="active"
          onClick={() =>
            goTo("/verify")
          }
        >
          <PlusIcon size={21} />
          <small>
            Verify
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            goTo("/properties")
          }
        >
          <PropertyIcon size={20} />
          <small>
            Properties
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            goTo("/reports")
          }
        >
          <ReportIcon size={20} />
          <small>
            Reports
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            goTo("/account")
          }
        >
          <UserIcon size={20} />
          <small>
            Account
          </small>
        </button>
      </nav>

      {/* ======================================================
          STYLES
          ====================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .resultPage {
          min-height: 100vh;
          background: #f7faff;
          color: #14264b;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button {
          font-family: inherit;
        }

        /* ======================================================
           SIDEBAR
           ====================================================== */

        .desktopSidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 212px;
          background: #ffffff;
          border-right: 1px solid #e8eef6;
          z-index: 40;
          display: flex;
          flex-direction: column;
          padding: 15px 14px;
        }

        .sidebarBrand {
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 5px 18px;
          color: #17284c;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          text-align: left;
        }

        .sidebarBrand strong,
        .mobileBrand strong {
          color: #1268f3;
        }

        .brandMark {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #1268f3;
          font-size: 26px;
          line-height: 1;
        }

        .newVerificationButton {
          height: 40px;
          border: none;
          border-radius: 7px;
          background: #1268f3;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 7px 18px
            rgba(18, 104, 243, 0.16);
          margin-bottom: 15px;
        }

        .sidebarNav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebarNav button,
        .sidebarBottom button {
          width: 100%;
          min-height: 37px;
          border: none;
          background: transparent;
          border-radius: 7px;
          color: #263754;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 10px;
          font-size: 11px;
          cursor: pointer;
          text-align: left;
        }

        .sidebarNav button:hover,
        .sidebarBottom button:hover {
          background: #f5f8fd;
          color: #1268f3;
        }

        .sidebarNav .sidebarActive {
          color: #1268f3;
          font-weight: 700;
        }

        .sidebarSectionLabel {
          color: #8a98ad;
          font-size: 9px;
          font-weight: 700;
          margin: 24px 10px 8px;
          letter-spacing: 0.2px;
        }

        .accountNav {
          gap: 1px;
        }

        .sidebarSettingsActive {
          position: relative;
        }

        .settingsChevron {
          margin-left: auto;
          color: #1268f3;
        }

        .settingsSubNav {
          background: #f5f8ff;
          border-radius: 9px;
          padding: 5px 0;
          margin: 1px 0 7px;
        }

        .settingsSubNav button {
          min-height: 31px;
          padding-left: 28px;
          font-size: 10px;
        }

        .settingsSubNav button:first-child {
          color: #1268f3;
          font-weight: 700;
          background: #edf4ff;
        }

        .sidebarBottom {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #edf1f6;
        }

        .simpleHeart,
        .simpleCard,
        .logoutIcon {
          width: 18px;
          text-align: center;
          font-size: 17px;
        }

        .expertCard {
          margin-top: 12px;
          border-radius: 9px;
          background: #f2f7ff;
          border: 1px solid #e0ebfa;
          padding: 13px 11px;
        }

        .expertIllustration {
          color: #1268f3;
          font-size: 23px;
          margin-bottom: 5px;
        }

        .expertCard strong {
          display: block;
          font-size: 10px;
          color: #1a3158;
          margin-bottom: 5px;
        }

        .expertCard p {
          margin: 0;
          color: #687b98;
          font-size: 8px;
          line-height: 1.55;
        }

        .expertCard button {
          width: 100%;
          height: 34px;
          margin-top: 10px;
          border: 1px solid #8bb8f7;
          border-radius: 6px;
          background: #ffffff;
          color: #1268f3;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        /* ======================================================
           MAIN
           ====================================================== */

        .mainArea {
          min-height: 100vh;
          margin-left: 212px;
        }

        .topHeader {
          height: 57px;
          background: #ffffff;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px 0 29px;
        }

        .desktopBreadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
        }

        .desktopBreadcrumb button {
          border: none;
          background: transparent;
          padding: 0;
          color: #71819a;
          cursor: pointer;
          font-size: 10px;
        }

        .desktopBreadcrumb strong {
          color: #17284c;
        }

        .desktopBreadcrumb span {
          color: #aeb9c9;
        }

        .mobileBrand {
          display: none;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notificationButton {
          width: 31px;
          height: 31px;
          border: none;
          background: transparent;
          color: #182b4c;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }

        .notificationDot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1268f3;
          right: 4px;
          top: 4px;
        }

        .userSummary {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .userSummary > div:first-child {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .userSummary strong {
          color: #17284c;
          font-size: 10px;
        }

        .userSummary span {
          color: #8b98aa;
          font-size: 8px;
        }

        .avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: #edf1f8;
          color: #6f7f99;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .mobileBreadcrumb {
          display: none;
        }

        /* ======================================================
           CONTENT
           ====================================================== */

        .content {
          width: 100%;
          max-width: 1090px;
          margin: 0 auto;
          padding: 21px 20px 24px;
        }

        /* ======================================================
           HERO
           ====================================================== */

        .resultHero {
          min-height: 190px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 28px 30px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e6edf6;
          box-shadow:
            0 5px 20px
            rgba(37, 74, 116, 0.035);
        }

        .resultHero.incomplete {
          background:
            radial-gradient(
              circle at 12% 50%,
              rgba(255, 214, 135, 0.19),
              transparent 27%
            ),
            linear-gradient(
              105deg,
              #fffaf0 0%,
              #fffdf8 55%,
              #f9fbff 100%
            );
          border-color: #f1e8d5;
        }

        .resultHero.low {
          background:
            linear-gradient(
              105deg,
              #f4fbf8,
              #ffffff
            );
          border-color: #dcefe5;
        }

        .resultHero.medium {
          background:
            linear-gradient(
              105deg,
              #fffaf0,
              #fffdf8
            );
          border-color: #f0dfbb;
        }

        .resultHero.high {
          background:
            linear-gradient(
              105deg,
              #fff6f6,
              #ffffff
            );
          border-color: #f0d6d6;
        }

        .resultHeroIcon {
          width: 106px;
          height: 106px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.85);
          box-shadow:
            0 7px 25px
            rgba(69, 92, 120, 0.08);
        }

        .resultHero.incomplete
          .resultHeroIcon {
          color: #ed7200;
        }

        .resultHero.low
          .resultHeroIcon {
          color: #16a45b;
        }

        .resultHero.medium
          .resultHeroIcon {
          color: #df9400;
        }

        .resultHero.high
          .resultHeroIcon {
          color: #d83a3a;
        }

        .resultHeroContent {
          position: relative;
          z-index: 3;
          flex: 1;
          min-width: 0;
        }

        .eyebrow {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          background: #fff0d9;
          color: #e66f00;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.25px;
          margin-bottom: 8px;
        }

        .resultHero.low .eyebrow {
          background: #e8f8ef;
          color: #159653;
        }

        .resultHero.medium .eyebrow {
          background: #fff2d4;
          color: #d38b00;
        }

        .resultHero.high .eyebrow {
          background: #ffe8e8;
          color: #d43737;
        }

        .resultHero h1 {
          margin: 0;
          color: #10245c;
          font-size: 31px;
          line-height: 1.1;
          letter-spacing: -0.8px;
        }

        .resultHero.low h1 {
          color: #137d48;
        }

        .resultHero.medium h1 {
          color: #d48900;
        }

        .resultHero.high h1 {
          color: #cf3030;
        }

        .statusPill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #fff0d9;
          color: #e66f00;
          font-size: 8px;
          font-weight: 800;
        }

        .resultHero.low .statusPill {
          background: #e8f8ef;
          color: #159653;
        }

        .resultHero.medium .statusPill {
          background: #fff2d4;
          color: #d38b00;
        }

        .resultHero.high .statusPill {
          background: #ffe8e8;
          color: #d43737;
        }

        .resultHero p {
          max-width: 520px;
          margin: 10px 0 0;
          color: #53657f;
          font-size: 11px;
          line-height: 1.65;
        }

        /* ======================================================
           HERO ILLUSTRATION
           ====================================================== */

        .heroIllustration {
          width: 230px;
          height: 160px;
          position: relative;
          flex-shrink: 0;
        }

        .heroGlow {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
        }

        .heroGlowOne {
          width: 105px;
          height: 105px;
          right: 18px;
          top: 18px;
          background: rgba(194, 219, 255, 0.42);
        }

        .heroGlowTwo {
          width: 80px;
          height: 80px;
          left: 18px;
          bottom: 2px;
          background: rgba(214, 235, 255, 0.42);
        }

        .heroClipboard {
          position: absolute;
          width: 91px;
          height: 118px;
          right: 43px;
          top: 22px;
          border-radius: 10px;
          background: linear-gradient(
            145deg,
            #eaf3ff,
            #c9ddff
          );
          box-shadow:
            0 13px 22px
            rgba(61, 104, 173, 0.18);
          transform: rotate(4deg);
        }

        .clipboardTop {
          position: absolute;
          left: 30px;
          top: -7px;
          width: 31px;
          height: 18px;
          border-radius: 6px 6px 3px 3px;
          background: #b8d2f9;
        }

        .clipboardSheet {
          position: absolute;
          left: 13px;
          top: 19px;
          width: 64px;
          height: 86px;
          border-radius: 5px;
          background: #ffffff;
          padding: 10px 8px;
        }

        .sheetTitle {
          width: 29px;
          height: 4px;
          background: #88aeea;
          border-radius: 5px;
          margin-bottom: 7px;
        }

        .sheetLine {
          height: 3px;
          border-radius: 4px;
          background: #e0e9f8;
          margin-bottom: 5px;
        }

        .sheetLine.long {
          width: 46px;
        }

        .sheetLine.medium {
          width: 35px;
          margin-bottom: 8px;
        }

        .sheetCheck {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
        }

        .sheetCheck span {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          background: #4285ed;
          color: #ffffff;
          font-size: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sheetCheck:last-child span {
          background: #f0a126;
        }

        .sheetCheck i {
          width: 31px;
          height: 3px;
          border-radius: 4px;
          background: #e3eaf5;
        }

        .magnifier {
          position: absolute;
          width: 59px;
          height: 59px;
          right: -18px;
          bottom: 1px;
          border: 10px solid #377de3;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          box-shadow:
            0 8px 18px
            rgba(54, 103, 180, 0.18);
        }

        .magnifier::after {
          content: "";
          position: absolute;
          width: 31px;
          height: 11px;
          border-radius: 10px;
          background: #377de3;
          right: -25px;
          bottom: -15px;
          transform: rotate(48deg);
        }

        .heroBars {
          position: absolute;
          left: 18px;
          bottom: 17px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding: 7px;
          border-radius: 13px;
          background: rgba(225, 238, 255, 0.9);
        }

        .heroBars span {
          width: 6px;
          border-radius: 4px 4px 1px 1px;
          background: #397ee9;
        }

        .heroBars span:nth-child(1) {
          height: 12px;
        }

        .heroBars span:nth-child(2) {
          height: 20px;
        }

        .heroBars span:nth-child(3) {
          height: 27px;
        }

        .heroAlert {
          position: absolute;
          right: 6px;
          bottom: 2px;
          width: 31px;
          height: 31px;
          border-radius: 9px;
          background: #fff0d5;
          color: #ec8c00;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 7px 15px
            rgba(197, 130, 27, 0.14);
        }

        /* ======================================================
           PRIMARY GRID
           ====================================================== */

        .primaryGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            300px;
          gap: 14px;
          margin-top: 15px;
        }

        .leftColumn,
        .rightColumn {
          min-width: 0;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e3eaf3;
          border-radius: 11px;
          box-shadow:
            0 4px 15px
            rgba(41, 74, 111, 0.025);
        }

        /* ======================================================
           SUMMARY
           ====================================================== */

        .summaryCard {
          padding: 17px;
        }

        .sectionHeader {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .sectionHeaderIcon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blueIcon {
          background: #edf5ff;
          color: #1268f3;
        }

        .sectionHeader h2,
        .card h2 {
          margin: 0;
          color: #123b87;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1px;
        }

        .summaryText {
          margin: 12px 0 0;
          color: #4e607b;
          font-size: 10px;
          line-height: 1.7;
        }

        .assessment {
          margin-top: 10px;
          color: #72829a;
          font-size: 9px;
        }

        .assessment-low {
          color: #159653;
        }

        .assessment-medium {
          color: #d48900;
        }

        .assessment-high {
          color: #d43737;
        }

        .assessment-incomplete {
          color: #e05d00;
        }

        /* ======================================================
           QUICK RESULT
           ====================================================== */

        .quickResultCard {
          margin-top: 14px;
          overflow: hidden;
        }

        .cardTopLine {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border-bottom: 1px solid #edf1f6;
        }

        .verificationType {
          color: #1268f3;
          font-size: 8px;
          font-weight: 700;
        }

        .quickGrid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
        }

        .quickItem {
          min-height: 88px;
          border-right: 1px solid #edf1f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .quickItem:last-child {
          border-right: none;
        }

        .quickItem > span {
          color: #7d8aa0;
          font-size: 8px;
          margin-bottom: 7px;
        }

        .quickItem > strong {
          font-size: 14px;
          font-weight: 800;
        }

        .riskValue.incomplete {
          color: #e68b00;
        }

        .riskValue.low {
          color: #159653;
        }

        .riskValue.medium {
          color: #d48900;
        }

        .riskValue.high {
          color: #d43737;
        }

        .blueValue {
          color: #1268f3;
        }

        .orangeValue {
          color: #e34c22;
        }

        .greenValue {
          color: #159653;
        }

        .quickIcon {
          margin-top: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quickIcon.incomplete {
          color: #e68b00;
        }

        .quickIcon.low {
          color: #159653;
        }

        .quickIcon.medium,
        .quickIcon.high {
          color: #d43737;
        }

        .quickIcon.blue {
          color: #6885ad;
        }

        .quickIcon.neutral {
          color: #778ca9;
        }

        .confidenceBars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 16px;
          margin-top: 5px;
        }

        .confidenceBars span {
          width: 4px;
          border-radius: 3px;
          background: #cdd9e8;
        }

        .confidenceBars span:nth-child(1) {
          height: 5px;
        }

        .confidenceBars span:nth-child(2) {
          height: 9px;
        }

        .confidenceBars span:nth-child(3) {
          height: 13px;
        }

        .confidenceBars span:nth-child(4) {
          height: 16px;
        }

        /* ======================================================
           CHECKS
           ====================================================== */

        .checksCard {
          margin-top: 14px;
          overflow: hidden;
        }

        .checksHeader {
          padding: 14px 16px;
          border-bottom: 1px solid #edf1f6;
        }

        .checksHeader h2 {
          margin-bottom: 4px;
        }

        .checksHeader p {
          margin: 0;
          color: #8492a7;
          font-size: 8px;
        }

        .checksList {
          padding: 0 14px;
        }

        .checkRow {
          min-height: 62px;
          display: flex;
          align-items: center;
          gap: 9px;
          border-bottom: 1px solid #edf1f6;
        }

        .checkRow:last-child {
          border-bottom: none;
        }

        .checkStatus {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkStatus.passed {
          color: #1268f3;
          background: #eef5ff;
        }

        .checkStatus.review {
          color: #dc8d00;
          background: #fff5df;
        }

        .checkStatus.not_assessed {
          color: #1268f3;
          background: #eef5ff;
        }

        .checkInfo {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .checkInfo strong {
          color: #172a4c;
          font-size: 10px;
          font-weight: 750;
        }

        .checkInfo span {
          max-width: 380px;
          color: #7a899f;
          font-size: 8px;
          line-height: 1.45;
        }

        .checkResult {
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 7px;
          font-size: 8px;
          font-weight: 700;
        }

        .checkResult.passed {
          color: #159653;
          background: #eaf8ef;
        }

        .checkResult.review {
          color: #d28700;
          background: #fff3d5;
        }

        .checkResult.not_assessed {
          color: #718097;
          background: #f0f3f7;
        }

        .checksFooter {
          padding: 10px;
          border-top: 1px solid #edf1f6;
          text-align: center;
          color: #1268f3;
          background: #f8fbff;
          font-size: 8px;
          font-weight: 700;
        }

        /* ======================================================
           RIGHT OVERVIEW
           ====================================================== */

        .overviewCard {
          padding: 17px;
        }

        .scoreArea {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px 0 13px;
        }

        .scoreRing {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background:
            conic-gradient(
              #c8daf9 0deg,
              #e6eefb 80deg,
              #edf2fa 360deg
            );
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .scoreRing::before {
          content: "";
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: #ffffff;
        }

        .scoreRingInner {
          position: relative;
          z-index: 2;
          width: 47px;
          height: 47px;
          border-radius: 50%;
          background: #eef5ff;
          color: #1268f3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scoreArea > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .scoreArea strong {
          color: #101f49;
          font-size: 28px;
          line-height: 1;
        }

        .scoreArea span {
          color: #556782;
          font-size: 9px;
        }

        .overviewRows {
          border-top: 1px solid #edf1f6;
        }

        .overviewRow {
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #edf1f6;
          font-size: 8px;
        }

        .overviewRow > span {
          color: #63738b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .overviewRow > strong {
          color: #152849;
          font-size: 9px;
        }

        .overviewRowIcon {
          color: #6d87ab;
          font-size: 14px;
        }

        .overviewRisk.incomplete {
          color: #718096;
        }

        .overviewRisk.low {
          color: #159653;
        }

        .overviewRisk.medium {
          color: #d48900;
        }

        .overviewRisk.high {
          color: #d43737;
        }

        .overviewType {
          height: 37px;
          margin-top: 10px;
          border-radius: 7px;
          background: #f2f6fc;
          color: #1268f3;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          font-size: 8px;
          font-weight: 700;
        }

        /* ======================================================
           DETAILS
           ====================================================== */

        .detailsCard {
          margin-top: 14px;
          padding: 17px;
        }

        .detailsCard h2 {
          margin-bottom: 9px;
        }

        .detailRow {
          min-height: 43px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #edf1f6;
        }

        .detailRow span {
          color: #73839b;
          font-size: 8px;
        }

        .detailRow strong {
          color: #263754;
          font-size: 8px;
          text-align: right;
        }

        .detailRisk.incomplete {
          color: #e05d00;
        }

        .detailRisk.low {
          color: #159653;
        }

        .detailRisk.medium {
          color: #d48900;
        }

        .detailRisk.high {
          color: #d43737;
        }

        .actionStack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }

        .actionStack button {
          height: 39px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
        }

        .downloadButton {
          border: none;
          background: #1268f3;
          color: #ffffff;
          box-shadow:
            0 7px 16px
            rgba(18, 104, 243, 0.15);
        }

        .shareButton {
          border: 1px solid #b9cde9;
          background: #ffffff;
          color: #1268f3;
        }

        .securityNotice {
          margin-top: 14px;
          padding: 11px;
          border-radius: 7px;
          background: #f0f8f7;
          display: flex;
          gap: 8px;
        }

        .securityLock {
          color: #159653;
          font-size: 16px;
        }

        .securityNotice strong {
          display: block;
          color: #25806a;
          font-size: 8px;
          margin-bottom: 3px;
        }

        .securityNotice p {
          margin: 0;
          color: #657c7b;
          font-size: 7px;
          line-height: 1.55;
        }

        /* ======================================================
           BOTTOM INFO
           ====================================================== */

        .bottomInfoGrid {
          display: grid;
          grid-template-columns:
            1fr
            1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .recommendationCard,
        .notIncludedCard {
          min-height: 98px;
          padding: 14px;
          border-radius: 10px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .recommendationCard.passed {
          background: #f1f7ff;
          border: 1px solid #d9e8fc;
        }

        .recommendationCard.review {
          background: #fffaf0;
          border: 1px solid #f0dfbb;
        }

        .recommendationCard.high {
          background: #fff5f5;
          border: 1px solid #efd0d0;
        }

        .recommendationCard.not_assessed {
          background: #f7f9fc;
          border: 1px solid #e1e8f0;
        }

        .recommendationIcon,
        .scopeIcon {
          width: 29px;
          height: 29px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recommendationIcon.passed {
          background: #e4f0ff;
          color: #1268f3;
        }

        .recommendationIcon.review {
          background: #fff1ce;
          color: #d78a00;
        }

        .recommendationIcon.high {
          background: #ffe4e4;
          color: #d43737;
        }

        .recommendationIcon.not_assessed {
          background: #eef2f6;
          color: #718096;
        }

        .recommendationCard strong,
        .notIncludedCard strong {
          display: block;
          color: #172a4d;
          font-size: 9px;
          margin-bottom: 5px;
        }

        .recommendationCard p,
        .notIncludedCard p {
          margin: 0;
          color: #71819a;
          font-size: 8px;
          line-height: 1.55;
        }

        .notIncludedCard {
          background: #fffaf0;
          border: 1px solid #f0dfbb;
        }

        .scopeIcon {
          background: #fff0cf;
          color: #dc8c00;
        }

        .notIncludedCard strong {
          color: #9b6a0a;
        }

        .notIncludedCard p {
          color: #816f48;
        }

        /* ======================================================
           UPGRADE
           ====================================================== */

        .upgradeCard {
          margin-top: 14px;
          min-height: 94px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 18px;
          border-radius: 10px;
          border: 1px solid #d9e6f8;
          background:
            linear-gradient(
              100deg,
              #f1f7ff,
              #f7fbff
            );
        }

        .upgradeCard.medium {
          background:
            linear-gradient(
              100deg,
              #fffaf0,
              #fffdf8
            );
          border-color: #f0dfbb;
        }

        .upgradeCard.high {
          background:
            linear-gradient(
              100deg,
              #fff4f4,
              #fffafa
            );
          border-color: #efd0d0;
        }

        .upgradeCard.incomplete {
          background:
            linear-gradient(
              100deg,
              #f2f7ff,
              #f7fbff
            );
        }

        .upgradeVisual {
          width: 76px;
          height: 63px;
          flex-shrink: 0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upgradeVisual::before {
          content: "";
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #dceaff;
        }

        .upgradeClipboard {
          position: relative;
          z-index: 2;
          width: 34px;
          height: 44px;
          border-radius: 4px;
          background: #ffffff;
          border: 2px solid #9abcf0;
          padding: 8px 5px;
          box-shadow:
            0 5px 10px
            rgba(52, 100, 173, 0.13);
        }

        .upgradeClipboard::before {
          content: "";
          position: absolute;
          width: 14px;
          height: 6px;
          border-radius: 3px;
          background: #8bb3ee;
          top: -5px;
          left: 8px;
        }

        .upgradeClipboard span {
          display: block;
          width: 20px;
          height: 3px;
          background: #d7e5f8;
          border-radius: 3px;
          margin-bottom: 5px;
        }

        .upgradeText {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .upgradeText strong {
          color: #152a4d;
          font-size: 12px;
        }

        .upgradeText span {
          color: #657995;
          font-size: 8px;
          line-height: 1.55;
          max-width: 550px;
        }

        .upgradeCard > button {
          min-width: 115px;
          height: 39px;
          border: none;
          border-radius: 6px;
          background: #1268f3;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .upgradeCard.medium > button {
          background: #dd9100;
        }

        .upgradeCard.high > button {
          background: #d43737;
        }

        .upgradeCard.incomplete > button {
          background: #1268f3;
        }

        /* ======================================================
           DISCLAIMER
           ====================================================== */

        .reportDisclaimer {
          max-width: 820px;
          margin: 17px auto 0;
          color: #8794a7;
          font-size: 8px;
          line-height: 1.6;
          text-align: center;
        }

        /* ======================================================
           FOOTER
           ====================================================== */

        .desktopFooter {
          min-height: 58px;
          border-top: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 35px;
          color: #7c899c;
          font-size: 8px;
          background: #ffffff;
        }

        .desktopFooter div {
          display: flex;
          gap: 24px;
        }

        .desktopFooter button {
          border: none;
          background: transparent;
          color: #7c899c;
          font-size: 8px;
          cursor: pointer;
        }

        /* ======================================================
           MOBILE NAV
           ====================================================== */

        .bottomNav {
          display: none;
        }

        /* ======================================================
           MOBILE
           ====================================================== */

        @media (max-width: 850px) {
          .desktopSidebar {
            display: none;
          }

          .mainArea {
            margin-left: 0;
            padding-bottom: 72px;
          }

          .topHeader {
            height: 60px;
            padding: 0 15px;
          }

          .desktopBreadcrumb,
          .userSummary {
            display: none;
          }

          .mobileBrand {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #17284c;
            font-size: 16px;
            font-weight: 800;
          }

          .mobileBrand .brandMark {
            width: 24px;
            height: 24px;
            font-size: 22px;
          }

          .headerRight {
            margin-left: auto;
          }

          .mobileBreadcrumb {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 13px 15px 0;
            font-size: 9px;
            color: #71819a;
          }

          .mobileBreadcrumb button {
            border: none;
            background: transparent;
            padding: 0;
            color: #71819a;
            font-size: 9px;
          }

          .mobileBreadcrumb strong {
            color: #17284c;
          }

          .content {
            padding:
              12px
              12px
              20px;
          }

          .resultHero {
            min-height: 0;
            padding: 18px 15px;
            gap: 12px;
            align-items: flex-start;
          }

          .resultHeroIcon {
            width: 64px;
            height: 64px;
          }

          .resultHeroIcon svg {
            width: 40px;
            height: 40px;
          }

          .resultHero h1 {
            font-size: 22px;
            letter-spacing: -0.4px;
          }

          .resultHero p {
            font-size: 9px;
            line-height: 1.55;
          }

          .eyebrow {
            font-size: 7px;
            padding: 5px 7px;
          }

          .statusPill {
            font-size: 7px;
            padding: 4px 6px;
          }

          .heroIllustration {
            display: none;
          }

          .primaryGrid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
          }

          .rightColumn {
            display: contents;
          }

          .overviewCard {
            order: 0;
          }

          .leftColumn {
            display: contents;
          }

          .summaryCard {
            order: 1;
          }

          .quickResultCard {
            order: 2;
          }

          .checksCard {
            order: 3;
          }

          .detailsCard {
            order: 4;
          }

          .bottomInfoGrid {
            order: 5;
          }

          .upgradeCard {
            order: 6;
          }

          .bottomInfoGrid {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 12px;
          }

          .recommendationCard,
          .notIncludedCard {
            min-height: auto;
          }

          .upgradeCard {
            align-items: center;
            padding: 13px;
            gap: 9px;
          }

          .upgradeVisual {
            width: 49px;
            height: 49px;
          }

          .upgradeVisual::before {
            width: 47px;
            height: 47px;
          }

          .upgradeClipboard {
            width: 25px;
            height: 33px;
            padding: 5px 3px;
          }

          .upgradeClipboard::before {
            width: 10px;
            height: 4px;
            top: -4px;
            left: 5px;
          }

          .upgradeClipboard span {
            width: 15px;
            height: 2px;
            margin-bottom: 4px;
          }

          .upgradeText strong {
            font-size: 10px;
          }

          .upgradeText span {
            font-size: 7px;
          }

          .upgradeCard > button {
            min-width: 79px;
            height: 34px;
            padding: 0 7px;
            font-size: 7px;
          }

          .desktopFooter {
            display: none;
          }

          .bottomNav {
            position: fixed;
            display: grid;
            grid-template-columns:
              repeat(5, 1fr);
            left: 0;
            right: 0;
            bottom: 0;
            height: 67px;
            z-index: 100;
            background: #12233e;
            border-top: 1px solid #263b59;
            box-shadow:
              0 -5px 20px
              rgba(0, 0, 0, 0.12);
          }

          .bottomNav button {
            border: none;
            background: transparent;
            color: #92a1b8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
          }

          .bottomNav button.active {
            color: #3f9aff;
          }

          .bottomNav small {
            font-size: 7px;
          }

          .bottomNav button.active small {
            font-weight: 800;
          }
        }

        /* ======================================================
           SMALL MOBILE
           ====================================================== */

        @media (max-width: 500px) {
          .headerRight {
            gap: 4px;
          }

          .content {
            padding-left: 9px;
            padding-right: 9px;
          }

          .resultHero {
            padding: 15px 12px;
            border-radius: 10px;
          }

          .resultHeroIcon {
            width: 55px;
            height: 55px;
          }

          .resultHeroIcon svg {
            width: 35px;
            height: 35px;
          }

          .resultHero h1 {
            font-size: 19px;
          }

          .resultHero p {
            font-size: 8px;
          }

          .sectionHeader h2,
          .card h2 {
            font-size: 10px;
          }

          .summaryCard,
          .overviewCard,
          .detailsCard {
            padding: 13px;
          }

          .summaryText {
            font-size: 9px;
          }

          .quickGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .quickItem {
            min-height: 82px;
            border-bottom: 1px solid #edf1f6;
          }

          .quickItem:nth-child(2) {
            border-right: none;
          }

          .quickItem:nth-child(3),
          .quickItem:nth-child(4) {
            border-bottom: none;
          }

          .quickItem > strong {
            font-size: 13px;
          }

          .checkRow {
            min-height: 67px;
          }

          .checkInfo strong {
            font-size: 9px;
          }

          .checkInfo span {
            font-size: 7px;
          }

          .checkResult {
            display: none;
          }

          .detailsCard {
            margin-top: 12px;
          }

          .detailRow {
            min-height: 40px;
          }

          .upgradeText {
            gap: 3px;
          }

          .upgradeCard > button {
            min-width: 72px;
          }

          .overviewCard {
            margin-top: 0;
          }

          .scoreArea strong {
            font-size: 25px;
          }

          .bottomNav {
            height: 64px;
          }

          .mainArea {
            padding-bottom: 69px;
          }
        }
      `}</style>
    </main>
  );
}