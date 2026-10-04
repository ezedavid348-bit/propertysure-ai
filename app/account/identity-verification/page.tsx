"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";

type DocumentType =
  | "nin"
  | "national-id"
  | "drivers-license"
  | "passport";

type DocumentOption = {
  id: DocumentType;
  title: string;
  description: string;
  icon: "nin" | "id" | "car" | "passport";
};

const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    id: "nin",
    title: "NIN / National Identification Number",
    description: "Use your NIN or an accepted NIN document.",
    icon: "nin",
  },
  {
    id: "national-id",
    title: "National Identity Card",
    description: "Government-issued National ID card.",
    icon: "id",
  },
  {
    id: "drivers-license",
    title: "Driver’s Licence",
    description: "Valid driver’s licence issued by FRSC.",
    icon: "car",
  },
  {
    id: "passport",
    title: "International Passport",
    description: "Passport issued by your country of citizenship.",
    icon: "passport",
  },
];

export default function IdentityVerificationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentType | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * ============================================================
   * BACK TO ACCOUNT
   * ============================================================
   *
   * Use a fresh navigation so the Account page is loaded cleanly.
   */

  const navigateToAccount = () => {
    window.location.href = "/account";
  };

  /*
   * ============================================================
   * DOCUMENT SELECTION
   * ============================================================
   */

  const handleDocumentSelect = (
    documentType: DocumentType,
  ) => {
    setSelectedDocument(documentType);
  };

  /*
   * ============================================================
   * CONTINUE
   * ============================================================
   */

  const handleContinue = () => {
    if (!selectedDocument) {
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "propertysure_kyc_document_type",
        selectedDocument,
      );
    }

    router.push(
      "/account/identity-verification/upload",
    );
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   *
   * LoadingScreen is intentionally rendered OUTSIDE AppShell.
   *
   * This allows it to cover the entire viewport instead of
   * leaving the AppShell mobile header and bottom navigation
   * visible underneath it.
   */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   *
   * AppShell supplies:
   *
   * - Desktop sidebar
   * - Desktop top header
   * - Mobile header
   * - Mobile navigation
   * - Account active navigation state
   *
   * The Identity Verification content itself remains unchanged.
   */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main className={styles.page}>
        <section className={styles.main}>
          <div className={styles.content}>
            {/* =================================================
                PAGE INTRO
            ================================================== */}

            <div className={styles.pageIntro}>
              <h1>Identity Verification</h1>

              <p>
                Complete the steps below to verify your
                identity and secure your account.
              </p>

              {/* =================================================
                  BACK TO ACCOUNT
              ================================================== */}

              <button
                type="button"
                className={styles.backLink}
                onClick={navigateToAccount}
              >
                <span
                  className={styles.icon}
                  style={{
                    fontSize: "18px",
                  }}
                  aria-hidden="true"
                >
                  ←
                </span>

                <span>
                  Back to Account
                </span>
              </button>

              {/* =================================================
                  STATUS
              ================================================== */}

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
                  Not Verified
                </span>
              </div>
            </div>

            {/* =================================================
                PROGRESS STEPS
            ================================================== */}

            <div className={styles.steps}>
              <Step
                number={1}
                label={
                  <>
                    Identity
                    <br />
                    Document
                  </>
                }
                active
              />

              <StepLine />

              <Step
                number={2}
                label={
                  <>
                    Document
                    <br />
                    Upload
                  </>
                }
              />

              <StepLine />

              <Step
                number={3}
                label={
                  <>
                    Information
                    <br />
                    Confirmation
                  </>
                }
              />

              <StepLine />

              <Step
                number={4}
                label={
                  <>
                    Selfie
                    <br />
                    Verification
                  </>
                }
              />

              <StepLine />

              <Step
                number={5}
                label={
                  <>
                    Review &
                    <br />
                    Submit
                  </>
                }
              />
            </div>

            {/* =================================================
                MAIN VERIFICATION CARD
            ================================================== */}

            <section
              className={
                styles.verificationCard
              }
            >
              {/* =================================================
                  CARD HEADER
              ================================================== */}

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
                  <IdCardIcon />
                </div>

                <div
                  className={
                    styles.cardHeaderText
                  }
                >
                  <h2>
                    Step 1: Identity Document
                  </h2>

                  <p>
                    Select the type of identity
                    document you will use for
                    verification.
                  </p>
                </div>
              </div>

              <div
                className={styles.divider}
              />

              {/* =================================================
                  DOCUMENT SECTION
              ================================================== */}

              <div
                className={
                  styles.documentSection
                }
              >
                <h3>
                  Accepted identity documents
                </h3>

                <div
                  className={
                    styles.documentGrid
                  }
                >
                  {DOCUMENT_OPTIONS.map(
                    (document) => {
                      const isSelected =
                        selectedDocument ===
                        document.id;

                      return (
                        <button
                          key={document.id}
                          type="button"
                          className={`${styles.documentOption} ${
                            isSelected
                              ? styles.documentOptionSelected
                              : ""
                          }`}
                          onClick={() =>
                            handleDocumentSelect(
                              document.id,
                            )
                          }
                          aria-pressed={
                            isSelected
                          }
                        >
                          {/* DOCUMENT ICON */}

                          <div
                            className={`${styles.documentIcon} ${
                              styles[
                                `documentIcon_${document.icon}`
                              ]
                            }`}
                          >
                            {document.icon ===
                              "nin" && (
                              <span>
                                NIN
                              </span>
                            )}

                            {document.icon ===
                              "id" && (
                              <IdCardIcon />
                            )}

                            {document.icon ===
                              "car" && (
                              <CarIcon />
                            )}

                            {document.icon ===
                              "passport" && (
                              <PassportIcon />
                            )}
                          </div>

                          {/* DOCUMENT TEXT */}

                          <div
                            className={
                              styles.documentText
                            }
                          >
                            <strong>
                              {document.title}
                            </strong>

                            <span>
                              {
                                document.description
                              }
                            </span>
                          </div>

                          {/* DOCUMENT ARROW */}

                          <span
                            className={
                              styles.documentArrow
                            }
                          >
                            {isSelected ? (
                              <CheckIcon />
                            ) : (
                              <span
                                className={
                                  styles.icon
                                }
                                style={{
                                  fontSize:
                                    "21px",
                                }}
                                aria-hidden="true"
                              >
                                ›
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* =================================================
                  SECURITY
              ================================================== */}

              <div
                className={
                  styles.securityBox
                }
              >
                <div
                  className={
                    styles.securityIcon
                  }
                >
                  <ShieldIcon />
                </div>

                <div>
                  <h3>
                    We take your security seriously
                  </h3>

                  <p>
                    Your document will be
                    encrypted and securely
                    processed. We never share
                    your data with third parties.
                  </p>
                </div>
              </div>

              {/* =================================================
                  CONTINUE
              ================================================== */}

              <button
                type="button"
                className={`${styles.continueButton} ${
                  !selectedDocument
                    ? styles.continueDisabled
                    : ""
                }`}
                onClick={handleContinue}
                disabled={
                  !selectedDocument
                }
              >
                <span
                  className={
                    styles.buttonDiamond
                  }
                >
                  ◇
                </span>

                <span>
                  Continue
                </span>
              </button>

              {/* =================================================
                  PRIVACY
              ================================================== */}

              <div
                className={
                  styles.privacyBox
                }
              >
                <LockIcon />

                <p>
                  Your information is
                  encrypted and securely
                  stored. We never share your
                  data with third parties.
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
   STEP COMPONENT
============================================================ */

function Step({
  number,
  label,
  active = false,
}: {
  number: number;
  label: React.ReactNode;
  active?: boolean;
}) {
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
        }`}
      >
        {number}
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

function StepLine() {
  return (
    <div
      className={styles.stepLine}
    />
  );
}

/* ============================================================
   ID CARD ICON
============================================================ */

function IdCardIcon() {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <circle
        cx="8"
        cy="11"
        r="2"
      />

      <path d="M5.5 16c.7-1.5 1.6-2.2 2.5-2.2s1.8.7 2.5 2.2" />

      <path d="M13 10h5" />

      <path d="M13 14h4" />
    </svg>
  );
}

/* ============================================================
   CAR ICON
============================================================ */

function CarIcon() {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 17h14" />

      <path d="M6 17v2" />

      <path d="M18 17v2" />

      <path d="M4 14l1.5-5h13L20 14" />

      <path d="M6 14h12" />

      <circle
        cx="7"
        cy="15"
        r="1"
      />

      <circle
        cx="17"
        cy="15"
        r="1"
      />
    </svg>
  );
}

/* ============================================================
   PASSPORT ICON
============================================================ */

function PassportIcon() {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <circle
        cx="12"
        cy="10"
        r="3"
      />

      <path d="M8.5 16h7" />

      <path d="M8.5 18h5" />
    </svg>
  );
}

/* ============================================================
   SHIELD ICON
============================================================ */

function ShieldIcon() {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l8 3v5c0 5.2-3.4 8.7-8 10-4.6-1.3-8-4.8-8-10V6l8-3z" />

      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ============================================================
   LOCK ICON
============================================================ */

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* ============================================================
   CHECK ICON
============================================================ */

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}