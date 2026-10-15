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
import LoadingScreen from "../AppShell/LoadingScreen";

import VerificationWorkflow from "./components/VerificationWorkflow";

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

type PropertyDetails = {
  propertyType: string;
  propertySubtype: string;
  estimatedSize: string;
  sizeUnit: string;
  estimatedValue: string;
  currency: string;
  propertyDescription: string;
  ownerType: string;
  ownerName: string;
  agentDeveloper: string;
  verificationPurpose: string;
};

type VerificationFindings = {
  document_package: UploadedDocument[];
  document_count: number;

  property_details: PropertyDetails;

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

const PROPERTY_DETAILS_STORAGE_KEY =
  "propertysure-property-details";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

/*
 * ============================================================
 * DOCUMENT HELPERS
 * ============================================================
 */

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

function createSafeFileName(
  fileName: string
): string {
  const lastDot = fileName.lastIndexOf(".");

  const extension =
    lastDot >= 0
      ? fileName.slice(lastDot).toLowerCase()
      : "";

  const baseName =
    lastDot >= 0
      ? fileName.slice(0, lastDot)
      : fileName;

  const safeBase = baseName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

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

/*
 * ============================================================
 * PROPERTY DETAILS HELPERS
 * ============================================================
 *
 * Property Details are collected on:
 *
 * /verify/property-details
 *
 * The original customer information is saved here
 * with the verification record.
 *
 * IMPORTANT:
 *
 * Customers are NOT required to enter a state,
 * local government area, or town.
 *
 * The Essential AI engine will identify location
 * information from uploaded document contents.
 *
 * The customer-provided property description is
 * not treated as verified location evidence.
 * ============================================================
 */

function readPropertyDetails(): PropertyDetails {
  const saved = sessionStorage.getItem(
    PROPERTY_DETAILS_STORAGE_KEY
  );

  if (!saved) {
    throw new Error(
      "Your property details could not be found. Please return to Property Details and continue again."
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(saved);
  } catch {
    throw new Error(
      "Your saved property information is invalid. Please return to Property Details and save it again."
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Your saved property information is invalid. Please return to Property Details."
    );
  }

  const data = parsed as Record<string, unknown>;

  const getString = (key: string): string =>
    typeof data[key] === "string"
      ? (data[key] as string).trim()
      : "";

  const propertyType = getString("propertyType");

  if (!propertyType) {
    throw new Error(
      "Please return to Property Details and select your property type."
    );
  }

  const ownerType = getString("ownerType");

  if (!ownerType) {
    throw new Error(
      "Please return to Property Details and select the seller or owner type."
    );
  }

  const verificationPurpose = getString(
    "verificationPurpose"
  );

  if (!verificationPurpose) {
    throw new Error(
      "Please return to Property Details and select your verification purpose."
    );
  }

  return {
    propertyType,

    propertySubtype:
      getString("propertySubtype"),

    estimatedSize:
      getString("estimatedSize"),

    sizeUnit:
      getString("sizeUnit") || "sqm",

    estimatedValue:
      getString("estimatedValue"),

    currency: "NGN",

    propertyDescription:
      getString("propertyDescription"),

    ownerType,

    ownerName:
      getString("ownerName"),

    agentDeveloper:
      getString("agentDeveloper"),

    verificationPurpose,
  };
}

/*
 * ============================================================
 * UPLOAD PAGE
 * ============================================================
 */

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

    const incomingFiles = Array.from(selectedFiles);

    if (incomingFiles.length === 0) {
      return;
    }

    const invalidFiles: string[] = [];
    const duplicateFiles: string[] = [];

    const existingFileKeys = new Set(
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

      const fileKey = getFileKey(file);

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
        `Already selected: ${duplicateFiles.join(", ")}`
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

    const newDocuments = validFiles.map(
      (file) => ({
        file,
        id: createDocumentId(),
      })
    );

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
      addDocuments(event.dataTransfer.files);
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
   * GET AUTHENTICATED USER
   * ============================================================
   *
   * There is NO anonymous authentication fallback.
   *
   * The authenticated Supabase user owns:
   *
   * Upload
   *   ↓
   * Verification
   *   ↓
   * Review
   *   ↓
   * Select Plan
   *   ↓
   * Checkout
   *   ↓
   * Payment
   *   ↓
   * Processing
   *   ↓
   * Result
   *
   * ============================================================
   */

  async function getVerifiedUser() {
    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "SESSION CHECK ERROR:",
        sessionError
      );
    }

    if (
      !sessionData?.session?.access_token
    ) {
      throw new Error(
        "Your PropertySure AI session has expired. Please sign in again before starting a verification."
      );
    }

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser(
      sessionData.session.access_token
    );

    if (userError) {
      console.error(
        "AUTH USER CHECK ERROR:",
        userError
      );

      throw new Error(
        "Your PropertySure AI session could not be verified. Please sign in again."
      );
    }

    const user = userData?.user || null;

    if (!user) {
      throw new Error(
        "You need to be signed in before starting a property verification. Please sign in and try again."
      );
    }

    if (user.is_anonymous === true) {
      throw new Error(
        "Your verification session is not linked to a registered account. Please sign in to your PropertySure AI account before uploading your documents."
      );
    }

    return user;
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

    const uploadedStoragePaths: string[] = [];

    try {
      /*
       * ========================================================
       * 1. READ ORIGINAL PROPERTY DETAILS
       * ========================================================
       *
       * No State/FCT selection is required.
       * No manual location input is required.
       */

      const propertyDetails =
        readPropertyDetails();

      /*
       * ========================================================
       * 2. REQUIRE A REAL AUTHENTICATED USER
       * ========================================================
       */

      const authUser =
        await getVerifiedUser();

      console.log(
        "============================================================"
      );

      console.log(
        "VERIFICATION AUTH USER"
      );

      console.log({
        userId: authUser.id,
        email: authUser.email || null,
        isAnonymous:
          authUser.is_anonymous || false,
      });

      console.log(
        "============================================================"
      );

      /*
       * ========================================================
       * 3. UPLOAD COMPLETE DOCUMENT PACKAGE
       * ========================================================
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

        console.log(
          "Uploading document:",
          {
            documentNumber: index + 1,
            fileName: originalFileName,
            userId: authUser.id,
            filePath,
          }
        );

        const {
          error: storageError,
        } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
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
         * Confirm the stored file can be accessed.
         */

        const {
          data: signedUrlData,
          error: signedUrlError,
        } = await supabase.storage
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
          original_name: originalFileName,
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
       * ========================================================
       * 4. INITIAL FINDINGS
       * ========================================================
       *
       * Store original customer property information.
       *
       * No customer-entered jurisdiction is stored.
       *
       * Essential AI will extract property locations
       * from the uploaded document contents.
       */

      const findings:
        VerificationFindings = {
        document_package:
          uploadedDocuments,

        document_count:
          uploadedDocuments.length,

        property_details:
          propertyDetails,

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
       * ========================================================
       * 5. CREATE VERIFICATION RECORD
       * ========================================================
       *
       * user_id remains the authenticated user ID.
       */

      console.log(
        "============================================================"
      );

      console.log(
        "CREATING VERIFICATION RECORD"
      );

      console.log({
        userId: authUser.id,
        documentName:
          primaryDocument.name,
        documentCount:
          uploadedDocuments.length,
      });

      console.log(
        "============================================================"
      );

      const {
        data: verificationRecord,
        error: verificationError,
      } = await supabase
        .from("verifications")
        .insert({
          user_id: authUser.id,

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
        .select("id, user_id")
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
          } = await supabase.storage
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

      if (!verificationRecord?.id) {
        throw new Error(
          "Verification record was created but no verification ID was returned."
        );
      }

      /*
       * ========================================================
       * 6. FINAL OWNERSHIP CHECK
       * ========================================================
       */

      if (
        verificationRecord.user_id !==
        authUser.id
      ) {
        console.error(
          "CRITICAL VERIFICATION OWNERSHIP MISMATCH:",
          {
            verificationId:
              verificationRecord.id,
            createdBy:
              authUser.id,
            databaseOwner:
              verificationRecord.user_id,
          }
        );

        throw new Error(
          "Verification ownership could not be confirmed. Please do not continue with payment."
        );
      }

      console.log(
        "============================================================"
      );

      console.log(
        "VERIFICATION CREATED SUCCESSFULLY"
      );

      console.log({
        verificationId:
          verificationRecord.id,

        userId:
          verificationRecord.user_id,

        authenticatedUserId:
          authUser.id,

        ownershipConfirmed:
          verificationRecord.user_id ===
          authUser.id,

        propertyDetailsSaved: true,
      });

      console.log(
        "============================================================"
      );

      /*
       * ========================================================
       * 7. CONTINUE TO REVIEW
       * ========================================================
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
   * LOADING
   * ============================================================
   */

  if (loadingPage) {
    return <LoadingScreen />;
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <AppShell activePath="/verify">
      <main className={styles.page}>
        <div className={styles.content}>
          {/* ==================================================
              SHARED VERIFICATION NAVIGATION
          ================================================== */}

          <VerificationWorkflow
            activeStep={3}
            backHref="/verify/document-guide"
            backLabel="Back to Document Guide"
            showTopBack={true}
            showBottomActions={false}
            showSecurityNote={false}
          />

          {/* ==================================================
              UPLOAD + SECURITY
          ================================================== */}

          <section
            className={styles.uploadLayout}
          >
            <div className={styles.uploadCard}>
              <div
                className={styles.sectionHeading}
              >
                <div>
                  <span>
                    DOCUMENT UPLOAD
                  </span>

                  <h2>
                    Upload Property Documents
                  </h2>

                  <p>
                    Upload the complete document
                    package for the property.
                  </p>
                </div>
              </div>

              <label
                className={`${styles.uploadZone} ${
                  isDragging
                    ? styles.dragging
                    : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileInput}
                  disabled={isUploading}
                />

                <div
                  className={styles.uploadIcon}
                >
                  <span>▧</span>
                  <b>↑</b>
                </div>

                <h3>
                  Drag & drop your documents here
                </h3>

                <p>
                  or <span>tap to browse</span>
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
                  Maximum file size: 20 MB per document
                </small>
              </label>
            </div>

            {/* SECURITY */}

            <aside
              className={styles.securityCard}
            >
              <div
                className={
                  styles.securityIcon
                }
              >
                ◈
              </div>

              <h2>
                Your Documents Are Secure
              </h2>

              <p>
                All documents are encrypted and
                processed securely through the
                PropertySure AI verification workflow.
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
                  Automatic document deletion after
                  verification
                </li>

                <li>
                  <span>✓</span>
                  Your privacy is our priority
                </li>
              </ul>
            </aside>
          </section>

          {/* ==================================================
              UPLOADED DOCUMENTS
          ================================================== */}

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
                  (document, index) => (
                    <div
                      className={
                        styles.documentRow
                      }
                      key={document.id}
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
                          Document {index + 1}
                        </strong>

                        <span>
                          {document.file.name}
                        </span>

                        <small>
                          {getDocumentType(
                            document.file
                          )}
                          {" • "}
                          {formatFileSize(
                            document.file.size
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
                        disabled={isUploading}
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
                onClick={openFilePicker}
                disabled={isUploading}
              >
                + Add Another Document
              </button>
            </section>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

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

          {/* ==================================================
              COMMON DOCUMENTS
          ================================================== */}

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
                You may upload the following documents
                and other relevant property documents:
              </p>

              <div
                className={
                  styles.commonGrid
                }
              >
                <span>
                  Certificate of Occupancy
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
                  Other relevant property documents
                </span>
              </div>
            </div>
          </section>

          {/* ==================================================
              FEATURES
          ================================================== */}

          <section
            className={styles.featureGrid}
          >
            <div
              className={styles.featureCard}
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
                Protected documents
              </span>
            </div>

            <div
              className={styles.featureCard}
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
                Automated workflow
              </span>
            </div>

            <div
              className={styles.featureCard}
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
                Intelligent document analysis
              </span>
            </div>

            <div
              className={styles.featureCard}
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
                Structured verification report
              </span>
            </div>
          </section>

          {/* ==================================================
              UPLOAD PAGE ACTIONS
          ================================================== */}

          <div
            className={styles.actions}
          >
            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={() => {
                if (isUploading) {
                  return;
                }

                window.location.href =
                  "/verify/document-guide";
              }}
              disabled={isUploading}
            >
              <span>←</span>
              Back
            </button>

            <button
              type="button"
              className={
                styles.continueButton
              }
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
          </div>

          {/* ==================================================
              SECURITY NOTE
          ================================================== */}

          <div
            className={
              styles.securityNote
            }
          >
            <span>🔒</span>

            Your documents remain securely stored
            while your verification is being processed.
          </div>
        </div>
      </main>
    </AppShell>
  );
}