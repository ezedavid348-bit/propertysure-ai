"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";

type DocumentType =
  | "nin"
  | "national-id"
  | "drivers-license"
  | "passport";

type IconName = "arrow";

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

const INITIAL_LOADING_TIME = 700;
const NAVIGATION_LOADING_TIME = 700;

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
    arrow: "←",
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
   PAGE
============================================================ */

export default function DocumentUploadPage() {
  const router = useRouter();

  const loadingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigationTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentType>("nin");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  /*
  ============================================================
  PAGE LOADING
  ============================================================
  */

  const [loading, setLoading] =
    useState(true);

  /* ============================================================
     INITIALIZE PAGE
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    try {
      const storedDocument =
        sessionStorage.getItem(
          "propertysure_kyc_document_type",
        );

      if (
        storedDocument === "nin" ||
        storedDocument === "national-id" ||
        storedDocument === "drivers-license" ||
        storedDocument === "passport"
      ) {
        setSelectedDocument(
          storedDocument as DocumentType,
        );
      }
    } catch {
      /*
        If sessionStorage is unavailable,
        continue with the default NIN document.
      */
    }

    /*
      Keep the shared loading screen visible
      long enough for the user to see it.
    */
    loadingTimeoutRef.current =
      setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, INITIAL_LOADING_TIME);

    return () => {
      mounted = false;

      if (loadingTimeoutRef.current) {
        clearTimeout(
          loadingTimeoutRef.current,
        );

        loadingTimeoutRef.current = null;
      }

      if (navigationTimeoutRef.current) {
        clearTimeout(
          navigationTimeoutRef.current,
        );

        navigationTimeoutRef.current = null;
      }
    };
  }, []);

  /* ============================================================
     SHARED LOADING SCREEN
  ============================================================ */

  if (loading || uploading) {
    return <LoadingScreen />;
  }

  /* ============================================================
     FILE VALIDATION
  ============================================================ */

  const validateFile = (
    file: File,
  ): boolean => {
    setError("");

    const validType =
      ALLOWED_FILE_TYPES.includes(
        file.type,
      );

    if (!validType) {
      setError(
        "Please upload a JPG, PNG or PDF file.",
      );

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "File size must not exceed 5MB.",
      );

      return false;
    }

    return true;
  };

  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileSelect = (
    file: File,
  ) => {
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
    event: ChangeEvent<HTMLInputElement>,
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
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
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
     STEP 2 → STEP 3
  ============================================================ */

  const handleContinue = () => {
    if (!selectedFile) {
      setError(
        "Please select your identity document before continuing.",
      );

      return;
    }

    if (
      typeof window !==
      "undefined"
    ) {
      sessionStorage.setItem(
        "propertysure_kyc_file_name",
        selectedFile.name,
      );

      sessionStorage.setItem(
        "propertysure_kyc_file_type",
        selectedFile.type,
      );
    }

    /*
      Clear any previous navigation timer.
    */
    if (
      navigationTimeoutRef.current
    ) {
      clearTimeout(
        navigationTimeoutRef.current,
      );
    }

    /*
      Show the shared LoadingScreen
      before Step 3 opens.
    */
    setUploading(true);

    navigationTimeoutRef.current =
      setTimeout(() => {
        router.push(
          "/account/identity-verification/information-confirmation",
        );
      }, NAVIGATION_LOADING_TIME);
  };

  /* ============================================================
     DOCUMENT NAME
  ============================================================ */

  const documentName =
    DOCUMENT_NAMES[
      selectedDocument
    ] || DOCUMENT_NAMES.nin;

  const documentBadge =
    selectedDocument === "nin"
      ? "NIN"
      : selectedDocument ===
          "national-id"
        ? "ID"
        : selectedDocument ===
            "drivers-license"
          ? "DL"
          : "PASS";

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main className={styles.page}>
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

              {/* ==================================================
                  BACK TO IDENTITY DOCUMENT
              ================================================== */}

              <button
                type="button"
                className={
                  styles.backLink
                }
                onClick={() =>
                  router.push(
                    "/account/identity-verification",
                  )
                }
              >
                <Icon
                  name="arrow"
                  size={18}
                />

                <span>
                  Back to Identity Document
                </span>
              </button>

              {/* ==================================================
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
                      "/account/identity-verification",
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
      </main>
    </AppShell>
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