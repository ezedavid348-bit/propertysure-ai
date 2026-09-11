"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";
import styles from "./result.module.css";

type CheckValue = boolean | null;

type VerificationChecks = {
  documentStructure: CheckValue;
  dataConsistency: CheckValue;
  signatureValid: CheckValue;
  stampValid: CheckValue;
  noForgery: CheckValue;
  noDuplicate: CheckValue;
  documentCompleteness: CheckValue;
};

type DocumentPackageItem = {
  name?: string;
  path?: string;
  type?: string;
  documentType?: string;
  documentTitleDetected?: string;
  nameDetected?: string;
};

type DocumentResult = {
  documentName?: string;
  documentType?: string;
  confidence?: number;
  summary?: string;
  assessmentStatus?: string;
  authenticityStatus?: string;
  syntheticDocumentRisk?: string;
  manipulationIndicators?: string[];
  checks?: VerificationChecks;
};

type VerificationFindings = {
  document_package?: DocumentPackageItem[];
  document_count?: number;
  checks?: VerificationChecks;
  essential?: {
    plan?: string;
    completed_at?: string;
    document_results?: DocumentResult[];
    summary?: string;
  };
  processing?: {
    stage?: string;
    progress?: number;
    message?: string;
  };
  /**
   * Optional GPS/location analysis written by the verification engine.
   * The Essential result remains functional when this data is not yet available.
   */
  gps?: unknown;
  location?: unknown;
  location_analysis?: unknown;
};

type Verification = {
  id: number | string;
  doc_name: string | null;
  file_url: string | null;
  doc_type: string | null;
  status: string | null;
  trust_score: number | null;
  confidence: number | null;
  risk: string | null;
  findings: VerificationFindings | null;
  created_at?: string | null;
};

type DisplayDocument = {
  index: number;
  reference: string;
  name: string;
  type: string;
  path: string;
  confidence: number | null;
  result: "Reviewed" | "Attention";
  summary: string;
  assessmentStatus: string;
  authenticityStatus: string;
  syntheticDocumentRisk: string | null;
  manipulationIndicators: string[];
  checks: VerificationChecks;
};

const STORAGE_BUCKET =
  "property-documents";

const EMPTY_CHECKS: VerificationChecks = {
  documentStructure: null,
  dataConsistency: null,
  signatureValid: null,
  stampValid: null,
  noForgery: null,
  noDuplicate: null,
  documentCompleteness: null,
};

function getDocumentType(
  document: DocumentPackageItem,
  result?: DocumentResult,
) {
  return (
    result?.documentType ||
    document.documentType ||
    document.documentTitleDetected ||
    document.nameDetected ||
    document.name ||
    "Property Document"
  );
}

function getDocumentName(
  document: DocumentPackageItem,
  result?: DocumentResult,
) {
  return (
    result?.documentName ||
    document.documentTitleDetected ||
    document.nameDetected ||
    getDocumentType(document, result)
  );
}

function getDocumentResult(
  checks: VerificationChecks,
): "Reviewed" | "Attention" {
  const values = Object.values(checks);

  // Essential is AI document assessment only. Never present an AI-only
  // assessment as "Passed" or as independent authenticity confirmation.

  /*
   * Essential is an AI document assessment only.
   * A clean AI assessment does not independently authenticate
   * a document against a government registry or other authority.
   *
   * Therefore an Essential document must never be displayed
   * as "Passed" solely because its AI checks are positive.
   */
  if (
    values.some(
      (value) => value === false,
    )
  ) {
    return "Attention";
  }

  return "Reviewed";
}

function getCheckLabel(
  key: keyof VerificationChecks,
) {
  const labels: Record<
    keyof VerificationChecks,
    string
  > = {
    documentStructure:
      "Document Structure",
    dataConsistency:
      "Data Consistency",
    signatureValid:
      "Signature Valid (Visual)",
    stampValid:
      "Stamp Valid (Visual)",
    noForgery:
      "Forgery Indicators",
    noDuplicate:
      "Duplicate Detection",
    documentCompleteness:
      "Document Completeness",
  };

  return labels[key];
}

