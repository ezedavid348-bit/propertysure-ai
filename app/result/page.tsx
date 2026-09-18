"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";
import styles from "../professional-report/professional-report.module.css";

type CheckValue = boolean | null;
type RiskLevel = "Low" | "Medium" | "High" | "Not Conclusive";
type LocationStatus = "consistent" | "mismatch" | "inconclusive";
type DetailRow = [label: string, value: unknown];

type VerificationChecks = {
  documentStructure: CheckValue;
  dataConsistency: CheckValue;
  signatureValid: CheckValue;
  stampValid: CheckValue;
  noForgery: CheckValue;
  noDuplicate: CheckValue;
  documentCompleteness: CheckValue;
};

type PackageDocument = {
  name?: string;
  path?: string;
  type?: string;
  document_type?: string;
  documentType?: string;
  document_title?: string;
  documentTitleDetected?: string;
  reference?: string;
  document_reference?: string;
  confidence?: number | null;
  ai_confidence?: number | null;
  status?: string;
  result?: string;
  summary?: string;
  findings?: Record<string, unknown>;
};

type VerificationRecord = {
  id: number | string;
  user_id?: string;
  doc_name?: string | null;
  file_url?: string | null;
  doc_type?: string | null;
  status?: string | null;
  trust_score?: number | null;
  confidence?: number | null;
  risk?: string | null;
  findings?: Record<string, unknown> | null;
};

type PaymentRecord = {
  plan?: string | null;
  status?: string | null;
  amount?: number | null;
  paid_at?: string | null;
};

const STORAGE_BUCKET = "property-documents";

const EMPTY_CHECKS: VerificationChecks = {
  documentStructure: null,
  dataConsistency: null,
  signatureValid: null,
  stampValid: null,
  noForgery: null,
  noDuplicate: null,
  documentCompleteness: null,
};

