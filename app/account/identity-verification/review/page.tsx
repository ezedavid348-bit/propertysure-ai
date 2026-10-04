"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";

/* ============================================================
   TYPES
============================================================ */

type IconName =
  | "user"
  | "calendar"
  | "gender"
  | "nationality"
  | "document"
  | "id"
  | "lock"
  | "check";

type DocumentType =
  | "nin"
  | "national-id"
  | "drivers-license"
  | "passport";

type ExtractedKycData = {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;

  documentType?: string;
  documentNumber?: string;
  dateOfIssue?: string;

  fileName?: string;
};

type StepItemProps = {
  number: number;
  label: ReactNode;
  active?: boolean;
  completed?: boolean;
};

/* ============================================================
   DOCUMENT NAMES
============================================================ */

const DOCUMENT_NAMES: Record<DocumentType, string> = {
  nin: "NIN / National Identification Number",
  "national-id": "National Identity Card",
  "drivers-license": "Driver’s Licence",
  passport: "International Passport",
};

/* ============================================================
   ICON
============================================================ */

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    user: "♙",
    calendar: "▣",
    gender: "♙",
    nationality: "⚑",
    document: "▤",
    id: "▣",
    lock: "♧",
    check: "✓",
  };

  return (
    <span
      className={styles.icon}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function displayValue(
  value: string | undefined
): string {
  if (!value || !value.trim()) {
    return "Not available";
  }

  return value.trim();
}

/* ============================================================
   NORMALIZE DOCUMENT TYPE
============================================================ */

function normalizeDocumentType(
  value: string | undefined
): DocumentType {
  if (!value) {
    return "nin";
  }

  const normalized =
    value
      .toLowerCase()
      .trim();

  if (
    normalized === "nin" ||
    normalized.includes(
      "national identification"
    )
  ) {
    return "nin";
  }

  if (
    normalized === "national-id" ||
    normalized.includes(
      "national identity"
    )
  ) {
    return "national-id";
  }

  if (
    normalized ===
      "drivers-license" ||
    normalized.includes(
      "driver"
    ) ||
    normalized.includes(
      "driving licence"
    ) ||
    normalized.includes(
      "driving license"
    )
  ) {
    return "drivers-license";
  }

  if (
    normalized === "passport" ||
    normalized.includes(
      "passport"
    )
  ) {
    return "passport";
  }

  return "nin";
}

/* ============================================================
   DOCUMENT BADGE
============================================================ */

function getDocumentBadge(
  documentType: DocumentType
): string {
  switch (documentType) {
    case "nin":
      return "NIN";

    case "national-id":
      return "ID";

    case "drivers-license":
      return "DL";

    case "passport":
      return "PASS";

    default:
      return "ID";
  }
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ReviewAndSubmitPage() {
  const router = useRouter();

  /* ==========================================================
     SHARED PAGE LOADING
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* ==========================================================
     KYC DATA
  ========================================================== */

  const [documentType, setDocumentType] =
    useState<DocumentType>("nin");

  const [fileName, setFileName] =
    useState("Document");

  const [filePreview, setFilePreview] =
    useState<string | null>(null);

  const [kycData, setKycData] =
    useState<ExtractedKycData>({});

  const [selfieData, setSelfieData] =
    useState<string | null>(null);

  const [confirmed, setConfirmed] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  /* ==========================================================
     LOAD KYC DATA
  ========================================================== */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      /* ------------------------------------------------------
         DOCUMENT TYPE
      ------------------------------------------------------ */

      const storedDocument =
        sessionStorage.getItem(
          "propertysure_kyc_document_type"
        );

      const normalizedDocument =
        normalizeDocumentType(
          storedDocument ||
            undefined
        );

      setDocumentType(
        normalizedDocument
      );

      /* ------------------------------------------------------
         FILE NAME
      ------------------------------------------------------ */

      const storedFileName =
        sessionStorage.getItem(
          "propertysure_kyc_file_name"
        );

      if (storedFileName) {
        setFileName(
          storedFileName
        );
      }

      /* ------------------------------------------------------
         FILE PREVIEW
      ------------------------------------------------------ */

      const storedPreview =
        sessionStorage.getItem(
          "propertysure_kyc_file_preview"
        );

      if (storedPreview) {
        setFilePreview(
          storedPreview
        );
      }

      /* ------------------------------------------------------
         EXTRACTED KYC DATA
      ------------------------------------------------------ */

      const storedKycData =
        sessionStorage.getItem(
          "propertysure_kyc_extracted_data"
        );

      if (storedKycData) {
        try {
          const parsedData =
            JSON.parse(
              storedKycData
            ) as ExtractedKycData;

          setKycData(
            parsedData
          );

          if (
            parsedData.documentType
          ) {
            setDocumentType(
              normalizeDocumentType(
                parsedData.documentType
              )
            );
          }

          if (
            parsedData.fileName
          ) {
            setFileName(
              parsedData.fileName
            );
          }
        } catch {
          console.warn(
            "PropertySure AI: Unable to parse extracted KYC data."
          );
        }
      }

      /* ------------------------------------------------------
         SELFIE
      ------------------------------------------------------ */

      const storedSelfie =
        sessionStorage.getItem(
          "propertysure_kyc_selfie_data"
        );

      if (storedSelfie) {
        setSelfieData(
          storedSelfie
        );
      }

      /* ------------------------------------------------------
         SUBMITTED STATE
      ------------------------------------------------------ */

      const storedSubmitted =
        sessionStorage.getItem(
          "propertysure_kyc_submitted"
        );

      if (
        storedSubmitted ===
        "true"
      ) {
        setSubmitted(true);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  /* ==========================================================
     DOCUMENT INFORMATION
  ========================================================== */

  const documentName =
    kycData.documentType ||
    DOCUMENT_NAMES[
      documentType
    ];

  const documentBadge =
    getDocumentBadge(
      documentType
    );

  /* ==========================================================
     PERSONAL INFORMATION
  ========================================================== */

  const fullName =
    displayValue(
      kycData.fullName
    );

  const dateOfBirth =
    displayValue(
      kycData.dateOfBirth
    );

  const gender =
    displayValue(
      kycData.gender
    );

  const nationality =
    displayValue(
      kycData.nationality
    );

  /* ==========================================================
     DOCUMENT INFORMATION
  ========================================================== */

  const documentNumber =
    displayValue(
      kycData.documentNumber
    );

  const dateOfIssue =
    displayValue(
      kycData.dateOfIssue
    );

  /* ==========================================================
     BACK TO SELFIE VERIFICATION
  ========================================================== */

  const navigateBackToSelfie =
    () => {
      router.push(
        "/account/identity-verification/selfie"
      );
    };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = () => {
    if (
      !confirmed ||
      !selfieData ||
      submitted
    ) {
      return;
    }

    /*
     * Mark the KYC review as submitted locally.
     * The backend submission can be connected here later.
     */

    try {
      sessionStorage.setItem(
        "propertysure_kyc_submitted",
        "true"
      );
    } catch {
      // Ignore storage errors.
    }

    setSubmitted(true);
  };

  /* ==========================================================
     SHARED LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main
        className={
          styles.page
        }
      >
        <section
          className={
            styles.main
          }
        >
          <div
            className={
              styles.content
            }
          >
            {/* ==================================================
                INTRO
            ================================================== */}

            <div
              className={
                styles.pageIntro
              }
            >
              <h1>
                Identity Verification
              </h1>

              <p>
                Complete the steps below to verify your
                identity and secure your account.
              </p>

              <button
                type="button"
                className={
                  styles.backLink
                }
                onClick={
                  navigateBackToSelfie
                }
              >
                <span
                  className={
                    styles.backArrow
                  }
                >
                  ←
                </span>

                <span>
                  Back to Selfie Verification
                </span>
              </button>

              <div
                className={
                  styles.statusBadge
                }
              >
                <span
                  className={
                    styles.statusDiamond
                  }
                >
                  ◇
                </span>

                <span>
                  {submitted
                    ? "Verification Submitted"
                    : "Not Verified"}
                </span>
              </div>
            </div>

            {/* ==================================================
                FIVE STEP PROGRESS
            ================================================== */}

            <div
              className={
                styles.steps
              }
            >
              <StepItem
                number={1}
                completed
                label={
                  <>
                    Identity
                    <br />
                    Document
                  </>
                }
              />

              <StepLine
                active
              />

              <StepItem
                number={2}
                completed
                label={
                  <>
                    Document
                    <br />
                    Upload
                  </>
                }
              />

              <StepLine
                active
              />

              <StepItem
                number={3}
                completed
                label={
                  <>
                    Information
                    <br />
                    Confirmation
                  </>
                }
              />

              <StepLine
                active
              />

              <StepItem
                number={4}
                completed
                label={
                  <>
                    Selfie
                    <br />
                    Verification
                  </>
                }
              />

              <StepLine />

              <StepItem
                number={5}
                active
                label={
                  <>
                    Review &
                    <br />
                    Submit
                  </>
                }
              />
            </div>

            {/* ==================================================
                REVIEW CARD
            ================================================== */}

            <section
              className={
                styles.verificationCard
              }
            >
              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardHeaderIcon
                  }
                >
                  <ReviewHeaderIcon />
                </div>

                <div
                  className={
                    styles.cardHeaderText
                  }
                >
                  <h2>
                    Step 5: Review & Submit
                  </h2>

                  <p>
                    Review your identity verification information
                    before submitting.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.divider
                }
              />

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <section
                className={
                  styles.reviewSection
                }
              >
                <div
                  className={
                    styles.reviewSectionHeader
                  }
                >
                  <h3>
                    Personal Information
                  </h3>
                </div>

                <div
                  className={
                    styles.personalBox
                  }
                >
                  <ReviewRow
                    icon="user"
                    label="Full Name"
                    value={
                      loadingData
                        ? "Loading..."
                        : fullName
                    }
                  />

                  <ReviewRow
                    icon="calendar"
                    label="Date of Birth"
                    value={
                      loadingData
                        ? "Loading..."
                        : dateOfBirth
                    }
                  />

                  <ReviewRow
                    icon="gender"
                    label="Gender"
                    value={
                      loadingData
                        ? "Loading..."
                        : gender
                    }
                  />

                  <ReviewRow
                    icon="nationality"
                    label="Nationality"
                    value={
                      loadingData
                        ? "Loading..."
                        : nationality
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  DOCUMENT INFORMATION
              ================================================= */}

              <section
                className={
                  styles.reviewSection
                }
              >
                <div
                  className={
                    styles.reviewSectionHeader
                  }
                >
                  <h3>
                    Document Information
                  </h3>
                </div>

                <div
                  className={
                    styles.documentBox
                  }
                >
                  <ReviewRow
                    documentBadge={
                      documentBadge
                    }
                    label="Document Type"
                    value={
                      loadingData
                        ? "Loading..."
                        : documentName
                    }
                  />

                  <ReviewRow
                    icon="id"
                    label="Document Number"
                    value={
                      loadingData
                        ? "Loading..."
                        : documentNumber
                    }
                  />

                  <ReviewRow
                    icon="calendar"
                    label="Date of Issue"
                    value={
                      loadingData
                        ? "Loading..."
                        : dateOfIssue
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  UPLOADED DOCUMENT
              ================================================= */}

              <section
                className={
                  styles.reviewSection
                }
              >
                <div
                  className={
                    styles.reviewSectionHeader
                  }
                >
                  <h3>
                    Uploaded Document
                  </h3>
                </div>

                <div
                  className={
                    styles.uploadedBox
                  }
                >
                  {filePreview ? (
                    <div
                      className={
                        styles.filePreview
                      }
                    >
                      <img
                        src={
                          filePreview
                        }
                        alt="Uploaded identity document"
                      />
                    </div>
                  ) : (
                    <div
                      className={
                        styles.fileIcon
                      }
                    >
                      <Icon
                        name="document"
                        size={18}
                      />
                    </div>
                  )}

                  <div
                    className={
                      styles.fileDetails
                    }
                  >
                    <span>
                      File Name
                    </span>

                    <strong>
                      {loadingData
                        ? "Loading..."
                        : fileName}
                    </strong>
                  </div>
                </div>
              </section>

              {/* =================================================
                  SELFIE
              ================================================= */}

              <section
                className={
                  styles.reviewSection
                }
              >
                <div
                  className={
                    styles.reviewSectionHeader
                  }
                >
                  <h3>
                    Selfie Verification
                  </h3>
                </div>

                <div
                  className={
                    styles.selfieBox
                  }
                >
                  <div
                    className={
                      styles.selfieThumbnail
                    }
                  >
                    {selfieData ? (
                      <img
                        src={
                          selfieData
                        }
                        alt="Captured selfie"
                      />
                    ) : (
                      <div
                        className={
                          styles.selfiePlaceholder
                        }
                      >
                        <Icon
                          name="user"
                          size={24}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      styles.selfieDetails
                    }
                  >
                    <strong>
                      Identity Selfie
                    </strong>

                    <span>
                      {selfieData
                        ? "Selfie captured successfully."
                        : "No selfie has been captured yet."}
                    </span>
                  </div>

                  {selfieData ? (
                    <div
                      className={
                        styles.capturedBadge
                      }
                    >
                      <Icon
                        name="check"
                        size={12}
                      />

                      <span>
                        Captured
                      </span>
                    </div>
                  ) : (
                    <div
                      className={
                        styles.missingBadge
                      }
                    >
                      Required
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  CONFIRMATION
              ================================================= */}

              {!submitted && (
                <label
                  className={
                    styles.confirmationBox
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      confirmed
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmed(
                        event.target.checked
                      )
                    }
                  />

                  <span
                    className={
                      styles.customCheckbox
                    }
                  >
                    {confirmed &&
                      "✓"}
                  </span>

                  <span
                    className={
                      styles.confirmationContent
                    }
                  >
                    <span
                      className={
                        styles.confirmationLock
                      }
                    >
                      <Icon
                        name="lock"
                        size={15}
                      />
                    </span>

                    <span>
                      I confirm that the information above is
                      correct and that the identity document and
                      selfie belong to me.
                    </span>
                  </span>
                </label>
              )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              {!submitted && (
                <button
                  type="button"
                  className={`${styles.submitButton} ${
                    !confirmed ||
                    !selfieData
                      ? styles.submitDisabled
                      : ""
                  }`}
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    !confirmed ||
                    !selfieData
                  }
                >
                  <span>
                    Submit Verification
                  </span>

                  <span
                    className={
                      styles.submitDiamond
                    }
                  >
                    ◆
                  </span>
                </button>
              )}

              {/* =================================================
                  SUBMITTED
              ================================================= */}

              {submitted && (
                <div
                  className={
                    styles.submittedBox
                  }
                >
                  <div
                    className={
                      styles.submittedIcon
                    }
                  >
                    ✓
                  </div>

                  <div>
                    <h3>
                      Verification Submitted
                    </h3>

                    <p>
                      Your identity verification has been
                      submitted successfully for review.
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  PRIVACY
              ================================================= */}

              <div
                className={
                  styles.privacyBox
                }
              >
                <Icon
                  name="lock"
                  size={17}
                />

                <p>
                  Your identity information and verification
                  data are securely processed and protected.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

/* ============================================================
   STEP ITEM
============================================================ */

function StepItem({
  number,
  label,
  active = false,
  completed = false,
}: StepItemProps) {
  return (
    <div
      className={`${styles.step} ${
        active
          ? styles.stepActive
          : ""
      }`}
    >
      <div
        className={`${styles.stepCircle} ${
          active
            ? styles.stepCircleActive
            : ""
        } ${
          completed
            ? styles.stepCircleCompleted
            : ""
        }`}
      >
        {completed ? (
          <span>
            ✓
          </span>
        ) : (
          number
        )}
      </div>

      <div
        className={
          styles.stepLabel
        }
      >
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   STEP LINE
============================================================ */

function StepLine({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <div
      className={`${styles.stepLine} ${
        active
          ? styles.stepLineActive
          : ""
      }`}
    />
  );
}

/* ============================================================
   REVIEW ROW
============================================================ */

function ReviewRow({
  icon,
  documentBadge,
  label,
  value,
}: {
  icon?: IconName;
  documentBadge?: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        styles.reviewRow
      }
    >
      {documentBadge ? (
        <div
          className={
            styles.documentBadge
          }
        >
          {documentBadge}
        </div>
      ) : (
        <div
          className={
            styles.rowIcon
          }
        >
          {icon && (
            <Icon
              name={icon}
              size={15}
            />
          )}
        </div>
      )}

      <div
        className={
          styles.rowLabel
        }
      >
        {label}
      </div>

      <div
        className={
          styles.rowValue
        }
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   REVIEW HEADER ICON
============================================================ */

function ReviewHeaderIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="7"
        r="3"
      />

      <path
        d="M3 20v-1a6 6 0 016-6h1"
      />

      <path
        d="M14 5h6v6"
      />

      <path
        d="m14 11 6-6"
      />

      <path
        d="m14 16 2 2 4-4"
      />
    </svg>
  );
}