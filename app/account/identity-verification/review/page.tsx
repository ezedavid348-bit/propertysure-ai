"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

/* ============================================================
   TYPES
============================================================ */

type DocumentType =
  | "nin"
  | "national-id"
  | "drivers-license"
  | "passport";

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "menu"
  | "arrow"
  | "user"
  | "calendar"
  | "gender"
  | "nationality"
  | "document"
  | "id"
  | "lock"
  | "check"
  | "edit"
  | "eye";

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
   NAVIGATION
============================================================ */

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },
  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

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
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    menu: "☰",
    arrow: "←",
    user: "♙",
    calendar: "▣",
    gender: "♙",
    nationality: "⚑",
    document: "▤",
    id: "▣",
    lock: "♧",
    check: "✓",
    edit: "✎",
    eye: "◉",
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
   SAFE DISPLAY VALUE
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

  const normalized = value
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
    normalized === "drivers-license" ||
    normalized.includes("driver") ||
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
    normalized.includes("passport")
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

export default function ReviewSubmitPage() {
  const router = useRouter();

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const [menuOpen, setMenuOpen] =
    useState(false);

  /* ----------------------------------------------------------
     KYC DATA
  ---------------------------------------------------------- */

  const [documentType, setDocumentType] =
    useState<DocumentType>("nin");

  const [fileName, setFileName] =
    useState("Document");

  const [filePreview, setFilePreview] =
    useState<string | null>(null);

  const [kycData, setKycData] =
    useState<ExtractedKycData>({});

  const [selfie, setSelfie] =
    useState<string | null>(null);

  /* ----------------------------------------------------------
     CONFIRMATION
  ---------------------------------------------------------- */

  const [confirmed, setConfirmed] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  /* ==========================================================
     LOAD EXISTING VERIFICATION DATA

     IMPORTANT:
     This page does not perform document extraction.

     It reads the exact information already collected by
     Steps 1–4.
  ========================================================== */

  useEffect(() => {
    if (
      typeof window === "undefined"
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

      if (storedDocument) {
        setDocumentType(
          normalizeDocumentType(
            storedDocument
          )
        );
      }

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
            "PropertySure AI: Unable to parse stored KYC data."
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
        setSelfie(
          storedSelfie
        );
      }

      /* ------------------------------------------------------
         PREVIOUS SUBMISSION STATE
      ------------------------------------------------------ */

      const storedStatus =
        sessionStorage.getItem(
          "propertysure_kyc_verification_status"
        );

      if (
        storedStatus === "Pending"
      ) {
        setSubmitted(true);
      }
    } catch {
      /*
       * Ignore sessionStorage errors.
       */
    }
  }, []);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigateTo = (
    path: string
  ) => {
    setMenuOpen(false);
    router.push(path);
  };

  /* ==========================================================
     DYNAMIC VALUES
  ========================================================== */

  const documentName =
    kycData.documentType
      ? kycData.documentType
      : DOCUMENT_NAMES[
          documentType
        ];

  const documentBadge =
    getDocumentBadge(
      documentType
    );

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

  const documentNumber =
    displayValue(
      kycData.documentNumber
    );

  const dateOfIssue =
    displayValue(
      kycData.dateOfIssue
    );

  /* ==========================================================
     VIEW DOCUMENT
  ========================================================== */

  const handleViewDocument = () => {
    if (!filePreview) {
      return;
    }

    window.open(
      filePreview,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ==========================================================
     EDIT SECTIONS
  ========================================================== */

  const handleEditDocument =
    () => {
      router.push(
        "/account/identity-verification"
      );
    };

  const handleEditUpload =
    () => {
      router.push(
        "/account/identity-verification/upload"
      );
    };

  const handleEditInformation =
    () => {
      router.push(
        "/account/identity-verification/confirmation"
      );
    };

  const handleEditSelfie =
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
      !selfie
    ) {
      return;
    }

    try {
      sessionStorage.setItem(
        "propertysure_kyc_verification_status",
        "Pending"
      );

      sessionStorage.setItem(
        "propertysure_kyc_submitted",
        "true"
      );
    } catch {
      // Ignore storage errors.
    }

    setSubmitted(true);
  };

  return (
    <main className={styles.page}>

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogoButton
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
          aria-label="PropertySure AI Dashboard"
        >
          <span
            className={
              styles.mobileLogoDiamond
            }
          >
            ◆
          </span>

          <span
            className={
              styles.mobileBrandName
            }
          >
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={17}
          />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuLogo
              }
              onClick={() =>
                navigateTo(
                  "/dashboard"
                )
              }
            >
              <span>
                ◆
              </span>

              <div>
                PropertySure
                <strong> AI</strong>
              </div>
            </button>

            <button
              type="button"
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property Due
            Diligence
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map(
              (item) => (
                <button
                  key={
                    item.href
                  }
                  type="button"
                  className={
                    styles.mobileNavItem
                  }
                  onClick={() =>
                    navigateTo(
                      item.href
                    )
                  }
                >
                  <span
                    className={
                      styles.navIcon
                    }
                  >
                    <Icon
                      name={
                        item.icon
                      }
                      size={18}
                    />
                  </span>

                  <span>
                    {
                      item.label
                    }
                  </span>
                </button>
              )
            )}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="account"
                size={18}
              />
            </span>

            <span>
              Account
            </span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="settings"
                size={18}
              />
            </span>

            <span>
              Settings
            </span>
          </button>
        </div>
      )}

      {/* ======================================================
          MAIN
      ====================================================== */}

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
              onClick={() =>
                router.push(
                  "/account"
                )
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Account
              </span>
            </button>

            {/* STATUS IS DIRECTLY BELOW BACK TO ACCOUNT */}

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
                  ? "Pending Verification"
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
            <Step
              completed
              number={1}
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

            <Step
              completed
              number={2}
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

            <Step
              completed
              number={3}
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

            <Step
              completed
              number={4}
              label={
                <>
                  Selfie
                  <br />
                  Verification
                </>
              }
            />

            <StepLine
              active
            />

            <Step
              active
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

          {/* ==================================================
              REVIEW CARD
          ================================================== */}

          <section
            className={
              styles.verificationCard
            }
          >

            {/* CARD HEADER */}

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
                <ReviewIcon />
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
                  Please review all the information below
                  before submitting your verification.
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

            <ReviewSection
              number="1."
              title="Personal Information"
              onEdit={
                handleEditInformation
              }
            >
              <div
                className={
                  styles.personalBox
                }
              >
                <ReviewRow
                  icon="user"
                  label="Full Name"
                  value={
                    fullName
                  }
                />

                <ReviewRow
                  icon="calendar"
                  label="Date of Birth"
                  value={
                    dateOfBirth
                  }
                />

                <ReviewRow
                  icon="gender"
                  label="Gender"
                  value={
                    gender
                  }
                />

                <ReviewRow
                  icon="nationality"
                  label="Nationality"
                  value={
                    nationality
                  }
                />
              </div>
            </ReviewSection>

            {/* =================================================
                DOCUMENT INFORMATION
            ================================================= */}

            <ReviewSection
              number="2."
              title="Document Information"
              onEdit={
                handleEditDocument
              }
            >
              <div
                className={
                  styles.documentBox
                }
              >
                <ReviewRow
                  badge={
                    documentBadge
                  }
                  label="Document Type"
                  value={
                    documentName
                  }
                />

                <ReviewRow
                  icon="id"
                  label="Document Number"
                  value={
                    documentNumber
                  }
                />

                <ReviewRow
                  icon="calendar"
                  label="Date of Issue"
                  value={
                    dateOfIssue
                  }
                />
              </div>
            </ReviewSection>

            {/* =================================================
                UPLOADED DOCUMENT
            ================================================= */}

            <ReviewSection
              number="3."
              title="Uploaded Document"
              onEdit={
                handleEditUpload
              }
            >
              <div
                className={
                  styles.uploadedBox
                }
              >
                <div
                  className={
                    styles.fileIcon
                  }
                >
                  <Icon
                    name="document"
                    size={19}
                  />
                </div>

                <div
                  className={
                    styles.fileDetails
                  }
                >
                  <span>
                    File Name
                  </span>

                  <strong>
                    {fileName}
                  </strong>
                </div>

                <button
                  type="button"
                  className={
                    styles.viewDocumentButton
                  }
                  onClick={
                    handleViewDocument
                  }
                  disabled={
                    !filePreview
                  }
                >
                  <Icon
                    name="eye"
                    size={17}
                  />

                  <span>
                    View Document
                  </span>
                </button>
              </div>
            </ReviewSection>

            {/* =================================================
                SELFIE
            ================================================= */}

            <ReviewSection
              number="4."
              title="Selfie Verification"
              onEdit={
                handleEditSelfie
              }
            >
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
                  {selfie ? (
                    <img
                      src={selfie}
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
                        size={26}
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
                    Selfie Captured
                  </strong>

                  <span>
                    {selfie
                      ? "Identity selfie successfully captured"
                      : "Selfie not available"}
                  </span>
                </div>

                <div
                  className={
                    selfie
                      ? styles.capturedBadge
                      : styles.missingBadge
                  }
                >
                  <span>
                    {selfie
                      ? "✓"
                      : "!"}
                  </span>

                  <span>
                    {selfie
                      ? "Captured"
                      : "Missing"}
                  </span>
                </div>
              </div>
            </ReviewSection>

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
                      event.target
                        .checked
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

                <div
                  className={
                    styles.confirmationContent
                  }
                >
                  <div
                    className={
                      styles.confirmationLock
                    }
                  >
                    <LockIcon />
                  </div>

                  <span>
                    By submitting, you confirm that all
                    the information provided is correct
                    and belongs to you.
                  </span>
                </div>

                <span
                  className={
                    styles.confirmationShort
                  }
                >
                  I confirm
                </span>
              </label>
            )}

            {/* =================================================
                SUBMITTED STATE
            ================================================= */}

            {submitted ? (
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
                    submitted and is now pending review.
                  </p>
                </div>
              </div>
            ) : (
              /* =================================================
                 SUBMIT BUTTON
              ================================================= */

              <button
                type="button"
                className={`${styles.submitButton} ${
                  !confirmed ||
                  !selfie
                    ? styles.submitDisabled
                    : ""
                }`}
                onClick={
                  handleSubmit
                }
                disabled={
                  !confirmed ||
                  !selfie
                }
              >
                <span
                  className={
                    styles.submitDiamond
                  }
                >
                  ◇
                </span>

                <span>
                  Submit for Verification
                </span>
              </button>
            )}

            {/* =================================================
                PRIVACY
            ================================================= */}

            <div
              className={
                styles.privacyBox
              }
            >
              <LockIcon />

              <p>
                Your information is encrypted and securely
                stored. We never share your data with third
                parties.
              </p>
            </div>

          </section>
        </div>
      </section>

      {/* ======================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo(
              "/verify"
            )
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>
            Verify
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>
            Properties
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>
            Reports
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>
            Account
          </span>
        </button>
      </nav>
    </main>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({
  number,
  label,
  active = false,
  completed = false,
}: {
  number: number;
  label: ReactNode;
  active?: boolean;
  completed?: boolean;
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
   REVIEW SECTION
============================================================ */

function ReviewSection({
  number,
  title,
  children,
  onEdit,
}: {
  number: string;
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
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
          <span>
            {number}
          </span>{" "}
          {title}
        </h3>

        <button
          type="button"
          className={
            styles.editButton
          }
          onClick={
            onEdit
          }
        >
          <span>
            Edit
          </span>

          <Icon
            name="edit"
            size={16}
          />
        </button>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   REVIEW ROW
============================================================ */

function ReviewRow({
  icon,
  badge,
  label,
  value,
}: {
  icon?: IconName;
  badge?: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        styles.reviewRow
      }
    >
      {badge ? (
        <div
          className={
            styles.documentBadge
          }
        >
          {badge}
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
              size={16}
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

function ReviewIcon() {
  return (
    <svg
      width="35"
      height="35"
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

      <path d="M9 3.5h6" />

      <path d="M9 9h6" />

      <path d="M9 13h3" />

      <path d="M9 17l1.5 1.5L14 15" />
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

      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}