const CHECK_LABELS: Record<keyof VerificationChecks, string> = {
  documentStructure: "Document Structure",
  dataConsistency: "Data Consistency",
  signatureValid: "Signature Valid (Visual)",
  stampValid: "Stamp Valid (Visual)",
  noForgery: "Forgery Indicators",
  noDuplicate: "Duplicate Detection",
  documentCompleteness: "Document Completeness",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(...values: unknown[]): unknown {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function stringValue(...values: unknown[]): string {
  const value = firstValue(...values);
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value);
}

function numberValue(...values: unknown[]): number | null {
  const value = firstValue(...values);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clampScore(value: number | null): number | null {
  if (value === null) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function getNested(record: Record<string, unknown>, ...keys: string[]): unknown {
  let current: unknown = record;
  for (const key of keys) current = asRecord(current)[key];
  return current;
}

function normalizeRisk(value: unknown): RiskLevel {
  const normalized = stringValue(value).toLowerCase();
  if (normalized.includes("high")) return "High";
  if (normalized.includes("medium") || normalized.includes("moderate")) return "Medium";
  if (normalized.includes("low")) return "Low";
  return "Not Conclusive";
}

function riskClass(risk: RiskLevel): string {
  if (risk === "Low") return styles.riskLow;
  if (risk === "Medium") return styles.riskMedium;
  if (risk === "High") return styles.riskHigh;
  return styles.riskUnknown;
}

function getPackageDocuments(
  findings: Record<string, unknown>,
  verification: VerificationRecord,
): PackageDocument[] {
  const candidate = firstValue(
    findings.document_package,
    findings.documents,
    getNested(findings, "essential", "documents"),
    getNested(findings, "essential", "document_results"),
  );

  if (Array.isArray(candidate)) {
    return candidate.filter(
      (item): item is PackageDocument => !!item && typeof item === "object",
    );
  }

  if (verification.file_url) {
    return [
      {
        name: verification.doc_name || "Property Document",
        path: verification.file_url,
        type: verification.doc_type || "Document",
        document_type: verification.doc_type || "Document",
      },
    ];
  }

  return [];
}

function getDocumentType(document: PackageDocument): string {
  return stringValue(
    document.document_type,
    document.documentType,
    document.document_title,
    document.documentTitleDetected,
    document.type,
    document.name,
  ) || "Property Document";
}

function getDocumentReference(document: PackageDocument, index: number, id: number | string): string {
  return stringValue(
    document.document_reference,
    document.reference,
  ) || `PSAI-${String(id)}-DOC-${String(index + 1).padStart(2, "0")}`;
}

function normalizeChecks(value: unknown): VerificationChecks {
  const record = asRecord(value);
  const get = (...keys: string[]): CheckValue => {
    const raw = firstValue(...keys.map((key) => record[key]));
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (["true", "passed", "pass", "yes", "valid", "clear", "detected: false"].includes(normalized)) return true;
      if (["false", "failed", "fail", "no", "invalid", "attention", "flagged"].includes(normalized)) return false;
    }
    return null;
  };

  return {
    documentStructure: get("documentStructure", "document_structure", "structure"),
    dataConsistency: get("dataConsistency", "data_consistency", "consistency"),
    signatureValid: get("signatureValid", "signature_valid", "signature"),
    stampValid: get("stampValid", "stamp_valid", "stamp", "seal_valid"),
    noForgery: get("noForgery", "no_forgery", "forgery", "manipulation"),
    noDuplicate: get("noDuplicate", "no_duplicate", "duplicate"),
    documentCompleteness: get("documentCompleteness", "document_completeness", "completeness"),
  };
}

function getEssentialChecks(findings: Record<string, unknown>): VerificationChecks {
  return normalizeChecks(
    firstValue(
      getNested(findings, "essential", "checks"),
      getNested(findings, "essential", "verification_checks"),
      findings.checks,
    ),
  );
}

function getDocumentChecks(document: PackageDocument): VerificationChecks {
  return normalizeChecks(
    firstValue(
      document.findings,
      getNested(document.findings || {}, "checks"),
      getNested(document.findings || {}, "verification_checks"),
    ),
  );
}

function checkLabel(key: keyof VerificationChecks): string {
  return CHECK_LABELS[key];
}

function checkDescription(key: keyof VerificationChecks, value: CheckValue): string {
  if (value === false) {
    const descriptions: Record<keyof VerificationChecks, string> = {
      documentStructure: "The document structure contains items requiring attention.",
      dataConsistency: "Some information appears inconsistent within the submitted package.",
      signatureValid: "Signature indicators require further review.",
      stampValid: "Stamp or seal indicators require further review.",
      noForgery: "Potential manipulation or alteration indicators were detected.",
      noDuplicate: "A possible duplicate or repeated document was detected.",
      documentCompleteness: "The submitted package may be missing supporting information.",
    };
    return descriptions[key];
  }
  if (value === null) return "This check could not be conclusively assessed from the available information.";
  const descriptions: Record<keyof VerificationChecks, string> = {
    documentStructure: "Document structure and expected formatting were assessed.",
    dataConsistency: "Key information was assessed for consistency across the available package.",
    signatureValid: "Visible signature indicators were assessed as part of the document review.",
    stampValid: "Visible stamps or seals were assessed as part of the document review.",
    noForgery: "No obvious manipulation indicators were identified in the available assessment.",
    noDuplicate: "No suspiciously repeated documents were identified in the available assessment.",
    documentCompleteness: "The available document package was assessed for expected supporting information.",
  };
  return descriptions[key];
}

function normalizeReportStatus(value: unknown): "Pending" | "Verified" | "Flagged" {
  const normalized = stringValue(value).toLowerCase();
  if (normalized === "verified") return "Verified";
  if (normalized === "flagged") return "Flagged";
  return "Pending";
}

function getAssessment(findings: Record<string, unknown>, verification: VerificationRecord): string {
  const explicit = stringValue(
    getNested(findings, "essential", "assessment", "status"),
    getNested(findings, "essential", "status"),
    findings.assessment_status,
    findings.overall_status,
  ).toLowerCase();

  if (explicit.includes("high risk")) return "High Risk";
  if (explicit.includes("attention")) return "Attention Required";
  if (explicit.includes("partially")) return "Partially Verified";
  if (explicit.includes("verified")) return "Verified";
  if (explicit.includes("review")) return "Reviewed";

  const risk = normalizeRisk(firstValue(
    getNested(findings, "essential", "risk"),
    findings.risk,
    verification.risk,
  ));
  if (risk === "High") return "High Risk";
  if (risk === "Medium") return "Attention Required";
  return normalizeReportStatus(verification.status) === "Verified" ? "Verified" : "Pending";
}

function getRecommendation(findings: Record<string, unknown>, assessment: string): string {
  const explicit = stringValue(
    getNested(findings, "essential", "recommendation", "status"),
    getNested(findings, "essential", "recommendation", "text"),
    getNested(findings, "essential", "recommendation"),
    findings.recommendation,
  );
  if (explicit) return explicit;
  if (assessment === "Verified") return "Proceed With Further Due Diligence";
  if (assessment === "High Risk") return "Do Not Proceed Until Resolved";
  if (assessment === "Attention Required" || assessment === "Partially Verified") return "Proceed With Caution";
  return "Further Verification Required";
}

function getLocation(findings: Record<string, unknown>) {
  const raw = asRecord(firstValue(
    findings.location,
    findings.gps,
    findings.location_analysis,
    getNested(findings, "essential", "location"),
    getNested(findings, "essential", "gps"),
  ));

  const coordinates = asRecord(raw.coordinates);
  const latitude = numberValue(raw.latitude, raw.lat, raw.gps_latitude, coordinates.latitude, coordinates.lat);
  const longitude = numberValue(raw.longitude, raw.lng, raw.lon, raw.gps_longitude, coordinates.longitude, coordinates.lng, coordinates.lon);

  const documentLocation = stringValue(
    raw.document_location,
    raw.documentLocation,
    raw.stated_location,
    raw.property_location_from_document,
    findings.property_location,
  );
  const detectedLocation = stringValue(
    raw.detected_location,
    raw.detectedLocation,
    raw.resolved_location,
    raw.address,
    raw.reported_location,
  );
  const confidence = clampScore(numberValue(raw.confidence, raw.location_confidence, raw.gps_confidence));
  const distance = numberValue(raw.distance_meters, raw.distanceMeters, raw.distance, findings.location_distance);
  const source = stringValue(raw.source, raw.gps_source, raw.location_source) || (latitude !== null && longitude !== null ? "Recorded GPS coordinates" : "No property GPS data recorded");
  const discrepancy = stringValue(raw.discrepancy, raw.location_discrepancy, raw.finding, raw.notes);
  const rawStatus = stringValue(raw.status, raw.location_status, raw.verification_status, raw.consistency).toLowerCase();

  let status: LocationStatus = "inconclusive";
  if (rawStatus.includes("mismatch") || rawStatus.includes("inconsistent") || rawStatus.includes("discrep")) status = "mismatch";
  else if (rawStatus.includes("consistent") || rawStatus === "match" || rawStatus === "matched" || rawStatus === "verified") status = "consistent";

  return {
    status,
    statusLabel: status === "consistent" ? "Location Consistent" : status === "mismatch" ? "Location Mismatch" : "Location Not Conclusive",
    latitude,
    longitude,
    coordinatesLabel: latitude !== null && longitude !== null
      ? `${Math.abs(latitude).toFixed(6)}° ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(6)}° ${longitude >= 0 ? "E" : "W"}`
      : "Not available",
    documentLocation: documentLocation || "Not available",
    detectedLocation: detectedLocation || "Not available",
    confidence,
    distance,
    source,
    message: status === "consistent"
      ? "The available geographic information is consistent with the property location stated in the submitted documents."
      : status === "mismatch"
        ? discrepancy || "A geographic discrepancy was identified between the available location information and the submitted property documents."
        : stringValue(raw.message, raw.summary, raw.analysis) || "The available location information is not sufficient to establish geographic consistency.",
  };
}

function getMapUrl(latitude: number, longitude: number): string {
  const delta = 0.015;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function getMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function getStorageObjectPath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const marker = `/${STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    const objectPath = url.pathname.substring(index + marker.length);
    return objectPath ? decodeURIComponent(objectPath) : null;
  } catch {
    return null;
  }
}

type DetailPresentation = {
  value: string;
  state: "available" | "attention" | "inconclusive";
};

function getDetailPresentation(value: unknown): DetailPresentation {
  const text = stringValue(value);

  if (!text) {
    return {
      value: "Not Conclusive",
      state: "inconclusive",
    };
  }

  const normalized = text.toLowerCase();

  if (
    normalized.includes("mismatch") ||
    normalized.includes("inconsisten") ||
    normalized.includes("conflict") ||
    normalized.includes("discrep") ||
    normalized.includes("attention required") ||
    normalized.includes("requires further review")
  ) {
    return {
      value: text,
      state: "attention",
    };
  }

  if (
    normalized === "not conclusive" ||
    normalized === "not conclusive." ||
    normalized === "not available" ||
    normalized === "unknown"
  ) {
    return {
      value: text,
      state: "inconclusive",
    };
  }

  return {
    value: text,
    state: "available",
  };
}

function detailRows(rows: DetailRow[], options?: { premium?: boolean }) {
  return rows.map(([label, rawValue]) => {
    const detail = getDetailPresentation(rawValue);
    const stateLabel =
      detail.state === "attention"
        ? "Attention"
        : detail.state === "available"
          ? "Available"
          : "Not Conclusive";

    return (
      <div
        className={styles.propertyGridItem}
        key={label}
        style={
          options?.premium
            ? {
                position: "relative",
                minHeight: 104,
                padding: "18px 18px 16px",
                border: "1px solid #e5ebf3",
                borderRadius: 14,
                background:
                  detail.state === "attention"
                    ? "linear-gradient(135deg, #fffaf2 0%, #ffffff 72%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
                boxShadow:
                  detail.state === "attention"
                    ? "0 8px 24px rgba(180, 120, 20, 0.08)"
                    : "0 8px 24px rgba(24, 53, 88, 0.06)",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {options?.premium ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                detail.state === "attention"
                  ? "#d99520"
                  : detail.state === "available"
                    ? "#1268f3"
                    : "#c9d3df",
            }}
          />
        ) : null}

        <div
          style={
            options?.premium
              ? {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 10,
                }
              : undefined
          }
        >
          <span
            style={
              options?.premium
                ? {
                    margin: 0,
                    color: "#73849a",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }
                : undefined
            }
          >
            {label}
          </span>

          {options?.premium ? (
            <span
              style={{
                flexShrink: 0,
                padding: "4px 8px",
                borderRadius: 999,
                background:
                  detail.state === "attention"
                    ? "#fff1d6"
                    : detail.state === "available"
                      ? "#eaf3ff"
                      : "#f0f3f6",
                color:
                  detail.state === "attention"
                    ? "#9a6200"
                    : detail.state === "available"
                      ? "#1557a6"
                      : "#718096",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {stateLabel}
            </span>
          ) : null}
        </div>

        <strong
          style={
            options?.premium
              ? {
                  display: "block",
                  color:
                    detail.state === "attention"
                      ? "#8b5a00"
                      : detail.state === "inconclusive"
                        ? "#68788d"
                        : "#16385f",
                  fontSize: 13,
                  lineHeight: 1.55,
                  fontWeight: 750,
                }
              : undefined
          }
        >
          {detail.value}
        </strong>

        {options?.premium && detail.state === "inconclusive" ? (
          <small
            style={{
              display: "block",
              marginTop: 8,
              color: "#8a98a9",
              fontSize: 9,
              lineHeight: 1.45,
            }}
          >
            The available evidence does not support a definitive conclusion.
          </small>
        ) : null}
      </div>
    );
  });
}


function simplifyFinding(value: string): string {
  const text = value.trim();
  if (!text) return "";

  const replacements: Array<[RegExp, string]> = [
    [/material\s+surname\s+mismatch\s+between\s+holder\s+(.+?)\s+and\s+registered\s+owner\s+(.+?)(?:\.|$)/i, "The name on the document does not match the registered owner name."],
    [/resolve\s+the\s+(.+?)\s+(?:versus|vs\.?|and)\s+(.+?)\s+ownership[- ]name\s+conflict\.?/i, "The ownership names do not match and need to be confirmed."],
    [/reconcile\s+(.+?)\s+with\s+(.+?)\s+parcel[- ]reference\s+conflict\.?/i, "The property/plot references do not match and need to be confirmed."],
    [/property\s+description\s+states\s+(.+?),\s*while\s+plot\s+reference\s+(.+?)\s+may\s+identify\s+(.+?)(?:\.|$)/i, "The property description and plot reference may refer to different plots."],
    [/printed\s+coordinates\s+appear\s+geographically\s+inconsistent\s+with\s+the\s+stated\s+(.+?)(?:\.|$)/i, "The printed coordinates do not appear to match the stated property location."],
    [/the\s+referenced\s+schedule\s+and\s+detailed\s+survey\s+plan\s+are\s+absent\.?/i, "The supporting schedule and detailed survey plan are missing."],
    [/obtain\s+and\s+review\s+the\s+complete\s+certificate\s+of\s+occupancy.*$/i, "The complete Certificate of Occupancy and its supporting pages should be provided."],
    [/obtain\s+reliable\s+identity\s+documents.*$/i, "Reliable identity and transaction records should be provided to confirm the parties involved."],
    [/validate\s+the\s+QR\s+code.*$/i, "The original document and QR code should be checked through the official source."],
    [/independently\s+confirm\s+file\s+number.*$/i, "The file number, survey reference, and title details should be independently confirmed."],
    [/obtain\s+an\s+independent\s+title\s+encumbrance\s+search\.?/i, "An independent title search should be completed."],
    [/confirm\s+the\s+correct\s+parcel\s+location\s+and\s+coordinates.*$/i, "The exact property location and coordinates should be confirmed using reliable survey records."],
    [/no\s+additional\s+documents\s+were\s+supplied.*$/i, "More supporting documents are needed to clear the ownership, property, or location differences."],
    [/confirm\s+whether\s+the\s+intended\s+parcel\s+is\s+(.+?)(?:\.|$)/i, "The correct plot/parcel needs to be confirmed."],
    [/obtain\s+independent\s+confirmation\s+of\s+the\s+stated\s+file.*$/i, "The stated title and registration details should be independently confirmed."],
    [/obtain\s+the\s+complete\s+title\s+instrument.*$/i, "The complete title document and referenced attachments should be provided."],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) return replacement;
  }

  return text
    .replace(/^resolve\s+/i, "Confirm ")
    .replace(/^reconcile\s+/i, "Confirm ")
    .replace(/^obtain\s+/i, "Provide ")
    .replace(/^independently\s+confirm\s+/i, "Confirm independently ")
    .replace(/^confirm\s+whether\s+/i, "Confirm whether ")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "") + ".";
}

function getRiskInterpretation(risk: RiskLevel): string {
  if (risk === "High") {
    return "We found important warning signs in the available documents. Some information conflicts or still needs independent confirmation. Do not rely on this document for a purchase, payment, signing, or transfer until the issues are cleared and the required external checks are completed.";
  }
  if (risk === "Medium") {
    return "There are issues that need clarification before you rely on the document. Complete the outstanding checks and confirm the important property and ownership details before moving forward.";
  }
  if (risk === "Low") {
    return "No major warning signs were identified in the available assessment. This does not replace an official title or government search where one is required.";
  }
  return "The available evidence is not enough to give the property a reliable risk conclusion. More information and the outstanding checks are needed before you make a transaction decision.";
}

function getConfidenceExplanation(confidence: number | null): string {
  if (confidence === null) {
    return "The Essential engine did not provide a confidence score. More evidence may be needed for a stronger assessment.";
  }
  if (confidence < 50) {
    return `The ${confidence}% score means the available evidence was not strong enough for the Essential analysis to be highly confident. This is an analysis-confidence measure, not a probability of fraud.`;
  }
  return `The Essential engine has ${confidence}% confidence in the available analysis and evidence. This is an analysis-confidence measure, not a probability that the property is genuine or fraudulent.`;
}

function getEffectiveEssentialStatus(
  verification: VerificationRecord,
  findings: Record<string, unknown>,
  checks: VerificationChecks,
): "Pending" | "Verified" | "Flagged" {
  const storedStatus = normalizeReportStatus(verification.status);

  // A final canonical status always wins.
  if (storedStatus === "Verified" || storedStatus === "Flagged") {
    return storedStatus;
  }

  // Legacy records can still contain status="pending" after the AI engine
  // has already produced its findings. Resolve those records from the actual
  // Essential evidence so the report does not incorrectly remain pending.
  const risk = normalizeRisk(firstValue(
    getNested(findings, "essential", "risk"),
    findings.risk,
    verification.risk,
  ));

  const hasAttention = (Object.keys(checks) as Array<keyof VerificationChecks>)
    .some((key) => checks[key] === false);

  const hasInconclusive = (Object.keys(checks) as Array<keyof VerificationChecks>)
    .some((key) => checks[key] === null);

  if (risk === "High" || hasAttention) return "Flagged";

  if (!hasInconclusive) {
    const hasAnyCheck = (Object.keys(checks) as Array<keyof VerificationChecks>)
      .some((key) => checks[key] !== null);

    if (hasAnyCheck) return "Verified";
  }

  // If no conclusive AI evidence exists yet, remain pending.
  return "Pending";
}

function isEssentialAnalysisComplete(status: "Pending" | "Verified" | "Flagged"): boolean {
  return status === "Verified" || status === "Flagged";
}

function EssentialReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id") || "";

  const [verification, setVerification] = useState<VerificationRecord | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"documents" | "checks" | "property" | "summary">("documents");
  const [selectedDocument, setSelectedDocument] = useState<PackageDocument | null>(null);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(-1);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const previewRequestId = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      if (!verificationId) {
        setError("Verification ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const numericId = Number(verificationId);
        const query = Number.isFinite(numericId)
          ? supabase.from("verifications").select("id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings").eq("id", numericId).maybeSingle()
          : supabase.from("verifications").select("id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings").eq("id", verificationId).maybeSingle();

        const { data, error: verificationError } = await query;
        if (verificationError) throw verificationError;
        if (!data) throw new Error("Verification record could not be found.");

        const { data: paymentData } = await supabase
          .from("payments")
          .select("plan,status,amount,paid_at")
          .eq("verification_id", data.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mounted) {
          setVerification(data as VerificationRecord);
          setPayment((paymentData || null) as PaymentRecord | null);
        }
      } catch (loadError) {
        console.error("PROFESSIONAL REPORT LOAD ERROR:", loadError);
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load the Essential report.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadReport();
    return () => {
      mounted = false;
    };
  }, [verificationId]);

  const findings = useMemo(() => asRecord(verification?.findings), [verification]);
  const documents = useMemo(() => getPackageDocuments(findings, verification || { id: verificationId }), [findings, verification, verificationId]);
  const location = useMemo(() => getLocation(findings), [findings]);

  const trustScore = clampScore(numberValue(
    getNested(findings, "essential", "trust_score"),
    findings.trust_score,
    verification?.trust_score,
  ));
  const confidence = clampScore(numberValue(
    getNested(findings, "essential", "confidence"),
    findings.confidence,
    verification?.confidence,
  ));
  const overallRisk = normalizeRisk(firstValue(
    getNested(findings, "essential", "risk"),
    findings.risk,
    verification?.risk,
  ));
  const assessment = getAssessment(findings, verification || { id: verificationId });
  const recommendation = getRecommendation(findings, assessment);

  const property = asRecord(firstValue(
    findings.property,
    getNested(findings, "essential", "property"),
  ));
  const ownership = asRecord(firstValue(
    findings.ownership,
    getNested(findings, "essential", "ownership"),
    getNested(findings, "essential", "title"),
  ));
  const coreDocumentChecks = useMemo(
    () => getEssentialChecks(findings),
    [findings],
  );

  const crossDocument = asRecord(firstValue(
    findings.cross_document_analysis,
    getNested(findings, "essential", "cross_document_analysis"),
  ));
  const propertyType = stringValue(property.property_type, property.type, findings.property_type) || "Not conclusive";
  const propertyLocation = stringValue(property.location, property.address, findings.property_location, location.detectedLocation) || "Not conclusive";
  const completedAt = stringValue(
    getNested(findings, "essential", "completed_at"),
    getNested(findings, "essential", "completedAt"),
    payment?.paid_at,
  );

  const effectiveEssentialStatus = getEffectiveEssentialStatus(
    verification || { id: verificationId },
    findings,
    coreDocumentChecks,
  );

  const essentialAnalysisComplete = isEssentialAnalysisComplete(
    effectiveEssentialStatus,
  );

  const packageStatus = effectiveEssentialStatus;

  const executiveSummary = stringValue(
    getNested(findings, "essential", "executive_summary"),
    findings.executive_summary,
  ) || "The Essential report will present the consolidated assessment once the AI verification engine has supplied its findings.";

  const recommendationReason = stringValue(
    getNested(findings, "essential", "recommendation", "reason"),
    findings.recommendation_reason,
  ) || "The recommendation is based on the available verification findings and outstanding issues.";

  const recommendationText = stringValue(
    getNested(findings, "essential", "recommendation", "text"),
    findings.recommendation_text,
    getNested(findings, "essential", "recommendation", "reason"),
  ) || "This recommendation is based on the available AI document, property, ownership, location, and risk evidence.";

  const professionalKeyFindingsRaw = firstValue(
    getNested(findings, "essential", "key_findings"),
    findings.key_findings,
    getNested(findings, "essential", "findings"),
  );

  const professionalKeyFindings: string[] = Array.isArray(professionalKeyFindingsRaw)
    ? professionalKeyFindingsRaw
        .map((item) => stringValue(item))
        .filter(Boolean)
    : stringValue(professionalKeyFindingsRaw)
        ? [stringValue(professionalKeyFindingsRaw)]
        : [];

  const outstandingIssues = firstValue(
    getNested(findings, "essential", "outstanding_issues"),
    findings.outstanding_issues,
    findings.issues,
  );

  const issueItems: string[] = Array.isArray(outstandingIssues)
    ? outstandingIssues.map((issue) => stringValue(issue)).filter(Boolean)
    : [];

  const summaryFindings = professionalKeyFindings.length > 0
    ? professionalKeyFindings
    : issueItems;

  const userFriendlyFindings = summaryFindings
    .map(simplifyFinding)
    .filter(Boolean);

  const essentialAnalysisNarrative = packageStatus === "Pending"
    ? `Your Essential verification is still being processed. ${documents.length > 0 ? `${documents.length} document${documents.length === 1 ? " is" : "s are"} already in the verification package. ` : ""}The final Essential assessment will appear when the AI verification engine supplies conclusive findings.`
    : executiveSummary.startsWith("The Essential report will present")
      ? `We reviewed ${documents.length} document${documents.length === 1 ? "" : "s"} in this Essential package. The current result is ${overallRisk.toLowerCase()} risk based on the available AI evidence.`
      : executiveSummary;

  const verificationStatusCounts = useMemo(() => {
    const counts = {
      Verified: 0,
      "Attention Required": 0,
      Pending: 0,
      "Not Conclusive": 0,
    };

    (Object.keys(coreDocumentChecks) as Array<keyof VerificationChecks>).forEach((key) => {
      const value = coreDocumentChecks[key];
      if (value === true) counts.Verified += 1;
      else if (value === false) counts["Attention Required"] += 1;
      else counts["Not Conclusive"] += 1;
    });

    return counts;
  }, [coreDocumentChecks]);

  const confidenceNarrative = getConfidenceExplanation(confidence);
  const riskInterpretation = getRiskInterpretation(overallRisk);
  const userActionMessage = overallRisk === "High"
    ? "Before you pay, sign, transfer money, or rely on this property document, resolve the issues identified in the AI assessment before proceeding."
    : overallRisk === "Medium"
      ? "Before proceeding, clarify the issues identified in the AI assessment before proceeding."
      : overallRisk === "Low"
        ? "The available assessment is encouraging, but complete any required official checks before completing the transaction."
        : "Do not make a final transaction decision yet. More evidence and verification are needed.";

  const crossDocumentRows: DetailRow[] = [
    ["Owner / Applicant Name", firstValue(crossDocument.owner_name, crossDocument.ownerName, ownership.owner_name, ownership.name, findings.owner_name)],
    ["Property Description", firstValue(crossDocument.property_description, property.description, findings.property_description)],
    ["Plot / Block", firstValue(crossDocument.plot_block, crossDocument.plot, property.plot, property.block, findings.plot_number)],
    ["Survey Information", firstValue(crossDocument.survey_reference, property.survey_reference, findings.survey_reference)],
    ["Location", firstValue(crossDocument.location, propertyLocation)],
    ["Land Size", firstValue(crossDocument.land_size, property.land_size, property.area, findings.land_size)],
    ["Title Reference", firstValue(crossDocument.title_reference, ownership.title_reference, findings.title_reference)],
    ["Relevant Dates", firstValue(crossDocument.dates, property.date, findings.relevant_dates)],
  ];

  const ownershipRows: DetailRow[] = [
    ["Named Owner", firstValue(ownership.owner_name, ownership.name, findings.owner_name)],
    ["Title Reference", firstValue(ownership.title_reference, ownership.reference, findings.title_reference)],
    ["Ownership Status", firstValue(ownership.status, findings.ownership_status)],
  ];

  const propertyRows: DetailRow[] = [
    ["Property Type", propertyType],
    ["Location", propertyLocation],
    ["Land Size", firstValue(property.land_size, property.area, findings.land_size)],
    ["Property Description", firstValue(property.description, findings.property_description)],
  ];


  async function openDocument(document: PackageDocument, index: number) {
    const requestId = ++previewRequestId.current;
    setSelectedDocument(document);
    setSelectedDocumentIndex(index);
    setSelectedDocumentUrl("");
    setPreviewError("");
    setPreviewLoading(true);

    try {
      const path = stringValue(document.path);
      const storagePath = path ? getStorageObjectPath(path) : null;
      if (storagePath) {
        const { data, error: signedUrlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(storagePath, 60 * 60);
        if (signedUrlError) throw new Error(signedUrlError.message);
        if (!data?.signedUrl) throw new Error("A secure document preview URL could not be created.");
        if (requestId === previewRequestId.current) setSelectedDocumentUrl(data.signedUrl);
        return;
      }
      if (/^https?:\/\//i.test(path)) {
        if (requestId === previewRequestId.current) setSelectedDocumentUrl(path);
        return;
      }
      throw new Error("The document location could not be resolved.");
    } catch (previewLoadError) {
      console.error("DOCUMENT PREVIEW ERROR:", previewLoadError);
      if (requestId === previewRequestId.current) {
        setPreviewError(previewLoadError instanceof Error ? previewLoadError.message : "Unable to load the document preview.");
      }
    } finally {
      if (requestId === previewRequestId.current) setPreviewLoading(false);
    }
  }

  function closeDocument() {
    ++previewRequestId.current;
    setSelectedDocument(null);
    setSelectedDocumentIndex(-1);
    setSelectedDocumentUrl("");
    setPreviewError("");
    setPreviewLoading(false);
  }

  function downloadReport() {
    window.open(`/api/report?id=${encodeURIComponent(String(verification?.id || verificationId))}`, "_blank");
  }

  function goToTab(tab: "documents" | "checks" | "property" | "summary") {
    setActiveTab(tab);
  }

  if (loading) {
    return (
      <AppShell activePath="/verify" headerPath="/result">
        <div className={styles.loadingPage}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <h2>Loading verification result</h2>
            <p>Retrieving your completed property analysis...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !verification) {
    return (
      <AppShell activePath="/verify" headerPath="/result">
        <div className={styles.errorPage}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>!</div>
            <h2>Unable to load result</h2>
            <p>{error || "The Essential verification result could not be loaded."}</p>
            <button type="button" className={styles.primaryButton} onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/verify" headerPath="/result">
      <main className={styles.resultPage}>
        <section className={styles.hero}>
          <div className={styles.heroWatermark} aria-hidden="true">
            <img
              src="/result-header-verification.png"
              alt=""
            />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.completeBadge}>
              <span>{essentialAnalysisComplete ? "✓" : "i"}</span>
              {essentialAnalysisComplete ? "ESSENTIAL VERIFICATION COMPLETE" : "ESSENTIAL VERIFICATION PENDING"}
            </div>

            <h1>Property Verification Report</h1>

            <p>AI document assessment of your property document package by PropertySure AI.</p>
             <p className={styles.heroSubtext}>Review the findings, AI verification checks, risks, and next steps below.</p>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <span className={styles.metaIcon}>◉</span>
                <div><small>Verification ID</small><strong>#{verification.id}</strong></div>
              </div>
              <div className={styles.heroMetaItem}>
                <span className={styles.metaIcon}>◫</span>
                <div><small>{packageStatus === "Pending" ? "Status" : "Completed"}</small><strong>{packageStatus === "Pending" ? "Pending" : formatDateTime(completedAt)}</strong></div>
              </div>
              <div className={styles.heroMetaItem}>
                <span className={styles.metaIcon}>▣</span>
                <div><small>Plan</small><strong>Essential</strong></div>
              </div>
              <div className={styles.heroMetaItem}>
                <span className={styles.metaIcon}>▱</span>
                <div><small>Documents Analyzed</small><strong>{documents.length} document{documents.length === 1 ? "" : "s"}</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.metricsGrid} aria-label="Result summary">
          <div className={`${styles.metricCard} ${styles.metricGreen}`}>
            <div className={styles.metricIcon}>✓</div>
            <div><span>Trust Score</span><strong>{trustScore ?? "—"}<small>{trustScore !== null ? " / 100" : ""}</small></strong><p>Overall package quality and reliability score.</p></div>
          </div>
          <div className={`${styles.metricCard} ${styles.metricBlue}`}>
            <div className={styles.metricIcon}>▮</div>
            <div><span>Essential AI Confidence</span><strong>{confidence !== null ? confidence : "—"}<small>{confidence !== null ? "%" : ""}</small></strong><p>{confidence !== null ? "Confidence in the available Essential analysis." : "No Essential confidence score was supplied."}</p></div>
          </div>
          <div className={`${styles.metricCard} ${overallRisk === "High" ? styles.metricWarning : styles.metricGreen}`}>
            <div className={styles.metricIcon}>!</div>
            <div><span>Overall Risk</span><strong className={riskClass(overallRisk)}>{overallRisk}</strong><p>Risk assessment across the available verification findings.</p></div>
          </div>
          <div className={`${styles.metricCard} ${packageStatus === "Flagged" ? styles.metricWarning : packageStatus === "Pending" ? styles.metricBlue : styles.metricGreen}`}>
            <div className={styles.metricIcon}>▣</div>
            <div><span>Package Status</span><strong>{packageStatus}</strong><p>{packageStatus === "Pending" ? "Essential analysis is still pending." : `${documents.length} of ${documents.length} submitted document${documents.length === 1 ? "" : "s"} reviewed.`}</p></div>
          </div>
        </section>

        <nav className={styles.tabs} aria-label="Verification result sections">
          <button type="button" className={activeTab === "documents" ? styles.activeTab : ""} onClick={() => goToTab("documents")}><span>▣</span>Document Results</button>
          <button type="button" className={activeTab === "checks" ? styles.activeTab : ""} onClick={() => goToTab("checks")}><span>♡</span>Verification Checks</button>
          <button type="button" className={activeTab === "property" ? styles.activeTab : ""} onClick={() => goToTab("property")}><span>⌖</span>Property Details</button>
          <button type="button" className={activeTab === "summary" ? styles.activeTab : ""} onClick={() => goToTab("summary")}><span>▤</span>Analysis Summary</button>
        </nav>

        <div className={styles.tabPanel} role="region" aria-live="polite">
          {activeTab === "documents" && (
            <div className={styles.tabPanelContent}>
        <section id="professional-documents" className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2><span>▣</span> Documents Reviewed</h2>
              <p>Documents included in the Essential verification package.</p>
            </div>
            <div className={styles.packageProgress}>
              <div className={styles.progressIcon}>{packageStatus === "Pending" ? "i" : "✓"}</div>
              <div><strong>{packageStatus === "Pending" ? `${documents.length} document${documents.length === 1 ? "" : "s"} submitted — Essential analysis pending` : `${documents.length} of ${documents.length} documents reviewed`}</strong><div className={styles.progressTrack}><span style={{ width: packageStatus !== "Pending" && documents.length ? "100%" : "0%" }} /></div><small>{packageStatus !== "Pending" && documents.length ? "100%" : "Pending"}</small></div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.documentTable}>
              <thead><tr><th>#</th><th>Document Type</th><th>Document Reference</th><th>AI Confidence</th><th>Status</th><th>Key Finding</th><th>Actions</th></tr></thead>
              <tbody>
                {documents.map((document, index) => {
                  const confidenceValue = clampScore(numberValue(document.ai_confidence, document.confidence));
                  const status = packageStatus;
                  const finding = stringValue(document.summary, getNested(document.findings || {}, "summary")) || "No AI finding supplied yet.";
                  return (
                    <tr key={`${document.path || document.name || "document"}-${index}`}>
                      <td>{index + 1}</td>
                      <td><div className={styles.documentTypeCell}><span className={styles.fileIcon}>▣</span><strong>{getDocumentType(document)}</strong></div></td>
                      <td><span className={styles.documentReference}>{getDocumentReference(document, index, verification.id)}</span></td>
                      <td>{confidenceValue !== null ? `${confidenceValue}%` : "—"}</td>
                      <td><span className={`${styles.statusBadge} ${status === "Flagged" ? styles.statusAttention : status === "Pending" ? styles.statusReviewed : styles.statusReviewed}`}>{status}</span></td>
                      <td>{finding}</td>
                      <td><button type="button" className={styles.viewButton} onClick={() => void openDocument(document, index)}>View Details <span>→</span></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {documents.length === 0 && <div className={styles.emptyState}>Essential document findings are not available yet.</div>}
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}><span>▣</span><div><h2>Document Findings</h2><p>Individual document-level findings supplied by the Essential AI verification engine.</p></div></div>
          <div className={styles.professionalFindingGrid}>
            {documents.map((document, index) => {
              const checks = getDocumentChecks(document);
              const entries = (Object.keys(checks) as Array<keyof VerificationChecks>).filter((key) => checks[key] !== null);
              return (
                <article className={styles.professionalFindingCard} key={`${document.name || "document"}-${index}`}>
                  <div className={styles.professionalFindingHeading}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{getDocumentType(document)}</strong><small>{getDocumentReference(document, index, verification.id)}</small></div></div>
                  <p>{stringValue(document.summary, getNested(document.findings || {}, "summary"), getNested(document.findings || {}, "assessment")) || "No document-level Essential summary is available yet."}</p>
                  {entries.length > 0 && <div className={styles.professionalCheckMini}>{entries.map((key) => <div key={key}><span>{checkLabel(key)}</span><strong className={checks[key] === false ? styles.detailAttention : checks[key] === true ? styles.detailPassed : styles.detailReviewed}>{checks[key] === true ? "No Issue Detected" : checks[key] === false ? "Attention" : "Not Conclusive"}</strong></div>)}</div>}
                </article>
              );
            })}
            {documents.length === 0 && <div className={styles.emptyState}>No document-level Essential findings are available yet.</div>}
          </div>
        </section>
            </div>
          )}

          {activeTab === "checks" && (
            <div className={styles.tabPanelContent}>
        <section id="professional-checks" className={styles.card}>
          <div className={styles.cardTitle}><span>▣</span><div><h2>Verification Checks</h2><p>Package-level AI checks from the Essential verification workflow.</p></div></div>
          <div className={styles.checkList}>
            {(Object.keys(coreDocumentChecks) as Array<keyof VerificationChecks>).map((key) => {
              const value = coreDocumentChecks[key];
              return <div className={styles.checkRow} key={key}><div className={`${styles.checkStatus} ${value === true ? styles.checkPassed : value === false ? styles.checkFailed : styles.checkReview}`}>{value === true ? "✓" : value === false ? "!" : "i"}</div><div className={styles.checkText}><strong>{checkLabel(key)}</strong><p>{checkDescription(key, value)}</p></div><span className={`${styles.checkBadge} ${value === true ? styles.checkBadgePassed : value === false ? styles.checkBadgeFailed : styles.checkBadgeReview}`}>{value === true ? "No Issue Detected" : value === false ? "Attention" : "Not Conclusive"}</span></div>;
            })}
          </div>
        </section>


            </div>
          )}

          {activeTab === "property" && (
            <div className={styles.tabPanelContent}>
        <section
          className={styles.card}
          style={{
            border: "1px solid #dfe7f1",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(24, 53, 88, 0.07)",
            overflow: "hidden",
          }}
        >
          <div
            className={styles.cardTitle}
            style={{
              marginBottom: 18,
              paddingBottom: 16,
              borderBottom: "1px solid #edf1f6",
            }}
          >
            <span>⇄</span>
            <div>
              <h2>Cross-Document Analysis</h2>
              <p>
                Comparison of key property information across the submitted
                document package. Values shown below come from the available
                document evidence; conflicts are highlighted for attention.
              </p>
            </div>
          </div>

          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              border: "1px solid #e5edf7",
              borderRadius: 12,
              background: "linear-gradient(135deg, #f7faff 0%, #ffffff 100%)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
                borderRadius: 9,
                background: "#eaf3ff",
                color: "#1268f3",
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ⇄
            </span>
            <div>
              <strong
                style={{
                  display: "block",
                  color: "#183558",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Document consistency view
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: 2,
                  color: "#71829b",
                  fontSize: 9,
                  lineHeight: 1.45,
                }}
              >
                This section shows what the submitted documents say about the
                same property and flags information that may need clarification.
              </span>
            </div>
          </div>

          <div
            className={styles.propertyGrid}
            style={{
              gap: 14,
            }}
          >
            {detailRows(crossDocumentRows, { premium: true })}
          </div>
        </section>

        <section
          id="professional-property"
          className={styles.card}
          style={{
            border: "1px solid #dfe7f1",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(24, 53, 88, 0.07)",
            overflow: "hidden",
          }}
        >
          <div
            className={styles.cardTitle}
            style={{
              marginBottom: 18,
              paddingBottom: 16,
              borderBottom: "1px solid #edf1f6",
            }}
          >
            <span>⌖</span>
            <div>
              <h2>Property Details</h2>
              <p>
                A structured profile of the property information extracted
                from the available documents and verification evidence.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(180px, 0.6fr)",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #0f2f57 0%, #164b83 100%)",
                color: "#ffffff",
                boxShadow: "0 10px 26px rgba(15, 47, 87, 0.16)",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: 7,
                  color: "#b9d4f4",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Property profile
              </span>
              <strong
                style={{
                  display: "block",
                  fontSize: 17,
                  lineHeight: 1.35,
                  fontWeight: 800,
                }}
              >
                {propertyType}
              </strong>
              <p
                style={{
                  margin: "7px 0 0",
                  color: "#dbe9f8",
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                Based on the property information currently available to the
                Essential AI review.
              </p>
            </div>

            <div
              style={{
                padding: "16px 18px",
                border: "1px solid #e2e9f2",
                borderRadius: 14,
                background: "#fbfdff",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: 7,
                  color: "#73849a",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Evidence status
              </span>
              <strong
                style={{
                  display: "block",
                  color: essentialAnalysisComplete ? "#176b46" : "#68788d",
                  fontSize: 14,
                  lineHeight: 1.35,
                }}
              >
                {essentialAnalysisComplete ? "Essential Analysis Complete" : "Essential Analysis Pending"}
              </strong>
              <p
                style={{
                  margin: "7px 0 0",
                  color: "#71829b",
                  fontSize: 9,
                  lineHeight: 1.45,
                }}
              >
                {essentialAnalysisComplete
                  ? "The displayed property profile reflects the completed Essential analysis."
                  : "Property information may be visible before all AI checks are completed."}
              </p>
            </div>
          </div>

          <div
            className={styles.propertyGrid}
            style={{
              gap: 14,
            }}
          >
            {detailRows(propertyRows, { premium: true })}
          </div>
        </section>

        <section
          className={styles.card}
          style={{
            border: "1px solid #dfe7f1",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(24, 53, 88, 0.07)",
            overflow: "hidden",
          }}
        >
          <div
            className={styles.cardTitle}
            style={{
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #edf1f6",
            }}
          >
            <span>♙</span>
            <div>
              <h2>Ownership &amp; Title</h2>
              <p>
                A concise view of the ownership and title evidence available
                from the submitted property documents.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 14,
              padding: "13px 15px",
              border: "1px solid #e4ebf4",
              borderRadius: 12,
              background: "linear-gradient(135deg, #f7faff 0%, #ffffff 100%)",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  marginBottom: 4,
                  color: "#7a899c",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                Title evidence
              </span>
              <strong
                style={{
                  display: "block",
                  color: "#17385f",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}
              >
                {essentialAnalysisComplete
                  ? "Available AI findings"
                  : "Essential title information is based on submitted documents"}
              </strong>
            </div>
            <span
              style={{
                flexShrink: 0,
                padding: "5px 9px",
                borderRadius: 999,
                background: essentialAnalysisComplete ? "#eaf3ff" : "#f0f3f6",
                color: essentialAnalysisComplete ? "#1557a6" : "#718096",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {essentialAnalysisComplete ? "Reviewed" : "Pending"}
            </span>
          </div>

          <div
            className={styles.propertyGrid}
            style={{
              gap: 12,
            }}
          >
            {detailRows(ownershipRows, { premium: true })}
          </div>
        </section>

        <section
          className={styles.card}
          style={{
            border: "1px solid #dfe7f1",
            borderRadius: 16,
            boxShadow: "0 14px 36px rgba(18, 50, 88, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            className={styles.cardTitle}
            style={{
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #edf1f6",
            }}
          >
            <span>⌖</span>
            <div>
              <h2>Property Location &amp; GPS Analysis</h2>
              <p>
                Location intelligence comparing available geographic evidence
                with the property location stated in the submitted documents.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
              padding: "15px 17px",
              borderRadius: 14,
              border:
                location.status === "mismatch"
                  ? "1px solid #efd9a8"
                  : location.status === "consistent"
                    ? "1px solid #d6eadf"
                    : "1px solid #e1e7ef",
              background:
                location.status === "mismatch"
                  ? "linear-gradient(135deg, #fffaf1 0%, #ffffff 100%)"
                  : location.status === "consistent"
                    ? "linear-gradient(135deg, #f5fbf7 0%, #ffffff 100%)"
                    : "linear-gradient(135deg, #f7faff 0%, #ffffff 100%)",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  marginBottom: 5,
                  color: "#73849a",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Location intelligence
              </span>
              <strong
                style={{
                  display: "block",
                  color:
                    location.status === "mismatch"
                      ? "#8b5a00"
                      : location.status === "consistent"
                        ? "#24714a"
                        : "#52657b",
                  fontSize: 15,
                  lineHeight: 1.35,
                  fontWeight: 800,
                }}
              >
                {location.statusLabel}
              </strong>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#71829b",
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                {location.status === "mismatch"
                  ? "A geographic difference requires clarification before relying on the location evidence."
                  : location.status === "consistent"
                    ? "The available geographic evidence is consistent with the stated property location."
                    : "The available geographic evidence is not sufficient to establish consistency."}
              </p>
            </div>

            <div
              style={{
                minWidth: 150,
                padding: "9px 11px",
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid #e5ebf2",
                textAlign: "right",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#8795a6",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Geographic reference
              </span>
              <strong
                style={{
                  display: "block",
                  marginTop: 3,
                  color: "#193b61",
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {location.coordinatesLabel}
              </strong>
            </div>
          </div>

          <div
            className={styles.locationGrid}
            style={{
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div className={styles.locationMetric}>
              <span>GPS Coordinates</span>
              <strong>{location.coordinatesLabel}</strong>
            </div>
            <div className={styles.locationMetric}>
              <span>Document-Stated Location</span>
              <strong>{location.documentLocation}</strong>
            </div>
            <div className={styles.locationMetric}>
              <span>Detected / Reported Location</span>
              <strong>{location.detectedLocation}</strong>
            </div>
            <div className={styles.locationMetric}>
              <span>Location Confidence</span>
              <strong>
                {location.confidence !== null
                  ? `${location.confidence}%`
                  : "Not available"}
              </strong>
            </div>
            <div className={styles.locationMetric}>
              <span>Location Source</span>
              <strong>{location.source}</strong>
            </div>
            <div className={styles.locationMetric}>
              <span>Distance Analysis</span>
              <strong>
                {location.distance !== null
                  ? `${location.distance.toLocaleString("en-NG")} m`
                  : "Not available"}
              </strong>
            </div>
          </div>

          <div
            className={styles.locationMessage}
            style={{
              marginBottom: 16,
              border:
                location.status === "mismatch"
                  ? "1px solid #efd9a8"
                  : location.status === "consistent"
                    ? "1px solid #d7eade"
                    : "1px solid #e2e8f0",
            }}
          >
            <div className={styles.locationMessageIcon}>
              {location.status === "mismatch"
                ? "!"
                : location.status === "consistent"
                  ? "✓"
                  : "i"}
            </div>
            <div>
              <strong>{location.statusLabel}</strong>
              <p>{location.message}</p>
            </div>
          </div>

          <div
            className={styles.locationMapPanel}
            style={{
              borderRadius: 15,
              border: "1px solid #dce5ef",
              boxShadow: "0 10px 28px rgba(20, 48, 80, 0.07)",
              overflow: "hidden",
            }}
          >
            <div
              className={styles.locationMapHeader}
              style={{
                padding: "15px 17px",
                background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
              }}
            >
              <div>
                <span>PROPERTY LOCATION MAP</span>
                <strong>Geographic Reference</strong>
              </div>
              <span className={styles.locationCoordinateBadge}>
                {location.latitude !== null && location.longitude !== null
                  ? "Coordinates available"
                  : "Not available"}
              </span>
            </div>

            {location.latitude !== null && location.longitude !== null ? (
              <>
                <div
                  className={styles.locationMapFrame}
                  style={{
                    minHeight: 330,
                    position: "relative",
                  }}
                >
                  <iframe
                    title="Property location map"
                    src={getMapUrl(location.latitude, location.longitude)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div
                    className={styles.locationMapOverlay}
                    style={{
                      borderRadius: 11,
                      boxShadow: "0 8px 22px rgba(20, 44, 72, 0.16)",
                    }}
                  >
                    <span>⌖</span>
                    <div>
                      <strong>Property Coordinates</strong>
                      <small>{location.coordinatesLabel}</small>
                    </div>
                  </div>
                </div>

                <div className={styles.locationMapFooter}>
                  <span>
                    Geographic reference based on the available verification
                    coordinates.
                  </span>
                  <a
                    className={styles.locationMapLink}
                    href={getMapsLink(location.latitude, location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps <span>↗</span>
                  </a>
                </div>
              </>
            ) : (
              <div className={styles.locationMapUnavailable}>
                <div className={styles.locationMapUnavailableIcon}>⌖</div>
                <div>
                  <strong>Map unavailable</strong>
                  <p>
                    A property map will appear here when usable GPS
                    coordinates are available from the verification data.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              marginTop: 14,
              padding: "11px 13px",
              borderRadius: 11,
              background: "#f7f9fc",
              border: "1px solid #e5eaf1",
            }}
          >
            <span
              style={{
                color: "#708196",
                fontSize: 11,
                lineHeight: 1.5,
              }}
              aria-hidden="true"
            >
              i
            </span>
            <p
              style={{
                margin: 0,
                color: "#718097",
                fontSize: 9,
                lineHeight: 1.55,
              }}
            >
              GPS is an additional geographic verification signal. It can help
              identify inconsistencies between the reported property location
              and the submitted documents, but it does not by itself establish
              document authenticity, ownership, or government issuance.
            </p>
          </div>
        </section>
            </div>
          )}

          {activeTab === "summary" && (
            <div className={styles.tabPanelContent}>
        <section id="professional-summary" className={styles.card}>
          <div className={styles.cardTitle}><span>▤</span><div><h2>Analysis Summary</h2><p>Overall Essential AI assessment of the submitted property document package.</p></div></div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryAssessmentPremium}>
              <div className={styles.summaryAssessmentHeader}>
                 <span>EXECUTIVE ASSESSMENT</span>
                 <strong className={essentialAnalysisComplete ? riskClass(overallRisk) : styles.riskUnknown}>
                   <span className={styles.summaryRiskIcon} aria-hidden="true">{!essentialAnalysisComplete ? "i" : overallRisk === "High" ? "!" : overallRisk === "Medium" ? "!" : overallRisk === "Low" ? "✓" : "i"}</span>
                   {overallRisk === "High" || overallRisk === "Medium" || overallRisk === "Low" ? `${overallRisk} Risk` : "Not Conclusive"}
                 </strong>
               </div>
              <p>{essentialAnalysisNarrative}</p>
              <div className={styles.summaryActionMessage}>
                <span>WHAT THIS MEANS FOR YOU</span>
                <p>{userActionMessage}</p>
              </div>
            </div>

            <div className={styles.analysisInsightGrid}>
              <article className={styles.analysisInsightCard}>
                <span>KEY FINDINGS</span>
                {userFriendlyFindings.length > 0 ? (
                  <ul>
                    {userFriendlyFindings.slice(0, 6).map((finding, index) => (
                      <li key={`${finding}-${index}`}>{finding}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{essentialAnalysisComplete ? "The Essential AI analysis did not return specific findings yet." : "Essential findings will appear here when the AI analysis is complete."}</p>
                )}
              </article>

              <article className={`${styles.analysisInsightCard} ${overallRisk === "High" ? styles.analysisRiskHigh : overallRisk === "Medium" ? styles.analysisRiskMedium : ""}`}>
                <span>WHAT THE RISK MEANS</span>
                <strong>{overallRisk === "High" || overallRisk === "Medium" || overallRisk === "Low" ? overallRisk : "Not Conclusive"}</strong>
                <p>{riskInterpretation}</p>
              </article>

              <article className={styles.analysisInsightCard}>
                <span>CONFIDENCE IN THIS ANALYSIS</span>
                <strong>{confidence !== null ? `${confidence}%` : "Not available"}</strong>
                <p>{confidenceNarrative}</p>
              </article>

              <article className={styles.analysisInsightCard}>
                 <span>AI VERIFICATION CHECKS</span>
                 <div className={styles.serviceCountGrid}>
                   <div className={styles.serviceCountVerified}><strong>{verificationStatusCounts.Verified}</strong><span>Verified</span></div>
                   <div className={styles.serviceCountAttention}><strong>{verificationStatusCounts["Attention Required"]}</strong><span>Attention</span></div>
                   <div className={styles.serviceCountPending}><strong>{verificationStatusCounts.Pending}</strong><span>Pending</span></div>
                   <div className={styles.serviceCountNeutral}><strong>{verificationStatusCounts["Not Conclusive"]}</strong><span>Not conclusive</span></div>
                 </div>
                 <p>These counts reflect the AI document checks included in the Essential verification scope.</p>
               </article>
            </div>

            <div className={styles.analysisRecommendationPanel}>
              <div className={`${styles.analysisRecommendationIcon} ${overallRisk === "High" ? styles.guidanceHigh : overallRisk === "Medium" ? styles.guidanceMedium : overallRisk === "Low" ? styles.guidanceLow : styles.guidanceNeutral}`} aria-hidden="true">{overallRisk === "High" || overallRisk === "Medium" ? "!" : overallRisk === "Low" ? "✓" : "i"}</div>
              <div>
                <span>ESSENTIAL GUIDANCE</span>
                <h3>{recommendation}</h3>
                <p>{recommendationText}</p>
                <strong>Need deeper verification?</strong>
                <p>For independent title, ownership, registry, survey, legal, or physical due diligence, use the Professional or Premium verification service.</p>
              </div>
            </div>

            <div className={styles.summaryStats}>
              <div>
                <strong>{documents.length}</strong>
                <span>Documents reviewed</span>
              </div>
              <div>
                <strong>{propertyType}</strong>
                <span>Property type</span>
              </div>
              <div>
                <strong className={riskClass(overallRisk)}>{assessment}</strong>
                <span>Essential assessment</span>
              </div>
              <div>
                <strong>{formatDate(completedAt)}</strong>
                <span>Report date</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}><span>!</span><div><h2>Outstanding Issues</h2><p>Items requiring clarification, confirmation, or additional verification.</p></div></div>
          <div className={styles.professionalIssueList}>
            {issueItems.length > 0 ? (
              issueItems.map((issue, index) => (
                <article className={styles.professionalIssueRow} key={`${issue}-${index}`}>
                  <div className={styles.professionalIssueNumber}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={styles.professionalIssueContent}>
                    <span className={styles.professionalIssueLabel}>ITEM {String(index + 1).padStart(2, "0")}</span>
                    <p>{simplifyFinding(issue)}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                No outstanding issues have been supplied by the Essential verification engine yet.
              </div>
            )}
          </div>
        </section>


            </div>
          )}
        </div>

        <section className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
          <div className={styles.actionRight}>
            <button type="button" className={styles.outlineButton} onClick={downloadReport}>↓ Download Full Report</button>
            <button type="button" className={styles.primaryButton} onClick={() => router.push("/verify")}>+ Verify Another Property</button>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <strong>PropertySure AI</strong>
            <span>Essential Property Verification Report</span>
          </div>
          <div className={styles.footerMeta}>
            <span>Verification ID #{verification.id}</span>
            <span>Essential Plan</span>
            <span>Assessment: {assessment}</span>
            {String(payment?.status || "").toLowerCase() === "paid" && <span>Payment: {formatCurrency(payment?.amount)}</span>}
          </div>
        </footer>

        {selectedDocument && (
          <div className={styles.modalBackdrop} onClick={closeDocument}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
              <div className={styles.modalHeader}><div><span>Document Details</span><h2>{getDocumentType(selectedDocument)}</h2><small className={styles.modalReference}>{getDocumentReference(selectedDocument, selectedDocumentIndex, verification.id)}</small></div><button type="button" onClick={closeDocument} className={styles.modalClose} aria-label="Close document details">×</button></div>
              <div className={styles.modalBody}>
                <div className={styles.documentPreviewColumn}>
                  <div className={styles.documentPreview}>
                    {previewLoading ? <div className={styles.previewLoading}><div className={styles.previewSpinner} /><span>Loading secure document preview...</span></div> : previewError ? <div className={styles.previewError}><strong>Document preview unavailable</strong><span>{previewError}</span></div> : selectedDocumentUrl ? (/image/i.test(getDocumentType(selectedDocument)) || /\.(jpg|jpeg|png|webp)(\?|$)/i.test(stringValue(selectedDocument.path))) ? <img src={selectedDocumentUrl} alt={getDocumentType(selectedDocument)} /> : <iframe src={selectedDocumentUrl} title={getDocumentType(selectedDocument)} /> : <div>Document preview unavailable.</div>}
                  </div>
                  <div className={styles.documentNavigation}>
                    <button type="button" className={styles.documentNavButton} disabled={selectedDocumentIndex <= 0} onClick={() => { const previous = documents[selectedDocumentIndex - 1]; if (previous) void openDocument(previous, selectedDocumentIndex - 1); }}>← Previous</button>
                    <span className={styles.documentCounter}>{selectedDocumentIndex + 1} of {documents.length}</span>
                    <button type="button" className={styles.documentNavButton} disabled={selectedDocumentIndex >= documents.length - 1} onClick={() => { const next = documents[selectedDocumentIndex + 1]; if (next) void openDocument(next, selectedDocumentIndex + 1); }}>Next →</button>
                  </div>
                </div>
                <div className={styles.modalDetails}>
                  <div className={styles.detailItem}><span>Document Type</span><strong>{getDocumentType(selectedDocument)}</strong></div>
                  <div className={styles.detailItem}><span>Document Reference</span><strong>{getDocumentReference(selectedDocument, selectedDocumentIndex, verification.id)}</strong></div>
                  <div className={styles.detailItem}><span>AI Confidence</span><strong>{clampScore(numberValue(selectedDocument.ai_confidence, selectedDocument.confidence)) !== null ? `${clampScore(numberValue(selectedDocument.ai_confidence, selectedDocument.confidence))}%` : "—"}</strong></div>
                  <div className={styles.detailItem}><span>Status</span><strong>{packageStatus}</strong></div>
                  <div className={styles.detailSummary}><span>Analysis Summary</span><p>{stringValue(selectedDocument.summary, getNested(selectedDocument.findings || {}, "summary")) || "No document-level Essential summary is available yet."}</p></div>
                </div>
              </div>
              <div className={styles.modalChecks}><h3>Document Checks</h3>{(Object.keys(getDocumentChecks(selectedDocument)) as Array<keyof VerificationChecks>).map((key) => { const value = getDocumentChecks(selectedDocument)[key]; return <div className={styles.modalCheckRow} key={key}><span>{checkLabel(key)}</span><strong className={value === true ? styles.modalPass : value === false ? styles.modalFail : styles.modalReview}>{value === true ? "No Issue Detected" : value === false ? "Attention" : "Not Conclusive"}</strong></div>; })}</div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function EssentialReportFallback() {
  return (
    <AppShell activePath="/verify" headerPath="/result">
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner} />
          <h2>Loading verification result</h2>
          <p>Retrieving your completed property analysis...</p>
        </div>
      </div>
    </AppShell>
  );
}

export default function EssentialResultPage() {
  return (
    <Suspense fallback={<EssentialReportFallback />}>
      <EssentialReportContent />
    </Suspense>
  );
}
