"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";
import VerificationNavigation from "../components/VerificationNavigation";
import { supabase } from "../../lib/supabase";

import styles from "./review.module.css";

/*
 * ============================================================
 * PROPERTY SURE AI
 * VERIFICATION REVIEW — STEP 4
 * ============================================================
 *
 * Workflow:
 *
 * /verify/property-details
 *    ↓
 * /verify/document-guide
 *    ↓
 * /verify
 *    ↓
 * /verify/review?id=VERIFICATION_ID
 *    ↓
 * /verify/select-plan?id=VERIFICATION_ID
 *    ↓
 * /verify/checkout?id=VERIFICATION_ID
 *    ↓
 * /processing?id=VERIFICATION_ID
 *    ↓
 * /result?id=VERIFICATION_ID
 *
 * IMPORTANT:
 * - One verification ID is used throughout the workflow.
 * - The document package belongs to one verification.
 * - Uploaded filename is NOT treated as document identity.
 * - AI classification is performed against the actual file
 *   contents retrieved from Supabase Storage.
 * - AppShell is the shared application navigation.
 * - VerificationNavigation is the shared verification workflow
 *   navigation used across the verification journey.
 * ============================================================
 */

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const STORAGE_BUCKET = "property-documents";

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

const DOCUMENT_TYPE_OPTIONS = [
  "Certificate of Occupancy (C of O)",
  "Deed of Assignment",
  "Survey Plan",
  "Allocation Letter",
  "Governor's Consent",
  "Power of Attorney",
  "Receipt / Evidence of Payment",
  "Building Approval / Planning Document",
  "Other Property Document",
] as const;

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type DocumentType =
  (typeof DOCUMENT_TYPE_OPTIONS)[number];

type ClassificationStatus =
  | "idle"
  | "classifying"
  | "identified"
  | "uncertain"
  | "failed";

type ClassificationSource =
  | "ai"
  | "manual"
  | "existing"
  | "unknown";

type UploadedDocument = {
  name: string;

  path: string;

  type: string;

  size: number;

  documentType?: string;

  classificationStatus?: ClassificationStatus;

  classificationConfidence?: number;

  classificationSource?: ClassificationSource;

  documentTitleDetected?: string;

  nameDetected?: string;

  classificationMessage?: string;
};

type ReviewDocument =
  UploadedDocument & {
    previewUrl?: string;

    previewError?: boolean;

    originalIndex: number;
  };

type VerificationFindings = {
  document_package?: UploadedDocument[];

  document_count?: number;

  checks?: {
    documentStructure?: boolean | null;

    dataConsistency?: boolean | null;

    signatureValid?: boolean | null;

    stampValid?: boolean | null;

    noForgery?: boolean | null;

    noDuplicate?: boolean | null;

    documentCompleteness?: boolean | null;
  };

  processing?: {
    stage?: string;

    progress?: number;

    message?: string;
  };

  ai_classification?: {
    status?:
      | "processing"
      | "completed"
      | "failed";

    completed_at?: string;

    model?: string;

    documents_classified?: number;

    message?: string;
  };
};

type VerificationRecord = {
  id: string;

  doc_name: string | null;

  file_url: string | null;

  doc_type: string | null;

  status: string | null;

  trust_score: number | null;

  confidence: number | null;

  risk: string | null;

  findings: VerificationFindings | null;
};

type ClassificationResponse = {
  documentType?: string;

  confidence?: number;

  status?:
    | "identified"
    | "uncertain"
    | "failed";

  message?: string;

  documentTitleDetected?: string;

  nameDetected?: string;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function formatFileSize(
  size: number,
): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getExtension(
  fileName: string,
): string {
  const parts =
    fileName.split(".");

  return parts.length > 1
    ? parts.pop()!.toUpperCase()
    : "FILE";
}

function normalizeFileType(
  fileName: string,
  type: string,
): string {
  if (
    type ===
    "application/pdf"
  ) {
    return "PDF";
  }

  if (
    type ===
      "image/jpeg" ||
    type === "image/jpg"
  ) {
    return "JPG";
  }

  if (
    type ===
    "image/png"
  ) {
    return "PNG";
  }

  const extension =
    getExtension(fileName);

  if (
    extension === "JPEG"
  ) {
    return "JPG";
  }

  return extension;
}

function getMimeTypeFromDocument(
  document: ReviewDocument,
): string {
  const type =
    document.type.toUpperCase();

  if (type === "PDF") {
    return "application/pdf";
  }

  if (
    type === "JPG" ||
    type === "JPEG"
  ) {
    return "image/jpeg";
  }

  if (type === "PNG") {
    return "image/png";
  }

  return "application/octet-stream";
}

function isImage(
  type: string,
): boolean {
  return [
    "JPG",
    "JPEG",
    "PNG",
  ].includes(
    type.toUpperCase(),
  );
}

function isPdf(
  type: string,
): boolean {
  return (
    type.toUpperCase() ===
    "PDF"
  );
}

function isValidDocumentType(
  value?: string,
): value is DocumentType {
  return Boolean(
    value &&
      DOCUMENT_TYPE_OPTIONS.includes(
        value as DocumentType,
      ),
  );
}

function createSafeFileName(
  fileName: string,
): string {
  return fileName
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-",
    )
    .replace(
      /-+/g,
      "-",
    );
}

