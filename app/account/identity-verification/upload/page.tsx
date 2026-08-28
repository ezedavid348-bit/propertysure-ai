"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

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
  | "chevron"
  | "upload"
  | "info"
  | "lock"
  | "check";

const DOCUMENT_NAMES: Record<DocumentType, string> = {
  nin: "NIN / National Identification Number",
  "national-id": "National Identity Card",
  "drivers-license": "Driver’s Licence",
  passport: "International Passport",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

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
    chevron: "›",
    upload: "⇧",
    info: "ⓘ",
    lock: "🔒",
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

export default function DocumentUploadPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentType>("nin");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  /* ============================================================
     LOAD SELECTED DOCUMENT FROM STEP 1
  ============================================================ */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedDocument =
      sessionStorage.getItem(
        "propertysure_kyc_document_type"
      );

    if (
      storedDocument === "nin" ||
      storedDocument === "national-id" ||
      storedDocument === "drivers-license" ||
      storedDocument === "passport"
    ) {
      setSelectedDocument(
        storedDocument as DocumentType
      );
    }
  }, []);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  /* ============================================================
     FILE VALIDATION
  ============================================================ */

  const validateFile = (file: File): boolean => {
    setError("");

    const validType =
      ALLOWED_FILE_TYPES.includes(file.type);

    if (!validType) {
      setError(
        "Please upload a JPG, PNG or PDF file."
      );

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "File size must not exceed 5MB."
      );

      return false;
    }

    return true;
  };

  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  /* ============================================================
     FILE INPUT
  ============================================================ */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    handleFileSelect(file);
  };

  /* ============================================================
     DRAG EVENTS
  ============================================================ */

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    handleFileSelect(file);
  };

  /* ============================================================
     CONTINUE

     IMPORTANT:
     The actual folder is:

     /account/identity-verification/information-confirmation

     NOT:

     /account/identity-verification/information
  ============================================================ */

  const handleContinue = () => {
    if (!selectedFile) {
      setError(
        "Please select your identity document before continuing."
      );

      return;
    }

    if (
      typeof window !== "undefined"
    ) {
      sessionStorage.setItem(
        "propertysure_kyc_file_name",
        selectedFile.name
      );

      sessionStorage.setItem(
        "propertysure_kyc_file_type",
        selectedFile.type
      );
    }

    setUploading(true);

    router.push(
      "/account/identity-verification/information-confirmation"
    );
  };

  /* ============================================================
     DOCUMENT NAME
  ============================================================ */

  const documentName =
    DOCUMENT_NAMES[selectedDocument] ||
    DOCUMENT_NAMES.nin;

  const documentBadge =
    selectedDocument === "nin"
      ? "NIN"
      : selectedDocument === "national-id"
        ? "ID"
        : selectedDocument === "drivers-license"
          ? "DL"
          : "PASS";

  return (
    <main className={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className={styles.mobileHeader}
      >

        <button
          type="button"
          className={styles.menuButton}
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
            navigateTo("/dashboard")
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
          className={styles.mobileBell}
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
                navigateTo("/dashboard")
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
                  key={item.href}
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
                    {item.label}
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
        className={styles.main}
      >

        <div
          className={styles.content}
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
            className={styles.steps}
          >

            <StepItem>

              <Step
                number={1}
                label={
                  <>
                    Identity
                    <br />
                    Document
                  </>
                }
                completed
              />

              <StepLine
                active
              />

            </StepItem>

            <StepItem>

              <Step
                number={2}
                label={
                  <>
                    Document
                    <br />
                    Upload
                  </>
                }
                active
              />

              <StepLine
                active
              />

            </StepItem>

            <StepItem>

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

            </StepItem>

            <StepItem>

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

            </StepItem>

            <StepItem last>

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

            </StepItem>

          </div>

          {/* ==================================================
              VERIFICATION CARD
          ================================================== */}

          <section
            className={
              styles.verificationCard
            }
          >

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
                <UploadCloudIcon />
              </div>

              <div
                className={
                  styles.cardHeaderText
                }
              >

                <h2>
                  Step 2: Document Upload
                </h2>

                <p>
                  Upload a clear photo of your selected
                  identity document.
                </p>

              </div>

            </div>

            <div
              className={
                styles.divider
              }
            />

            {/* =================================================
                DOCUMENT REQUIREMENTS
            ================================================= */}

            <div
              className={
                styles.requirementsBox
              }
            >

              <div
                className={
                  styles.infoIcon
                }
              >
                <InfoIcon />
              </div>

              <div
                className={
                  styles.requirementsContent
                }
              >

                <h3>
                  Make sure your document is:
                </h3>

                <div
                  className={
                    styles.requirementsGrid
                  }
                >

                  <Requirement>
                    Clear and in focus
                  </Requirement>

                  <Requirement>
                    Not blurry or cropped
                  </Requirement>

                  <Requirement>
                    All corners visible
                  </Requirement>

                  <Requirement>
                    Not expired
                  </Requirement>

                </div>

              </div>

            </div>

            {/* =================================================
                SELECTED DOCUMENT
            ================================================= */}

            <div
              className={
                styles.sectionLabel
              }
            >
              Selected document
            </div>

            <div
              className={
                styles.selectedDocument
              }
            >

              <div
                className={
                  styles.ninBadge
                }
              >
                {documentBadge}
              </div>

              <div
                className={
                  styles.selectedDocumentName
                }
              >
                {documentName}
              </div>

              <button
                type="button"
                className={
                  styles.changeButton
                }
                onClick={() =>
                  router.push(
                    "/account/identity-verification"
                  )
                }
              >
                Change
              </button>

            </div>

            {/* =================================================
                UPLOAD DOCUMENT
            ================================================= */}

            <div
              className={
                styles.sectionLabel
              }
            >
              Upload document
            </div>

            <div
              className={`${styles.uploadArea} ${
                dragActive
                  ? styles.uploadAreaActive
                  : ""
              } ${
                selectedFile
                  ? styles.uploadAreaSelected
                  : ""
              }`}
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
            >

              <div
                className={
                  styles.uploadIconCircle
                }
              >
                <UploadIcon />
              </div>

              {selectedFile ? (
                <>
                  <div
                    className={
                      styles.fileName
                    }
                  >
                    {selectedFile.name}
                  </div>

                  <div
                    className={
                      styles.fileSize
                    }
                  >
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={
                      styles.dragText
                    }
                  >
                    Drag and drop your document here
                  </div>

                  <div
                    className={
                      styles.orText
                    }
                  >
                    or
                  </div>
                </>
              )}

              <label
                className={
                  styles.chooseFileButton
                }
              >

                <UploadSmallIcon />

                <span>
                  {selectedFile
                    ? "Choose Another File"
                    : "Choose File"}
                </span>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={
                    handleFileChange
                  }
                  hidden
                />

              </label>

              <div
                className={
                  styles.fileTypes
                }
              >
                JPG, PNG or PDF
                <span>
                  •
                </span>
                Max size 5MB
              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={
                  styles.errorMessage
                }
              >
                {error}
              </div>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            <div
              className={
                styles.securityBox
              }
            >

              <div
                className={
                  styles.securityLock
                }
              >
                <LockIcon />
              </div>

              <p>
                Your document is encrypted and securely
                stored. We never share your data with third
                parties.
              </p>

            </div>

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
                  !selectedFile ||
                  uploading
                }
              >

                <span>
                  {uploading
                    ? "Processing..."
                    : "Continue"}
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
   STEP ITEM
============================================================ */

function StepItem({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`${styles.stepItem} ${
        last
          ? styles.stepItemLast
          : ""
      }`}
    >
      {children}
    </div>
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
  label: React.ReactNode;
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
   REQUIREMENT
============================================================ */

function Requirement({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        styles.requirement
      }
    >

      <span
        className={
          styles.requirementCheck
        }
      >
        ✓
      </span>

      <span>
        {children}
      </span>

    </div>
  );
}

/* ============================================================
   UPLOAD CLOUD ICON
============================================================ */

function UploadCloudIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.39 17.39A5 5 0 0018 8h-1.26A8 8 0 103 16.3" />
      <path d="M16 16l-4-4-4 4" />
    </svg>
  );
}

/* ============================================================
   UPLOAD ICON
============================================================ */

function UploadIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 14v5h14v-5" />
    </svg>
  );
}

/* ============================================================
   SMALL UPLOAD ICON
============================================================ */

function UploadSmallIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 14v5h14v-5" />
    </svg>
  );
}

/* ============================================================
   INFO ICON
============================================================ */

function InfoIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
    </svg>
  );
}

/* ============================================================
   LOCK ICON
============================================================ */

function LockIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

      <path
        d="M8 10V7a4 4 0 018 0v3"
      />

    </svg>
  );
}