function getCheckDescription(
  key: keyof VerificationChecks,
  value: CheckValue,
) {
  if (value === false) {
    const descriptions: Record<
      keyof VerificationChecks,
      string
    > = {
      documentStructure:
        "The document structure contains items requiring attention.",
      dataConsistency:
        "Some information appears inconsistent within the submitted package.",
      signatureValid:
        "Signature indicators require further review.",
      stampValid:
        "Stamp or seal indicators require further review.",
      noForgery:
        "Potential manipulation or alteration indicators were detected.",
      noDuplicate:
        "A possible duplicate or repeated document was detected.",
      documentCompleteness:
        "The submitted package may be missing supporting information.",
    };

    return descriptions[key];
  }

  if (value === null) {
    return "This check could not be conclusively assessed from the submitted documents.";
  }

  const descriptions: Record<
    keyof VerificationChecks,
    string
  > = {
    documentStructure:
      "Documents have coherent structure and expected formatting.",
    dataConsistency:
      "Key information is consistent across the submitted documents.",
    signatureValid:
      "Visible signatures appear reasonable based on visual assessment.",
    stampValid:
      "Visible stamps or seals appear reasonable based on visual assessment.",
    noForgery:
      "No obvious signs of manipulation or alteration were detected.",
    noDuplicate:
      "No suspiciously repeated documents were detected.",
    documentCompleteness:
      "The submitted document package appears reasonably complete.",
  };

  return descriptions[key];
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatRisk(
  risk: string | null,
) {
  if (!risk) return "—";

  return risk
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getRiskClass(
  risk: string | null,
) {
  const normalized =
    risk?.toLowerCase();

  if (
    normalized === "low" ||
    normalized === "very_low"
  ) {
    return styles.riskLow;
  }

  if (
    normalized === "medium" ||
    normalized === "moderate"
  ) {
    return styles.riskMedium;
  }

  if (
    normalized === "high" ||
    normalized === "very_high"
  ) {
    return styles.riskHigh;
  }

  return styles.riskUnknown;
}

function isPackageComplete(
  documents: DisplayDocument[],
) {
  return (
    documents.length > 0 &&
    documents.every(
      (document) =>
        document.result !==
        "Attention",
    )
  );
}

function getAssessmentDetails(
  trustScore: number,
  confidence: number,
  risk: string | null,
  documents: DisplayDocument[],
) {
  const normalizedRisk = risk?.toLowerCase() || "";

  const attentionDocuments = documents.filter(
    (document) => document.result === "Attention",
  );

  const reviewedDocuments = documents.filter(
    (document) => document.result === "Reviewed",
  );

  const failedChecks = documents.flatMap((document) =>
    (Object.keys(document.checks) as Array<keyof VerificationChecks>)
      .filter((key) => document.checks[key] === false)
      .map((key) => ({
        key,
        document: document.type,
      })),
  );

  const reviewedChecks = documents.flatMap((document) =>
    (Object.keys(document.checks) as Array<keyof VerificationChecks>)
      .filter((key) => document.checks[key] === null)
      .map((key) => ({
        key,
        document: document.type,
      })),
  );

  const uniqueFailedCheckLabels = [
    ...new Set(
      failedChecks.map((item) =>
        getCheckLabel(item.key),
      ),
    ),
  ];

  const uniqueReviewedCheckLabels = [
    ...new Set(
      reviewedChecks.map((item) =>
        getCheckLabel(item.key),
      ),
    ),
  ];

  const attentionNames = attentionDocuments
    .map((document) => document.type)
    .filter(Boolean);

  const reviewedNames = reviewedDocuments
    .map((document) => document.type)
    .filter(Boolean);

  const formatNames = (
    names: string[],
    fallback: string,
  ) => {
    if (names.length === 0) return fallback;
    if (names.length === 1) return names[0];
    if (names.length === 2) {
      return `${names[0]} and ${names[1]}`;
    }
    return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
  };

  const attentionText = formatNames(
    attentionNames,
    "the affected documents",
  );

  const reviewedText = formatNames(
    reviewedNames,
    "the submitted documents",
  );

  const failedChecksText =
    uniqueFailedCheckLabels.length > 0
      ? uniqueFailedCheckLabels.join(", ")
      : "";

  const reviewedChecksText =
    uniqueReviewedCheckLabels.length > 0
      ? uniqueReviewedCheckLabels.join(", ")
      : "";

  const hasHighRisk =
    normalizedRisk === "high" ||
    normalizedRisk === "very_high";

  const hasMediumRisk =
    normalizedRisk === "medium" ||
    normalizedRisk === "moderate";

  const hasAttention =
    attentionDocuments.length > 0 ||
    hasHighRisk ||
    trustScore < 50;

  const hasCaution =
    !hasAttention &&
    (
      hasMediumRisk ||
      trustScore < 80 ||
      confidence < 80
    );

  if (documents.length === 0) {
    return {
      level: "caution" as const,
      assessment:
        "No analyzed documents are currently available for this assessment. The analysis summary will be generated once the submitted document package has been processed.",
      recommendation:
        "Complete the document submission and assessment process before relying on this result.",
      title: "Analysis Pending",
    };
  }

  if (hasAttention) {
    const failedChecksSentence =
      failedChecksText
        ? `The specific areas requiring attention include ${failedChecksText}.`
        : "The flagged documents contain findings that require further review.";

    const scoreSentence =
      `The package received an AI trust score of ${trustScore}/100 with AI analysis confidence of ${confidence}%, resulting in a ${formatRisk(risk)} risk assessment.`;

    return {
      level: "attention" as const,
      assessment:
        `The Essential AI assessment analyzed ${documents.length} submitted document${documents.length === 1 ? "" : "s"} and found that ${attentionText} ${attentionDocuments.length === 1 ? "requires" : "require"} further attention. ${failedChecksSentence} ${scoreSentence} This is an AI document assessment only and does not independently authenticate the submitted documents.`,
      recommendation:
        `Review the findings identified in ${attentionText}${failedChecksText ? `, particularly ${failedChecksText}` : ""}, reconcile the affected information with the rest of the property document package, and consider Professional or Premium due diligence before proceeding with the transaction.`,
      title: "Action Recommended",
    };
  }

  if (!hasCaution) {
    return {
      level: "strong" as const,
      assessment:
        `The Essential AI assessment analyzed all ${documents.length} submitted document${documents.length === 1 ? "" : "s"} and found strong results across the available document-level checks. The package received an AI trust score of ${trustScore}/100 with AI analysis confidence of ${confidence}%. No obvious document-level concerns were identified within the scope of the Essential assessment. This does not establish that the documents are genuine or officially issued.`,
      recommendation:
        "The submitted package has produced a strong AI document assessment. Treat the result as an initial screening assessment only. For a major property transaction, complete independent government, ownership, legal, and other professional due diligence before payment, transfer, or other irreversible commitments.",
      title: "AI Assessment Looks Strong",
    };
  }

  const reviewSentence =
    reviewedDocuments.length > 0
      ? `${reviewedDocuments.length} document${reviewedDocuments.length === 1 ? "" : "s"} (${reviewedText}) were assessed but cannot be independently authenticated from the Essential service.`
      : "Some assessed areas did not meet the stronger AI assessment threshold.";

  const checkSentence =
    reviewedChecksText
      ? `Areas requiring additional review include ${reviewedChecksText}.`
      : "";

  return {
    level: "caution" as const,
    assessment:
      `The Essential AI assessment analyzed ${documents.length} submitted document${documents.length === 1 ? "" : "s"}. ${reviewSentence} ${checkSentence} The package received an AI trust score of ${trustScore}/100 with AI analysis confidence of ${confidence}%, resulting in a ${formatRisk(risk)} risk assessment. No Essential result should be interpreted as independent authenticity confirmation.`,
    recommendation:
      "Proceed with caution. Use this result as an initial AI screening assessment and complete independent government and ownership verification through Professional or Premium due diligence before making a final property decision.",
    title: "Additional Verification Recommended",
  };
}

function getOverallAssessment(
  trustScore: number,
  confidence: number,
  risk: string | null,
  documents: DisplayDocument[],
) {
  return getAssessmentDetails(
    trustScore,
    confidence,
    risk,
    documents,
  ).assessment;
}

function getRecommendation(
  trustScore: number,
  confidence: number,
  risk: string | null,
  documents: DisplayDocument[],
) {
  return getAssessmentDetails(
    trustScore,
    confidence,
    risk,
    documents,
  ).recommendation;
}

function getRecommendationTitle(
  trustScore: number,
  confidence: number,
  risk: string | null,
  documents: DisplayDocument[],
) {
  return getAssessmentDetails(
    trustScore,
    confidence,
    risk,
    documents,
  ).title;
}

/**
 * Converts a Supabase Storage URL into the
 * underlying storage object path.
 *
 * Supports:
 * - public Storage URLs
 * - signed Storage URLs
 * - plain Storage object paths
 */
function getStorageObjectPath(
  value: string,
) {
  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    !trimmed.startsWith(
      "http://",
    ) &&
    !trimmed.startsWith(
      "https://",
    )
  ) {
    return trimmed;
  }

  try {
    const url =
      new URL(trimmed);

    const bucketMarker =
      `/${STORAGE_BUCKET}/`;

    const bucketIndex =
      url.pathname.indexOf(
        bucketMarker,
      );

    if (
      bucketIndex === -1
    ) {
      return null;
    }

    const objectPath =
      url.pathname.substring(
        bucketIndex +
          bucketMarker.length,
      );

    if (!objectPath) {
      return null;
    }

    return decodeURIComponent(
      objectPath,
    );
  } catch {
    return null;
  }
}

type LocationStatus =
  | "consistent"
  | "mismatch"
  | "inconclusive";

type LocationAnalysis = {
  status: LocationStatus;
  statusLabel: string;
  latitude: number | null;
  longitude: number | null;
  coordinatesLabel: string;
  documentLocation: string;
  detectedLocation: string;
  confidence: number | null;
  distanceMeters: number | null;
  source: string;
  discrepancy: string;
  message: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return null;
}

function firstString(
  record: Record<string, unknown> | null,
  keys: string[],
) {
  if (!record) return "";

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function firstNumber(
  record: Record<string, unknown> | null,
  keys: string[],
) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function normalizeLocationStatus(
  value: unknown,
): LocationStatus {
  if (typeof value !== "string") {
    return "inconclusive";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (
    normalized.includes("mismatch") ||
    normalized.includes("inconsistent") ||
    normalized.includes("discrep") ||
    normalized.includes("different")
  ) {
    return "mismatch";
  }

  if (
    normalized.includes("consistent") ||
    normalized === "match" ||
    normalized === "matched" ||
    normalized === "verified"
  ) {
    return "consistent";
  }

  return "inconclusive";
}

function getLocationAnalysis(
  findings: VerificationFindings,
): LocationAnalysis {
  const rawCandidates = [
    findings.essential &&
      asRecord(findings.essential)?.gps,
    findings.essential &&
      asRecord(findings.essential)?.location,
    findings.essential &&
      asRecord(findings.essential)?.location_analysis,
    findings.gps,
    findings.location,
    findings.location_analysis,
  ];

  const raw = rawCandidates.find(
    (value) => value !== null && value !== undefined,
  );

  const record = asRecord(raw);

  const coordinatesRecord = asRecord(
    record?.coordinates,
  );

  const latitude =
    firstNumber(record, [
      "latitude",
      "lat",
      "gps_latitude",
    ]) ??
    firstNumber(coordinatesRecord, [
      "latitude",
      "lat",
    ]);

  const longitude =
    firstNumber(record, [
      "longitude",
      "lng",
      "lon",
      "gps_longitude",
    ]) ??
    firstNumber(coordinatesRecord, [
      "longitude",
      "lng",
      "lon",
    ]);

  const status = normalizeLocationStatus(
    record?.status ??
      record?.location_status ??
      record?.verification_status ??
      record?.consistency,
  );

  const documentLocation =
    firstString(record, [
      "document_location",
      "stated_location",
      "property_location_from_document",
      "document_stated_location",
    ]) || "Not available";

  const detectedLocation =
    firstString(record, [
      "detected_location",
      "gps_location",
      "resolved_location",
      "reported_location",
    ]) || "Not available";

  const confidence = firstNumber(record, [
    "confidence",
    "location_confidence",
    "gps_confidence",
  ]);

  const distanceMeters = firstNumber(record, [
    "distance_meters",
    "distanceMeters",
    "distance",
  ]);

  const source =
    firstString(record, [
      "source",
      "gps_source",
      "location_source",
    ]) ||
    (latitude !== null && longitude !== null
      ? "Recorded GPS coordinates"
      : "No property GPS data recorded");

  const discrepancy =
    firstString(record, [
      "discrepancy",
      "location_discrepancy",
      "finding",
    ]);

  let message =
    "Property GPS/location information is not yet conclusive from the available verification data.";

  if (status === "consistent") {
    message =
      "Location information is consistent with the submitted property documents based on the available GPS/location data.";
  } else if (status === "mismatch") {
    message =
      discrepancy ||
      "A geographic discrepancy was detected between the available GPS/location information and the submitted property documents.";
  } else if (record) {
    message =
      firstString(record, [
        "message",
        "summary",
        "analysis",
      ]) ||
      message;
  }

  const statusLabel =
    status === "consistent"
      ? "Location Consistent"
      : status === "mismatch"
        ? "Location Mismatch"
        : "Location Not Conclusive";

  return {
    status,
    statusLabel,
    latitude,
    longitude,
    coordinatesLabel:
      latitude !== null && longitude !== null
        ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        : "Not available",
    documentLocation,
    detectedLocation,
    confidence,
    distanceMeters,
    source,
    discrepancy,
    message,
  };
}

function getLocationStatusClass(
  status: LocationStatus,
) {
  if (status === "consistent") {
    return styles.locationStatusConsistent;
  }

  if (status === "mismatch") {
    return styles.locationStatusMismatch;
  }

  return styles.locationStatusInconclusive;
}

export default function ResultPage() {
  const searchParams =
    useSearchParams();

  const verificationId =
    searchParams.get("id");

  const [
    verification,
    setVerification,
  ] = useState<Verification | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    | "documents"
    | "checks"
    | "property"
    | "summary"
  >("documents");

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<DisplayDocument | null>(
      null,
    );

  const [
    selectedDocumentUrl,
    setSelectedDocumentUrl,
  ] = useState("");

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [
    previewError,
    setPreviewError,
  ] = useState("");

  const previewRequestId =
    useRef(0);

  useEffect(() => {
    if (!verificationId) {
      setError(
        "Verification ID was not provided.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadVerification() {
      try {
        setLoading(true);
        setError("");

        const {
          data,
          error: queryError,
        } = await supabase
          .from("verifications")
          .select(
            "id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings,created_at",
          )
          .eq(
            "id",
            verificationId,
          )
          .maybeSingle();

        if (queryError) {
          throw new Error(
            queryError.message,
          );
        }

        if (!data) {
          throw new Error(
            "Verification record was not found.",
          );
        }

        if (!cancelled) {
          setVerification(
            data as Verification,
          );
        }
      } catch (loadError) {
        console.error(
          "RESULT LOAD ERROR:",
          loadError,
        );

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load verification result.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVerification();

    return () => {
      cancelled = true;
    };
  }, [verificationId]);

  const findings =
    verification?.findings || {};

  const documentPackage =
    Array.isArray(
      findings.document_package,
    )
      ? findings.document_package
      : verification?.file_url
        ? [
            {
              name:
                verification.doc_name ||
                "Property Document",
              path:
                verification.file_url,
              type:
                verification.doc_type ||
                "application/pdf",
              documentType:
                verification.doc_type ||
                undefined,
            },
          ]
        : [];

  /*
   * PACKAGE-LEVEL AI RESULTS
   *
   * Each entry represents one document's
   * individual AI verification result.
   */
  const aiResults =
    Array.isArray(
      findings.essential
        ?.document_results,
    )
      ? findings.essential
          ?.document_results || []
      : [];

  const documents =
    useMemo(() => {
      return documentPackage.map(
        (
          document,
          index,
        ) => {
          const result =
            aiResults[index];

          const checks =
            result?.checks ||
            EMPTY_CHECKS;

          /*
           * IMPORTANT:
           *
           * result.summary is the AI-generated
           * summary for THIS DOCUMENT ONLY.
           *
           * findings.essential.summary is the
           * summary for the ENTIRE PACKAGE.
           *
           * They must never be mixed.
           */
          const documentSummary =
            typeof result?.summary ===
                "string" &&
            result.summary.trim()
              ? result.summary.trim()
              : "No document-specific analysis summary is available.";

          return {
            index: index + 1,

            reference:
              `PSAI-${String(
                verification?.id ||
                  verificationId ||
                  "000",
              )}-DOC-${String(
                index + 1,
              ).padStart(
                2,
                "0",
              )}`,

            name:
              getDocumentName(
                document,
                result,
              ),

            type:
              getDocumentType(
                document,
                result,
              ),

            path:
              document.path || "",

            confidence:
              typeof result?.confidence ===
              "number"
                ? result.confidence
                : null,

            result:
              getDocumentResult(
                checks,
              ),

            summary:
              documentSummary,

            assessmentStatus:
              typeof result?.assessmentStatus ===
                "string" &&
              result.assessmentStatus.trim()
                ? result.assessmentStatus.trim()
                : "ai_assessed",

            authenticityStatus:
              typeof result?.authenticityStatus ===
                "string" &&
              result.authenticityStatus.trim()
                ? result.authenticityStatus.trim()
                : "not_independently_verified",

            syntheticDocumentRisk:
              typeof result?.syntheticDocumentRisk ===
                "string" &&
              result.syntheticDocumentRisk.trim()
                ? result.syntheticDocumentRisk.trim()
                : null,

            manipulationIndicators:
              Array.isArray(
                result?.manipulationIndicators,
              )
                ? result.manipulationIndicators.filter(
                    (item): item is string =>
                      typeof item === "string" &&
                      item.trim().length > 0,
                  )
                : [],

            checks,
          };
        },
      );
    }, [
      documentPackage,
      aiResults,
      verification?.id,
      verificationId,
    ]);

  /*
   * PACKAGE-LEVEL CHECKS
   */
  const packageChecks =
    findings.checks ||
    EMPTY_CHECKS;

  const trustScore =
    typeof verification?.trust_score ===
    "number"
      ? verification.trust_score
      : 0;

  const confidence =
    typeof verification?.confidence ===
    "number"
      ? verification.confidence
      : 0;

  const packageStatus =
    isPackageComplete(
      documents,
    )
      ? "AI Assessed"
      : documents.length > 0
        ? "Attention Required"
        : "Pending";

  const assessedDocuments = documents.length;

  const reviewedDocuments =
    documents.filter(
      (document) =>
        document.result ===
        "Reviewed",
    ).length;

  const attentionDocuments =
    documents.filter(
      (document) =>
        document.result ===
        "Attention",
    ).length;

  /*
   * PACKAGE-LEVEL ANALYSIS SUMMARY
   *
   * This belongs to the entire submitted
   * property document package.
   */
  const overallSummary =
    findings.essential
      ?.summary ||
    "The submitted property document package has been analyzed by PropertySure AI.";

  const overallAssessment =
    getOverallAssessment(
      trustScore,
      confidence,
      verification?.risk || null,
      documents,
    );

  const recommendation =
    getRecommendation(
      trustScore,
      confidence,
      verification?.risk || null,
      documents,
    );

  const recommendationTitle =
    getRecommendationTitle(
      trustScore,
      confidence,
      verification?.risk || null,
      documents,
    );

  const locationAnalysis =
    getLocationAnalysis(findings);

  async function openDocument(
    document: DisplayDocument,
  ) {
    const requestId =
      ++previewRequestId.current;

    setSelectedDocument(
      document,
    );

    setSelectedDocumentUrl("");
    setPreviewError("");
    setPreviewLoading(true);

    try {
      const storagePath =
        getStorageObjectPath(
          document.path,
        );

      if (
        storagePath
      ) {
        const {
          data,
          error:
            signedUrlError,
        } =
          await supabase.storage
            .from(
              STORAGE_BUCKET,
            )
            .createSignedUrl(
              storagePath,
              60 * 60,
            );

        if (
          signedUrlError
        ) {
          throw new Error(
            signedUrlError.message,
          );
        }

        if (
          !data?.signedUrl
        ) {
          throw new Error(
            "A secure document preview URL could not be created.",
          );
        }

        if (
          requestId ===
          previewRequestId.current
        ) {
          setSelectedDocumentUrl(
            data.signedUrl,
          );
        }

        return;
      }

      if (
        document.path.startsWith(
          "http://",
        ) ||
        document.path.startsWith(
          "https://",
        )
      ) {
        if (
          requestId ===
          previewRequestId.current
        ) {
          setSelectedDocumentUrl(
            document.path,
          );
        }

        return;
      }

      throw new Error(
        "The document location could not be resolved.",
      );
    } catch (previewLoadError) {
      console.error(
        "DOCUMENT PREVIEW ERROR:",
        previewLoadError,
      );

      if (
        requestId ===
        previewRequestId.current
      ) {
        setPreviewError(
          previewLoadError instanceof
            Error
            ? previewLoadError.message
            : "Unable to load the document preview.",
        );
      }
    } finally {
      if (
        requestId ===
        previewRequestId.current
      ) {
        setPreviewLoading(
          false,
        );
      }
    }
  }

  function closeDocument() {
    ++previewRequestId.current;

    setSelectedDocument(
      null,
    );

    setSelectedDocumentUrl("");
    setPreviewError("");
    setPreviewLoading(false);
  }

  async function showPreviousDocument() {
    if (
      !selectedDocument ||
      selectedDocument.index <= 1
    ) {
      return;
    }

    const previous =
      documents[
        selectedDocument.index -
          2
      ];

    if (previous) {
      await openDocument(
        previous,
      );
    }
  }

  async function showNextDocument() {
    if (
      !selectedDocument ||
      selectedDocument.index >=
        documents.length
    ) {
      return;
    }

    const next =
      documents[
        selectedDocument.index
      ];

    if (next) {
      await openDocument(
        next,
      );
    }
  }

  function downloadReport() {
    if (!verification) {
      return;
    }

    window.open(
      `/api/report?id=${encodeURIComponent(
        String(
          verification.id,
        ),
      )}`,
      "_blank",
    );
  }

  function verifyAnotherProperty() {
    window.location.href =
      "/verify";
  }

  function goToDashboard() {
    window.location.href =
      "/dashboard";
  }

  if (loading) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/result"
      >
        <div
          className={
            styles.loadingPage
          }
        >
          <div
            className={
              styles.loadingCard
            }
          >
            <div
              className={
                styles.loadingSpinner
              }
            />

            <h2>
              Loading verification
              result
            </h2>

            <p>
              Retrieving your completed
              property analysis...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (
    error ||
    !verification
  ) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/result"
      >
        <div
          className={
            styles.errorPage
          }
        >
          <div
            className={
              styles.errorCard
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
              Unable to load result
            </h2>

            <p>
              {error ||
                "The verification result could not be loaded."}
            </p>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                goToDashboard
              }
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      activePath="/verify"
      headerPath="/result"
    >
      <main
        className={
          styles.resultPage
        }
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroWatermark
            }
            aria-hidden="true"
            style={{
              right: "0",
              top: "0",
              width: "62%",
              height: "100%",
              transform: "none",
              opacity: 1,
            }}
          >
            <img
              src="/result-header-verification.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "right center",
                display: "block",
              }}
            />
          </div>

          <div
            className={
              styles.heroContent
            }
          >
            <div
              className={
                styles.completeBadge
              }
            >
              <span>✓</span>
              AI ASSESSMENT COMPLETE
            </div>

            <h1>
              Property Document
              AI Assessment Result
            </h1>

            <p>
              Your document package
              has been assessed by
              PropertySure AI.
            </p>

            <p
              className={
                styles.heroSubtext
              }
            >
              Here is your AI document
              assessment report.
            </p>

            <div
              className={
                styles.heroMeta
              }
            >
              <div
                className={
                  styles.heroMetaItem
                }
              >
                <span
                  className={
                    styles.metaIcon
                  }
                >
                  ◉
                </span>

                <div>
                  <small>
                    Verification ID
                  </small>

                  <strong>
                    #
                    {
                      verification.id
                    }
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.heroMetaItem
                }
              >
                <span
                  className={
                    styles.metaIcon
                  }
                >
                  ◫
                </span>

                <div>
                  <small>
                    Completed
                  </small>

                  <strong>
                    {formatDateTime(
                      findings
                        .essential
                        ?.completed_at ||
                        verification.created_at,
                    )}
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.heroMetaItem
                }
              >
                <span
                  className={
                    styles.metaIcon
                  }
                >
                  ▣
                </span>

                <div>
                  <small>
                    Plan
                  </small>

                  <strong>
                    Essential
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.heroMetaItem
                }
              >
                <span
                  className={
                    styles.metaIcon
                  }
                >
                  ▱
                </span>

                <div>
                  <small>
                    Documents
                    Analyzed
                  </small>

                  <strong>
                    {
                      documents.length
                    }{" "}
                    document
                    {documents.length ===
                    1
                      ? ""
                      : "s"}
                  </strong>
                </div>
              </div>
            </div>
          </div>


        </section>

        {/* =====================================================
            SUMMARY METRICS
        ====================================================== */}

        <section
          className={
            styles.metricsGrid
          }
        >
          <div
            className={`${styles.metricCard} ${styles.metricGreen}`}
          >
            <div
              className={
                styles.metricIcon
              }
            >
              ✓
            </div>

            <div>
              <span>
                Trust Score
              </span>

              <strong>
                {trustScore}
                <small>
                  {" "}
                  / 100
                </small>
              </strong>

              <p>
                AI-assessed document
                indicators across the
                submitted package.
              </p>
            </div>
          </div>

          <div
            className={`${styles.metricCard} ${styles.metricBlue}`}
          >
            <div
              className={
                styles.metricIcon
              }
            >
              ▮
            </div>

            <div>
              <span>
                Confidence
              </span>

              <strong>
                {confidence}
                <small>
                  %
                </small>
              </strong>

              <p>
                AI confidence in
                its analysis of the
                submitted documents.
              </p>
            </div>
          </div>

          <div
            className={`${styles.metricCard} ${styles.metricGreen}`}
          >
            <div
              className={
                styles.metricIcon
              }
            >
              !
            </div>

            <div>
              <span>
                Risk Level
              </span>

              <strong
                className={
                  getRiskClass(
                    verification.risk,
                  )
                }
              >
                {formatRisk(
                  verification.risk,
                )}
              </strong>

              <p>
                Risk assessment from
                the AI document
                screening results.
              </p>
            </div>
          </div>

          <div
            className={`${styles.metricCard} ${styles.metricBlue}`}
          >
            <div
              className={
                styles.metricIcon
              }
            >
              ▣
            </div>

            <div>
              <span>
                Package Status
              </span>

              <strong>
                {packageStatus}
              </strong>

              <p>
                {documents.length} of{" "}
                {
                  documents.length
                }{" "}
                submitted document
                {documents.length ===
                1
                  ? ""
                  : "s"}{" "}
                analyzed.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PROPERTY LOCATION & GPS ANALYSIS
        ====================================================== */}

        <section
          className={
            styles.locationCard
          }
        >
          <div
            className={
              styles.locationHeader
            }
          >
            <div
              className={
                styles.locationHeading
              }
            >
              <div
                className={
                  styles.locationIcon
                }
                aria-hidden="true"
              >
                ⌖
              </div>

              <div>
                <span
                  className={
                    styles.locationEyebrow
                  }
                >
                  GEOGRAPHIC VERIFICATION SIGNAL
                </span>

                <h2>
                  Property Location & GPS Analysis
                </h2>

                <p>
                  Available GPS and location information is compared with the property location stated in the submitted documents.
                </p>
              </div>
            </div>

            <span
              className={`${styles.locationStatus} ${getLocationStatusClass(locationAnalysis.status)}`}
            >
              {locationAnalysis.statusLabel}
            </span>
          </div>

          <div
            className={
              styles.locationGrid
            }
          >
            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                GPS Coordinates
              </span>
              <strong>
                {locationAnalysis.coordinatesLabel}
              </strong>
            </div>

            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                Document-Stated Location
              </span>
              <strong>
                {locationAnalysis.documentLocation}
              </strong>
            </div>

            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                Detected / Reported Location
              </span>
              <strong>
                {locationAnalysis.detectedLocation}
              </strong>
            </div>

            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                Location Confidence
              </span>
              <strong>
                {locationAnalysis.confidence !== null
                  ? `${locationAnalysis.confidence}%`
                  : "Not available"}
              </strong>
            </div>

            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                Location Source
              </span>
              <strong>
                {locationAnalysis.source}
              </strong>
            </div>

            <div
              className={
                styles.locationMetric
              }
            >
              <span>
                Distance Analysis
              </span>
              <strong>
                {locationAnalysis.distanceMeters !== null
                  ? `${locationAnalysis.distanceMeters.toLocaleString("en-NG")} m`
                  : "Not available"}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.locationMessage
            }
          >
            <div
              className={
                styles.locationMessageIcon
              }
              aria-hidden="true"
            >
              {locationAnalysis.status === "mismatch"
                ? "!"
                : locationAnalysis.status === "consistent"
                  ? "✓"
                  : "i"}
            </div>

            <div>
              <strong>
                {locationAnalysis.statusLabel}
              </strong>
              <p>
                {locationAnalysis.message}
              </p>
            </div>
          </div>

          {locationAnalysis.latitude !== null &&
            locationAnalysis.longitude !== null && (
              <div
                className={
                  styles.locationActions
                }
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationAnalysis.latitude},${locationAnalysis.longitude}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    styles.locationMapLink
                  }
                >
                  Open Location in Maps
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            )}

          <div
            className={
              styles.locationDisclaimer
            }
          >
            GPS is an additional geographic verification signal. It can help identify inconsistencies between the reported property location and the submitted documents, but it does not by itself establish document authenticity, ownership, or government issuance.
          </div>
        </section>

        {/* =====================================================
            TABS
        ====================================================== */}

        <nav
          className={
            styles.tabs
          }
        >
          <button
            type="button"
            className={
              activeTab ===
              "documents"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setActiveTab(
                "documents",
              )
            }
          >
            <span>▣</span>
            Document Results (
            {documents.length})
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "checks"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setActiveTab(
                "checks",
              )
            }
          >
            <span>♡</span>
            Verification Checks
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "property"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setActiveTab(
                "property",
              )
            }
          >
            <span>⌖</span>
            Property Details
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "summary"
                ? styles.activeTab
                : ""
            }
            onClick={() =>
              setActiveTab(
                "summary",
              )
            }
          >
            <span>▤</span>
            Analysis Summary
          </button>
        </nav>

        {/* =====================================================
            DOCUMENT RESULTS
        ====================================================== */}

        {activeTab ===
          "documents" && (
          <>
            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <h2>
                    <span>▣</span>
                    Submitted Documents
                  </h2>

                  <p>
                    All documents in
                    your package have
                    received an AI
                    document assessment.
                    Select a document
                    to view its
                    individual result.
                  </p>
                </div>

                <div
                  className={
                    styles.packageProgress
                  }
                >
                  <div
                    className={
                      styles.progressIcon
                    }
                  >
                    ✓
                  </div>

                  <div>
                    <strong>
                      {documents.length}{" "}
                      of{" "}
                      {
                        documents.length
                      }{" "}
                      documents
                      analyzed
                    </strong>

                    <div
                      className={
                        styles.progressTrack
                      }
                    >
                      <span
                        style={{
                          width:
                            documents.length >
                            0
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>

                    <small>
                      100%
                    </small>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.tableWrap
                }
              >
                <table
                  className={
                    styles.documentTable
                  }
                >
                  <thead>
                    <tr>
                      <th>#</th>

                      <th>
                        Document Type
                      </th>

                      <th>
                        Document Reference
                      </th>

                      <th>
                        AI Confidence
                      </th>

                      <th>
                        Result
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map(
                      (
                        document,
                      ) => (
                        <tr
                          key={`${document.index}-${document.path}`}
                        >
                          <td>
                            {
                              document.index
                            }
                          </td>

                          <td>
                            <div
                              className={
                                styles.documentTypeCell
                              }
                            >
                              <span
                                className={
                                  styles.fileIcon
                                }
                              >
                                ▣
                              </span>

                              <strong>
                                {
                                  document.type
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                styles.documentReference
                              }
                            >
                              {
                                document.reference
                              }
                            </span>
                          </td>

                          <td>
                            {document.confidence !==
                            null
                              ? `${document.confidence}%`
                              : "—"}
                          </td>

                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                document.result ===
                                "Reviewed"
                                  ? styles.statusReviewed
                                  : styles.statusAttention
                              }`}
                            >
                              {
                                document.result ===
                                "Reviewed"
                                  ? "AI Assessed"
                                  : document.result
                              }
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={
                                styles.viewButton
                              }
                              onClick={() =>
                                openDocument(
                                  document,
                                )
                              }
                            >
                              View Details
                              <span>
                                →
                              </span>
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {documents.length ===
                0 && (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  No analyzed documents
                  are available.
                </div>
              )}
            </section>

            <section
              className={
                styles.twoColumnGrid
              }
            >
              <div
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.cardTitle
                  }
                >
                  <span>▣</span>

                  <div>
                    <h2>
                      Verification
                      Checks
                      <small>
                        {" "}
                        (Essential)
                      </small>
                    </h2>

                    <p>
                      Results are based
                      on AI analysis of
                      your submitted
                      document package.
                      They do not independently
                      authenticate ownership
                      or issuance.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.checkList
                  }
                >
                  {(
                    Object.keys(
                      packageChecks,
                    ) as Array<
                      keyof VerificationChecks
                    >
                  ).map(
                    (key) => {
                      const value =
                        packageChecks[
                          key
                        ];

                      return (
                        <div
                          className={
                            styles.checkRow
                          }
                          key={key}
                        >
                          <div
                            className={`${styles.checkStatus} ${
                              value ===
                              true
                                ? styles.checkPassed
                                : value ===
                                    false
                                  ? styles.checkFailed
                                  : styles.checkReview
                            }`}
                          >
                            {value ===
                            true
                              ? "✓"
                              : value ===
                                  false
                                ? "!"
                                : "i"}
                          </div>

                          <div
                            className={
                              styles.checkText
                            }
                          >
                            <strong>
                              {getCheckLabel(
                                key,
                              )}
                            </strong>

                            <p>
                              {getCheckDescription(
                                key,
                                value,
                              )}
                            </p>
                          </div>

                          <span
                            className={`${styles.checkBadge} ${
                              value ===
                              true
                                ? styles.checkBadgePassed
                                : value ===
                                    false
                                  ? styles.checkBadgeFailed
                                  : styles.checkBadgeReview
                            }`}
                          >
                            {value ===
                            true
                              ? "No Issue Detected"
                              : value ===
                                  false
                                ? "Attention"
                                : "Not Conclusive"}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.cardTitle
                  }
                >
                  <span>▤</span>

                  <div>
                    <h2>
                      Key Findings
                    </h2>

                    <p>
                      Summary of the Analysis
                      assessment across
                      the submitted
                      package.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.findingsBox
                  }
                >
                  <div
                    className={
                      styles.findingItem
                    }
                  >
                    <span>✓</span>

                    <p>
                      All{" "}
                      {
                        documents.length
                      }{" "}
                      submitted document
                      {documents.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      were analyzed.
                    </p>
                  </div>

                  {documents.length >
                    0 && (
                    <div
                      className={
                        styles.findingItem
                      }
                    >
                      <span>i</span>

                      <p>
                        The submitted documents received an AI document assessment. A clean AI assessment does not independently authenticate a document.
                      </p>
                    </div>
                  )}

                  {reviewedDocuments >
                    0 && (
                    <div
                      className={
                        styles.findingItem
                      }
                    >
                      <span>i</span>

                      <p>
                        {
                          reviewedDocuments
                        }{" "}
                        document
                        {reviewedDocuments ===
                        1
                          ? ""
                          : "s"}{" "}
                        require additional
                        review.
                      </p>
                    </div>
                  )}

                  {attentionDocuments >
                    0 && (
                    <div
                      className={
                        styles.findingItemDanger
                      }
                    >
                      <span>!</span>

                      <p>
                        {
                          attentionDocuments
                        }{" "}
                        document
                        {attentionDocuments ===
                        1
                          ? ""
                          : "s"}{" "}
                        contain findings
                        requiring
                        attention.
                      </p>
                    </div>
                  )}

                  {packageChecks
                    .dataConsistency ===
                    true && (
                    <div
                      className={
                        styles.findingItem
                      }
                    >
                      <span>✓</span>

                      <p>
                        Key property
                        information appears
                        consistent across
                        the submitted
                        documents.
                      </p>
                    </div>
                  )}

                  {packageChecks
                    .noForgery ===
                    true && (
                    <div
                      className={
                        styles.findingItem
                      }
                    >
                      <span>✓</span>

                      <p>
                        No obvious signs of
                        manipulation were
                        detected by the
                        AI assessment.
                      </p>
                    </div>
                  )}

                  <div
                    className={
                      styles.findingSummary
                    }
                  >
                    {overallSummary}
                  </div>
                </div>
              </div>
            </section>

            <section
              className={
                styles.limitationCard
              }
            >
              <div
                className={
                  styles.limitationIcon
                }
              >
                i
              </div>

              <div>
                <h2>
                  Important Limitations
                  (Essential Plan)
                </h2>

                <p>
                  <strong>Authenticity Status:</strong>{" "}
                  Not Independently Verified. This Essential result is an AI document assessment and is not a government or legal authenticity confirmation.
                </p>

                <ul>
                  <li>
                    This is a visual
                    and content-based
                    AI analysis only.
                  </li>

                  <li>
                    No government
                    registry
                    verification is
                    performed.
                  </li>

                  <li>
                    No independent
                    ownership search
                    is provided.
                  </li>

                  <li>
                    No physical
                    property
                    inspection or
                    site visit is
                    conducted.
                  </li>

                  <li>
                    No litigation or
                    encumbrance search
                    is performed.
                  </li>

                  <li>
                    For comprehensive
                    due diligence,
                    consider the
                    Professional or
                    Premium plans.
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}

        {/* =====================================================
            CHECKS TAB
        ====================================================== */}

        {activeTab ===
          "checks" && (
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardTitle
              }
            >
              <span>▣</span>

              <div>
                <h2>
                  Verification Checks
                </h2>

                <p>
                  Package-level AI
                  verification results.
                </p>
              </div>
            </div>

            <div
              className={
                styles.checkList
              }
            >
              {(
                Object.keys(
                  packageChecks,
                ) as Array<
                  keyof VerificationChecks
                >
              ).map(
                (key) => {
                  const value =
                    packageChecks[
                      key
                    ];

                  return (
                    <div
                      className={
                        styles.checkRow
                      }
                      key={key}
                    >
                      <div
                        className={`${styles.checkStatus} ${
                          value === true
                            ? styles.checkPassed
                            : value ===
                                false
                              ? styles.checkFailed
                              : styles.checkReview
                        }`}
                      >
                        {value ===
                        true
                          ? "✓"
                          : value ===
                              false
                            ? "!"
                            : "i"}
                      </div>

                      <div
                        className={
                          styles.checkText
                        }
                      >
                        <strong>
                          {getCheckLabel(
                            key,
                          )}
                        </strong>

                        <p>
                          {getCheckDescription(
                            key,
                            value,
                          )}
                        </p>
                      </div>

                      <span
                        className={`${styles.checkBadge} ${
                          value === true
                            ? styles.checkBadgePassed
                            : value ===
                                false
                              ? styles.checkBadgeFailed
                              : styles.checkBadgeReview
                        }`}
                      >
                        {value ===
                        true
                          ? "No Issue Detected"
                          : value ===
                              false
                            ? "Attention"
                            : "Not Conclusive"}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            PROPERTY TAB
        ====================================================== */}

        {activeTab ===
          "property" && (
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardTitle
              }
            >
              <span>⌖</span>

              <div>
                <h2>
                  Property Details
                </h2>

                <p>
                  Property information
                  extracted from the
                  submitted documents.
                </p>
              </div>
            </div>

            <div
              className={
                styles.propertyNotice
              }
            >
              Property-level details
              will be displayed here
              when the AI extracts
              matching property
              information from the
              submitted document
              package.
            </div>

            <div
              className={
                styles.propertyGrid
              }
            >
              <div>
                <span>
                  Primary Document
                </span>

                <strong>
                  {documents[0]
                    ?.type ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Documents Submitted
                </span>

                <strong>
                  {documents.length}
                </strong>
              </div>

              <div>
                <span>
                  Package Status
                </span>

                <strong>
                  {packageStatus}
                </strong>
              </div>

              <div>
                <span>
                  Verification Plan
                </span>

                <strong>
                  Essential
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            SUMMARY TAB
        ====================================================== */}

        {activeTab ===
          "summary" && (
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardTitle
              }
            >
              <span>▤</span>

              <div>
                <h2>
                  Analysis Summary
                </h2>

                <p>
                  Overall AI assessment
                  of the submitted
                  property document
                  package.
                </p>
              </div>
            </div>

            <div
              className={
                styles.summaryContent
              }
            >
              <div
                className={
                  styles.summaryAssessment
                }
              >
                <span>
                  Overall Assessment
                </span>

                <p>
                  {overallAssessment}
                </p>
              </div>

              <div
                className={
                  styles.recommendationBox
                }
              >
                <div
                  className={
                    styles.recommendationIcon
                  }
                >
                  ✓
                </div>

                <div>
                  <span>
                    {recommendationTitle}
                  </span>

                  <p>
                    {recommendation}
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.summaryStats
                }
              >
                <div>
                  <strong>
                    {
                      documents.length
                    }
                  </strong>

                  <span>
                    Documents
                    analyzed
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      assessedDocuments
                    }
                  </strong>

                  <span>
                    AI-assessed documents
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      reviewedDocuments
                    }
                  </strong>

                  <span>
                    Documents requiring review
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      attentionDocuments
                    }
                  </strong>

                  <span>
                    Documents requiring
                    attention
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <section
          className={
            styles.actions
          }
        >
          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={
              goToDashboard
            }
          >
            ← Back to Dashboard
          </button>

          <div
            className={
              styles.actionRight
            }
          >
            <button
              type="button"
              className={
                styles.outlineButton
              }
              onClick={
                downloadReport
              }
            >
              ↓ Download Full Report
            </button>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                verifyAnotherProperty
              }
            >
              + Verify Another Property
            </button>
          </div>
        </section>

        {/* =====================================================
            DOCUMENT DETAILS MODAL
        ====================================================== */}

        {selectedDocument && (
          <div
            className={
              styles.modalBackdrop
            }
            onClick={
              closeDocument
            }
          >
            <div
              className={
                styles.modal
              }
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div
                className={
                  styles.modalHeader
                }
              >
                <div>
                  <span>
                    Document Details
                  </span>

                  <h2>
                    {
                      selectedDocument.type
                    }
                  </h2>

                  <small
                    className={
                      styles.modalReference
                    }
                  >
                    {
                      selectedDocument.reference
                    }
                  </small>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDocument
                  }
                  className={
                    styles.modalClose
                  }
                  aria-label="Close document details"
                >
                  ×
                </button>
              </div>

              <div
                className={
                  styles.modalBody
                }
              >
                <div
                  className={
                    styles.documentPreviewColumn
                  }
                >
                  <div
                    className={
                      styles.documentPreview
                    }
                  >
                    {previewLoading ? (
                      <div
                        className={
                          styles.previewLoading
                        }
                      >
                        <div
                          className={
                            styles.previewSpinner
                          }
                        />

                        <span>
                          Loading secure
                          document preview...
                        </span>
                      </div>
                    ) : previewError ? (
                      <div
                        className={
                          styles.previewError
                        }
                      >
                        <strong>
                          Document preview
                          unavailable
                        </strong>

                        <span>
                          {previewError}
                        </span>
                      </div>
                    ) : selectedDocumentUrl ? (
                      selectedDocument.type
                        .toLowerCase()
                        .includes(
                          "image",
                        ) ||
                      selectedDocument.path
                        .toLowerCase()
                        .match(
                          /\.(jpg|jpeg|png|webp)(\?|$)/i,
                        ) ? (
                        <img
                          src={
                            selectedDocumentUrl
                          }
                          alt={
                            selectedDocument.type
                          }
                        />
                      ) : (
                        <iframe
                          src={
                            selectedDocumentUrl
                          }
                          title={
                            selectedDocument.type
                          }
                        />
                      )
                    ) : (
                      <div>
                        Document preview
                        unavailable.
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      styles.documentNavigation
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.documentNavButton
                      }
                      onClick={
                        showPreviousDocument
                      }
                      disabled={
                        selectedDocument.index <=
                        1
                      }
                    >
                      ← Previous
                    </button>

                    <span
                      className={
                        styles.documentCounter
                      }
                    >
                      {
                        selectedDocument.index
                      }{" "}
                      of{" "}
                      {
                        documents.length
                      }
                    </span>

                    <button
                      type="button"
                      className={
                        styles.documentNavButton
                      }
                      onClick={
                        showNextDocument
                      }
                      disabled={
                        selectedDocument.index >=
                        documents.length
                      }
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div
                  className={
                    styles.modalDetails
                  }
                >
                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Document Type
                    </span>

                    <strong>
                      {
                        selectedDocument.type
                      }
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Document Reference
                    </span>

                    <strong>
                      {
                        selectedDocument.reference
                      }
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      AI Confidence
                    </span>

                    <strong>
                      {selectedDocument.confidence !==
                      null
                        ? `${selectedDocument.confidence}%`
                        : "—"}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Result
                    </span>

                    <strong
                      className={
                        selectedDocument.result ===
                        "Attention"
                          ? styles.detailAttention
                          : styles.detailReviewed
                      }
                    >
                      {
                        selectedDocument.result
                      }
                    </strong>
                  </div>

                  {/* =================================================
                      INDIVIDUAL DOCUMENT ANALYSIS SUMMARY

                      IMPORTANT:
                      This displays selectedDocument.summary.

                      It does NOT display overallSummary.

                      Therefore:
                      Document 1 → Document 1 summary
                      Document 2 → Document 2 summary
                      Document 3 → Document 3 summary
                  ================================================== */}

                  <div
                    className={
                      styles.detailSummary
                    }
                  >
                    <span>
                      Analysis Summary
                    </span>

                    <p>
                      {
                        selectedDocument.summary
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.modalChecks
                }
              >
                <h3>
                  Document Checks
                </h3>

                {(
                  Object.keys(
                    selectedDocument.checks,
                  ) as Array<
                    keyof VerificationChecks
                  >
                ).map(
                  (key) => {
                    const value =
                      selectedDocument
                        .checks[
                        key
                      ];

                    return (
                      <div
                        className={
                          styles.modalCheckRow
                        }
                        key={key}
                      >
                        <span>
                          {
                            getCheckLabel(
                              key,
                            )
                          }
                        </span>

                        <strong
                          className={
                            value ===
                            true
                              ? styles.modalPass
                              : value ===
                                  false
                                ? styles.modalFail
                                : styles.modalReview
                          }
                        >
                          {value ===
                          true
                            ? "No Issue Detected"
                            : value ===
                                false
                              ? "Attention"
                              : "Not Conclusive"}
                        </strong>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}