function getDisplayTitle(
  document: ReviewDocument,
  index: number,
): string {
  if (
    document.documentType &&
    document.documentType.trim()
  ) {
    return document.documentType;
  }

  if (
    document.documentTitleDetected &&
    document.documentTitleDetected.trim()
  ) {
    return document.documentTitleDetected;
  }

  return `Property Document ${
    index + 1
  }`;
}

function getDetectedTitle(
  document: ReviewDocument,
): string {
  if (
    document.documentTitleDetected &&
    document.documentTitleDetected.trim()
  ) {
    return document.documentTitleDetected;
  }

  return "";
}

function getDetectedName(
  document: ReviewDocument,
): string {
  if (
    document.nameDetected &&
    document.nameDetected.trim()
  ) {
    return document.nameDetected.trim();
  }

  return "";
}

function toStoredDocument(
  document: ReviewDocument,
): UploadedDocument {
  return {
    name: document.name,

    path: document.path,

    type: normalizeFileType(
      document.name,
      document.type,
    ),

    size: document.size,

    documentType:
      document.documentType,

    classificationStatus:
      document.classificationStatus,

    classificationConfidence:
      document.classificationConfidence,

    classificationSource:
      document.classificationSource,

    documentTitleDetected:
      document.documentTitleDetected,

    nameDetected:
      document.nameDetected,

    classificationMessage:
      document.classificationMessage,
  };
}

/*
 * ============================================================
 * REVIEW PAGE
 * ============================================================
 */

