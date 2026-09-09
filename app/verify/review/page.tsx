"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppShell from "../../AppShell/AppShell";
import { supabase } from "../../lib/supabase";

import styles from "./review.module.css";

/*
 * ============================================================
 * PROPERTY SURE AI
 * VERIFICATION REVIEW — STEP 2
 * ============================================================
 *
 * Workflow:
 *
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
 * ============================================================
 */

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const STORAGE_BUCKET = "property-documents";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

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

type ReviewDocument = UploadedDocument & {
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
    | "uncertain";

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
  bytes: number,
): string {
  if (bytes <= 0) {
    return "Size unavailable";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(
      bytes / 1024,
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function getExtension(
  name: string,
): string {
  return (
    name
      .split(".")
      .pop()
      ?.toUpperCase() || "FILE"
  );
}

function normalizeFileType(
  name: string,
  type?: string,
): string {
  const extension =
    getExtension(name);

  if (extension !== "FILE") {
    return extension;
  }

  const normalized =
    String(type || "").toLowerCase();

  if (
    normalized ===
    "application/pdf"
  ) {
    return "PDF";
  }

  if (
    normalized ===
      "image/jpeg" ||
    normalized ===
      "image/jpg"
  ) {
    return "JPG";
  }

  if (
    normalized ===
    "image/png"
  ) {
    return "PNG";
  }

  return String(
    type || "FILE",
  ).toUpperCase();
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
   * LOAD PAGE
   * ============================================================
   */

  useEffect(() => {
    if (!verificationId) {
      setError(
        "No verification ID was provided.",
      );

      setLoading(false);

      return;
    }

    void loadVerification(
      verificationId,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId]);

  /*
   * ============================================================
   * SIGNED URL
   * ============================================================
   */

  async function getDocumentSignedUrl(
    documentPath: string,
    expiresIn = 600,
  ): Promise<string> {
    if (!documentPath) {
      throw new Error(
        "Document storage path is missing.",
      );
    }

    const {
      data,
      error: signedUrlError,
    } =
      await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(
          documentPath,
          expiresIn,
        );

    if (
      signedUrlError ||
      !data?.signedUrl
    ) {
      throw new Error(
        signedUrlError?.message ||
          "Unable to create a secure document URL.",
      );
    }

    return data.signedUrl;
  }

  /*
   * ============================================================
   * AI CLASSIFIER
   * ============================================================
   */

  async function classifyDocument(
    documentUrl: string,
    fileName: string,
    mimeType: string,
  ): Promise<ClassificationResponse> {
    if (!documentUrl) {
      throw new Error(
        "A secure document URL is required for AI identification.",
      );
    }

    const fileResponse =
      await fetch(documentUrl);

    if (!fileResponse.ok) {
      throw new Error(
        `Unable to retrieve the document from storage (${fileResponse.status}).`,
      );
    }

    const blob =
      await fileResponse.blob();

    if (
      !blob ||
      blob.size <= 0
    ) {
      throw new Error(
        "The document retrieved from storage is empty.",
      );
    }

    const actualMimeType =
      mimeType ||
      blob.type ||
      "application/octet-stream";

    const file =
      new File(
        [blob],
        fileName ||
          "property-document",
        {
          type:
            actualMimeType,
        },
      );

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    const response =
      await fetch(
        "/api/verify-document/classify-document",
        {
          method: "POST",
          body: formData,
        },
      );

    let data: unknown =
      null;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    const resultData =
      data &&
      typeof data === "object"
        ? (data as {
            success?: boolean;

            nameDetected?: string;

            documentTitleDetected?: string;

            documentType?: string;

            confidence?: number;

            status?:
              | "identified"
              | "uncertain";

            message?: string;

            result?: {
              documentType?: string;

              documentTypeConfidence?: number;

              documentTitleDetected?: string;

              nameDetected?: string;

              summary?: string;
            };

            error?: string;
          })
        : {};

    if (!response.ok) {
      throw new Error(
        resultData.error ||
          resultData.message ||
          `Document classification failed (${response.status}).`,
      );
    }

    if (
      !resultData.result
    ) {
      throw new Error(
        resultData.error ||
          "The classification API returned no result.",
      );
    }

    const raw =
      resultData.result;

    const confidenceNumber =
      Number(
        raw.documentTypeConfidence,
      );

    const confidence =
      Number.isFinite(
        confidenceNumber,
      )
        ? confidenceNumber
        : 0;

    const documentType =
      isValidDocumentType(
        raw.documentType,
      )
        ? raw.documentType
        : undefined;

    const status =
      documentType &&
      confidence >= 75
        ? "identified"
        : "uncertain";

    const nameDetected =
      typeof raw.nameDetected ===
      "string"
        ? raw.nameDetected.trim()
        : "";

    const documentTitleDetected =
      typeof raw.documentTitleDetected ===
      "string"
        ? raw.documentTitleDetected.trim()
        : "";

    console.log(
      "PROPERTY SURE AI CLASSIFICATION RESULT:",
      {
        fileName,

        mimeType:
          actualMimeType,

        documentType,

        confidence,

        status,

        documentTitleDetected,

        nameDetected,
      },
    );

    return {
      documentType,

      confidence,

      documentTitleDetected,

      nameDetected,

      status,

      message:
        raw.summary ||
        "",
    };
  }

  /*
   * ============================================================
   * CLASSIFY EXISTING DOCUMENT
   * ============================================================
   */

  async function classifyExistingDocument(
    document: ReviewDocument,
  ): Promise<ClassificationResponse> {
    const signedUrl =
      await getDocumentSignedUrl(
        document.path,
        600,
      );

    return classifyDocument(
      signedUrl,
      document.name,
      getMimeTypeFromDocument(
        document,
      ),
    );
  }

  /*
   * ============================================================
   * SAVE DOCUMENT PACKAGE
   * ============================================================
   */

  async function saveDocumentPackage(
    updatedDocuments: ReviewDocument[],
    recordOverride?:
      | VerificationRecord
      | null,
  ): Promise<VerificationRecord> {
    const activeVerification =
      recordOverride ||
      verificationRef.current;

    if (
      !activeVerification
    ) {
      throw new Error(
        "Verification record is not available.",
      );
    }

    const cleanDocuments =
      updatedDocuments.map(
        toStoredDocument,
      );

    const currentFindings =
      activeVerification.findings ||
      {};

    const updatedFindings:
      VerificationFindings = {
      ...currentFindings,

      document_package:
        cleanDocuments,

      document_count:
        cleanDocuments.length,

      processing: {
        ...(currentFindings.processing ||
          {}),

        stage: "review",

        progress: 8,

        message:
          "Your property document package is ready for review.",
      },
    };

    const firstDocument =
      cleanDocuments[0];

    const {
      error: updateError,
    } =
      await supabase
        .from("verifications")
        .update({
          doc_name:
            firstDocument?.name ||
            null,

          file_url:
            firstDocument?.path ||
            null,

          doc_type:
            firstDocument?.documentType ||
            null,

          findings:
            updatedFindings,

          status: "review",
        })
        .eq(
          "id",
          activeVerification.id,
        );

    if (
      updateError
    ) {
      throw new Error(
        `Could not update document package: ${updateError.message}`,
      );
    }

    const updatedRecord:
      VerificationRecord = {
      ...activeVerification,

      doc_name:
        firstDocument?.name ||
        null,

      file_url:
        firstDocument?.path ||
        null,

      doc_type:
        firstDocument?.documentType ||
        null,

      findings:
        updatedFindings,

      status: "review",
    };

    verificationRef.current =
      updatedRecord;

    setVerification(
      updatedRecord,
    );

    return updatedRecord;
  }

  /*
   * ============================================================
   * LOAD VERIFICATION
   * ============================================================
   */

  async function loadVerification(
    id: string,
  ): Promise<void> {
    setLoading(true);

    setError("");

    try {
      const {
        data: {
          user,
        },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError
      ) {
        throw new Error(
          authError.message,
        );
      }

      if (!user) {
        window.location.href =
          "/signin";

        return;
      }

      const {
        data,
        error:
          verificationError,
      } =
        await supabase
          .from("verifications")
          .select(
            "id, doc_name, file_url, doc_type, status, trust_score, confidence, risk, findings",
          )
          .eq(
            "id",
            id,
          )
          .single();

      if (
        verificationError
      ) {
        throw new Error(
          `Could not load verification: ${verificationError.message}`,
        );
      }

      if (!data) {
        throw new Error(
          "Verification record could not be found.",
        );
      }

      const record =
        data as unknown as VerificationRecord;

      verificationRef.current =
        record;

      setVerification(
        record,
      );

      let packageDocuments =
        Array.isArray(
          record.findings
            ?.document_package,
        )
          ? record.findings!
              .document_package!
          : [];

      /*
       * ========================================================
       * LEGACY SINGLE-DOCUMENT FALLBACK
       * ========================================================
       */

      if (
        packageDocuments.length ===
          0 &&
        record.file_url
      ) {
        packageDocuments = [
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
                record.doc_type ||
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

            nameDetected:
              "",
          },
        ];
      }

      const prepared:
        ReviewDocument[] = [];

      /*
       * ========================================================
       * PREPARE DOCUMENTS
       * ========================================================
       */

      for (
        let index = 0;
        index <
        packageDocuments.length;
        index += 1
      ) {
        const document =
          packageDocuments[index];

        if (
          !document?.path
        ) {
          continue;
        }

        const normalizedType =
          normalizeFileType(
            document.name ||
              `Document ${
                index + 1
              }`,
            document.type,
          );

        let previewUrl:
          | string
          | undefined;

        let previewError =
          false;

        try {
          previewUrl =
            await getDocumentSignedUrl(
              document.path,
              3600,
            );
        } catch {
          try {
            const {
              data:
                downloadedFile,
            } =
              await supabase.storage
                .from(
                  STORAGE_BUCKET,
                )
                .download(
                  document.path,
                );

            if (
              downloadedFile
            ) {
              previewUrl =
                URL.createObjectURL(
                  downloadedFile,
                );
            } else {
              previewError =
                true;
            }
          } catch {
            previewError =
              true;
          }
        }

        prepared.push({
          name:
            document.name ||
            `Property Document ${
              index + 1
            }`,

          path:
            document.path,

          type:
            normalizedType,

          size:
            Number(
              document.size,
            ) || 0,

          documentType:
            document.documentType,

          classificationStatus:
            document.classificationStatus ||
            (document.documentType
              ? "identified"
              : "idle"),

          classificationConfidence:
            document.classificationConfidence,

          classificationSource:
            document.classificationSource ||
            (document.documentType
              ? "existing"
              : "unknown"),

          documentTitleDetected:
            document.documentTitleDetected,

          nameDetected:
            document.nameDetected,

          classificationMessage:
            document.classificationMessage,

          previewUrl,

          previewError,

          originalIndex:
            index,
        });
      }

      documentsRef.current =
        prepared;

      setDocuments(
        prepared,
      );

      setLoading(false);

      /*
       * ========================================================
       * IDENTIFY UNKNOWN DOCUMENTS
       * ========================================================
       */

      const unknownDocuments =
        prepared.filter(
          (document) =>
            !document.documentType ||
            document.classificationStatus ===
              "idle",
        );

      if (
        unknownDocuments.length >
        0
      ) {
        void classifyUnknownDocuments(
          unknownDocuments,
        );
      }
    } catch (
      loadError
    ) {
      console.error(
        "REVIEW PAGE ERROR:",
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your document review.",
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
    unknownDocuments: ReviewDocument[],
  ): Promise<void> {
    for (
      const originalDocument of
        unknownDocuments
    ) {
      const path =
        originalDocument.path;

      try {
        const classifyingDocuments =
          documentsRef.current.map(
            (item) =>
              item.path === path
                ? {
                    ...item,

                    classificationStatus:
                      "classifying" as const,
                  }
                : item,
          );

        documentsRef.current =
          classifyingDocuments;

        setDocuments(
          classifyingDocuments,
        );

        const result =
          await classifyExistingDocument(
            originalDocument,
          );

        const validType =
          isValidDocumentType(
            result.documentType,
          )
            ? result.documentType
            : undefined;

        const identified =
          Boolean(validType) &&
          result.status ===
            "identified";

        const updatedDocuments =
          documentsRef.current.map(
            (item) =>
              item.path === path
                ? {
                    ...item,

                    documentType:
                      validType,

                    classificationStatus:
                      identified
                        ? ("identified" as const)
                        : ("uncertain" as const),

                    classificationConfidence:
                      result.confidence,

                    classificationSource:
                      identified
                        ? ("ai" as const)
                        : ("unknown" as const),

                    documentTitleDetected:
                      result.documentTitleDetected ||
                      "",

                    nameDetected:
                      result.nameDetected ||
                      "",

                    classificationMessage:
                      result.message ||
                      "",
                  }
                : item,
          );

        documentsRef.current =
          updatedDocuments;

        setDocuments(
          updatedDocuments,
        );

        await saveDocumentPackage(
          updatedDocuments,
        );
      } catch (
        classificationError
      ) {
        console.warn(
          "DOCUMENT CLASSIFICATION ERROR:",
          classificationError,
        );

        const failedDocuments =
          documentsRef.current.map(
            (item) =>
              item.path === path
                ? {
                    ...item,

                    classificationStatus:
                      "failed" as const,

                    classificationSource:
                      "unknown" as const,
                  }
                : item,
          );

        documentsRef.current =
          failedDocuments;

        setDocuments(
          failedDocuments,
        );
      }
    }
  }

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

    const activeVerification =
      verificationRef.current;

    if (
      !file ||
      !activeVerification
    ) {
      return;
    }

    setError("");

    setSuccessMessage("");

    if (
      !ALLOWED_TYPES.includes(
        file.type as
          (typeof ALLOWED_TYPES)[number],
      )
    ) {
      setError(
        `"${file.name}" is not supported. Please upload PDF, JPG or PNG.`,
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        `"${file.name}" exceeds the 20 MB file limit.`,
      );

      return;
    }

    if (
      documentsRef.current.some(
        (document) =>
          document.name ===
            file.name &&
          document.size ===
            file.size,
      )
    ) {
      setError(
        `"${file.name}" is already in this verification package.`,
      );

      return;
    }

    setAddingDocument(true);

    setModifyingDocuments(true);

    let uploadedPath:
      | string
      | null = null;

    try {
      const safeName =
        createSafeFileName(
          file.name,
        );

      const uniqueId =
        typeof crypto !==
          "undefined" &&
        typeof crypto.randomUUID ===
          "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      uploadedPath =
        `${activeVerification.id}/verification-uploads/${uniqueId}-${safeName}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .upload(
            uploadedPath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            },
          );

      if (
        uploadError
      ) {
        throw new Error(
          `Could not upload "${file.name}": ${uploadError.message}`,
        );
      }

      let previewUrl:
        | string
        | undefined;

      try {
        previewUrl =
          await getDocumentSignedUrl(
            uploadedPath,
            3600,
          );
      } catch {
        // Preview remains optional.
      }

      const newDocument:
        ReviewDocument = {
        name:
          file.name,

        path:
          uploadedPath,

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
          "unknown",

        documentTitleDetected:
          "",

        nameDetected:
          "",

        classificationMessage:
          "",

        previewUrl,

        previewError:
          !previewUrl,

        originalIndex:
          documentsRef.current.length,
      };

      const updatedDocuments =
        [
          ...documentsRef.current,
          newDocument,
        ];

      documentsRef.current =
        updatedDocuments;

      setDocuments(
        updatedDocuments,
      );

      try {
        await saveDocumentPackage(
          updatedDocuments,
          activeVerification,
        );
      } catch (
        databaseError
      ) {
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .remove([
            uploadedPath,
          ]);

        throw databaseError;
      }

      try {
        const classificationUrl =
          previewUrl ||
          (await getDocumentSignedUrl(
            uploadedPath,
            600,
          ));

        const result =
          await classifyDocument(
            classificationUrl,
            file.name,
            file.type,
          );

        const validType =
          isValidDocumentType(
            result.documentType,
          )
            ? result.documentType
            : undefined;

        const identified =
          Boolean(validType) &&
          result.status ===
            "identified";

        const classifiedDocuments =
          documentsRef.current.map(
            (item) =>
              item.path ===
              uploadedPath
                ? {
                    ...item,

                    documentType:
                      validType,

                    classificationStatus:
                      identified
                        ? ("identified" as const)
                        : ("uncertain" as const),

                    classificationConfidence:
                      result.confidence,

                    classificationSource:
                      identified
                        ? ("ai" as const)
                        : ("unknown" as const),

                    documentTitleDetected:
                      result.documentTitleDetected ||
                      "",

                    nameDetected:
                      result.nameDetected ||
                      "",

                    classificationMessage:
                      result.message ||
                      "",
                  }
                : item,
          );

        documentsRef.current =
          classifiedDocuments;

        setDocuments(
          classifiedDocuments,
        );

        await saveDocumentPackage(
          classifiedDocuments,
        );

        if (
          identified &&
          validType &&
          result.nameDetected
        ) {
          setSuccessMessage(
            `${validType} identified. Name detected: ${result.nameDetected}.`,
          );
        } else if (
          identified &&
          validType
        ) {
          setSuccessMessage(
            `${validType} automatically identified from the document contents.`,
          );
        } else if (
          result.nameDetected
        ) {
          setSuccessMessage(
            `AI detected "${result.nameDetected}" in the document, but could not confidently determine the document type.`,
          );
        } else if (
          result.documentTitleDetected
        ) {
          setSuccessMessage(
            `AI detected "${result.documentTitleDetected}" from the document, but could not confidently determine the document type.`,
          );
        } else {
          setSuccessMessage(
            "Document uploaded. We could not confidently identify its type. You can select its type manually.",
          );
        }
      } catch (
        classificationError
      ) {
        console.warn(
          "DOCUMENT IDENTIFICATION FAILED:",
          classificationError,
        );

        const failedDocuments =
          documentsRef.current.map(
            (item) =>
              item.path ===
              uploadedPath
                ? {
                    ...item,

                    classificationStatus:
                      "failed" as const,

                    classificationSource:
                      "unknown" as const,
                  }
                : item,
          );

        documentsRef.current =
          failedDocuments;

        setDocuments(
          failedDocuments,
        );

        setSuccessMessage(
          "Document uploaded. Automatic identification failed, so please select its type manually.",
        );
      }
    } catch (
      addError
    ) {
      console.error(
        "ADD DOCUMENT ERROR:",
        addError,
      );

      if (
        uploadedPath
      ) {
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .remove([
            uploadedPath,
          ]);
      }

      setError(
        addError instanceof Error
          ? addError.message
          : "Unable to add this document.",
      );
    } finally {
      setAddingDocument(false);

      setModifyingDocuments(false);
    }
  }

  /*
   * ============================================================
   * CHANGE DOCUMENT TYPE
   * ============================================================
   */

  async function changeDocumentType(
    documentPath: string,
    newType: DocumentType,
  ): Promise<void> {
    if (
      modifyingDocuments ||
      processing
    ) {
      return;
    }

    const updatedDocuments =
      documentsRef.current.map(
        (document) =>
          document.path ===
          documentPath
            ? {
                ...document,

                documentType:
                  newType,

                classificationStatus:
                  "identified" as const,

                classificationSource:
                  "manual" as const,
              }
            : document,
      );

    setModifyingDocuments(true);

    setError("");

    setSuccessMessage("");

    try {
      await saveDocumentPackage(
        updatedDocuments,
      );

      documentsRef.current =
        updatedDocuments;

      setDocuments(
        updatedDocuments,
      );

      setDocumentTypeOpen(
        null,
      );

      setSuccessMessage(
        "Document type updated.",
      );
    } catch (
      typeError
    ) {
      console.error(
        "DOCUMENT TYPE ERROR:",
        typeError,
      );

      setError(
        typeError instanceof Error
          ? typeError.message
          : "Unable to update document type.",
      );
    } finally {
      setModifyingDocuments(false);
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
    if (
      processing ||
      modifyingDocuments
    ) {
      return;
    }

    const currentDocuments =
      documentsRef.current;

    /*
     * IMPORTANT:
     * A document can be removed even when it is
     * the only document currently in the package.
     *
     * The user can then upload another document.
     */

    const confirmed =
      window.confirm(
        `Remove "${getDisplayTitle(
          document,
          document.originalIndex,
        )}" from this verification package?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(
      document.path,
    );

    setModifyingDocuments(true);

    setError("");

    setSuccessMessage("");

    try {
      const updatedDocuments =
        currentDocuments
          .filter(
            (item) =>
              item.path !==
              document.path,
          )
          .map(
            (
              item,
              index,
            ) => ({
              ...item,

              originalIndex:
                index,
            }),
          );

      await saveDocumentPackage(
        updatedDocuments,
      );

      const {
        error:
          storageDeleteError,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET,
          )
          .remove([
            document.path,
          ]);

      if (
        storageDeleteError
      ) {
        console.warn(
          "DOCUMENT STORAGE DELETE WARNING:",
          storageDeleteError,
        );
      }

      if (
        document.previewUrl?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          document.previewUrl,
        );
      }

      documentsRef.current =
        updatedDocuments;

      setDocuments(
        updatedDocuments,
      );

      if (
        selectedDocument?.path ===
        document.path
      ) {
        setSelectedDocument(
          null,
        );
      }

      setSuccessMessage(
        "Document removed from the verification package.",
      );
    } catch (
      removeError
    ) {
      console.error(
        "REMOVE DOCUMENT ERROR:",
        removeError,
      );

      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove this document.",
      );
    } finally {
      setDeletingDocumentId(
        null,
      );

      setModifyingDocuments(false);
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
        planError instanceof Error
          ? planError.message
          : "Unable to continue to plan selection.",
      );
    }
  }

  /*
   * ============================================================
   * NAVIGATION
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

  function openAddDocumentPicker(): void {
    if (
      processing ||
      modifyingDocuments ||
      addingDocument
    ) {
      return;
    }

    fileInputRef.current?.click();
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
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingBrand}>
          <span className={styles.loadingDiamond} />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={styles.loadingIndicator}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p className={styles.loadingText}>
          Loading...
        </p>
      </main>
    );
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
      <main className={styles.page}>
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
          <button
            type="button"
            className={
              styles.backButton
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
            Back to Verify Property
          </button>

          <section
            className={
              styles.workflow
            }
          >
            <div
              className={
                styles.workflowItem
              }
            >
              <span
                className={
                  styles.workflowNumberDone
                }
              >
                ✓
              </span>

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
                styles.workflowLineActive
              }
            />

            <div
              className={`${styles.workflowItem} ${styles.workflowCurrent}`}
            >
              <span
                className={
                  styles.workflowNumberActive
                }
              >
                2
              </span>

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
                styles.workflowItem
              }
            >
              <span
                className={
                  styles.workflowNumber
                }
              >
                3
              </span>

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
                styles.workflowItem
              }
            >
              <span
                className={
                  styles.workflowNumber
                }
              >
                4
              </span>

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
                styles.workflowItem
              }
            >
              <span
                className={
                  styles.workflowNumber
                }
              >
                5
              </span>

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

                  const classificationFailed =
                    document.classificationStatus ===
                      "failed" ||
                    document.classificationStatus ===
                      "uncertain";

                  return (
                    <article
                      className={
                        styles.documentCard
                      }
                      key={`${document.path}-${index}`}
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
                          <div
                            className={
                              styles.documentIconFallback
                            }
                          >
                            {isImage(
                              document.type,
                            )
                              ? "IMG"
                              : isPdf(
                                    document.type,
                                  )
                                ? "PDF"
                                : getExtension(
                                    document.name,
                                  )}
                          </div>

                          {document.previewUrl &&
                            isImage(
                              document.type,
                            ) && (
                              <img
                                src={
                                  document.previewUrl
                                }
                                alt={`${title} document preview`}
                                className={
                                  styles.documentThumbnail
                                }
                                onError={(
                                  event,
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            )}

                          {document.previewUrl &&
                            isPdf(
                              document.type,
                            ) && (
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
                                  <span />
                                  <span />
                                </div>
                              </div>
                            )}
                        </div>

                        <div
                          className={
                            styles.documentInfo
                          }
                        >
                          <strong>
                            {isClassifying
                              ? "Identifying document..."
                              : title}
                          </strong>

                          <span>
                            Document{" "}
                            {index + 1}
                            {" • "}
                            {document.type}

                            {document.size >
                            0
                              ? ` • ${formatFileSize(
                                  document.size,
                                )}`
                              : ""}
                          </span>

                          {detectedTitle &&
                            !isClassifying && (
                              <small
                                className={
                                  styles.detectedDocumentTitle
                                }
                              >
                                AI detected
                                title:{" "}
                                <strong>
                                  {
                                    detectedTitle
                                  }
                                </strong>
                              </small>
                            )}

                          {detectedName &&
                            !isClassifying && (
                              <small
                                className={
                                  styles.detectedPersonName
                                }
                              >
                                Name detected
                                in document:{" "}
                                <strong>
                                  {
                                    detectedName
                                  }
                                </strong>
                              </small>
                            )}

                          <small>
                            Uploaded file:{" "}
                            {document.name}
                          </small>

                          {isClassifying && (
                            <small
                              className={
                                styles.classificationStatus
                              }
                            >
                              <span
                                className={
                                  styles.miniSpinner
                                }
                              />

                              PropertySure AI
                              is reading
                              the actual
                              document
                              contents
                            </small>
                          )}

                          {!isClassifying &&
                            document.classificationStatus ===
                              "identified" &&
                            document.classificationSource ===
                              "ai" && (
                              <small
                                className={
                                  styles.classificationSuccess
                                }
                              >
                                ✓ Automatically
                                identified
                                from document
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

                        {/* ==================================================
                            REMOVE DOCUMENT
                            ================================================== */}

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

            {!processing && (
              <span
                className={
                  styles.buttonArrow
                }
              >
                →
              </span>
            )}
          </button>

          <div
            className={
              styles.securityNotice
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
 * LOADING / ERROR SCREEN
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
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingBrand}>
          <span className={styles.loadingDiamond} />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={styles.loadingIndicator}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p className={styles.loadingText}>
          Loading...
        </p>
      </main>
    );
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