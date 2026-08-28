"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

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
  /*
   * IMPORTANT:
   * `name` is ONLY the uploaded filename.
   */
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

  useEffect(() => {
    documentsRef.current =
      documents;
  }, [documents]);

  useEffect(() => {
    verificationRef.current =
      verification;
  }, [verification]);

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
   *
   * IMPORTANT CHANGE:
   *
   * We no longer send the Supabase URL directly to the
   * classification API.
   *
   * We first download the ACTUAL FILE from Supabase.
   *
   * Then we send that actual file using multipart/form-data.
   *
   * This means:
   *
   * Supabase
   *    ↓
   * actual File
   *    ↓
   * Classification API
   *    ↓
   * OpenAI
   *    ↓
   * document analysis
   *
   * The filename is never used as evidence.
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

    /*
     * ==========================================================
     * DOWNLOAD ACTUAL FILE FROM SUPABASE
     * ==========================================================
     */

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

    /*
     * ==========================================================
     * CREATE REAL FILE OBJECT
     * ==========================================================
     */

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

    /*
     * ==========================================================
     * SEND ACTUAL FILE TO CLASSIFICATION API
     * ==========================================================
     */

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    /*
     * IMPORTANT:
     *
     * Do NOT manually set Content-Type.
     *
     * The browser creates the multipart boundary.
     */

    const response =
      await fetch(
        "/api/verify-document/classify-document",
        {
          method: "POST",

          body:
            formData,
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

    /*
     * ==========================================================
     * API ERROR
     * ==========================================================
     */

    if (!response.ok) {
      throw new Error(
        resultData.error ||
          resultData.message ||
          `Document classification failed (${response.status}).`,
      );
    }

    /*
     * ==========================================================
     * RESULT CHECK
     * ==========================================================
     */

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

    /*
     * ==========================================================
     * CONFIDENCE
     * ==========================================================
     */

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

    /*
     * ==========================================================
     * DOCUMENT TYPE
     * ==========================================================
     */

    const documentType =
      isValidDocumentType(
        raw.documentType,
      )
        ? raw.documentType
        : undefined;

    /*
     * ==========================================================
     * CLASSIFICATION STATUS
     * ==========================================================
     */

    const status =
      documentType &&
      confidence >= 75
        ? "identified"
        : "uncertain";

    /*
     * ==========================================================
     * ACTUAL NAME FROM DOCUMENT
     * ==========================================================
     */

    const nameDetected =
      typeof raw.nameDetected ===
      "string"
        ? raw.nameDetected.trim()
        : "";

    /*
     * ==========================================================
     * ACTUAL DOCUMENT TITLE
     * ==========================================================
     */

    const documentTitleDetected =
      typeof raw.documentTitleDetected ===
      "string"
        ? raw.documentTitleDetected.trim()
        : "";

    /*
     * ==========================================================
     * DEBUG LOG
     * ==========================================================
     *
     * This is intentional.
     *
     * When we test, the terminal will show us exactly what
     * the AI returned.
     * ==========================================================
     */

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
    } = await supabase
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
       * Legacy single-document fallback.
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
        // Preview is optional.
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

      /*
       * ========================================================
       * AI CLASSIFICATION
       * ========================================================
       */

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

    if (
      currentDocuments.length <=
      1
    ) {
      setError(
        "At least one document must remain in the verification package.",
      );

      return;
    }

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
   * CONTINUE TO PROCESSING
   * ============================================================
   */

  async function continueToProcessing(): Promise<void> {
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

      const storedDocuments =
        currentDocuments.map(
          toStoredDocument,
        );

      const finalFindings:
        VerificationFindings = {
        ...(storedRecord.findings ||
          {}),

        document_package:
          storedDocuments,

        document_count:
          storedDocuments.length,

        processing: {
          ...(storedRecord
            .findings
            ?.processing ||
            {}),

          stage:
            "queued",

          progress:
            10,

          message:
            "Your document package has been submitted for AI analysis.",
        },

        ai_classification: {
          status:
            "completed",

          completed_at:
            new Date().toISOString(),

          documents_classified:
            storedDocuments.filter(
              (document) =>
                document.classificationStatus ===
                "identified",
            ).length,

          message:
            "Document identification completed before verification analysis.",
        },
      };

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "verifications",
          )
          .update({
            status:
              "processing",

            findings:
              finalFindings,
          })
          .eq(
            "id",
            storedRecord.id,
          );

      if (
        updateError
      ) {
        throw new Error(
          `Could not start verification: ${updateError.message}`,
        );
      }

      window.location.href =
        `/processing?id=${encodeURIComponent(
          storedRecord.id,
        )}`;
    } catch (
      processingError
    ) {
      console.error(
        "PROCESSING START ERROR:",
        processingError,
      );

      setError(
        processingError instanceof Error
          ? processingError.message
          : "Unable to continue to document analysis.",
      );

      setProcessing(false);
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
      <Screen
        message="Loading your documents"
        detail="Preparing your document package for review..."
      />
    );
  }

  /*
   * ============================================================
   * ERROR SCREEN
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

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="reviewPage">

      <header className="mobileHeader">

        <button
          type="button"
          className="backButton"
          onClick={
            goBackToVerify
          }
          disabled={
            processing ||
            modifyingDocuments
          }
        >
          ←
        </button>

        <div className="headerLogo">

          <span className="logoDiamond">
            ◆
          </span>

          <span>
            PropertySure
            <strong>
              {" "}AI
            </strong>
          </span>

        </div>

        <div className="headerStep">
          2 of 3
        </div>

      </header>

      <input
        ref={
          fileInputRef
        }
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        style={{
          display:
            "none",
        }}
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

      <div className="pageContent">

        <div className="reviewBadge">

          <span>
            ✓
          </span>

          DOCUMENT PACKAGE REVIEW

        </div>

        <section className="intro">

          <h1>
            Review Your{" "}
            <span>
              Documents
            </span>
          </h1>

          <p>
            PropertySure AI identifies
            documents from their actual
            contents and extracts relevant
            information from the document
            itself. Review the package before
            verification analysis begins.
          </p>

        </section>

        <section className="summaryCard">

          <div className="summaryIcon">
            ▤
          </div>

          <div className="summaryText">

            <strong>
              Property Document Package
            </strong>

            <span>
              {documents.length}{" "}
              {
                documents.length ===
                1
                  ? "document"
                  : "documents"
              }{" "}
              ready for analysis
            </span>

          </div>

          <div className="summaryStatus">
            Ready
          </div>

        </section>

        <section className="documentsSection">

          <div className="sectionHeader">

            <div>

              <h2>
                Submitted Documents
              </h2>

              <p>
                AI identifies the document
                from its contents. The
                uploaded filename is not used
                as the document identity.
              </p>

            </div>

            <span className="documentCount">
              {documents.length}
            </span>

          </div>

          <div className="documentList">

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
                  <div
                    className="documentCard"
                    key={`${document.path}-${index}`}
                  >

                    <button
                      type="button"
                      className="documentMainButton"
                      onClick={() =>
                        setSelectedDocument(
                          document,
                        )
                      }
                      disabled={
                        modifyingDocuments
                      }
                    >

                      <div className="documentIcon">

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

                      <div className="documentInfo">

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

                        {/*
                         * ACTUAL DOCUMENT TITLE
                         */}

                        {detectedTitle &&
                          !isClassifying && (
                            <small className="detectedDocumentTitle">

                              AI detected title:{" "}
                              <strong>
                                {detectedTitle}
                              </strong>

                            </small>
                          )}

                        {/*
                         * ACTUAL PERSON NAME
                         */}

                        {detectedName &&
                          !isClassifying && (
                            <small className="detectedPersonName">

                              Name detected in
                              document:{" "}
                              <strong>
                                {detectedName}
                              </strong>

                            </small>
                          )}

                        {/*
                         * UPLOADED FILENAME
                         *
                         * This is deliberately separate
                         * from the AI-detected name.
                         */}

                        <small>
                          Uploaded file:{" "}
                          {document.name}
                        </small>

                        {isClassifying && (
                          <small className="classificationStatus">

                            <span className="miniSpinner" />

                            PropertySure AI is
                            reading the actual
                            document contents

                          </small>
                        )}

                        {!isClassifying &&
                          document.classificationStatus ===
                            "identified" &&
                          document.classificationSource ===
                            "ai" && (
                            <small className="classificationSuccess">

                              ✓ Automatically identified
                              from document contents

                              {document.classificationConfidence !==
                                undefined
                                ? ` • ${document.classificationConfidence}% confidence`
                                : ""}

                            </small>
                          )}

                        {classificationFailed && (
                          <small className="classificationWarning">

                            ⚠ Document type could not be
                            confidently identified

                          </small>
                        )}

                      </div>

                      <div className="documentArrow">
                        ›
                      </div>

                    </button>

                    <div className="documentActions">

                      <button
                        type="button"
                        className={
                          document.documentType
                            ? "typeButton identified"
                            : "typeButton needsType"
                        }
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

                        <span className="typeChevron">
                          {documentTypeOpen ===
                          document.path
                            ? "⌃"
                            : "⌄"}
                        </span>

                      </button>

                      {documentTypeOpen ===
                        document.path && (

                        <div className="typeMenu">

                          <div className="typeMenuTitle">
                            Correct document type
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
                                    ? "typeOption active"
                                    : "typeOption"
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

                                {option}

                              </button>

                            ),
                          )}

                        </div>

                      )}

                      <button
                        type="button"
                        className="removeButton"
                        onClick={() => {
                          void removeDocument(
                            document,
                          );
                        }}
                        disabled={
                          modifyingDocuments ||
                          documents.length <=
                            1 ||
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

                  </div>
                );
              },
            )}

          </div>

          <button
            type="button"
            className="addDocumentButton"
            onClick={
              openAddDocumentPicker
            }
            disabled={
              processing ||
              modifyingDocuments
            }
          >

            <span className="addDocumentPlus">
              +
            </span>

            {addingDocument
              ? "Uploading & identifying..."
              : "Add another document"}

          </button>

        </section>

        {successMessage && (

          <div className="successMessage">

            <span>
              ✓
            </span>

            {successMessage}

          </div>

        )}

        {error && (

          <div className="inlineError">

            <span>
              !
            </span>

            <div>
              {error}
            </div>

          </div>

        )}

        <section className="nextCard">

          <div className="nextIcon">
            ✦
          </div>

          <div>

            <strong>
              What happens next?
            </strong>

            <p>
              After you continue,
              PropertySure AI will analyze
              the entire document package for
              structure, consistency,
              signatures, stamps, completeness,
              duplicate indicators and
              potential forgery risks.
            </p>

          </div>

        </section>

        <button
          type="button"
          className="continueButton"
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
            void continueToProcessing();
          }}
        >

          <span>
            {processing
              ? "Starting AI Analysis..."
              : "Continue to AI Analysis"}
          </span>

          {!processing && (
            <span className="buttonArrow">
              →
            </span>
          )}

        </button>

        <button
          type="button"
          className="backToVerify"
          disabled={
            processing ||
            modifyingDocuments
          }
          onClick={
            goBackToVerify
          }
        >
          ← Back to Upload Documents
        </button>

        <div className="securityNotice">

          <span>
            🔒
          </span>

          Your documents remain securely
          stored while your verification is
          being processed.

        </div>

      </div>

      {selectedDocument && (

        <div
          className="modalOverlay"
          onClick={() =>
            setSelectedDocument(
              null,
            )
          }
        >

          <div
            className="previewModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="previewHeader">

              <div>

                <strong>
                  {getDisplayTitle(
                    selectedDocument,
                    selectedDocument.originalIndex,
                  )}
                </strong>

                {selectedDocument.documentTitleDetected && (
                  <span className="modalDetectedTitle">

                    AI detected title:
                    {" "}
                    {
                      selectedDocument.documentTitleDetected
                    }

                  </span>
                )}

                {selectedDocument.nameDetected && (
                  <span className="modalDetectedName">

                    Name detected:
                    {" "}
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
              >
                ×
              </button>

            </div>

            <div className="previewBody">

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

                <div className="previewUnavailable">

                  <div>
                    📄
                  </div>

                  <p>
                    Preview unavailable
                  </p>

                  <span>
                    The file was uploaded,
                    but the preview could not
                    be retrieved. The document
                    remains in the verification
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

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .reviewPage {
          min-height: 100vh;
          padding-bottom: 45px;
          color: #f8fafc;

          background:
            radial-gradient(
              circle at 50% -20%,
              rgba(17, 105, 190, 0.22),
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

        .mobileHeader {
          height: 76px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 24px;

          border-bottom:
            1px solid
            rgba(70, 145, 230, 0.16);

          background:
            rgba(2, 16, 35, 0.94);

          position: sticky;
          top: 0;
          z-index: 20;
        }

        .backButton {
          width: 42px;
          height: 42px;

          border: none;

          background:
            rgba(22, 142, 255, 0.08);

          border:
            1px solid
            rgba(22, 142, 255, 0.2);

          border-radius: 10px;

          color: #d9e9fb;

          font-size: 23px;
          cursor: pointer;
        }

        .backButton:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .headerLogo {
          display: flex;
          align-items: center;
          gap: 8px;

          font-size: 19px;
          font-weight: 700;
        }

        .logoDiamond {
          color: #168eff;
          font-size: 25px;
        }

        .headerLogo strong {
          color: #168eff;
        }

        .headerStep {
          color: #7189a5;
          font-size: 11px;
          font-weight: 700;
        }

        .pageContent {
          width: 100%;
          max-width: 760px;

          margin: 0 auto;

          padding:
            38px 28px 30px;
        }

        .reviewBadge {
          width: max-content;

          display: flex;
          align-items: center;
          gap: 8px;

          padding:
            9px 14px;

          border-radius: 999px;

          border:
            1px solid
            rgba(32, 217, 129, 0.28);

          background:
            rgba(32, 217, 129, 0.06);

          color: #20d981;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.4px;
        }

        .reviewBadge span {
          width: 18px;
          height: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(32, 217, 129, 0.15);
        }

        .intro {
          text-align: center;
          padding:
            35px 0 28px;
        }

        .intro h1 {
          margin: 0;

          font-size:
            clamp(34px, 6vw, 47px);

          line-height: 1.08;

          letter-spacing: -1.7px;
        }

        .intro h1 span {
          color: #20a7ff;
        }

        .intro p {
          max-width: 610px;

          margin:
            16px auto 0;

          color: #94aac3;

          font-size: 14px;
          line-height: 1.65;
        }

        .summaryCard,
        .documentCard {
          border:
            1px solid
            rgba(48, 130, 205, 0.25);

          background:
            rgba(5, 29, 56, 0.75);
        }

        .summaryCard {
          display: flex;
          align-items: center;
          gap: 13px;

          padding:
            15px 16px;

          border-radius: 13px;
        }

        .summaryIcon,
        .documentIcon {
          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(22, 142, 255, 0.1);

          border:
            1px solid
            rgba(22, 142, 255, 0.25);

          color: #36aaff;
        }

        .summaryIcon {
          width: 47px;
          height: 47px;

          flex-shrink: 0;

          border-radius: 11px;

          font-size: 22px;
        }

        .summaryText {
          flex: 1;

          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .summaryText strong {
          font-size: 14px;
        }

        .summaryText span {
          color: #8098b4;
          font-size: 11px;
        }

        .summaryStatus {
          padding:
            6px 10px;

          border-radius: 999px;

          background:
            rgba(32, 217, 129, 0.08);

          color: #20d981;

          border:
            1px solid
            rgba(32, 217, 129, 0.2);

          font-size: 10px;
          font-weight: 700;
        }

        .documentsSection {
          margin-top: 20px;
        }

        .sectionHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 10px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: 17px;
        }

        .sectionHeader p {
          margin:
            5px 0 0;

          color: #718aa6;

          font-size: 10px;
          line-height: 1.5;
        }

        .documentCount {
          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(22, 142, 255, 0.1);

          color: #39aaff;

          font-size: 12px;
          font-weight: 800;
        }

        .documentList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .documentCard {
          position: relative;
          width: 100%;

          border-radius: 13px;

          overflow: visible;
        }

        .documentMainButton {
          width: 100%;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 12px;

          border: none;

          border-radius:
            13px 13px 0 0;

          background: transparent;

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .documentMainButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .documentIcon {
          width: 48px;
          height: 48px;

          flex-shrink: 0;

          border-radius: 10px;

          font-size: 9px;
          font-weight: 800;
        }

        .documentInfo {
          flex: 1;
          min-width: 0;

          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .documentInfo > strong {
          color: #e9f2fc;

          font-size: 13px;
          line-height: 1.35;
        }

        .documentInfo > span {
          color: #7089a5;
          font-size: 9px;
        }

        .documentInfo small {
          color: #55718f;

          font-size: 8px;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }

        .detectedDocumentTitle {
          color: #b9cde3 !important;

          white-space: normal !important;

          line-height: 1.45;

          overflow: visible !important;
        }

        .detectedDocumentTitle strong {
          color: #dcecff;
        }

        .detectedPersonName {
          color: #7ee7b2 !important;

          white-space: normal !important;

          line-height: 1.45;

          overflow: visible !important;
        }

        .detectedPersonName strong {
          color: #b7f7d5;
        }

        .classificationStatus {
          display: flex;
          align-items: center;
          gap: 5px;

          color: #56b8ff !important;
        }

        .classificationSuccess {
          color: #20d981 !important;
        }

        .classificationWarning {
          color: #fbbf24 !important;
        }

        .miniSpinner {
          width: 10px;
          height: 10px;

          flex-shrink: 0;

          border:
            1.5px solid
            rgba(86, 184, 255, 0.2);

          border-top-color:
            #56b8ff;

          border-radius: 50%;

          animation:
            miniSpin
            0.7s
            linear
            infinite;
        }

        .documentArrow {
          color: #7590ad;
          font-size: 27px;
          font-weight: 300;
        }

        .documentActions {
          position: relative;

          display: flex;
          align-items: center;
          gap: 8px;

          padding:
            8px 10px 10px;

          border-top:
            1px solid
            rgba(48, 130, 205, 0.14);
        }

        .typeButton {
          position: relative;

          flex: 1;
          min-width: 0;

          display: flex;
          align-items: center;
          gap: 7px;

          padding:
            8px 10px;

          border:
            1px solid
            rgba(48, 130, 205, 0.25);

          border-radius: 8px;

          background:
            rgba(3, 20, 40, 0.7);

          color: #91a8c1;

          text-align: left;

          cursor: pointer;
        }

        .typeButton.identified {
          border-color:
            rgba(32, 217, 129, 0.22);
        }

        .typeButton.needsType {
          border-color:
            rgba(251, 191, 36, 0.3);
        }

        .typeButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .typeButton > span:first-child {
          color: #5f7b99;
          font-size: 8px;
        }

        .typeButton strong {
          flex: 1;
          min-width: 0;

          color: #dbeafe;

          font-size: 9px;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }

        .typeButton.needsType strong {
          color: #fbbf24;
        }

        .typeChevron {
          color: #48aaff;
          font-size: 13px;
        }

        .typeMenu {
          position: absolute;

          left: 10px;
          right: 78px;

          top: calc(100% - 2px);

          z-index: 50;

          max-height: 280px;

          overflow-y: auto;

          padding: 5px;

          border:
            1px solid
            rgba(59, 151, 231, 0.35);

          border-radius: 10px;

          background: #071d36;

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, 0.45);
        }

        .typeMenuTitle {
          padding:
            8px 9px;

          color: #5f7b99;

          font-size: 8px;

          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: 0.5px;
        }

        .typeOption {
          width: 100%;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 9px;

          border: none;

          border-radius: 7px;

          background: transparent;

          color: #a9bdd3;

          text-align: left;

          font-size: 9px;

          cursor: pointer;
        }

        .typeOption:hover,
        .typeOption.active {
          background:
            rgba(22, 142, 255, 0.12);

          color: #42aaff;
        }

        .typeOption > span {
          width: 12px;

          color: #20d981;

          font-weight: 800;
        }

        .removeButton {
          flex-shrink: 0;

          padding:
            8px 10px;

          border:
            1px solid
            rgba(248, 113, 113, 0.2);

          border-radius: 8px;

          background:
            rgba(127, 29, 29, 0.08);

          color: #f87171;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;
        }

        .removeButton:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .addDocumentButton {
          width: 100%;
          min-height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          margin-top: 10px;

          border:
            1px dashed
            rgba(42, 156, 239, 0.42);

          border-radius: 10px;

          background:
            rgba(22, 142, 255, 0.04);

          color: #42aaff;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        .addDocumentButton:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .addDocumentPlus {
          width: 22px;
          height: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(22, 142, 255, 0.12);

          font-size: 18px;
        }

        .successMessage,
        .inlineError {
          display: flex;
          align-items: flex-start;
          gap: 9px;

          margin-top: 12px;

          padding:
            10px 12px;

          border-radius: 9px;

          font-size: 10px;
          line-height: 1.5;
        }

        .successMessage {
          align-items: center;

          border:
            1px solid
            rgba(32, 217, 129, 0.2);

          background:
            rgba(32, 217, 129, 0.06);

          color: #63e6a2;
        }

        .successMessage span {
          width: 21px;
          height: 21px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(32, 217, 129, 0.12);
        }

        .inlineError {
          border:
            1px solid
            rgba(248, 113, 113, 0.25);

          background:
            rgba(127, 29, 29, 0.15);

          color: #fca5a5;
        }

        .inlineError > span {
          width: 22px;
          height: 22px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(239, 68, 68, 0.15);

          color: #ff747b;

          font-weight: 800;
        }

        .nextCard {
          display: flex;
          gap: 12px;

          margin-top: 16px;

          padding: 15px;

          border:
            1px solid
            rgba(165, 107, 255, 0.2);

          border-radius: 12px;

          background:
            rgba(94, 52, 152, 0.07);
        }

        .nextIcon {
          width: 39px;
          height: 39px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(165, 107, 255, 0.1);

          color: #b57aff;

          font-size: 19px;
        }

        .nextCard strong {
          font-size: 12px;
        }

        .nextCard p {
          margin:
            6px 0 0;

          color: #8299b4;

          font-size: 10px;
          line-height: 1.6;
        }

        .continueButton {
          width: 100%;
          height: 58px;

          position: relative;

          margin-top: 15px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #0875df,
              #0c65cf
            );

          color: white;

          font-size: 15px;
          font-weight: 700;

          cursor: pointer;
        }

        .continueButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .buttonArrow {
          position: absolute;
          right: 20px;

          font-size: 27px;
        }

        .backToVerify {
          display: block;

          margin:
            13px auto 0;

          border: none;

          background: transparent;

          color: #6f8eaf;

          font-size: 11px;

          cursor: pointer;
        }

        .backToVerify:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .securityNotice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          margin-top: 19px;

          color: #6f88a5;

          text-align: center;

          font-size: 9px;
          line-height: 1.5;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;

          z-index: 100;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 18px;

          background:
            rgba(0, 7, 17, 0.88);

          backdrop-filter:
            blur(8px);
        }

        .previewModal {
          width: 100%;
          max-width: 900px;

          height: 90vh;

          display: flex;
          flex-direction: column;

          overflow: hidden;

          border:
            1px solid
            rgba(59, 151, 231, 0.35);

          border-radius: 15px;

          background: #061a32;

          box-shadow:
            0 30px 90px
            rgba(0, 0, 0, 0.55);
        }

        .previewHeader {
          min-height: 62px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding:
            10px 14px;

          border-bottom:
            1px solid
            rgba(76, 149, 235, 0.15);
        }

        .previewHeader > div {
          display: flex;
          flex-direction: column;
          gap: 4px;

          min-width: 0;
        }

        .previewHeader strong,
        .previewHeader span {
          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }

        .previewHeader strong {
          font-size: 13px;
        }

        .previewHeader span {
          color: #718aa6;
          font-size: 9px;
        }

        .modalDetectedTitle {
          color: #b9cde3 !important;

          white-space: normal !important;
        }

        .modalDetectedName {
          color: #7ee7b2 !important;

          white-space: normal !important;
        }

        .previewHeader button {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          border: none;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.06);

          color: white;

          font-size: 24px;

          cursor: pointer;
        }

        .previewBody {
          flex: 1;
          min-height: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 10px;

          overflow: auto;

          background: #020c19;
        }

        .previewBody img {
          max-width: 100%;
          max-height: 100%;

          object-fit: contain;

          border-radius: 5px;
        }

        .previewBody iframe {
          width: 100%;
          height: 100%;

          border: none;

          background: white;
        }

        .previewUnavailable {
          text-align: center;

          max-width: 320px;

          padding: 25px;
        }

        .previewUnavailable div {
          font-size: 42px;
        }

        .previewUnavailable p {
          margin:
            10px 0 5px;

          color: white;

          font-size: 15px;
        }

        .previewUnavailable span {
          color: #7891ad;

          font-size: 11px;
          line-height: 1.5;
        }

        .previewUnavailable button {
          margin-top: 18px;

          border: none;

          padding:
            9px 18px;

          border-radius: 8px;

          background: #168eff;

          color: white;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        @keyframes miniSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        @media (max-width: 600px) {

          .mobileHeader {
            height: 70px;

            padding:
              0 16px;
          }

          .headerLogo {
            font-size: 17px;
          }

          .logoDiamond {
            font-size: 23px;
          }

          .pageContent {
            padding:
              25px 16px 28px;
          }

          .reviewBadge {
            font-size: 9px;

            padding:
              8px 11px;
          }

          .intro {
            padding:
              27px 0 22px;
          }

          .intro h1 {
            font-size:
              clamp(
                29px,
                8.5vw,
                38px
              );
          }

          .intro p {
            font-size: 11px;
          }

          .summaryCard {
            padding: 12px;
          }

          .summaryIcon {
            width: 42px;
            height: 42px;
            font-size: 19px;
          }

          .summaryText strong {
            font-size: 11px;
          }

          .summaryText span {
            font-size: 9px;
          }

          .summaryStatus {
            font-size: 8px;

            padding:
              5px 8px;
          }

          .sectionHeader h2 {
            font-size: 15px;
          }

          .sectionHeader p {
            font-size: 9px;
          }

          .documentMainButton {
            padding: 10px;
          }

          .documentIcon {
            width: 43px;
            height: 43px;
          }

          .documentInfo > strong {
            font-size: 10px;
          }

          .documentInfo > span {
            font-size: 8px;
          }

          .documentInfo small {
            font-size: 7px;
          }

          .detectedDocumentTitle,
          .detectedPersonName {
            white-space: normal !important;
          }

          .documentActions {
            padding:
              7px 8px 8px;
          }

          .typeButton {
            padding:
              7px 8px;
          }

          .typeButton strong {
            font-size: 8px;
          }

          .removeButton {
            padding:
              7px 8px;

            font-size: 8px;
          }

          .typeMenu {
            left: 8px;
            right: 72px;
          }

          .nextCard p {
            font-size: 9px;
          }

          .continueButton {
            height: 56px;
            font-size: 13px;
          }

          .previewModal {
            height: 92vh;
            border-radius: 12px;
          }
        }

        @media (max-width: 380px) {

          .pageContent {
            padding-left: 12px;
            padding-right: 12px;
          }

          .headerLogo {
            font-size: 16px;
          }

          .documentInfo > strong {
            font-size: 9px;
          }

          .typeButton strong {
            max-width: 110px;
          }
        }

      `}</style>

    </main>
  );
}

/*
 * ============================================================
 * SCREEN
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
  return (
    <main className="screen">

      <div
        className={
          error
            ? "errorIcon"
            : "spinner"
        }
      >
        {error ? "!" : ""}
      </div>

      <h2>
        {message}
      </h2>

      <p>
        {detail}
      </p>

      {error && (
        <button
          type="button"
          onClick={onBack}
        >
          Back to Verify
        </button>
      )}

      <style jsx>{`

        .screen {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding: 30px;

          background:
            linear-gradient(
              180deg,
              #031328,
              #021124
            );

          color: white;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .spinner {
          width: 44px;
          height: 44px;

          border:
            3px solid
            rgba(22, 142, 255, 0.18);

          border-top-color:
            #168eff;

          border-radius: 50%;

          animation:
            spin
            0.8s
            linear
            infinite;

          margin-bottom: 20px;
        }

        .errorIcon {
          width: 58px;
          height: 58px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(239, 68, 68, 0.12);

          border:
            1px solid
            rgba(239, 68, 68, 0.35);

          color: #ff6b73;

          font-size: 28px;
          font-weight: 700;

          margin-bottom: 18px;
        }

        .screen h2 {
          margin: 0;
          font-size: 22px;
        }

        .screen p {
          max-width: 500px;

          color: #91a8c2;

          line-height: 1.6;

          font-size: 13px;
        }

        .screen button {
          border: none;

          padding:
            12px 22px;

          border-radius: 9px;

          background: #168eff;

          color: white;

          font-weight: 700;

          cursor: pointer;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

      `}</style>

    </main>
  );
}