export default function ReviewPage() {
  const [
    verification,
    setVerification,
  ] =
    useState<VerificationRecord | null>(
      null,
    );

  const [
    documents,
    setDocuments,
  ] = useState<ReviewDocument[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    modifyingDocuments,
    setModifyingDocuments,
  ] = useState(false);

  const [
    addingDocument,
    setAddingDocument,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<ReviewDocument | null>(
      null,
    );

  const [
    documentTypeOpen,
    setDocumentTypeOpen,
  ] = useState<string | null>(
    null,
  );

  const [
    deletingDocumentId,
    setDeletingDocumentId,
  ] =
    useState<string | null>(
      null,
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const documentsRef =
    useRef<ReviewDocument[]>(
      [],
    );

  const verificationRef =
    useRef<VerificationRecord | null>(
      null,
    );

  /*
   * ============================================================
   * VERIFICATION ID
   * ============================================================
   */

  const verificationId =
    useMemo(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      return new URLSearchParams(
        window.location.search,
      ).get("id");
    }, []);

  /*
   * ============================================================
   * REFS
   * ============================================================
   */

  useEffect(() => {
    documentsRef.current =
      documents;
  }, [documents]);

  useEffect(() => {
    verificationRef.current =
      verification;
  }, [verification]);

  /*
   * ============================================================
   * SIGNED URL
   * ============================================================
   */

  async function getDocumentSignedUrl(
    path: string,
  ): Promise<string> {
    const {
      data,
      error: signedUrlError,
    } =
      await supabase.storage
        .from(
          STORAGE_BUCKET,
        )
        .createSignedUrl(
          path,
          60 * 60,
        );

    if (
      signedUrlError ||
      !data?.signedUrl
    ) {
      throw new Error(
        signedUrlError?.message ||
          "Unable to create a secure document preview.",
      );
    }

    return data.signedUrl;
  }

  /*
   * ============================================================
   * AI CLASSIFICATION
   * ============================================================
   */

  async function classifyDocument(
    document: ReviewDocument,
  ): Promise<ClassificationResponse> {
    const signedUrl =
      await getDocumentSignedUrl(
        document.path,
      );

    const response =
      await fetch(
        "/api/verify-document/classify-document",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fileUrl: signedUrl,

            fileName:
              document.name,

            fileType:
              getMimeTypeFromDocument(
                document,
              ),
          }),
        },
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "Document identification failed.",
      );
    }

    return result as ClassificationResponse;
  }

  async function classifyExistingDocument(
    document: ReviewDocument,
  ): Promise<ClassificationResponse> {
    return classifyDocument(
      document,
    );
  }

  /*
   * ============================================================
   * SAVE DOCUMENT PACKAGE
   * ============================================================
   */

  async function saveDocumentPackage(
    currentDocuments: ReviewDocument[],
    activeVerification: VerificationRecord,
  ): Promise<VerificationRecord> {
    const findings: VerificationFindings =
      activeVerification.findings ||
      {};

    const updatedFindings: VerificationFindings =
      {
        ...findings,

        document_package:
          currentDocuments.map(
            toStoredDocument,
          ),

        document_count:
          currentDocuments.length,

        processing: {
          ...(findings.processing ||
            {}),
          stage:
            "review",
          progress: 25,
          message:
            "Document package ready for verification.",
        },

        ai_classification: {
          ...(findings.ai_classification ||
            {}),
          documents_classified:
            currentDocuments.filter(
              (
                document,
              ) =>
                document.classificationStatus ===
                "identified",
            ).length,
        },
      };

    const firstDocument =
      currentDocuments[0];

    const {
      data,
      error:
        updateError,
    } =
      await supabase
        .from(
          "verifications",
        )
        .update({
          doc_name:
            firstDocument?.name ||
            activeVerification.doc_name,

          file_url:
            firstDocument?.path ||
            activeVerification.file_url,

          doc_type:
            firstDocument?.documentType ||
            activeVerification.doc_type,

          status: "review",

          findings:
            updatedFindings,
        })
        .eq(
          "id",
          activeVerification.id,
        )
        .select(
          "id, doc_name, file_url, doc_type, status, trust_score, confidence, risk, findings",
        )
        .single();

    if (updateError) {
      throw new Error(
        updateError.message,
      );
    }

    if (!data) {
      throw new Error(
        "Unable to save the verification package.",
      );
    }

    const updatedRecord =
      data as VerificationRecord;

    setVerification(
      updatedRecord,
    );

    verificationRef.current =
      updatedRecord;

    return updatedRecord;
  }

  /*
   * ============================================================
   * LOAD VERIFICATION
   * ============================================================
   */

  async function loadVerification(): Promise<void> {
    if (!verificationId) {
      setError(
        "Verification ID is missing.",
      );

      setLoading(false);

      return;
    }

    try {
      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message,
        );
      }

      if (!user) {
        throw new Error(
          "Please sign in to continue.",
        );
      }

      const {
        data,
        error:
          verificationError,
      } =
        await supabase
          .from(
            "verifications",
          )
          .select(
            "id, doc_name, file_url, doc_type, status, trust_score, confidence, risk, findings",
          )
          .eq(
            "id",
            verificationId,
          )
          .eq(
            "user_id",
            user.id,
          )
          .single();

      if (
        verificationError
      ) {
        throw new Error(
          verificationError.message,
        );
      }

      if (!data) {
        throw new Error(
          "Verification record not found.",
        );
      }

      const record =
        data as VerificationRecord;

      setVerification(
        record,
      );

      verificationRef.current =
        record;

      const packageDocuments =
        record.findings
          ?.document_package;

      let loadedDocuments: ReviewDocument[] =
        Array.isArray(
          packageDocuments,
        )
          ? packageDocuments.map(
              (
                document,
                index,
              ): ReviewDocument => ({
                ...document,

                type:
                  normalizeFileType(
                    document.name,
                    document.type,
                  ),

                originalIndex:
                  index,

                classificationStatus:
                  document.classificationStatus ||
                  (document.documentType
                    ? "identified"
                    : "idle"),

                classificationSource:
                  document.classificationSource ||
                  (document.documentType
                    ? "existing"
                    : "unknown"),
              }),
            )
          : [];

      /*
       * Legacy single-document fallback.
       */

      if (
        loadedDocuments.length ===
          0 &&
        record.file_url
      ) {
        loadedDocuments = [
          {
            name:
              record.doc_name ||
              "Property Document",

            path:
              record.file_url,

            type:
              normalizeFileType(
                record.doc_name ||
                  "",
                "",
              ),

            size: 0,

            documentType:
              record.doc_type ||
              undefined,

            classificationStatus:
              record.doc_type
                ? "identified"
                : "idle",

            classificationSource:
              record.doc_type
                ? "existing"
                : "unknown",

            originalIndex: 0,
          },
        ];
      }

      const preparedDocuments =
        await Promise.all(
          loadedDocuments.map(
            async (
              document,
            ): Promise<ReviewDocument> => {
              try {
                const previewUrl =
                  await getDocumentSignedUrl(
                    document.path,
                  );

                return {
                  ...document,

                  previewUrl,

                  previewError:
                    false,
                };
              } catch (
                previewError
              ) {
                console.error(
                  "PREVIEW URL ERROR:",
                  previewError,
                );

                return {
                  ...document,

                  previewError:
                    true,
                };
              }
            },
          ),
        );

      setDocuments(
        preparedDocuments,
      );

      documentsRef.current =
        preparedDocuments;

      setLoading(false);

      /*
       * Identify documents that have not yet been classified.
       */

      void classifyUnknownDocuments(
        preparedDocuments,
        record,
      );
    } catch (
      loadError
    ) {
      console.error(
        "LOAD REVIEW ERROR:",
        loadError,
      );

      setError(
        loadError instanceof
        Error
          ? loadError.message
          : "Unable to load the verification review.",
      );

      setLoading(false);
    }
  }

  /*
   * ============================================================
   * CLASSIFY UNKNOWN DOCUMENTS
   * ============================================================
   */

  async function classifyUnknownDocuments(
    currentDocuments: ReviewDocument[],
    activeVerification: VerificationRecord,
  ): Promise<void> {
    const unknownDocuments =
      currentDocuments.filter(
        (document) =>
          !document.documentType ||
          document.classificationStatus ===
            "idle" ||
          document.classificationStatus ===
            "failed" ||
          document.classificationStatus ===
            "uncertain",
      );

    if (
      unknownDocuments.length ===
      0
    ) {
      return;
    }

    setDocuments(
      (previous): ReviewDocument[] =>
        previous.map(
          (
            document,
          ): ReviewDocument =>
            unknownDocuments.some(
              (unknown) =>
                unknown.path ===
                document.path,
            )
              ? {
                  ...document,

                  classificationStatus:
                    "classifying",

                  classificationSource:
                    "ai",

                  classificationMessage:
                    "Identifying document from its contents...",
                }
              : document,
        ),
    );

    try {
      const classifiedDocuments: ReviewDocument[] =
        [
          ...currentDocuments,
        ];

      for (
        const unknownDocument of unknownDocuments
      ) {
        try {
          const result =
            await classifyExistingDocument(
              unknownDocument,
            );

          const validType =
            isValidDocumentType(
              result.documentType,
            );

          const identified =
            Boolean(
              validType &&
                typeof result.confidence ===
                  "number" &&
                result.confidence >=
                  75,
            );

          const index =
            classifiedDocuments.findIndex(
              (document) =>
                document.path ===
                unknownDocument.path,
            );

          if (
            index !==
            -1
          ) {
            const existingDocument =
              classifiedDocuments[
                index
              ];

            classifiedDocuments[
              index
            ] = {
              ...existingDocument,

              documentType:
                validType
                  ? result.documentType
                  : existingDocument.documentType,

              classificationStatus:
                identified
                  ? "identified"
                  : "uncertain",

              classificationConfidence:
                result.confidence,

              classificationSource:
                "ai",

              documentTitleDetected:
                result.documentTitleDetected,

              nameDetected:
                result.nameDetected,

              classificationMessage:
                result.message,
            };
          }
        } catch (
          classificationError
        ) {
          console.error(
            "CLASSIFICATION ERROR:",
            classificationError,
          );

          const index =
            classifiedDocuments.findIndex(
              (document) =>
                document.path ===
                unknownDocument.path,
            );

          if (
            index !==
            -1
          ) {
            const existingDocument =
              classifiedDocuments[
                index
              ];

            classifiedDocuments[
              index
            ] = {
              ...existingDocument,

              classificationStatus:
                "failed",

              classificationSource:
                "ai",

              classificationMessage:
                classificationError instanceof
                Error
                  ? classificationError.message
                  : "Document identification failed.",
            };
          }
        }

        setDocuments([
          ...classifiedDocuments,
        ]);

        documentsRef.current =
          classifiedDocuments;
      }

      await saveDocumentPackage(
        classifiedDocuments,
        activeVerification,
      );

      setSuccessMessage(
        "Document identification completed.",
      );
    } catch (
      classificationPackageError
    ) {
      console.error(
        "CLASSIFICATION PACKAGE ERROR:",
        classificationPackageError,
      );
    }
  }

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    void loadVerification();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId]);

  /*
   * ============================================================
   * ADD DOCUMENT
   * ============================================================
   */

  async function handleAddDocument(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type as
          (typeof ALLOWED_TYPES)[number],
      )
    ) {
      setError(
        "Unsupported file type. Please upload PDF, JPG or PNG.",
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File is too large. Maximum file size is 20MB.",
      );

      return;
    }

    const duplicate =
      documentsRef.current.some(
        (document) =>
          document.name ===
            file.name &&
          document.size ===
            file.size,
      );

    if (duplicate) {
      setError(
        "This document has already been added.",
      );

      return;
    }

    const activeVerification =
      verificationRef.current;

    if (!activeVerification) {
      setError(
        "Verification record is unavailable.",
      );

      return;
    }

    setAddingDocument(true);

    setModifyingDocuments(
      true,
    );

    setError("");

    setSuccessMessage("");

    try {
      const {
        data: {
          user,
        },
        error:
          authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          authError.message,
        );
      }

      if (!user) {
        throw new Error(
          "Please sign in to continue.",
        );
      }

      const documentId =
        crypto.randomUUID();

      const safeFileName =
        createSafeFileName(
          file.name,
        );

      const storagePath =
        `${user.id}/verification-uploads/${documentId}/${safeFileName}`;

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .upload(
            storagePath,
            file,
            {
              upsert: false,

              contentType:
                file.type,
            },
          );

      if (uploadError) {
        throw new Error(
          uploadError.message,
        );
      }

      const previewUrl =
        await getDocumentSignedUrl(
          storagePath,
        );

      const newDocument: ReviewDocument =
        {
          name:
            file.name,

          path:
            storagePath,

          type:
            normalizeFileType(
              file.name,
              file.type,
            ),

          size:
            file.size,

          classificationStatus:
            "classifying",

          classificationSource:
            "ai",

          classificationMessage:
            "Identifying document from its contents...",

          previewUrl,

          previewError:
            false,

          originalIndex:
            documentsRef.current
              .length,
        };

      const updatedDocuments: ReviewDocument[] =
        [
          ...documentsRef.current,
          newDocument,
        ];

      setDocuments(
        updatedDocuments,
      );

      documentsRef.current =
        updatedDocuments;

      const classified =
        await classifyDocument(
          newDocument,
        );

      const validType =
        isValidDocumentType(
          classified.documentType,
        );

      const identified =
        Boolean(
          validType &&
            typeof classified.confidence ===
              "number" &&
            classified.confidence >=
              75,
        );

      const finalDocument: ReviewDocument =
        {
          ...newDocument,

          documentType:
            validType
              ? classified.documentType
              : undefined,

          classificationStatus:
            identified
              ? "identified"
              : "uncertain",

          classificationConfidence:
            classified.confidence,

          classificationSource:
            "ai",

          documentTitleDetected:
            classified.documentTitleDetected,

          nameDetected:
            classified.nameDetected,

          classificationMessage:
            classified.message,
        };

      const finalDocuments: ReviewDocument[] =
        updatedDocuments.map(
          (
            document,
          ): ReviewDocument =>
            document.path ===
            finalDocument.path
              ? finalDocument
              : document,
        );

      setDocuments(
        finalDocuments,
      );

      documentsRef.current =
        finalDocuments;

      await saveDocumentPackage(
        finalDocuments,
        activeVerification,
      );

      setSuccessMessage(
        "Document added and identified successfully.",
      );
    } catch (
      addDocumentError
    ) {
      console.error(
        "ADD DOCUMENT ERROR:",
        addDocumentError,
      );

      setError(
        addDocumentError instanceof
        Error
          ? addDocumentError.message
          : "Unable to add the document.",
      );
    } finally {
      setAddingDocument(
        false,
      );

      setModifyingDocuments(
        false,
      );
    }
  }

  function openAddDocumentPicker(): void {
    fileInputRef.current?.click();
  }

  /*
   * ============================================================
   * CHANGE DOCUMENT TYPE
   * ============================================================
   */

  async function changeDocumentType(
    path: string,
    documentType: DocumentType,
  ): Promise<void> {
    const activeVerification =
      verificationRef.current;

    if (!activeVerification) {
      return;
    }

    setModifyingDocuments(
      true,
    );

    setError("");

    setSuccessMessage("");

    try {
      const updatedDocuments: ReviewDocument[] =
        documentsRef.current.map(
          (
            document,
          ): ReviewDocument =>
            document.path ===
            path
              ? {
                  ...document,

                  documentType,

                  classificationStatus:
                    "identified",

                  classificationSource:
                    "manual",

                  classificationMessage:
                    "Document type confirmed manually.",
                }
              : document,
        );

      setDocuments(
        updatedDocuments,
      );

      documentsRef.current =
        updatedDocuments;

      await saveDocumentPackage(
        updatedDocuments,
        activeVerification,
      );

      setDocumentTypeOpen(
        null,
      );

      setSuccessMessage(
        "Document type updated.",
      );
    } catch (
      changeTypeError
    ) {
      console.error(
        "CHANGE DOCUMENT TYPE ERROR:",
        changeTypeError,
      );

      setError(
        changeTypeError instanceof
        Error
          ? changeTypeError.message
          : "Unable to update the document type.",
      );
    } finally {
      setModifyingDocuments(
        false,
      );
    }
  }

  /*
   * ============================================================
   * REMOVE DOCUMENT
   * ============================================================
   */

  async function removeDocument(
    document: ReviewDocument,
  ): Promise<void> {
    const activeVerification =
      verificationRef.current;

    if (!activeVerification) {
      return;
    }

    if (
      documentsRef.current.length <=
      1
    ) {
      setError(
        "At least one property document is required.",
      );

      return;
    }

    setDeletingDocumentId(
      document.path,
    );

    setModifyingDocuments(
      true,
    );

    setError("");

    setSuccessMessage("");

    try {
      const {
        error:
          removeError,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .remove([
            document.path,
          ]);

      if (
        removeError
      ) {
        console.warn(
          "STORAGE REMOVE WARNING:",
          removeError,
        );
      }

      const updatedDocuments: ReviewDocument[] =
        documentsRef.current
          .filter(
            (item) =>
              item.path !==
              document.path,
          )
          .map(
            (
              item,
              index,
            ): ReviewDocument => ({
              ...item,

              originalIndex:
                index,
            }),
          );

      setDocuments(
        updatedDocuments,
      );

      documentsRef.current =
        updatedDocuments;

      await saveDocumentPackage(
        updatedDocuments,
        activeVerification,
      );

      setSuccessMessage(
        "Document removed from the verification package.",
      );
    } catch (
      removeDocumentError
    ) {
      console.error(
        "REMOVE DOCUMENT ERROR:",
        removeDocumentError,
      );

      setError(
        removeDocumentError instanceof
        Error
          ? removeDocumentError.message
          : "Unable to remove the document.",
      );
    } finally {
      setDeletingDocumentId(
        null,
      );

      setModifyingDocuments(
        false,
      );
    }
  }

  /*
   * ============================================================
   * CONTINUE TO SELECT PLAN
   * ============================================================
   */

  async function continueToPlan(): Promise<void> {
    const activeVerification =
      verificationRef.current;

    const currentDocuments =
      documentsRef.current;

    if (
      !activeVerification ||
      processing ||
      modifyingDocuments ||
      currentDocuments.length ===
        0
    ) {
      return;
    }

    if (
      currentDocuments.some(
        (document) =>
          document.classificationStatus ===
          "classifying",
      )
    ) {
      setError(
        "Please wait for document identification to finish before continuing.",
      );

      return;
    }

    setProcessing(true);

    setError("");

    setSuccessMessage("");

    try {
      const storedRecord =
        await saveDocumentPackage(
          currentDocuments,
          activeVerification,
        );

      window.location.href =
        `/verify/select-plan?id=${encodeURIComponent(
          storedRecord.id,
        )}`;
    } catch (
      planError
    ) {
      console.error(
        "SELECT PLAN ROUTING ERROR:",
        planError,
      );

      setProcessing(false);

      setError(
        planError instanceof
        Error
          ? planError.message
          : "Unable to continue to plan selection.",
      );
    }
  }

  /*
   * ============================================================
   * BACK TO VERIFY
   * ============================================================
   */

  function goBackToVerify(): void {
    if (
      processing ||
      modifyingDocuments
    ) {
      return;
    }

    window.location.href =
      "/verify";
  }

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      documentsRef.current.forEach(
        (document) => {
          if (
            document.previewUrl?.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              document.previewUrl,
            );
          }
        },
      );
    };
  }, []);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * ============================================================
   * LOAD ERROR
   * ============================================================
   */

  if (
    error &&
    !verification
  ) {
    return (
      <Screen
        message="Unable to load review"
        detail={error}
        error
        onBack={
          goBackToVerify
        }
      />
    );
  }

  const classificationInProgress =
    documents.some(
      (document) =>
        document.classificationStatus ===
        "classifying",
    );

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  return (
    <AppShell
      activePath="/verify"
      headerPath="/verify/review"
    >
      <main
        className={
          styles.page
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className={
            styles.hiddenInput
          }
          onChange={(event) => {
            void handleAddDocument(
              event,
            );
          }}
          disabled={
            processing ||
            modifyingDocuments
          }
        />

        <div
          className={
            styles.content
          }
        >
          <VerificationNavigation
            currentStep={4}
            backLabel="Back to Verify Property"
            backPath="/verify"
            disabled={
              processing ||
              modifyingDocuments
            }
          />

          <section
            className={
              styles.intro
            }
          >
            <div
              className={
                styles.reviewBadge
              }
            >
              <span>✓</span>
              DOCUMENT PACKAGE REVIEW
            </div>

            <h1>
              Review Your{" "}
              <span>
                Documents
              </span>
            </h1>

            <p>
              PropertySure AI
              identifies documents
              from their actual
              contents and extracts
              relevant information
              from the document
              itself. Review the
              package before
              verification analysis
              begins.
            </p>
          </section>

          <section
            className={
              styles.summaryCard
            }
          >
            <div
              className={
                styles.summaryIcon
              }
            >
              ▤
            </div>

            <div
              className={
                styles.summaryText
              }
            >
              <strong>
                Property Document
                Package
              </strong>

              <span>
                {documents.length}{" "}
                {documents.length ===
                1
                  ? "document"
                  : "documents"}{" "}
                ready for analysis
              </span>
            </div>

            <div
              className={
                styles.summaryStatus
              }
            >
              {classificationInProgress
                ? "Identifying"
                : "Ready"}
            </div>
          </section>

          <section
            className={
              styles.documentsSection
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <div>
                <h2>
                  Submitted
                  Documents
                </h2>

                <p>
                  AI identifies each
                  document from its
                  contents. The
                  uploaded filename is
                  not used as the
                  document identity.
                </p>
              </div>

              <span
                className={
                  styles.documentCount
                }
              >
                {documents.length}
              </span>
            </div>

            <div
              className={
                styles.documentList
              }
            >
              {documents.map(
                (
                  document,
                  index,
                ) => {
                  const title =
                    getDisplayTitle(
                      document,
                      index,
                    );

                  const detectedTitle =
                    getDetectedTitle(
                      document,
                    );

                  const detectedName =
                    getDetectedName(
                      document,
                    );

                  const isClassifying =
                    document.classificationStatus ===
                    "classifying";

                  const classificationIdentified =
                    document.classificationStatus ===
                    "identified";

                  const classificationFailed =
                    document.classificationStatus ===
                    "failed";

                  return (
                    <article
                      key={
                        document.path
                      }
                      className={
                        styles.documentCard
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.documentMainButton
                        }
                        onClick={() =>
                          setSelectedDocument(
                            document,
                          )
                        }
                        disabled={
                          modifyingDocuments
                        }
                      >
                        <div
                          className={
                            styles.documentIcon
                          }
                        >
                          {document.previewUrl &&
                          isImage(
                            document.type,
                          ) ? (
                            <img
                              src={
                                document.previewUrl
                              }
                              alt=""
                              className={
                                styles.documentThumbnail
                              }
                            />
                          ) : isPdf(
                              document.type,
                            ) ? (
                            <div
                              className={
                                styles.pdfThumbnail
                              }
                            >
                              <div
                                className={
                                  styles.pdfThumbnailTop
                                }
                              >
                                PDF
                              </div>

                              <div
                                className={
                                  styles.pdfThumbnailLines
                                }
                              >
                                <span />
                                <span />
                                <span />
                              </div>
                            </div>
                          ) : (
                            <div
                              className={
                                styles.documentIconFallback
                              }
                            >
                              {
                                document.type
                              }
                            </div>
                          )}
                        </div>

                        <div
                          className={
                            styles.documentInfo
                          }
                        >
                          <strong>
                            {title}
                          </strong>

                          <span>
                            {document.type}
                            {" • "}
                            {formatFileSize(
                              document.size,
                            )}
                          </span>

                          {detectedTitle && (
                            <small
                              className={
                                styles.detectedDocumentTitle
                              }
                            >
                              <strong>
                                AI title:
                              </strong>{" "}
                              {
                                detectedTitle
                              }
                            </small>
                          )}

                          {detectedName && (
                            <small
                              className={
                                styles.detectedPersonName
                              }
                            >
                              Name detected:{" "}
                              {
                                detectedName
                              }
                            </small>
                          )}

                          {document.classificationMessage && (
                            <small>
                              {
                                document.classificationMessage
                              }
                            </small>
                          )}

                          {isClassifying && (
                            <small
                              className={
                                styles.classificationProcessing
                              }
                            >
                              Identifying
                              from
                              document
                              contents...
                            </small>
                          )}

                          {classificationIdentified && (
                            <small
                              className={
                                styles.classificationSuccess
                              }
                            >
                              ✓ Automatically
                              identified
                              from
                              document
                              contents

                              {document.classificationConfidence !==
                              undefined
                                ? ` • ${document.classificationConfidence}% confidence`
                                : ""}
                            </small>
                          )}

                          {classificationFailed && (
                            <small
                              className={
                                styles.classificationWarning
                              }
                            >
                              ⚠ Document type
                              could not be
                              confidently
                              identified
                            </small>
                          )}
                        </div>

                        <div
                          className={
                            styles.documentArrow
                          }
                        >
                          ›
                        </div>
                      </button>

                      <div
                        className={
                          styles.documentActions
                        }
                      >
                        <div
                          className={
                            styles.typeControlWrap
                          }
                        >
                          <button
                            type="button"
                            className={`${styles.typeButton} ${
                              document.documentType
                                ? styles.identified
                                : styles.needsType
                            }`}
                            onClick={() =>
                              setDocumentTypeOpen(
                                documentTypeOpen ===
                                  document.path
                                  ? null
                                  : document.path,
                              )
                            }
                            disabled={
                              modifyingDocuments ||
                              isClassifying
                            }
                          >
                            <span>
                              Type
                            </span>

                            <strong>
                              {
                                document.documentType ||
                                "Select type"
                              }
                            </strong>

                            <span
                              className={
                                styles.typeChevron
                              }
                            >
                              {documentTypeOpen ===
                              document.path
                                ? "⌃"
                                : "⌄"}
                            </span>
                          </button>

                          {documentTypeOpen ===
                            document.path && (
                            <div
                              className={
                                styles.typeMenu
                              }
                            >
                              <div
                                className={
                                  styles.typeMenuTitle
                                }
                              >
                                Correct
                                document
                                type
                              </div>

                              {DOCUMENT_TYPE_OPTIONS.map(
                                (
                                  option,
                                ) => (
                                  <button
                                    type="button"
                                    key={
                                      option
                                    }
                                    className={
                                      document.documentType ===
                                      option
                                        ? `${styles.typeOption} ${styles.typeOptionActive}`
                                        : styles.typeOption
                                    }
                                    onClick={() => {
                                      void changeDocumentType(
                                        document.path,
                                        option,
                                      );
                                    }}
                                  >
                                    <span>
                                      {document.documentType ===
                                      option
                                        ? "✓"
                                        : ""}
                                    </span>

                                    {
                                      option
                                    }
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={() => {
                            void removeDocument(
                              document,
                            );
                          }}
                          disabled={
                            modifyingDocuments ||
                            deletingDocumentId ===
                              document.path
                          }
                        >
                          {deletingDocumentId ===
                          document.path
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </article>
                  );
                },
              )}
            </div>

            <button
              type="button"
              className={
                styles.addDocumentButton
              }
              onClick={
                openAddDocumentPicker
              }
              disabled={
                processing ||
                modifyingDocuments
              }
            >
              <span
                className={
                  styles.addDocumentPlus
                }
              >
                +
              </span>

              {addingDocument
                ? "Uploading & identifying..."
                : "Add another document"}
            </button>
          </section>

          {successMessage && (
            <div
              className={
                styles.successMessage
              }
            >
              <span>✓</span>

              {successMessage}
            </div>
          )}

          {error && (
            <div
              className={
                styles.inlineError
              }
            >
              <span>!</span>

              <div>
                {error}
              </div>
            </div>
          )}

          <section
            className={
              styles.nextCard
            }
          >
            <div
              className={
                styles.nextIcon
              }
            >
              ✦
            </div>

            <div>
              <strong>
                What happens next?
              </strong>

              <p>
                After you continue,
                PropertySure AI will
                analyze the entire
                document package for
                structure,
                consistency,
                signatures, stamps,
                completeness,
                duplicate indicators
                and potential forgery
                risks.
              </p>
            </div>
          </section>

          <div
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.backActionButton
              }
              disabled={
                processing ||
                modifyingDocuments
              }
              onClick={
                goBackToVerify
              }
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
                processing ||
                modifyingDocuments ||
                documents.length ===
                  0 ||
                documents.some(
                  (document) =>
                    document.classificationStatus ===
                    "classifying",
                )
              }
              onClick={() => {
                void continueToPlan();
              }}
            >
              <span>
                {processing
                  ? "Preparing Select Plan..."
                  : "Continue to Select Plan"}
              </span>

              <b>→</b>
            </button>
          </div>

          <div
            className={
              styles.securityNote
            }
          >
            <span>🔒</span>

            Your documents remain
            securely stored while
            your verification is
            being processed.
          </div>
        </div>

        {/* ====================================================
            DOCUMENT PREVIEW MODAL
            ==================================================== */}

        {selectedDocument && (
          <div
            className={
              styles.modalOverlay
            }
            onClick={() =>
              setSelectedDocument(
                null,
              )
            }
          >
            <div
              className={
                styles.previewModal
              }
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div
                className={
                  styles.previewHeader
                }
              >
                <div>
                  <strong>
                    {getDisplayTitle(
                      selectedDocument,
                      selectedDocument.originalIndex,
                    )}
                  </strong>

                  {selectedDocument.documentTitleDetected && (
                    <span
                      className={
                        styles.modalDetectedTitle
                      }
                    >
                      AI detected
                      title:{" "}
                      {
                        selectedDocument.documentTitleDetected
                      }
                    </span>
                  )}

                  {selectedDocument.nameDetected && (
                    <span
                      className={
                        styles.modalDetectedName
                      }
                    >
                      Name detected:{" "}
                      {
                        selectedDocument.nameDetected
                      }
                    </span>
                  )}

                  <span>
                    {
                      selectedDocument.type
                    }
                    {" • "}
                    {
                      selectedDocument.name
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDocument(
                      null,
                    )
                  }
                  aria-label="Close document preview"
                >
                  ×
                </button>
              </div>

              <div
                className={
                  styles.previewBody
                }
              >
                {selectedDocument.previewUrl &&
                isImage(
                  selectedDocument.type,
                ) ? (
                  <img
                    src={
                      selectedDocument.previewUrl
                    }
                    alt={getDisplayTitle(
                      selectedDocument,
                      selectedDocument.originalIndex,
                    )}
                  />
                ) : selectedDocument.previewUrl &&
                  isPdf(
                    selectedDocument.type,
                  ) ? (
                  <iframe
                    src={
                      selectedDocument.previewUrl
                    }
                    title={getDisplayTitle(
                      selectedDocument,
                      selectedDocument.originalIndex,
                    )}
                  />
                ) : (
                  <div
                    className={
                      styles.previewUnavailable
                    }
                  >
                    <div>
                      📄
                    </div>

                    <p>
                      Preview
                      unavailable
                    </p>

                    <span>
                      The file was
                      uploaded, but
                      the preview
                      could not be
                      retrieved. The
                      document
                      remains in the
                      verification
                      package.
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDocument(
                          null,
                        )
                      }
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

/*
 * ============================================================
 * ERROR SCREEN
 * ============================================================
 */

function Screen({
  message,
  detail,
  error = false,
  onBack,
}: {
  message: string;

  detail: string;

  error?: boolean;

  onBack?: () => void;
}) {
  if (!error) {
    return <LoadingScreen />;
  }

  return (
    <main
      className={
        styles.screen
      }
    >
      <div
        className={
          styles.errorIcon
        }
      >
        !
      </div>

      <h2>
        {message}
      </h2>

      <p>
        {detail}
      </p>

      {onBack && (
        <button
          type="button"
          onClick={
            onBack
          }
        >
          Back to Verify
        </button>
      )}
    </main>
  );
}