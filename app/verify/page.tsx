"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  DragEvent,
} from "react";

import { supabase } from "../lib/supabase";

import AppShell from "../AppShell/AppShell";

import styles from "./verify.module.css";

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

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function getDocumentType(file: File): string {
  if (file.type === "application/pdf") {
    return "PDF";
  }

  if (file.type === "image/jpeg") {
    return "JPG";
  }

  if (file.type === "image/png") {
    return "PNG";
  }

  const extension = file.name
    .split(".")
    .pop()
    ?.toUpperCase();

  return extension || "FILE";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function createSafeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");

  const extension =
    lastDot >= 0
      ? fileName
          .slice(lastDot)
          .toLowerCase()
      : "";

  const baseName =
    lastDot >= 0
      ? fileName.slice(0, lastDot)
      : fileName;

  const safeBase = baseName
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
    safeBase || "property-document"
  }${extension}`;
}

function getFileKey(file: File): string {
  return `${file.name}__${file.size}__${file.lastModified}`;
}

function createDocumentId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function VerifyPage() {
  const [loadingPage, setLoadingPage] =
    useState(true);

  const [documents, setDocuments] =
    useState<SelectedDocument[]>([]);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadError, setUploadError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /*
   * ============================================================
   * PAGE INITIALIZATION
   * ============================================================
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadingPage(false);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * ============================================================
   * ADD DOCUMENTS
   * ============================================================
   */

  function addDocuments(
    selectedFiles: FileList | File[]
  ) {
    setUploadError("");

    const incomingFiles =
      Array.from(selectedFiles);

    if (incomingFiles.length === 0) {
      return;
    }

    const invalidFiles: string[] = [];
    const duplicateFiles: string[] = [];

    const existingFileKeys =
      new Set(
        documents.map((document) =>
          getFileKey(document.file)
        )
      );

    const currentSelectionKeys =
      new Set<string>();

    const validFiles: File[] = [];

    for (const file of incomingFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(
          `${file.name}: unsupported file type`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(
          `${file.name}: exceeds 20 MB`
        );
        continue;
      }

      const fileKey =
        getFileKey(file);

      if (
        existingFileKeys.has(fileKey) ||
        currentSelectionKeys.has(fileKey)
      ) {
        duplicateFiles.push(file.name);
        continue;
      }

      currentSelectionKeys.add(fileKey);

      validFiles.push(file);
    }

    const messages: string[] = [];

    if (invalidFiles.length > 0) {
      messages.push(
        invalidFiles.join(" • ")
      );
    }

    if (duplicateFiles.length > 0) {
      messages.push(
        `Already selected: ${duplicateFiles.join(
          ", "
        )}`
      );
    }

    if (messages.length > 0) {
      setUploadError(
        messages.join(" • ")
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    const newDocuments =
      validFiles.map((file) => ({
        file,
        id: createDocumentId(),
      }));

    setDocuments((current) => [
      ...current,
      ...newDocuments,
    ]);
  }

  /*
   * ============================================================
   * FILE INPUT
   * ============================================================
   */

  function handleFileInput(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      addDocuments(event.target.files);
    }

    event.target.value = "";
  }

  /*
   * ============================================================
   * DRAG / DROP
   * ============================================================
   */

  function handleDragOver(
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();

    setIsDragging(false);

    if (event.dataTransfer.files) {
      addDocuments(
        event.dataTransfer.files
      );
    }
  }

  /*
   * ============================================================
   * REMOVE DOCUMENT
   * ============================================================
   */

  function removeDocument(
    documentId: string
  ) {
    if (isUploading) {
      return;
    }

    setDocuments((current) =>
      current.filter(
        (document) =>
          document.id !== documentId
      )
    );

    setUploadError("");
  }

  /*
   * ============================================================
   * FILE PICKER
   * ============================================================
   */

  function openFilePicker() {
    if (isUploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  /*
   * ============================================================
   * VERIFICATION / SUPABASE UPLOAD
   * ============================================================
   */

  async function handleVerification() {
    if (
      documents.length === 0 ||
      isUploading
    ) {
      return;
    }

    setIsUploading(true);
    setUploadError("");

    const uploadedStoragePaths: string[] =
      [];

    try {
      /*
       * 1. Get existing session.
       */

      let {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.warn(
          "SESSION CHECK WARNING:",
          sessionError
        );
      }

      /*
       * 2. Create anonymous session if needed.
       */

      if (!session?.user) {
        const {
          data: anonymousData,
          error: anonymousError,
        } =
          await supabase.auth.signInAnonymously();

        if (anonymousError) {
          throw new Error(
            `We could not start your secure verification session: ${anonymousError.message}`
          );
        }

        session =
          anonymousData.session;

        if (!session?.user) {
          throw new Error(
            "We could not create a secure verification session. Please try again."
          );
        }
      }

      const authUser =
        session.user;

      /*
       * 3. Upload the complete document package.
       */

      const uploadedDocuments:
        UploadedDocument[] = [];

      for (
        let index = 0;
        index < documents.length;
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
          `${authUser.id}/verification-uploads/${documentId}/${safeFileName}`;

        const {
          error: storageError,
        } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(
              filePath,
              file,
              {
                cacheControl: "3600",
                upsert: false,
                contentType:
                  file.type,
              }
            );

        if (storageError) {
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

        /*
         * Confirm stored file can be accessed.
         */

        const {
          data: signedUrlData,
          error: signedUrlError,
        } =
          await supabase.storage
            .from(STORAGE_BUCKET)
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
          id: documentId,
          name: originalFileName,
          original_name:
            originalFileName,
          path: filePath,
          type: getDocumentType(file),
          mime_type: file.type,
          size: file.size,
        });
      }

      if (
        uploadedDocuments.length === 0
      ) {
        throw new Error(
          "No documents were uploaded."
        );
      }

      /*
       * 4. Initial findings.
       */

      const findings:
        VerificationFindings = {
        document_package:
          uploadedDocuments,

        document_count:
          uploadedDocuments.length,

        checks: {
          documentStructure: null,
          dataConsistency: null,
          signatureValid: null,
          stampValid: null,
          noForgery: null,
          noDuplicate: null,
          documentCompleteness: null,
        },

        processing: {
          stage: "received",
          progress: 8,
          message:
            "Your property document package has been securely received.",
        },
      };

      const primaryDocument =
        uploadedDocuments[0];

      /*
       * 5. Create verification record.
       */

      const {
        data: verificationRecord,
        error: verificationError,
      } =
        await supabase
          .from("verifications")
          .insert({
            user_id:
              authUser.id,

            doc_name:
              primaryDocument.name,

            file_url:
              primaryDocument.path,

            doc_type:
              primaryDocument.type,

            status: "review",

            trust_score: null,

            confidence: null,

            risk: null,

            findings,
          })
          .select("id")
          .single();

      if (verificationError) {
        console.error(
          "VERIFICATION RECORD ERROR:",
          verificationError
        );

        if (
          uploadedStoragePaths.length > 0
        ) {
          const {
            error: rollbackError,
          } =
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove(
                uploadedStoragePaths
              );

          if (rollbackError) {
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

      /*
       * 6. Continue to Review.
       */

      window.location.href =
        `/verify/review?id=${encodeURIComponent(
          verificationRecord.id
        )}`;
    } catch (error) {
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

  /*
   * ============================================================
   * DASHBOARD-STYLE LOADING
   * ============================================================
   */

  if (loadingPage) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingBrand}>
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
        </p>
      </main>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <AppShell activePath="/verify">
      <main className={styles.page}>
        <div
          className={
            styles.content
          }
        >
          {/* WORKFLOW */}

          <section
            className={
              styles.workflowCard
            }
          >
            <div
              className={`${styles.workflowStep} ${styles.workflowActive}`}
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                1
              </div>

              <div>
                <strong>
                  Upload Documents
                </strong>

                <span>
                  Add your property
                  documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                2
              </div>

              <div>
                <strong>
                  Review Package
                </strong>

                <span>
                  Confirm your
                  documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                3
              </div>

              <div>
                <strong>
                  Select Plan
                </strong>

                <span>
                  Choose your
                  service
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                4
              </div>

              <div>
                <strong>
                  Secure Checkout
                </strong>

                <span>
                  Complete payment
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                5
              </div>

              <div>
                <strong>
                  Verification
                </strong>

                <span>
                  AI analysis and
                  results
                </span>
              </div>
            </div>
          </section>

          {/* UPLOAD + SECURITY */}

          <section
            className={
              styles.uploadLayout
            }
          >
            <div
              className={
                styles.uploadCard
              }
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <div>
                  <span>
                    DOCUMENT UPLOAD
                  </span>

                  <h2>
                    Upload Property
                    Documents
                  </h2>

                  <p>
                    Upload the complete
                    document package
                    for the property.
                  </p>
                </div>
              </div>

              <label
                className={`${styles.uploadZone} ${
                  isDragging
                    ? styles.dragging
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
                  ref={fileInputRef}
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

                <div
                  className={
                    styles.uploadIcon
                  }
                >
                  <span>
                    ▧
                  </span>

                  <b>
                    ↑
                  </b>
                </div>

                <h3>
                  Drag & drop your
                  documents here
                </h3>

                <p>
                  or{" "}
                  <span>
                    tap to browse
                  </span>
                </p>

                <div
                  className={
                    styles.supportedFormats
                  }
                >
                  <span>
                    Supported formats:
                  </span>

                  <b className={styles.pdf}>
                    PDF
                  </b>

                  <b className={styles.jpg}>
                    JPG
                  </b>

                  <b className={styles.png}>
                    PNG
                  </b>
                </div>

                <small>
                  Maximum file size:
                  20 MB per document
                </small>
              </label>
            </div>

            {/* SECURITY */}

            <aside
              className={
                styles.securityCard
              }
            >
              <div
                className={
                  styles.securityIcon
                }
              >
                ◈
              </div>

              <h2>
                Your Documents
                Are Secure
              </h2>

              <p>
                All documents are
                encrypted and
                processed securely
                through the
                PropertySure AI
                verification workflow.
              </p>

              <ul>
                <li>
                  <span>✓</span>
                  Bank-level encryption
                </li>

                <li>
                  <span>✓</span>
                  Secure cloud storage
                </li>

                <li>
                  <span>✓</span>
                  Automatic document
                  deletion after
                  verification
                </li>

                <li>
                  <span>✓</span>
                  Your privacy is our
                  priority
                </li>
              </ul>
            </aside>
          </section>

          {/* UPLOADED DOCUMENTS */}

          {hasDocuments && (
            <section
              className={
                styles.documentsCard
              }
            >
              <div
                className={
                  styles.documentsHeader
                }
              >
                <div>
                  <span>
                    DOCUMENT PACKAGE
                  </span>

                  <h2>
                    Uploaded Documents
                  </h2>
                </div>

                <strong>
                  {documentCount}{" "}
                  {documentCount === 1
                    ? "file"
                    : "files"}
                </strong>
              </div>

              <div
                className={
                  styles.documentList
                }
              >
                {documents.map(
                  (
                    document,
                    index
                  ) => (
                    <div
                      className={
                        styles.documentRow
                      }
                      key={
                        document.id
                      }
                    >
                      <div
                        className={`${styles.documentTypeIcon} ${
                          getDocumentType(
                            document.file
                          ) === "PDF"
                            ? styles.documentPdf
                            : styles.documentImage
                        }`}
                      >
                        {getDocumentType(
                          document.file
                        )}
                      </div>

                      <div
                        className={
                          styles.documentInfo
                        }
                      >
                        <strong>
                          Document{" "}
                          {index + 1}
                        </strong>

                        <span>
                          {document.file.name}
                        </span>

                        <small>
                          {getDocumentType(
                            document.file
                          )}{" "}
                          •{" "}
                          {formatFileSize(
                            document.file
                              .size
                          )}
                        </small>
                      </div>

                      <div
                        className={
                          styles.documentStatus
                        }
                      >
                        ✓
                      </div>

                      <button
                        type="button"
                        className={
                          styles.removeDocument
                        }
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
              </div>

              <button
                type="button"
                className={
                  styles.addMoreButton
                }
                onClick={
                  openFilePicker
                }
                disabled={
                  isUploading
                }
              >
                + Add Another Document
              </button>
            </section>
          )}

          {/* ERROR */}

          {uploadError && (
            <div
              className={
                styles.errorMessage
              }
            >
              <span>!</span>

              <p>
                {uploadError}
              </p>
            </div>
          )}

          {/* CONTINUE TO REVIEW */}

          <button
            type="button"
            className={`${styles.reviewButton} ${
              !hasDocuments ||
              isUploading
                ? styles.reviewDisabled
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
            <span>
              {isUploading
                ? "Uploading Documents..."
                : "Continue to Review"}
            </span>

            {!isUploading && (
              <b>→</b>
            )}
          </button>

          {/* COMMON DOCUMENTS */}

          <section
            className={
              styles.commonDocuments
            }
          >
            <div
              className={
                styles.commonIcon
              }
            >
              ◇
            </div>

            <div>
              <span>
                DOCUMENT GUIDE
              </span>

              <h2>
                Common Documents
              </h2>

              <p>
                You may upload the
                following documents
                and other relevant
                property documents:
              </p>

              <div
                className={
                  styles.commonGrid
                }
              >
                <span>
                  Certificate of
                  Occupancy
                </span>

                <span>
                  Deed of Assignment
                </span>

                <span>
                  Survey Plan
                </span>

                <span>
                  Allocation Letter
                </span>

                <span>
                  Building Approval
                </span>

                <span>
                  Title Documents
                </span>

                <span>
                  Other relevant
                  property documents
                </span>
              </div>
            </div>
          </section>

          {/* FEATURES */}

          <section
            className={
              styles.featureGrid
            }
          >
            <div
              className={
                styles.featureCard
              }
            >
              <div
                className={`${styles.featureIcon} ${styles.secureFeature}`}
              >
                ◈
              </div>

              <strong>
                Secure
              </strong>

              <span>
                Protected
                documents
              </span>
            </div>

            <div
              className={
                styles.featureCard
              }
            >
              <div
                className={`${styles.featureIcon} ${styles.fastFeature}`}
              >
                ↯
              </div>

              <strong>
                Fast
              </strong>

              <span>
                Automated
                workflow
              </span>
            </div>

            <div
              className={
                styles.featureCard
              }
            >
              <div
                className={`${styles.featureIcon} ${styles.aiFeature}`}
              >
                ✦
              </div>

              <strong>
                AI-Powered
              </strong>

              <span>
                Intelligent
                document analysis
              </span>
            </div>

            <div
              className={
                styles.featureCard
              }
            >
              <div
                className={`${styles.featureIcon} ${styles.reliableFeature}`}
              >
                ◆
              </div>

              <strong>
                Reliable
              </strong>

              <span>
                Structured
                verification report
              </span>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}