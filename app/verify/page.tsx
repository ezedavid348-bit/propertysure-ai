"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type SelectedDocument = {
  file: File;
  id: string;
};

type UploadedDocument = {
  id: string;
  name: string;
  original_name: string;
  path: string;
  type: string;
  mime_type: string;
  size: number;
};

type VerificationFindings = {
  document_package: UploadedDocument[];
  document_count: number;

  checks: {
    documentStructure: boolean | null;
    dataConsistency: boolean | null;
    signatureValid: boolean | null;
    stampValid: boolean | null;
    noForgery: boolean | null;
    noDuplicate: boolean | null;
    documentCompleteness: boolean | null;
  };

  processing: {
    stage: "received";
    progress: 8;
    message: string;
  };
};

const STORAGE_BUCKET = "property-documents";

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function getDocumentType(
  file: File
): string {
  if (
    file.type ===
    "application/pdf"
  ) {
    return "PDF";
  }

  if (
    file.type ===
    "image/jpeg"
  ) {
    return "JPG";
  }

  if (
    file.type ===
    "image/png"
  ) {
    return "PNG";
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toUpperCase();

  return extension || "FILE";
}

function formatFileSize(
  bytes: number
): string {
  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function createSafeFileName(
  fileName: string
): string {
  const lastDot =
    fileName.lastIndexOf(".");

  const extension =
    lastDot >= 0
      ? fileName
          .slice(lastDot)
          .toLowerCase()
      : "";

  const baseName =
    lastDot >= 0
      ? fileName.slice(
          0,
          lastDot
        )
      : fileName;

  const safeBase =
    baseName
      .normalize("NFKD")
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return `${
    safeBase ||
    "property-document"
  }${extension}`;
}

function getFileKey(
  file: File
): string {
  return `${file.name}__${file.size}__${file.lastModified}`;
}

function createDocumentId(): string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function VerifyPage() {
  const router =
    useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true);

  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    documents,
    setDocuments,
  ] =
    useState<SelectedDocument[]>(
      []
    );

  const [
    isDragging,
    setIsDragging,
  ] =
    useState(false);

  const [
    isUploading,
    setIsUploading,
  ] =
    useState(false);

  const [
    uploadError,
    setUploadError,
  ] =
    useState("");

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoadingPage(false);
      }, 350);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  function navigateTo(
    path: string
  ) {
    setMenuOpen(false);

    window.location.href =
      path;
  }

  function addDocuments(
    selectedFiles:
      | FileList
      | File[]
  ) {
    setUploadError("");

    const incomingFiles =
      Array.from(
        selectedFiles
      );

    if (
      incomingFiles.length ===
      0
    ) {
      return;
    }

    const invalidFiles:
      string[] = [];

    const duplicateFiles:
      string[] = [];

    const existingFileKeys =
      new Set(
        documents.map(
          (
            document
          ) =>
            getFileKey(
              document.file
            )
        )
      );

    const currentSelectionKeys =
      new Set<string>();

    const validFiles:
      File[] = [];

    for (
      const file of
      incomingFiles
    ) {
      if (
        !ALLOWED_TYPES.includes(
          file.type
        )
      ) {
        invalidFiles.push(
          `${file.name}: unsupported file type`
        );

        continue;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        invalidFiles.push(
          `${file.name}: exceeds 20 MB`
        );

        continue;
      }

      const fileKey =
        getFileKey(file);

      if (
        existingFileKeys.has(
          fileKey
        )
      ) {
        duplicateFiles.push(
          file.name
        );

        continue;
      }

      if (
        currentSelectionKeys.has(
          fileKey
        )
      ) {
        duplicateFiles.push(
          file.name
        );

        continue;
      }

      currentSelectionKeys.add(
        fileKey
      );

      validFiles.push(
        file
      );
    }

    const messages:
      string[] = [];

    if (
      invalidFiles.length >
      0
    ) {
      messages.push(
        invalidFiles.join(
          " • "
        )
      );
    }

    if (
      duplicateFiles.length >
      0
    ) {
      messages.push(
        `Already selected: ${duplicateFiles.join(
          ", "
        )}`
      );
    }

    if (
      messages.length >
      0
    ) {
      setUploadError(
        messages.join(
          " • "
        )
      );
    }

    if (
      validFiles.length ===
      0
    ) {
      return;
    }

    const newDocuments =
      validFiles.map(
        (
          file
        ) => ({
          file,
          id:
            createDocumentId(),
        })
      );

    setDocuments(
      (
        current
      ) => [
        ...current,
        ...newDocuments,
      ]
    );
  }

  function handleFileInput(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    if (
      event.target.files
    ) {
      addDocuments(
        event.target.files
      );
    }

    event.target.value = "";
  }

  function handleDragOver(
    event:
      DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();

    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(
    event:
      DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();

    setIsDragging(false);

    if (
      event.dataTransfer.files
    ) {
      addDocuments(
        event.dataTransfer.files
      );
    }
  }

  function removeDocument(
    documentId: string
  ) {
    if (
      isUploading
    ) {
      return;
    }

    setDocuments(
      (
        current
      ) =>
        current.filter(
          (
            document
          ) =>
            document.id !==
            documentId
        )
    );

    setUploadError("");
  }

  function openFilePicker() {
    if (
      isUploading
    ) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleVerification() {
    if (
      documents.length ===
        0 ||
      isUploading
    ) {
      return;
    }

    setIsUploading(true);

    setUploadError("");

    const uploadedStoragePaths:
      string[] = [];

    try {
      /*
       * ======================================================
       * 1. GET EXISTING SESSION
       * ======================================================
       */

      const {
        data: {
          session,
        },
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError
      ) {
        console.error(
          "PROPERTY SURE AI: SESSION CHECK ERROR:",
          sessionError
        );

        throw new Error(
          "We could not verify your account session. Please sign in again."
        );
      }

      /*
       * ======================================================
       * 2. REQUIRE REAL AUTHENTICATED USER
       *
       * IMPORTANT:
       * NO anonymous fallback.
       * ======================================================
       */

      if (
        !session?.user ||
        session.user.is_anonymous ===
          true
      ) {
        router.replace(
          "/signin"
        );

        return;
      }

      /*
       * ======================================================
       * 3. USER ID
       * ======================================================
       */

      const user =
        session.user;

      console.log(
        "PROPERTY SURE AI: Verification user:",
        {
          userId:
            user.id,

          anonymous:
            user.is_anonymous ===
            true,
        }
      );

      /*
       * ======================================================
       * 4. UPLOAD COMPLETE DOCUMENT PACKAGE
       * ======================================================
       */

      const uploadedDocuments:
        UploadedDocument[] = [];

      for (
        let index = 0;
        index <
        documents.length;
        index++
      ) {
        const selectedDocument =
          documents[index];

        const file =
          selectedDocument.file;

        const originalFileName =
          file.name;

        const safeFileName =
          createSafeFileName(
            originalFileName
          );

        const documentId =
          selectedDocument.id;

        const filePath =
          `${user.id}/verification-uploads/${documentId}/${safeFileName}`;

        console.log(
          "PROPERTY SURE AI: UPLOADING DOCUMENT:",
          {
            documentId,
            originalFileName,
            safeFileName,
            filePath,
            mimeType:
              file.type,
            size:
              file.size,
          }
        );

        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              STORAGE_BUCKET
            )
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",

                upsert:
                  false,

                contentType:
                  file.type,
              }
            );

        if (
          storageError
        ) {
          console.error(
            "SUPABASE STORAGE UPLOAD ERROR:",
            storageError
          );

          throw new Error(
            `Could not upload "${originalFileName}": ${storageError.message}`
          );
        }

        uploadedStoragePaths.push(
          filePath
        );

        const {
          data:
            signedUrlData,
          error:
            signedUrlError,
        } =
          await supabase.storage
            .from(
              STORAGE_BUCKET
            )
            .createSignedUrl(
              filePath,
              60 * 10
            );

        if (
          signedUrlError ||
          !signedUrlData?.signedUrl
        ) {
          console.error(
            "SUPABASE STORAGE VERIFICATION ERROR:",
            {
              filePath,
              signedUrlError,
            }
          );

          throw new Error(
            `The document "${originalFileName}" uploaded, but PropertySure could not verify the stored file. Please try uploading it again.`
          );
        }

        uploadedDocuments.push({
          id:
            documentId,

          name:
            originalFileName,

          original_name:
            originalFileName,

          path:
            filePath,

          type:
            getDocumentType(
              file
            ),

          mime_type:
            file.type,

          size:
            file.size,
        });
      }

      if (
        uploadedDocuments.length ===
        0
      ) {
        throw new Error(
          "No documents were uploaded."
        );
      }

      const findings:
        VerificationFindings =
        {
          document_package:
            uploadedDocuments,

          document_count:
            uploadedDocuments.length,

          checks: {
            documentStructure:
              null,

            dataConsistency:
              null,

            signatureValid:
              null,

            stampValid:
              null,

            noForgery:
              null,

            noDuplicate:
              null,

            documentCompleteness:
              null,
          },

          processing: {
            stage:
              "received",

            progress:
              8,

            message:
              "Your property document package has been securely received.",
          },
        };

      const primaryDocument =
        uploadedDocuments[0];

      if (
        !primaryDocument
      ) {
        throw new Error(
          "No primary document was found."
        );
      }

      const {
        data:
          verificationRecord,
        error:
          verificationError,
      } =
        await supabase
          .from(
            "verifications"
          )
          .insert({
            user_id:
              user.id,

            doc_name:
              primaryDocument.name,

            file_url:
              primaryDocument.path,

            doc_type:
              primaryDocument.type,

            status:
              "review",

            trust_score:
              null,

            confidence:
              null,

            risk:
              null,

            findings,
          })
          .select(
            "id"
          )
          .single();

      if (
        verificationError
      ) {
        console.error(
          "VERIFICATION RECORD ERROR:",
          verificationError
        );

        if (
          uploadedStoragePaths.length >
          0
        ) {
          const {
            error:
              rollbackError,
          } =
            await supabase.storage
              .from(
                STORAGE_BUCKET
              )
              .remove(
                uploadedStoragePaths
              );

          if (
            rollbackError
          ) {
            console.warn(
              "STORAGE ROLLBACK WARNING:",
              rollbackError
            );
          }
        }

        throw new Error(
          `Could not create verification record: ${verificationError.message}`
        );
      }

      if (
        !verificationRecord?.id
      ) {
        throw new Error(
          "Verification record was created but no verification ID was returned."
        );
      }

      console.log(
        "PROPERTY SURE AI: VERIFICATION CREATED:",
        {
          verificationId:
            verificationRecord.id,

          userId:
            user.id,

          anonymous:
            user.is_anonymous ===
            true,

          documentCount:
            uploadedDocuments.length,

          documents:
            uploadedDocuments.map(
              (
                document
              ) => ({
                id:
                  document.id,

                name:
                  document.name,

                original_name:
                  document.original_name,

                path:
                  document.path,

                type:
                  document.type,

                mime_type:
                  document.mime_type,

                size:
                  document.size,
              })
            ),
        }
      );

      window.location.href =
        `/verify/review?id=${encodeURIComponent(
          verificationRecord.id
        )}`;
    } catch (
      error
    ) {
      console.error(
        "VERIFICATION START ERROR:",
        error
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading your documents."
      );

      setIsUploading(false);
    }
  }

  const documentCount =
    documents.length;

  const hasDocuments =
    documentCount > 0;

  if (loadingPage) {
    return (
      <main className="dashboardLoading">
        <div className="loadingBrand">
          <div className="loadingLogo">
            ◆
          </div>

          <div className="loadingTitle">
            <span>
              PropertySure
            </span>

            <strong>
              AI
            </strong>
          </div>
        </div>

        <div className="loadingText">
          Loading verification...
        </div>

        <style jsx>{`
          .dashboardLoading {
            min-height: 100vh;

            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(
                  0,
                  123,
                  255,
                  0.18
                ),
                transparent 30%
              ),
              #06152f;

            color: #ffffff;

            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 10px;
          }

          .loadingBrand {
            display: flex;

            align-items: center;

            gap: 8px;
          }

          .loadingLogo {
            color: #168eff;

            font-size: 42px;

            line-height: 1;
          }

          .loadingTitle {
            font-size: 22px;

            font-weight: 700;

            letter-spacing: -0.2px;
          }

          .loadingTitle span {
            color: #ffffff;
          }

          .loadingTitle strong {
            color: #168eff;
          }

          .loadingText {
            color: #8ea4c3;

            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="verifyPage">

      <header className="mobileHeader">

        <button
          className="menuButton"
          type="button"
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          className="mobileLogoButton"
          type="button"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <span className="mobileLogoDiamond">
            ◆
          </span>

          <span className="mobileBrandName">
            PropertySure
            <strong>
              AI
            </strong>
          </span>
        </button>

        <button
          className="mobileBell"
          type="button"
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <span className="bellIcon">
            🔔
          </span>

          <span className="mobileNotificationDot" />
        </button>

      </header>

      {menuOpen && (

        <div className="mobileMenu">

          <div className="mobileMenuHeader">

            <div>

              <div className="mobileMenuLogo">

                <span className="mobileMenuDiamond">
                  ◆
                </span>

                <span>
                  PropertySure
                  <strong>
                    AI
                  </strong>
                </span>

              </div>

              <div className="mobileMenuSubtitle">
                AI-Powered Property Due Diligence
              </div>

            </div>

            <button
              className="closeMenu"
              type="button"
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>

          </div>

          <nav className="mobileMenuNav">

            <button
              className="mobileNavItem"
              type="button"
              onClick={() =>
                navigateTo(
                  "/dashboard"
                )
              }
            >
              <span className="navIcon">
                ▦
              </span>

              Dashboard
            </button>

            <button
              className="mobileNavItem active"
              type="button"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              <span className="navIcon">
                ⇧
              </span>

              Verify Property
            </button>

            <button
              className="mobileNavItem"
              type="button"
              onClick={() =>
                navigateTo(
                  "/my-properties"
                )
              }
            >
              <span className="navIcon">
                ⌂
              </span>

              My Properties
            </button>

            <button
              className="mobileNavItem"
              type="button"
              onClick={() =>
                navigateTo(
                  "/verification-history"
                )
              }
            >
              <span className="navIcon">
                ◷
              </span>

              Verification History
            </button>

            <button
              className="mobileNavItem"
              type="button"
              onClick={() =>
                navigateTo(
                  "/fraud-watch"
                )
              }
            >
              <span className="navIcon">
                ◈
              </span>

              Fraud Watch
            </button>

            <button
              className="mobileNavItem"
              type="button"
              onClick={() =>
                navigateTo(
                  "/reports"
                )
              }
            >
              <span className="navIcon">
                ▤
              </span>

              Reports
            </button>

          </nav>

          <div className="mobileAccountLabel">
            ACCOUNT
          </div>

          <button
            className="mobileNavItem"
            type="button"
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <span className="navIcon">
              ◯
            </span>

            Account
          </button>

          <button
            className="mobileNavItem"
            type="button"
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <span className="navIcon">
              ⚙
            </span>

            Settings
          </button>

        </div>
      )}

      <div className="pageContent">

        <div className="verificationBadge">

          <span className="badgeDiamond">
            ◇
          </span>

          AI-POWERED VERIFICATION

        </div>

        <section className="intro">

          <h1>
            Let's{" "}
            <span>
              Verify
            </span>{" "}
            Your Property
          </h1>

          <p>
            Upload your complete property
            document package and let
            PropertySure AI analyze the
            submitted documents for
            authenticity, consistency,
            completeness and potential
            risk indicators.
          </p>

        </section>

        <section
          className={`uploadCard ${
            isDragging
              ? "uploadCardDragging"
              : ""
          }`}
        >

          <label
            className={`uploadZone ${
              isDragging
                ? "dragging"
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

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={
                handleFileInput
              }
              disabled={
                isUploading
              }
            />

            <div className="uploadIllustration">

              <div className="documentBack">

                <div className="documentLines">

                  <span />
                  <span />
                  <span />

                </div>

              </div>

              <div className="documentFront">

                <div className="documentLines">

                  <span />
                  <span />
                  <span />

                </div>

              </div>

              <div className="uploadCircle">
                ↑
              </div>

            </div>

            <h2>
              Upload Document Package
            </h2>

            <p className="uploadInstruction">
              Tap to browse or drag & drop
              your property documents
            </p>

            <div className="fileTypes">

              <span className="fileType pdf">
                PDF
              </span>

              <span className="fileType jpg">
                JPG
              </span>

              <span className="fileType png">
                PNG
              </span>

            </div>

            <div className="uploadLimit">
              Upload all relevant documents • 20 MB each
            </div>

          </label>

          {hasDocuments && (

            <div className="selectedDocuments">

              <div className="selectedHeader">

                <div>
                  Documents selected
                </div>

                <span>
                  {documentCount}{" "}
                  {documentCount ===
                  1
                    ? "document"
                    : "documents"}
                </span>

              </div>

              {documents.map(
                (
                  document,
                  index
                ) => (

                  <div
                    className="documentRow"
                    key={
                      document.id
                    }
                  >

                    <div className="documentRowIcon">

                      {getDocumentType(
                        document.file
                      )}

                    </div>

                    <div className="documentRowInfo">

                      <div className="documentRowName">

                        {
                          document
                            .file
                            .name
                        }

                      </div>

                      <div className="documentRowMeta">

                        Document{" "}
                        {index + 1}

                        {" • "}

                        {getDocumentType(
                          document.file
                        )}

                        {" • "}

                        {formatFileSize(
                          document
                            .file
                            .size
                        )}

                      </div>

                    </div>

                    <button
                      type="button"
                      className="removeDocument"
                      onClick={() =>
                        removeDocument(
                          document.id
                        )
                      }
                      disabled={
                        isUploading
                      }
                      aria-label={`Remove ${document.file.name}`}
                    >
                      ×
                    </button>

                  </div>

                )
              )}

              <button
                type="button"
                className="addMoreButton"
                onClick={
                  openFilePicker
                }
                disabled={
                  isUploading
                }
              >
                + Add another document
              </button>

            </div>

          )}

        </section>

        {uploadError && (

          <div className="errorMessage">

            <span>
              !
            </span>

            <p>
              {uploadError}
            </p>

          </div>

        )}

        <button
          type="button"
          className={`startButton ${
            !hasDocuments ||
            isUploading
              ? "disabled"
              : ""
          }`}
          disabled={
            !hasDocuments ||
            isUploading
          }
          onClick={
            handleVerification
          }
        >

          <span className="sparkle">
            ✦
          </span>

          <span>
            {isUploading
              ? "Uploading Documents..."
              : "Continue to Review"}
          </span>

          {!isUploading && (

            <span className="startArrow">
              →
            </span>

          )}

        </button>

        <div className="securityNotice">

          <span className="securityIcon">
            ♧
          </span>

          <span>
            Your documents are securely
            uploaded and processed through
            the PropertySure AI verification
            workflow.
          </span>

        </div>

        <section className="benefitsCard">

          <div className="benefit">

            <div className="benefitIcon secureIcon">
              ♢
            </div>

            <strong>
              Secure
            </strong>

            <span>
              Protected
              <br />
              Documents
            </span>

          </div>

          <div className="benefitDivider" />

          <div className="benefit">

            <div className="benefitIcon fastIcon">
              ◷
            </div>

            <strong>
              Fast
            </strong>

            <span>
              Automated
              <br />
              Workflow
            </span>

          </div>

          <div className="benefitDivider" />

          <div className="benefit">

            <div className="benefitIcon aiIcon">
              ✤
            </div>

            <strong>
              AI-Powered
            </strong>

            <span>
              Document
              <br />
              Analysis
            </span>

          </div>

          <div className="benefitDivider" />

          <div className="benefit">

            <div className="benefitIcon reliableIcon">
              ♢
            </div>

            <strong>
              Reliable
            </strong>

            <span>
              Structured
              <br />
              Findings
            </span>

          </div>

        </section>

        <button
          type="button"
          className="reportCard"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >

          <div className="reportIcon">
            ▤
          </div>

          <div className="reportText">

            <strong>
              Verification Reports
            </strong>

            <span>
              View completed verification
              reports and results.
            </span>

          </div>

          <div className="reportArrow">
            ›
          </div>

        </button>

      </div>

      <nav className="bottomNav">

        <button
          type="button"
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >

          <span>
            ▦
          </span>

          <small>
            Dashboard
          </small>

        </button>

        <button
          type="button"
          className="bottomItem active"
        >

          <span>
            ⇧
          </span>

          <small>
            Verify
          </small>

        </button>

        <button
          type="button"
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >

          <span>
            ⌂
          </span>

          <small>
            Properties
          </small>

        </button>

        <button
          type="button"
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >

          <span>
            ▤
          </span>

          <small>
            Reports
          </small>

        </button>

        <button
          type="button"
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >

          <span>
            ◯
          </span>

          <small>
            Account
          </small>

        </button>

      </nav>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .verifyPage {
          min-height: 100vh;
          padding-bottom: 80px;
          color: #f8fafc;

          background:
            radial-gradient(
              circle at 50% -20%,
              rgba(
                17,
                105,
                190,
                .22
              ),
              transparent 40%
            ),
            linear-gradient(
              180deg,
              #031328 0%,
              #041a34 50%,
              #021124 100%
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button {
          font-family: inherit;
        }

        .mobileHeader {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          padding: 0 14px;

          display: grid;

          grid-template-columns:
            44px
            minmax(0, 1fr)
            44px;

          align-items: center;

          background:
            rgba(
              3,
              18,
              40,
              0.98
            );

          border-bottom:
            1px solid
            #193650;
        }

        .menuButton {
          width: 40px;
          height: 40px;
          border: 0;
          background: transparent;
          color: white;
          font-size: 24px;
          padding: 5px;
          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobileLogoButton {
          height: 40px;
          border: none;
          background: transparent;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.2px;

          cursor: pointer;
          min-width: 0;
        }

        .mobileLogoDiamond {
          color: #168eff;
          font-size: 23px;
          line-height: 1;
          flex-shrink: 0;
        }

        .mobileBrandName {
          color: #ffffff;
          white-space: nowrap;
        }

        .mobileBrandName strong {
          color: #168eff;
        }

        .mobileBell {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: white;
          position: relative;

          display: grid;
          place-items: center;

          cursor: pointer;
          padding: 0;
        }

        .mobileBell .bellIcon {
          font-size: 17px;
          line-height: 1;
          display: block;
        }

        .mobileNotificationDot {
          position: absolute;
          width: 8px;
          height: 8px;
          top: 5px;
          right: 3px;
          border-radius: 50%;
          background: #168eff;

          box-shadow:
            0 0 8px
            rgba(
              22,
              142,
              255,
              0.6
            );
        }

        .mobileBell:hover {
          background:
            rgba(
              22,
              142,
              255,
              0.05
            );
        }

        .mobileMenu {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: block;
          background: #06152f;
          padding: 22px;
          overflow-y: auto;
        }

        .mobileMenuHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .mobileMenuLogo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .mobileMenuDiamond {
          color: #168eff;
          font-size: 25px;
          line-height: 1;
        }

        .mobileMenuLogo > span:last-child {
          color: #ffffff;
        }

        .mobileMenuLogo strong {
          color: #168eff;
        }

        .mobileMenuSubtitle {
          color: #8fa5c2;
          font-size: 11px;
          line-height: 1.5;
          margin-top: 8px;
        }

        .closeMenu {
          border: 0;
          background: transparent;
          color: white;
          font-size: 30px;
          cursor: pointer;
        }

        .mobileMenuNav {
          margin-top: 35px;
        }

        .mobileNavItem {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 15px;

          padding:
            16px 14px;

          border-radius: 10px;
          border: none;

          background:
            transparent;

          color: #b3c3d8;
          font-size: 15px;

          margin-bottom: 5px;

          cursor: pointer;
          text-align: left;
        }

        .mobileNavItem:hover {
          background:
            rgba(
              25,
              111,
              200,
              0.14
            );
        }

        .mobileNavItem.active {
          background: #0c64bd;
          color: white;
        }

        .navIcon {
          width: 20px;
          text-align: center;
          color: #82b9f2;
          flex-shrink: 0;
        }

        .mobileAccountLabel {
          color: #617996;
          font-size: 10px;
          letter-spacing: 1.5px;
          margin:
            28px 14px 10px;
        }

        .pageContent {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding:
            40px 28px 35px;
        }

        .verificationBadge {
          width: fit-content;

          display: flex;
          align-items: center;

          gap: 9px;

          padding:
            10px 17px;

          border-radius: 999px;

          border:
            1px solid
            rgba(
              22,
              142,
              255,
              .35
            );

          background:
            rgba(
              10,
              91,
              164,
              .12
            );

          color: #20d981;

          font-size: 12px;
          font-weight: 700;
          letter-spacing: .4px;
        }

        .badgeDiamond {
          color: #20d981;
          font-size: 16px;
        }

        .intro {
          width: 100%;
          text-align: center;
          padding:
            38px 0 32px;
        }

        .intro h1 {
          margin: 0;
          color: #f8fafc;

          font-size:
            clamp(
              35px,
              6vw,
              48px
            );

          line-height: 1.08;
          letter-spacing: -1.8px;
          font-weight: 750;
        }

        .intro h1 span {
          color: #20a7ff;
        }

        .intro p {
          max-width: 650px;
          margin:
            18px auto 0;

          color: #9aafc7;
          font-size: 15px;
          line-height: 1.65;
        }

        .uploadCard {
          width: 88%;
          max-width: 680px;
          margin: 0 auto;
          padding: 10px;

          border:
            1px solid
            rgba(
              25,
              143,
              255,
              .48
            );

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(
                8,
                32,
                62,
                .94
              ),
              rgba(
                3,
                18,
                36,
                .96
              )
            );

          box-shadow:
            0 20px 55px
            rgba(
              0,
              0,
              0,
              .2
            );
        }

        .uploadZone {
          min-height: 380px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          padding:
            35px 20px;

          border:
            2px dashed
            rgba(
              22,
              142,
              255,
              .7
            );

          border-radius: 15px;

          cursor: pointer;

          background:
            radial-gradient(
              circle at center,
              rgba(
                16,
                111,
                200,
                .09
              ),
              transparent 65%
            );

          transition:
            .2s ease;
        }

        .uploadZone:hover,
        .uploadZone.dragging {
          border-color:
            #28aaff;

          background:
            radial-gradient(
              circle at center,
              rgba(
                20,
                126,
                221,
                .16
              ),
              transparent 68%
            );
        }

        .uploadZone input {
          display: none;
        }

        .uploadIllustration {
          position: relative;

          width: 130px;
          height: 125px;

          margin-bottom: 20px;
        }

        .documentBack {
          position: absolute;

          width: 75px;
          height: 95px;

          left: 23px;
          top: 4px;

          border-radius: 9px;

          border:
            1px solid
            rgba(
              41,
              169,
              255,
              .7
            );

          background:
            linear-gradient(
              145deg,
              #0b4c87,
              #0a315c
            );

          transform:
            rotate(-8deg);
        }

        .documentFront {
          position: absolute;

          width: 78px;
          height: 98px;

          left: 37px;
          top: 17px;

          border-radius: 9px;

          background:
            linear-gradient(
              145deg,
              #168eff,
              #0872d8
            );

          border:
            1px solid
            rgba(
              71,
              184,
              255,
              .75
            );

          box-shadow:
            0 12px 25px
            rgba(
              0,
              92,
              180,
              .3
            );
        }

        .documentLines {
          position: absolute;

          left: 22px;
          top: 32px;

          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .documentLines span {
          display: block;

          width: 32px;
          height: 3px;

          border-radius: 3px;

          background:
            rgba(
              255,
              255,
              255,
              .28
            );
        }

        .uploadCircle {
          position: absolute;

          right: 4px;
          bottom: 3px;

          width: 62px;
          height: 62px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            3px solid
            #1fa7ff;

          background:
            #06264a;

          color: #35b4ff;

          font-size: 31px;
          line-height: 1;

          box-shadow:
            0 0 0 5px
            rgba(
              22,
              142,
              255,
              .05
            );
        }

        .uploadZone h2 {
          margin:
            0 0 9px;

          color:
            #f8fafc;

          font-size: 23px;
          font-weight: 700;
        }

        .uploadInstruction {
          margin: 0;
          color: #91a8c2;
          font-size: 14px;
        }

        .fileTypes {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 12px;

          margin-top: 20px;
        }

        .fileType {
          min-width: 82px;

          padding:
            10px 18px;

          border:
            1px solid
            rgba(
              48,
              139,
              220,
              .3
            );

          border-radius: 8px;

          background:
            rgba(
              5,
              30,
              58,
              .7
            );

          font-size: 12px;
          font-weight: 700;
        }

        .fileType.pdf {
          color: #ff4d55;
        }

        .fileType.jpg {
          color: #20d981;
        }

        .fileType.png {
          color: #42a6ff;
        }

        .uploadLimit {
          margin-top: 20px;
          color: #6f89a7;
          font-size: 11px;
        }

        .selectedDocuments {
          margin-top: 10px;
          padding: 14px;

          border-radius: 12px;

          border:
            1px solid
            rgba(
              40,
              130,
              211,
              .28
            );

          background:
            rgba(
              2,
              18,
              37,
              .65
            );
        }

        .selectedHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #dbeafe;

          font-size: 12px;
          font-weight: 700;

          margin-bottom: 9px;
        }

        .selectedHeader span {
          color: #20a7ff;
        }

        .documentRow {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 9px;
          margin-top: 7px;

          border-radius: 9px;

          background:
            rgba(
              7,
              35,
              67,
              .7
            );

          border:
            1px solid
            rgba(
              57,
              137,
              214,
              .15
            );
        }

        .documentRowIcon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background:
            rgba(
              17,
              115,
              202,
              .15
            );

          color: #36aaff;

          font-size: 9px;
          font-weight: 800;
        }

        .documentRowInfo {
          flex: 1;
          min-width: 0;
        }

        .documentRowName {
          color: #e8f1fb;
          font-size: 12px;
          font-weight: 600;

          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .documentRowMeta {
          margin-top: 4px;
          color: #708aa7;
          font-size: 9px;
        }

        .removeDocument {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          border: none;
          border-radius: 50%;

          background:
            rgba(
              239,
              68,
              68,
              .08
            );

          color: #f87171;

          font-size: 19px;

          cursor: pointer;
        }

        .removeDocument:disabled {
          opacity: .4;
          cursor:
            not-allowed;
        }

        .addMoreButton {
          width: 100%;
          margin-top: 9px;
          padding: 9px;

          border:
            1px dashed
            rgba(
              42,
              156,
              239,
              .35
            );

          border-radius: 8px;

          background:
            transparent;

          color: #48aaff;

          font-size: 11px;

          cursor: pointer;
        }

        .addMoreButton:disabled {
          opacity: .4;
          cursor:
            not-allowed;
        }

        .errorMessage {
          display: flex;
          align-items: center;
          gap: 10px;

          margin:
            10px auto 0;

          width: 88%;
          max-width: 680px;

          padding:
            11px 13px;

          border-radius: 9px;

          border:
            1px solid
            rgba(
              248,
              113,
              113,
              .25
            );

          background:
            rgba(
              127,
              29,
              29,
              .15
            );

          color:
            #fca5a5;

          font-size: 11px;
        }

        .errorMessage span {
          width: 22px;
          height: 22px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(
              239,
              68,
              68,
              .18
            );

          color:
            #ff7178;

          font-weight: 700;
        }

        .errorMessage p {
          margin: 0;
          line-height: 1.5;
        }

        .startButton {
          width: 88%;
          max-width: 680px;

          height: 60px;

          margin:
            12px auto 0;

          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          border: none;
          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #0875df,
              #0c65cf
            );

          color: white;

          font-size: 17px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 28px
            rgba(
              0,
              102,
              225,
              .2
            );
        }

        .startButton:hover:not(
          .disabled
        ) {
          background:
            linear-gradient(
              90deg,
              #168eff,
              #0872d8
            );
        }

        .startButton.disabled {
          opacity: .55;
          cursor:
            not-allowed;
        }

        .sparkle {
          font-size: 18px;
        }

        .startArrow {
          position: absolute;
          right: 22px;

          font-size: 29px;
          font-weight: 300;
        }

        .securityNotice {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          padding:
            14px 10px;

          color: #849bb6;

          font-size: 11px;
          line-height: 1.5;

          text-align: center;
        }

        .securityIcon {
          color: #3bb1ff;
          font-size: 17px;
          flex-shrink: 0;
        }

        .benefitsCard {
          width: 100%;
          min-height: 150px;

          display: grid;

          grid-template-columns:
            1fr auto
            1fr auto
            1fr auto
            1fr;

          align-items: center;

          border:
            1px solid
            rgba(
              42,
              126,
              205,
              .3
            );

          border-radius: 12px;

          background:
            rgba(
              5,
              28,
              54,
              .75
            );
        }

        .benefit {
          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          padding:
            16px 8px;
        }

        .benefitIcon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          margin-bottom: 9px;

          font-size: 24px;
        }

        .secureIcon {
          color: #20d981;

          border:
            1px solid
            rgba(
              32,
              217,
              129,
              .3
            );

          background:
            rgba(
              32,
              217,
              129,
              .07
            );
        }

        .fastIcon {
          color: #168eff;

          border:
            1px solid
            rgba(
              22,
              142,
              255,
              .3
            );

          background:
            rgba(
              22,
              142,
              255,
              .07
            );
        }

        .aiIcon {
          color: #a56bff;

          border:
            1px solid
            rgba(
              165,
              107,
              255,
              .3
            );

          background:
            rgba(
              165,
              107,
              255,
              .07
            );
        }

        .reliableIcon {
          color: #ffb52e;

          border:
            1px solid
            rgba(
              255,
              181,
              46,
              .3
            );

          background:
            rgba(
              255,
              181,
              46,
              .07
            );
        }

        .benefit strong {
          color: #f5f8fc;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .benefit span {
          color: #879bb5;
          font-size: 10px;
          line-height: 1.5;
        }

        .benefitDivider {
          width: 1px;
          height: 70px;

          background:
            rgba(
              132,
              157,
              187,
              .16
            );
        }

        .reportCard {
          width: 100%;
          min-height: 92px;

          margin-top: 12px;

          display: flex;
          align-items: center;

          gap: 14px;

          padding:
            15px 17px;

          border:
            1px solid
            rgba(
              41,
              126,
              205,
              .3
            );

          border-radius: 12px;

          background:
            rgba(
              5,
              28,
              54,
              .75
            );

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .reportIcon {
          width: 50px;
          height: 50px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          border:
            1px solid
            rgba(
              22,
              142,
              255,
              .28
            );

          background:
            rgba(
              22,
              142,
              255,
              .1
            );

          color: #168eff;

          font-size: 24px;
        }

        .reportText {
          display: flex;
          flex-direction: column;

          gap: 6px;

          flex: 1;
          min-width: 0;
        }

        .reportText strong {
          color: #f4f8fd;
          font-size: 15px;
        }

        .reportText span {
          color: #8298b3;
          font-size: 11px;
        }

        .reportArrow {
          color: #8ca4c0;
          font-size: 30px;
          font-weight: 300;
        }

        .bottomNav {
          position: fixed;

          display: flex;

          left: 0;
          right: 0;
          bottom: 0;

          height: 68px;

          z-index: 150;

          background:
            rgba(
              4,
              18,
              42,
              .98
            );

          border-top:
            1px solid
            rgba(
              76,
              149,
              235,
              .18
            );

          justify-content:
            space-around;

          align-items: center;
        }

        .bottomItem {
          flex: 1;
          height: 100%;

          border: none;

          background:
            transparent;

          text-align: center;

          color: #7990ad;

          font-size: 17px;

          cursor: pointer;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;
        }

        .bottomItem span {
          display: block;
          margin-bottom: 4px;
        }

        .bottomItem small {
          font-size: 8px;
        }

        .bottomItem.active {
          color: #42a5ff;
        }

        @media (max-width: 600px) {

          .pageContent {
            max-width: 100%;

            padding:
              26px 16px 25px;
          }

          .verificationBadge {
            font-size: 10px;

            padding:
              9px 13px;
          }

          .intro {
            padding:
              27px 0 24px;
          }

          .intro h1 {
            font-size:
              clamp(
                30px,
                8.8vw,
                39px
              );

            letter-spacing:
              -1.3px;
          }

          .intro p {
            margin-top: 13px;

            font-size: 12px;
          }

          .uploadCard {
            width: 92%;

            padding: 8px;
          }

          .uploadZone {
            min-height: 330px;

            padding:
              25px 12px;
          }

          .uploadIllustration {
            transform:
              scale(.88);

            margin-bottom: 8px;
          }

          .uploadZone h2 {
            font-size: 19px;
          }

          .uploadInstruction {
            font-size: 12px;
          }

          .fileTypes {
            margin-top: 16px;

            gap: 9px;
          }

          .fileType {
            min-width: 70px;

            padding:
              8px 13px;

            font-size: 11px;
          }

          .uploadLimit {
            margin-top: 15px;

            font-size: 10px;
          }

          .startButton {
            width: 92%;

            height: 58px;

            font-size: 15px;
          }

          .errorMessage {
            width: 92%;
          }

          .securityNotice {
            font-size: 9px;

            padding:
              12px 5px;
          }

          .benefitsCard {
            min-height: 140px;
          }

          .benefit {
            padding:
              12px 3px;
          }

          .benefitIcon {
            width: 35px;

            height: 35px;

            font-size: 19px;

            margin-bottom: 7px;
          }

          .benefit strong {
            font-size: 10px;
          }

          .benefit span {
            font-size: 8px;
          }

          .benefitDivider {
            height: 62px;
          }

          .reportCard {
            min-height: 82px;

            padding: 12px;
          }

          .reportIcon {
            width: 43px;

            height: 43px;

            font-size: 20px;
          }

          .reportText strong {
            font-size: 13px;
          }

          .reportText span {
            font-size: 9px;
          }

          .reportArrow {
            font-size: 25px;
          }

        }

        @media (max-width: 380px) {

          .pageContent {
            padding-left: 12px;

            padding-right: 12px;
          }

          .mobileLogoButton {
            font-size: 15px;
          }

          .mobileLogoDiamond {
            font-size: 21px;
          }

          .mobileBell {
            font-size: 17px;
          }

          .intro h1 {
            font-size: 29px;
          }

          .intro p {
            font-size: 11px;
          }

          .uploadCard {
            width: 94%;
          }

          .uploadZone {
            min-height: 315px;
          }

          .benefit span {
            font-size: 7px;
          }

          .benefit strong {
            font-size: 9px;
          }

        }

      `}</style>

    </main>
  );
}