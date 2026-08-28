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
  | "history"
  | "fraud"
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
  | "id";

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
    history: "◷",
    fraud: "◇",
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
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

/* ============================================================
   SAFE VALUE
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

export default function InformationConfirmationPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [documentType, setDocumentType] =
    useState<DocumentType>("nin");

  const [fileName, setFileName] =
    useState("Document");

  const [filePreview, setFilePreview] =
    useState<string | null>(null);

  const [kycData, setKycData] =
    useState<ExtractedKycData>({});

  const [confirmed, setConfirmed] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  /* ==========================================================
     LOAD KYC DATA
     
     This page does NOT extract the information itself.

     It reads the information that the previous verification
     process has already stored in sessionStorage.
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

          /* -----------------------------------------------
             If the extracted data itself contains the
             document type, use that as the source of truth.
          ------------------------------------------------ */

          if (
            parsedData.documentType
          ) {
            setDocumentType(
              normalizeDocumentType(
                parsedData.documentType
              )
            );
          }

          /* -----------------------------------------------
             File name from extracted data
          ------------------------------------------------ */

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
    } finally {
      setLoadingData(false);
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
     DYNAMIC DOCUMENT INFORMATION
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

  /* ==========================================================
     DYNAMIC PERSONAL INFORMATION
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
     DYNAMIC DOCUMENT INFORMATION
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
     CONTINUE
  ========================================================== */

  const handleContinue = () => {
    if (!confirmed) {
      return;
    }

    router.push(
      "/account/identity-verification/selfie"
    );
  };

  /* ==========================================================
     VIEW UPLOADED DOCUMENT
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

  return (
    <main
      className={
        styles.page
      }
    >

      {/* ======================================================
          HEADER
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
            <strong>
              {" "}AI
            </strong>
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
                <strong>
                  {" "}AI
                </strong>
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
              PAGE INTRO
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

            {/* =================================================
                LOCKED STANDARD BACK BUTTON

                Arrow: 18px
                Text: 13px
                Gap: 7px
                Height: 22px
                Padding: 0
                Width: fit-content
                Blue: #168eff
                Weight: 500
                Top spacing: 20px
                Alignment: left
            ================================================= */}

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

            {/* STATUS */}

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
              active
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

          {/* ==================================================
              VERIFICATION CARD
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
                <UserCheckIcon />
              </div>

              <div
                className={
                  styles.cardHeaderText
                }
              >

                <h2>
                  Step 3: Information Confirmation
                </h2>

                <p>
                  Please confirm that the information below
                  matches your identity document.
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

            <InformationSection
              title="Personal Information"
            >

              <InformationRow
                icon="user"
                label="Full Name"
                value={
                  loadingData
                    ? "Loading..."
                    : fullName
                }
              />

              <InformationRow
                icon="calendar"
                label="Date of Birth"
                value={
                  loadingData
                    ? "Loading..."
                    : dateOfBirth
                }
              />

              <InformationRow
                icon="gender"
                label="Gender"
                value={
                  loadingData
                    ? "Loading..."
                    : gender
                }
              />

              <InformationRow
                icon="nationality"
                label="Nationality"
                value={
                  loadingData
                    ? "Loading..."
                    : nationality
                }
              />

            </InformationSection>

            {/* =================================================
                DOCUMENT INFORMATION
            ================================================= */}

            <InformationSection
              title="Document Information"
            >

              <InformationRow
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

              <InformationRow
                icon="id"
                label="Document Number"
                value={
                  loadingData
                    ? "Loading..."
                    : documentNumber
                }
              />

              <InformationRow
                icon="calendar"
                label="Date of Issue"
                value={
                  loadingData
                    ? "Loading..."
                    : dateOfIssue
                }
              />

            </InformationSection>

            {/* =================================================
                UPLOADED DOCUMENT
            ================================================= */}

            <InformationSection
              title="Uploaded Document"
            >

              <div
                className={
                  styles.uploadedDocument
                }
              >

                <div
                  className={
                    styles.rowIcon
                  }
                >
                  <Icon
                    name="document"
                    size={18}
                  />
                </div>

                <div
                  className={
                    styles.rowLabel
                  }
                >
                  File Name
                </div>

                <div
                  className={
                    styles.rowValue
                  }
                >
                  {loadingData
                    ? "Loading..."
                    : fileName}
                </div>

                <button
                  type="button"
                  className={
                    styles.viewButton
                  }
                  onClick={
                    handleViewDocument
                  }
                  disabled={
                    !filePreview
                  }
                >
                  View
                </button>

              </div>

            </InformationSection>

            {/* =================================================
                CONFIRMATION
            ================================================= */}

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
                  styles.confirmationText
                }
              >
                I confirm that the above information is correct
                and matches my identity document.
              </span>

            </label>

            {/* =================================================
                CONTINUE
            ================================================= */}

            <div
              className={
                styles.continueRow
              }
            >

              <button
                type="button"
                className={
                  styles.continueButton
                }
                onClick={
                  handleContinue
                }
                disabled={
                  !confirmed
                }
              >

                <span>
                  Continue
                </span>

                <span
                  className={
                    styles.continueArrow
                  }
                >
                  →
                </span>

              </button>

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
          "✓"
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
   INFORMATION SECTION
============================================================ */

function InformationSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className={
        styles.informationSection
      }
    >

      <h3>
        {title}
      </h3>

      <div
        className={
          styles.informationTable
        }
      >
        {children}
      </div>

    </section>
  );
}

/* ============================================================
   INFORMATION ROW
============================================================ */

function InformationRow({
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
        styles.informationRow
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
              size={17}
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
   USER CHECK ICON
============================================================ */

function UserCheckIcon() {
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

      <circle
        cx="17"
        cy="17"
        r="4"
      />

      <path
        d="m15.5 17 1 1 2-2"
      />

    </svg>
  );
}