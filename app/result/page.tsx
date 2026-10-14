
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";
import styles from "../professional-report/professional-report.module.css";
import "leaflet/dist/leaflet.css";

/*
 * ============================================================
 * PROPERTYSURE AI — ESSENTIAL RESULTS PAGE
 * ============================================================
 *
 * Updated:
 *
 * 1. Premium individual manipulation indicator cards.
 * 2. Mobile swipe hint and navigation arrow.
 * 3. Consistent executive assessment typography.
 * 4. Removed duplicated Key Findings from Analysis Summary.
 * 5. Consistent Recommended Next Steps typography.
 *
 * Preserved:
 *
 * - Desktop document results table
 * - Mobile document cards
 * - Individual View Details actions
 * - Secure document preview
 * - Individual verification checks
 * - Overall package checks
 * - Property information
 * - Saved AI analysis
 * - Report download button
 * - Compact mobile action buttons
 *
 * ============================================================
 */

type JsonRecord = Record<string, unknown>;

type CheckValue = boolean | null;

type Tab =
  | "documents"
  | "checks"
  | "property"
  | "gps"
  | "summary";

type RiskLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Not Conclusive";

type VerificationChecks = {
  documentStructure: CheckValue;
  dataConsistency: CheckValue;
  signatureValid: CheckValue;
  stampValid: CheckValue;
  noForgery: CheckValue;
  noDuplicate: CheckValue;
  documentCompleteness: CheckValue;
};

type VerificationRecord = {
  id: number;
  user_id?: string | null;
  doc_name?: string | null;
  file_url?: string | null;
  doc_type?: string | null;
  status?: string | null;
  trust_score?: number | null;
  confidence?: number | null;
  risk?: string | null;
  findings?: JsonRecord | null;
};

type PaymentRecord = {
  plan?: string | null;
  status?: string | null;
  amount?: number | null;
  paid_at?: string | null;
};

type PackageDocument = {
  name?: string;
  path?: string;
  type?: string;

  document_type?: string;
  documentType?: string;

  document_title?: string;
  documentTitle?: string;
  documentTitleDetected?: string;

  documentName?: string;
  documentNumber?: string;
  nameDetected?: string;
  issuingAuthority?: string;

  propertyLocation?: string;
  propertyDescription?: string;
  propertyType?: string;
  landSize?: string;
  plotNumber?: string;
  blockNumber?: string;
  surveyReference?: string;

  ownerName?: string;
  holderName?: string;

  reference?: string;
  document_reference?: string;

  confidence?: number | null;
  ai_confidence?: number | null;

  summary?: string;
  assessmentStatus?: string;
  authenticityStatus?: string;
  syntheticDocumentRisk?: string;

  manipulationIndicators?: string[];

  checks?: JsonRecord;
  findings?: JsonRecord;
  extractedFields?: JsonRecord;
  propertyDetails?: JsonRecord;
  parties?: JsonRecord;
  dates?: JsonRecord;
};

type DetailRow = {
  label: string;
  value: string;
  source: string;
};

type DocumentUnderstanding = {
  observedFields?: string[];
  referenceStructure?: string[];
  terminology?: string[];
  missingOrUnclearFields?: string[];
  notes?: string[];
};

const STORAGE_BUCKET = "property-documents";

const CHECK_KEYS: Array<keyof VerificationChecks> = [
  "documentStructure",
  "dataConsistency",
  "signatureValid",
  "stampValid",
  "noForgery",
  "noDuplicate",
  "documentCompleteness",
];

const CHECK_LABELS: Record<
  keyof VerificationChecks,
  string
> = {
  documentStructure: "Document Structure",
  dataConsistency: "Data Consistency",
  signatureValid: "Signature Indicators (Visual)",
  stampValid: "Stamp / Seal Indicators (Visual)",
  noForgery: "Manipulation Indicators",
  noDuplicate: "Duplicate Indicators",
  documentCompleteness: "Document Completeness",
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function asRecord(value: unknown): JsonRecord {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

/* Keep GPS JSON array handling typed without changing report layout. */
function recordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is JsonRecord =>
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .map(asRecord);
}

function firstValue(...values: unknown[]): unknown {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "",
  );
}

function stringValue(...values: unknown[]): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

function numberValue(...values: unknown[]): number | null {
  const value = firstValue(...values);

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
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function scoreValue(...values: unknown[]): number | null {
  const value = numberValue(...values);

  return value === null
    ? null
    : Math.max(0, Math.min(100, Math.round(value)));
}

function nested(
  value: unknown,
  ...keys: string[]
): unknown {
  let current: unknown = value;

  for (const key of keys) {
    current = asRecord(current)[key];
  }

  return current;
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase(),
    );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeRisk(value: unknown): RiskLevel {
  const text = stringValue(value).toLowerCase();

  if (
    text.includes("high") ||
    text.includes("critical")
  ) {
    return "High";
  }

  if (
    text.includes("medium") ||
    text.includes("moderate")
  ) {
    return "Medium";
  }

  if (text.includes("low")) return "Low";

  return "Not Conclusive";
}

function riskStyle(value: RiskLevel): string {
  if (value === "High") return styles.riskHigh;
  if (value === "Medium") return styles.riskMedium;
  if (value === "Low") return styles.riskLow;
  return styles.riskUnknown;
}

function normalizedName(value: unknown): string {
  return stringValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/*
 * ============================================================
 * MERGE UPLOADS AND SAVED DOCUMENT ASSESSMENTS
 * ============================================================
 */

function getPackageDocuments(
  findings: JsonRecord,
  verification: VerificationRecord,
): PackageDocument[] {
  const essential = asRecord(findings.essential);

  const uploadsRaw = firstValue(
    findings.document_package,
    findings.documents,
    essential.documents,
  );

  const analysesRaw = essential.document_results;

  let uploads: PackageDocument[] = Array.isArray(uploadsRaw)
    ? uploadsRaw.filter(
        (item): item is PackageDocument =>
          !!item &&
          typeof item === "object" &&
          !Array.isArray(item),
      )
    : [];

  const analyses: PackageDocument[] =
    Array.isArray(analysesRaw)
      ? analysesRaw.filter(
          (item): item is PackageDocument =>
            !!item &&
            typeof item === "object" &&
            !Array.isArray(item),
        )
      : [];

  if (
    uploads.length === 0 &&
    verification.file_url
  ) {
    uploads = [
      {
        name:
          verification.doc_name ||
          "Property Document",
        path: verification.file_url,
        documentType:
          verification.doc_type ||
          "Property Document",
      },
    ];
  }

  if (uploads.length === 0) {
    return analyses.map((analysis) => ({
      ...analysis,
      name:
        stringValue(
          analysis.documentName,
          analysis.name,
        ) || "Property Document",
    }));
  }

  const used = new Set<number>();

  return uploads.map((upload, index) => {
    const uploadName = normalizedName(upload.name);

    let matchIndex = analyses.findIndex(
      (analysis, analysisIndex) =>
        !used.has(analysisIndex) &&
        uploadName.length > 0 &&
        normalizedName(
          firstValue(
            analysis.documentName,
            analysis.name,
          ),
        ) === uploadName,
    );

    if (
      matchIndex < 0 &&
      analyses.length === uploads.length &&
      !used.has(index)
    ) {
      matchIndex = index;
    }

    if (matchIndex < 0) return upload;

    used.add(matchIndex);

    const analysis = analyses[matchIndex];

    return {
      ...upload,
      ...analysis,

      path: stringValue(
        upload.path,
        analysis.path,
      ),

      name: stringValue(
        upload.name,
        analysis.documentName,
        analysis.name,
      ),

      documentType: stringValue(
        analysis.documentType,
        upload.documentType,
        upload.document_type,
      ),

      documentTitleDetected: stringValue(
        upload.documentTitleDetected,
        analysis.documentTitleDetected,
      ),

      documentTitle: stringValue(
        analysis.documentTitle,
        upload.documentTitle,
      ),

      nameDetected: stringValue(
        upload.nameDetected,
        analysis.nameDetected,
      ),

      summary: stringValue(
        analysis.summary,
        upload.summary,
      ),

      confidence: numberValue(
        analysis.confidence,
        upload.confidence,
      ),

      ai_confidence: numberValue(
        analysis.ai_confidence,
        analysis.confidence,
        upload.ai_confidence,
      ),

      assessmentStatus: stringValue(
        analysis.assessmentStatus,
        upload.assessmentStatus,
      ),

      authenticityStatus: stringValue(
        analysis.authenticityStatus,
        upload.authenticityStatus,
      ),

      syntheticDocumentRisk: stringValue(
        analysis.syntheticDocumentRisk,
        upload.syntheticDocumentRisk,
      ),

      manipulationIndicators:
        textArray(analysis.manipulationIndicators).length > 0
          ? textArray(analysis.manipulationIndicators)
          : textArray(upload.manipulationIndicators),

      checks: {
        ...asRecord(upload.checks),
        ...asRecord(analysis.checks),
      },

      findings: {
        ...asRecord(upload.findings),
        ...asRecord(analysis.findings),
      },

      extractedFields: {
        ...asRecord(upload.extractedFields),
        ...asRecord(analysis.extractedFields),
      },

      propertyDetails: {
        ...asRecord(upload.propertyDetails),
        ...asRecord(analysis.propertyDetails),
      },

      parties: {
        ...asRecord(upload.parties),
        ...asRecord(analysis.parties),
      },

      dates: {
        ...asRecord(upload.dates),
        ...asRecord(analysis.dates),
      },

      propertyLocation: stringValue(
        analysis.propertyLocation,
        upload.propertyLocation,
      ),

      propertyDescription: stringValue(
        analysis.propertyDescription,
        upload.propertyDescription,
      ),

      propertyType: stringValue(
        analysis.propertyType,
        upload.propertyType,
      ),

      landSize: stringValue(
        analysis.landSize,
        upload.landSize,
      ),

      plotNumber: stringValue(
        analysis.plotNumber,
        upload.plotNumber,
      ),

      blockNumber: stringValue(
        analysis.blockNumber,
        upload.blockNumber,
      ),

      surveyReference: stringValue(
        analysis.surveyReference,
        upload.surveyReference,
      ),

      ownerName: stringValue(
        analysis.ownerName,
        upload.ownerName,
      ),

      holderName: stringValue(
        analysis.holderName,
        upload.holderName,
      ),

      documentNumber: stringValue(
        analysis.documentNumber,
        upload.documentNumber,
      ),

      issuingAuthority: stringValue(
        analysis.issuingAuthority,
        upload.issuingAuthority,
      ),
    };
  });
}

function documentType(
  document: PackageDocument,
): string {
  return (
    stringValue(
      document.documentType,
      document.document_type,
      document.documentTitleDetected,
      document.documentTitle,
      document.document_title,
      document.type,
    ) || "Property Document"
  );
}

function documentReference(
  document: PackageDocument,
  index: number,
  verificationId: number,
): string {
  return (
    stringValue(
      document.document_reference,
      document.reference,
      document.documentNumber,
    ) ||
    `PSAI-${verificationId}-DOC-${String(
      index + 1,
    ).padStart(2, "0")}`
  );
}

/*
 * ============================================================
 * CHECKS
 * ============================================================
 */

function normalizeChecks(
  value: unknown,
): VerificationChecks {
  const record = asRecord(value);

  function check(...names: string[]): CheckValue {
    const raw = firstValue(
      ...names.map((name) => record[name]),
    );

    if (typeof raw === "boolean") return raw;

    const text = stringValue(raw).toLowerCase();

    if (
      ["true", "passed", "pass", "yes", "valid"].includes(text)
    ) {
      return true;
    }

    if (
      ["false", "failed", "fail", "no", "flagged"].includes(text)
    ) {
      return false;
    }

    return null;
  }

  return {
    documentStructure: check(
      "documentStructure",
      "document_structure",
    ),
    dataConsistency: check(
      "dataConsistency",
      "data_consistency",
    ),
    signatureValid: check(
      "signatureValid",
      "signature_valid",
    ),
    stampValid: check(
      "stampValid",
      "stamp_valid",
    ),
    noForgery: check(
      "noForgery",
      "no_forgery",
    ),
    noDuplicate: check(
      "noDuplicate",
      "no_duplicate",
    ),
    documentCompleteness: check(
      "documentCompleteness",
      "document_completeness",
    ),
  };
}

function documentChecks(
  document: PackageDocument,
): VerificationChecks {
  return normalizeChecks(
    firstValue(
      document.checks,
      nested(document.findings, "checks"),
      document.findings,
    ),
  );
}

function checkText(value: CheckValue): string {
  if (value === true) return "No Issue Detected";
  if (value === false) return "Attention Required";
  return "Not Conclusive";
}

/*
 * ============================================================
 * PROPERTY DETAILS
 * ============================================================
 */

function getPropertyDetails(
  findings: JsonRecord,
  documents: PackageDocument[],
): DetailRow[] {
  const essential = asRecord(findings.essential);

  const property = asRecord(
    firstValue(
      findings.property,
      essential.property,
      findings.property_details,
    ),
  );

  const ownership = asRecord(
    firstValue(
      findings.ownership,
      essential.ownership,
    ),
  );

  const crossDocument = asRecord(
    firstValue(
      findings.cross_document_analysis,
      essential.cross_document_analysis,
    ),
  );

  const firstDocument =
    documents.length > 0
      ? documents[0]
      : ({} as PackageDocument);

  const extracted = asRecord(
    firstDocument.extractedFields,
  );

  const extractedProperty = asRecord(
    firstValue(
      extracted.propertyDetails,
      extracted.property,
      firstDocument.propertyDetails,
    ),
  );

  const parties = asRecord(
    firstValue(
      extracted.parties,
      firstDocument.parties,
    ),
  );

  function detail(
    label: string,
    sources: Array<[unknown, string]>,
  ): DetailRow {
    for (const [rawValue, source] of sources) {
      const value = stringValue(rawValue);

      if (value) {
        return { label, value, source };
      }
    }

    return {
      label,
      value: "Not available in structured data",
      source: "unavailable",
    };
  }

  return [
    detail("Document Type", [
      [firstDocument.documentType, "AI classification"],
      [firstDocument.document_type, "Document package"],
      [firstDocument.type, "Document package"],
    ]),

    detail("Document Title", [
      [firstDocument.documentTitleDetected, "AI classification"],
      [firstDocument.documentTitle, "AI extraction"],
      [extracted.documentTitle, "AI extraction"],
    ]),

    detail("Property Type", [
      [property.property_type, "AI extraction"],
      [extractedProperty.propertyType, "AI extraction"],
      [firstDocument.propertyType, "Document-level analysis"],
    ]),

    detail("Property Location", [
      [property.location, "AI extraction"],
      [property.address, "Saved property information"],
      [crossDocument.location, "Cross-document analysis"],
      [extractedProperty.location, "AI extraction"],
      [firstDocument.propertyLocation, "Document-level analysis"],
    ]),

    detail("Property Description", [
      [property.description, "AI extraction"],
      [crossDocument.property_description, "Cross-document analysis"],
      [extractedProperty.propertyDescription, "AI extraction"],
      [extractedProperty.description, "AI extraction"],
      [firstDocument.propertyDescription, "Document-level analysis"],
    ]),

    detail("Land Size", [
      [property.land_size, "AI extraction"],
      [extractedProperty.landSize, "AI extraction"],
      [firstDocument.landSize, "Document-level analysis"],
    ]),

    detail("Plot / Block Number", [
      [crossDocument.plot_block, "Cross-document analysis"],
      [property.plot, "AI extraction"],
      [property.block, "AI extraction"],
      [extractedProperty.plotNumber, "AI extraction"],
      [firstDocument.plotNumber, "Document-level analysis"],
    ]),

    detail("Survey Reference", [
      [crossDocument.survey_reference, "Cross-document analysis"],
      [property.survey_reference, "AI extraction"],
      [extractedProperty.surveyReference, "AI extraction"],
      [extractedProperty.surveyNumber, "AI extraction"],
      [firstDocument.surveyReference, "Document-level analysis"],
    ]),

    detail("Named Owner / Holder", [
      [ownership.owner_name, "Document claim"],
      [ownership.holder, "Document claim"],
      [parties.owner, "AI extraction"],
      [parties.holder, "AI extraction"],
      [firstDocument.ownerName, "Document-level analysis"],
      [firstDocument.holderName, "Document-level analysis"],
    ]),

    detail("Name Identified on Document", [
      [firstDocument.nameDetected, "AI classification"],
      [extracted.nameDetected, "AI extraction"],
    ]),

    detail("Title Reference", [
      [ownership.title_reference, "Saved ownership information"],
      [crossDocument.title_reference, "Cross-document analysis"],
      [findings.title_reference, "Saved findings"],
    ]),

    detail("Document Number", [
      [firstDocument.documentNumber, "AI extraction"],
      [extracted.documentNumber, "AI extraction"],
    ]),

    detail("Issuing Authority", [
      [firstDocument.issuingAuthority, "AI extraction"],
      [extracted.issuingAuthority, "AI extraction"],
    ]),
  ];
}

/*
 * ============================================================
 * SECURE PREVIEW HELPER
 * ============================================================
 */

function getStorageObjectPath(
  value: string,
): string | null {
  const path = value.trim();

  if (!path) return null;

  if (!/^https?:\/\//i.test(path)) return path;

  try {
    const url = new URL(path);
    const marker = `/${STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index < 0) return null;

    return decodeURIComponent(
      url.pathname.substring(
        index + marker.length,
      ),
    );
  } catch {
    return null;
  }
}

/*
 * ============================================================
 * METRIC
 * ============================================================
 */

function Metric({
  label,
  value,
  description,
  tone = "blue",
}: {
  label: string;
  value: string;
  description: string;
  tone?: "blue" | "green" | "warning";
}) {
  const toneClass =
    tone === "warning"
      ? styles.metricWarning
      : tone === "green"
        ? styles.metricGreen
        : styles.metricBlue;

  return (
    <div
      className={`${styles.metricCard} ${toneClass}`}
    >
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * PREMIUM MANIPULATION INDICATOR CARDS
 * ============================================================
 *
 * Each item is distinct.
 *
 * The cards are visual presentation only.
 * They do not change the AI findings or their meaning.
 *
 * ============================================================
 */

function PremiumIndicators({
  indicators,
}: {
  indicators: string[];
}) {
  if (indicators.length === 0) {
    return (
      <p className="psai-no-indicators">
        No separate manipulation indicators were saved
        for this document.
      </p>
    );
  }

  return (
    <div className="psai-indicator-list">
      {indicators.map((indicator, index) => (
        <article
          key={`${index}-${indicator}`}
          className="psai-indicator-card"
        >
          <div className="psai-indicator-icon">
            <span aria-hidden="true">!</span>
          </div>

          <p>{indicator}</p>
        </article>
      ))}
    </div>
  );
}


/* ============================================================
 * GPS ONLY — isolated presentation, no modifications to
 * Document Results, Verification Checks, Property or Summary.
 * ============================================================ */

type GPSPosition = { latitude: number; longitude: number; label?: string };

function gpsNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function gpsPosition(value: unknown): GPSPosition | null {
  const raw = asRecord(value);
  const coordinates = asRecord(raw.coordinates);
  const latitude = gpsNumber(firstValue(raw.latitude, coordinates.latitude));
  const longitude = gpsNumber(firstValue(raw.longitude, coordinates.longitude));
  if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    latitude,
    longitude,
    label: stringValue(raw.beaconId, raw.label, raw.id, coordinates.label),
  };
}

function gpsPositions(value: unknown): GPSPosition[] {
  if (!Array.isArray(value)) return [];
  const points: GPSPosition[] = [];
  for (const item of value) {
    const found = gpsPosition(item);
    if (found) points.push(found);
  }
  if (points.length > 3) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first.latitude === last.latitude && first.longitude === last.longitude) points.pop();
  }
  return points;
}

function gpsFormat(value: unknown, digits = 2): string {
  const number = gpsNumber(value);
  return number === null
    ? "Not available"
    : number.toLocaleString("en-NG", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function GPSMapOnly({ marker }: { marker: GPSPosition | null }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLat = marker?.latitude;
  const markerLng = marker?.longitude;

  useEffect(() => {
    if (markerLat === undefined || markerLng === undefined) return;
    let canceled = false;
    let localMap: import("leaflet").Map | null = null;

    async function mount() {
      const L = await import("leaflet");
      if (canceled || !elementRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(elementRef.current, { scrollWheelZoom: false })
        .setView([markerLat!, markerLng!], 17);
      localMap = map;
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 19,
      }).addTo(map);
      const pin = L.divIcon({
        className: "psai-gps-pin",
        html: '<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:50%;background:#225de9;box-shadow:0 1px 6px #233e68"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([markerLat!, markerLng!], { icon: pin })
        .bindPopup("Document-reported location (not independently verified)")
        .addTo(map);
      window.requestAnimationFrame(() => {
        if (!canceled) map.invalidateSize();
      });
    }

    void mount();
    return () => {
      canceled = true;
      if (localMap) {
        localMap.remove();
        if (mapRef.current === localMap) mapRef.current = null;
      }
    };
  }, [markerLat, markerLng]);

  if (!marker) {
    return <p>No safe document-reported map position is available.</p>;
  }
  return (
    <div
      ref={elementRef}
      className="psai-gps-leaflet"
      role="application"
      aria-label="Interactive document-reported property location map"
    />
  );
}

/** A standalone, schematic drawing made only from validated boundary points. */
function SurveyPlotShape({
  points,
  area,
}: {
  points: GPSPosition[];
  area: number | null;
}) {
  if (points.length < 3) return null;

  const WIDTH = 720;
  const HEIGHT = 420;
  const PADDING = 75;
  const latitudeCentre =
    points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitudeScale = Math.max(
    0.01,
    Math.cos((latitudeCentre * Math.PI) / 180),
  );
  const projected = points.map((point) => ({
    ...point,
    x: point.longitude * longitudeScale,
    y: point.latitude,
  }));
  const minX = Math.min(...projected.map((point) => point.x));
  const maxX = Math.max(...projected.map((point) => point.x));
  const minY = Math.min(...projected.map((point) => point.y));
  const maxY = Math.max(...projected.map((point) => point.y));
  const spanX = Math.max(maxX - minX, 1e-10);
  const spanY = Math.max(maxY - minY, 1e-10);
  const scale = Math.min(
    (WIDTH - 2 * PADDING) / spanX,
    (HEIGHT - 2 * PADDING) / spanY,
  );
  const offsetX = (WIDTH - spanX * scale) / 2;
  const offsetY = (HEIGHT - spanY * scale) / 2;
  const drawing = projected.map((point) => ({
    ...point,
    sx: offsetX + (point.x - minX) * scale,
    sy: HEIGHT - offsetY - (point.y - minY) * scale,
  }));
  const polygon = drawing.map((point) => `${point.sx},${point.sy}`).join(" ");

  return (
    <div className="psai-gps-survey-plot">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Separate survey plot shape with ${points.length} labelled beacons`}
      >
        <rect width={WIDTH} height={HEIGHT} rx={14} fill="#f5f9ff" />
        <polygon
          points={polygon}
          fill="#dceafd"
          stroke="#2761c5"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {drawing.map((point, index) => (
          <g key={`${point.label || index}-${index}`}>
            <circle
              cx={point.sx}
              cy={point.sy}
              r={7}
              fill="#2761c5"
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={point.sx + 12}
              y={point.sy - 13}
              fontSize={19}
              fontWeight={700}
              fill="#173c72"
            >
              {point.label || `Beacon ${index + 1}`}
            </text>
          </g>
        ))}
        <text
          x={WIDTH - 30}
          y={34}
          textAnchor="end"
          fill="#25569b"
          fontSize={20}
          fontWeight={700}
        >
          N ↑
        </text>
        {area !== null && (
          <text
            x={WIDTH / 2}
            y={HEIGHT - 25}
            textAnchor="middle"
            fill="#244c85"
            fontSize={19}
            fontWeight={700}
          >
            Calculated Area: {gpsFormat(area)} m²
          </text>
        )}
      </svg>
      <p className="psai-gps-caption">
        Survey plot diagram based on validated document-derived beacon
        coordinates. This is separate from the geographic location map,
        and is not an official cadastral or field survey.
      </p>
    </div>
  );
}

function GPSReportSection({ analysis }: { analysis: JsonRecord }) {
  const mapData = asRecord(analysis.mapData);
  const marker = gpsPosition(firstValue(mapData.markerCoordinates, mapData.center, analysis.coordinates));
  const boundaries = recordArray(analysis.surveyBoundaries);
  const measurements = recordArray(analysis.surveyMeasurements);
  const documents = recordArray(analysis.documentGPSResults);
  const diagnostics = recordArray(analysis.surveyDiagnostics);
  const comparisons = recordArray(analysis.documentComparisons);
  const locationComparisons = recordArray(analysis.surveyLocationComparisons);
  const candidate = boundaries.find((item) => item.status === "available" && item.mapReady === true);
  const boundary = candidate ? gpsPositions(candidate.points) : [];
  const fromMap = mapData.showBoundary === true ? gpsPositions(mapData.boundaryPoints) : [];
  const plottedBoundary = boundary.length >= 3 ? boundary : fromMap.length >= 3 ? fromMap : [];
  const showBoundary = plottedBoundary.length >= 3;
  const plotMeasurement = measurements.find(
    (item) => item.geometryValid === true &&
      gpsNumber(item.calculatedAreaSquareMeters) !== null,
  );
  const calculatedPlotArea = plotMeasurement
    ? gpsNumber(plotMeasurement.calculatedAreaSquareMeters)
    : null;

  return (
    <div className="psai-gps-only">
      <section className={styles.card}>
        <div className={styles.cardTitle}>
          <span>⌖</span>
          <div><h2>GPS Analysis</h2><p>Document-reported locations and survey plot analysis.</p></div>
        </div>
        <p className="psai-gps-disclaimer">These coordinates and measurements come from uploaded documents, not a physical survey or government registry confirmation.</p>
        {Object.keys(analysis).length === 0 ? (
          <p>No GPS analysis was saved for this verification.</p>
        ) : (
          <>
            <div className="psai-gps-tiles">
              <div><span>Latitude</span><strong>{gpsFormat(marker?.latitude, 6)}</strong></div>
              <div><span>Longitude</span><strong>{gpsFormat(marker?.longitude, 6)}</strong></div>
              <div><span>Document Coordinate System</span><strong>{stringValue(analysis.coordinateSystem) || "Not established"}</strong></div>
              <div><span>Plot Boundary</span><strong>{showBoundary ? "Calculated from survey beacons" : "Not established"}</strong></div>
            </div>
            <GPSMapOnly marker={marker} />
            <p className="psai-gps-caption">Blue marker = the separately stated, document-reported location. The survey plot shape is displayed separately below; neither is independently verified.</p>
            {marker && <a className="psai-gps-external" href={`https://www.openstreetmap.org/?mlat=${marker.latitude}&mlon=${marker.longitude}#map=17/${marker.latitude}/${marker.longitude}`} target="_blank" rel="noopener noreferrer">Open full map ↗</a>}
            {!showBoundary && <div className="psai-gps-alert"><strong>Plot shape could not be confirmed</strong><p>{stringValue(diagnostics[0]?.explanation, asRecord(boundaries[0]).limitations && textArray(boundaries[0]?.limitations)[0]) || "An established beacon order and supported coordinate reference are required to draw the plot safely."}</p><p>Beacon coordinates alone do not prove the correct plot boundary.</p></div>}
          </>
        )}
      </section>
      {showBoundary && (
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <span>▱</span>
            <div>
              <h2>Survey Plot Shape</h2>
              <p>Separate plot outline with the validated survey beacon labels.</p>
            </div>
          </div>
          <SurveyPlotShape points={plottedBoundary} area={calculatedPlotArea} />
        </section>
      )}
      {measurements.length > 0 && (
        <section className={styles.card}>
          <div className={styles.cardTitle}><span>▱</span><div><h2>Survey Measurements</h2><p>Document-based plot area, perimeter, and side lengths.</p></div></div>
          {measurements.map((measurement, index) => {
            const areaComparison = asRecord(measurement.areaComparison);
            const sides = recordArray(measurement.sideLengths);
            return <article className="psai-gps-document" key={index}>
              <h3>{stringValue(measurement.sourceDocument) || `Survey ${index + 1}`}</h3>
              <div className="psai-gps-tiles">
                <div><span>Calculated Area</span><strong>{gpsNumber(measurement.calculatedAreaSquareMeters) === null ? "Not calculated" : `${gpsFormat(measurement.calculatedAreaSquareMeters)} m²`}</strong></div>
                <div><span>Perimeter</span><strong>{gpsNumber(measurement.perimeterMeters) === null ? "Not calculated" : `${gpsFormat(measurement.perimeterMeters)} m`}</strong></div>
                <div><span>Stated Area</span><strong>{gpsNumber(measurement.statedAreaSquareMeters) === null ? "Not available" : `${gpsFormat(measurement.statedAreaSquareMeters)} m²`}</strong></div>
                <div><span>Area Difference</span><strong>{gpsNumber(areaComparison.differenceSquareMeters) === null ? "Not available" : `${gpsFormat(areaComparison.differenceSquareMeters)} m²`}</strong></div>
              </div>
              {sides.length > 0 && <div className="psai-gps-scroll"><table><thead><tr><th>Side</th><th>Length</th></tr></thead><tbody>{sides.map((side, j) => <tr key={j}><td>{stringValue(side.fromBeacon, side.from, side.startBeacon)} → {stringValue(side.toBeacon, side.to, side.endBeacon)}</td><td>{gpsFormat(firstValue(side.distanceMeters, side.lengthMeters, side.metres))} m</td></tr>)}</tbody></table></div>}
              {textArray(measurement.limitations).length > 0 && <p className="psai-gps-caption">{textArray(measurement.limitations).join(" ")}</p>}
            </article>;
          })}
        </section>
      )}
      {documents.length > 0 && <section className={styles.card}>
        <div className={styles.cardTitle}><span>⌖</span><div><h2>Survey Beacons &amp; Document Coordinates</h2><p>Original coordinates extracted from submitted documents.</p></div></div>
        {documents.map((document, index) => {
          const beacons = recordArray(document.surveyBeacons);
          const reference = asRecord(document.coordinateReference);
          return <article className="psai-gps-document" key={index}>
            <h3>{stringValue(document.sourceDocument) || `Document ${index + 1}`}</h3>
            <p><strong>Reported address:</strong> {stringValue(document.statedAddress) || "Not available"}</p>
            {beacons.length > 0 && <>
              <p><strong>Survey reference:</strong> {stringValue(reference.datum) || "Unspecified"} / UTM Zone {stringValue(reference.utmZone) || "Unspecified"}{stringValue(reference.hemisphere)}</p>
              <p><strong>Boundary order:</strong> {textArray(document.boundarySequence).join(" → ") || "Not established"} ({document.boundarySequenceEstablished === true ? "established" : "unconfirmed"})</p>
              <div className="psai-gps-scroll"><table><thead><tr><th>Beacon</th><th>Easting</th><th>Northing</th></tr></thead><tbody>{beacons.map((b, i) => <tr key={i}><td>{stringValue(b.beaconId) || `#${i + 1}`}</td><td>{gpsFormat(b.easting)}</td><td>{gpsFormat(b.northing)}</td></tr>)}</tbody></table></div>
            </>}
          </article>;
        })}
      </section>}
      {(comparisons.length > 0 || locationComparisons.length > 0) && <section className={styles.card}>
        <div className={styles.cardTitle}><span>↔</span><div><h2>Geographic Comparisons</h2><p>Position differences between submitted documents.</p></div></div>
        {[...comparisons, ...locationComparisons].map((comparison, index) => <article className="psai-gps-document" key={index}>
          <h3>{stringValue(comparison.firstDocument, comparison.sourceDocument, comparison.documentName) || `Comparison ${index + 1}`}{stringValue(comparison.secondDocument) ? ` ↔ ${stringValue(comparison.secondDocument)}` : ""}</h3>
          <p>{stringValue(comparison.explanation, comparison.summary) || "No detailed explanation was saved."}</p>
          {gpsNumber(comparison.distanceMeters) !== null && <p>Distance: {gpsFormat(comparison.distanceMeters)} m</p>}
        </article>)}
      </section>}
      <section className={styles.card}>
        <div className={styles.cardTitle}><span>!</span><div><h2>GPS Findings &amp; Limitations</h2><p>Concise findings, with detailed technical notes on demand.</p></div></div>
        <ul className="psai-gps-findings">
          {recordArray(analysis.structuredFindings).length > 0 ? recordArray(analysis.structuredFindings).map((finding, index) => <li key={index}><strong>{stringValue(finding.title) || "GPS finding"}</strong><p>{stringValue(finding.description)}</p></li>) : textArray(analysis.findings).slice(0, 6).map((finding, index) => <li key={index}>{finding}</li>)}
        </ul>
        <details><summary>View Technical GPS Findings and Limitations</summary>
          <ul className="psai-gps-findings">{textArray(analysis.findings).map((finding, index) => <li key={index}>{finding}</li>)}{textArray(analysis.limitations).map((limitation, index) => <li key={`lim-${index}`}>{limitation}</li>)}</ul>
        </details>
        <p className="psai-gps-disclaimer">A calculated plot does not prove ownership, title, or registered property boundaries. Confirm material discrepancies with a licensed surveyor and relevant authorities.</p>
      </section>
    </div>
  );
}

/*
 * ============================================================
 * RESPONSIVE CSS
 * ============================================================
 */

const RESPONSIVE_CSS = `
  /* New GPS tab only: no overrides to existing results styles */
  .psai-gps-only .psai-gps-survey-plot{margin-top:16px;width:100%;min-width:0}
  .psai-gps-only .psai-gps-survey-plot svg{display:block;width:100%;height:auto;border:1px solid #dce6f2;border-radius:12px;box-sizing:border-box}

  .psai-gps-only .psai-gps-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}
  .psai-gps-only .psai-gps-tiles>div{min-width:0;padding:14px;border:1px solid #dce4ed;border-radius:11px;background:#f8fafc}
  .psai-gps-only .psai-gps-tiles span{display:block;font-size:12px;color:#52647b;margin-bottom:5px}
  .psai-gps-only .psai-gps-tiles strong{color:#1d365a;font-size:15px;overflow-wrap:anywhere}
  .psai-gps-only .psai-gps-leaflet{width:100%;height:390px;min-height:300px;border-radius:12px;z-index:0;margin:16px 0;overflow:hidden}
  .psai-gps-only .psai-gps-caption{color:#53677c;font-size:12px;line-height:1.6;margin:12px 0}
  .psai-gps-only .psai-gps-alert{border:1px solid #efdfc6;background:#fffaf3;padding:16px;border-radius:12px;margin-top:16px}
  .psai-gps-only .psai-gps-alert p{font-size:13px;line-height:1.65}
  .psai-gps-only .psai-gps-disclaimer{padding:12px;border-left:3px solid #d6a23c;background:#fffaf0;font-size:12px;line-height:1.65}
  .psai-gps-only .psai-gps-document{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-top:13px;overflow-wrap:anywhere}
  .psai-gps-only .psai-gps-document h3{font-size:14px;color:#1b375c;margin:0 0 10px}
  .psai-gps-only .psai-gps-scroll{overflow-x:auto;margin:12px 0;border:1px solid #e2e8f0;border-radius:10px}
  .psai-gps-only table{width:100%;border-collapse:collapse;min-width:340px;font-size:12px}
  .psai-gps-only th,.psai-gps-only td{padding:11px;text-align:left;border-bottom:1px solid #e2e8f0}
  .psai-gps-only th{background:#eef3fa}
  .psai-gps-only .psai-gps-findings{padding-left:24px;color:#364b65;line-height:1.65;font-size:13px}
  .psai-gps-only .psai-gps-findings li{margin-bottom:10px}
  .psai-gps-only .psai-gps-findings p{margin:2px 0}
  .psai-gps-only details{margin-top:14px;border:1px solid #e1e9f3;padding:12px;border-radius:10px}
  .psai-gps-only summary{cursor:pointer;color:#2d5eab;font-weight:650}
  .psai-gps-only .psai-gps-external{display:inline-block;color:#255ccc;margin-top:4px}
  @media(max-width:767px){.psai-gps-only .psai-gps-leaflet{height:330px}.psai-gps-only .psai-gps-tiles{grid-template-columns:minmax(0,1fr)}}

  /*
   * ----------------------------------------------------------
   * DEFAULT DESKTOP / MOBILE VISIBILITY
   * ----------------------------------------------------------
   */

  .psai-desktop-hero,
  .psai-desktop-scope,
  .psai-desktop-documents {
    display: block;
  }

  .psai-mobile-heading,
  .psai-mobile-scope,
  .psai-mobile-documents,
  .psai-mobile-tab-hint {
    display: none;
  }

  /*
   * ----------------------------------------------------------
   * PREMIUM MANIPULATION INDICATORS
   * ----------------------------------------------------------
   */

  .psai-indicator-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
    margin-top: 15px;
    width: 100%;
    min-width: 0;
  }

  .psai-indicator-card {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    width: 100%;
    min-width: 0;
    padding: 15px 16px;
    border-radius: 12px;
    border: 1px solid #e3e9f0;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(25, 45, 78, 0.035);
    box-sizing: border-box;
  }

  .psai-indicator-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 25px;
    width: 25px;
    height: 25px;
    border-radius: 8px;
    background: #fff0ed;
    border: 1px solid #f7dcd6;
    color: #ba5145;
    font-size: 14px;
    font-weight: 800;
    line-height: 1;
  }

  .psai-indicator-card p {
    flex: 1;
    min-width: 0;
    margin: 0;
    color: #42536b;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.65;
    overflow-wrap: anywhere;
  }

  .psai-no-indicators {
    color: #718198;
    font-size: 13px;
    line-height: 1.6;
  }

  /*
   * ----------------------------------------------------------
   * PREMIUM ANALYSIS SUMMARY TYPOGRAPHY
   * ----------------------------------------------------------
   */

  .psai-summary-executive-text,
  .psai-summary-meaning-text,
  .psai-recommendation-text {
    margin: 0;
    color: #344861;
    font-size: 15px;
    font-weight: 650;
    line-height: 1.75;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .psai-summary-executive-text {
    margin-top: 12px;
  }

  .psai-summary-meaning-text {
    margin-top: 9px;
  }

  .psai-recommendation-section {
    padding: 24px;
  }

  .psai-recommendation-label {
    display: block;
    margin-bottom: 15px;
    color: #435e95;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.09em;
    line-height: 1.5;
    text-transform: uppercase;
  }

  .psai-recommendation-text + .psai-recommendation-text {
    margin-top: 14px;
  }

  /*
   * ----------------------------------------------------------
   * OUTSTANDING ISSUES
   * ----------------------------------------------------------
   */

  .psai-outstanding-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
    margin-top: 16px;
  }

  .psai-outstanding-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 15px;
    border: 1px solid #e5eaf2;
    border-radius: 12px;
    background: #ffffff;
    box-sizing: border-box;
  }

  .psai-outstanding-dot {
    flex: 0 0 22px;
    height: 22px;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #f4dbd8;
    border-radius: 50%;
    background: #fff3f1;
    color: #ba5145;
    font-size: 13px;
    font-weight: 800;
  }

  .psai-outstanding-item p {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.65;
    color: #40526b;
    overflow-wrap: anywhere;
  }

  /*
   * ----------------------------------------------------------
   * MOBILE STYLES
   * ----------------------------------------------------------
   */

  @media (max-width: 767px) {
    .psai-desktop-hero,
    .psai-desktop-scope,
    .psai-desktop-documents {
      display: none !important;
    }

    /*
     * COMPACT MOBILE REPORT HEADER
     */

    .psai-mobile-heading {
      display: block !important;
      padding: 0 2px;
      margin: 0 0 12px;
    }

    .psai-mobile-heading-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .psai-mobile-heading-eyebrow {
      display: block;
      color: #64748b;
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .psai-mobile-heading h1 {
      margin: 0;
      font-size: 21px;
      font-weight: 800;
      line-height: 1.2;
      color: #172b4d;
      letter-spacing: -0.035em;
    }

    .psai-mobile-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px 7px;
      margin-top: 7px;
      color: #64748b;
      font-size: 11px;
      line-height: 1.5;
    }

    .psai-mobile-status {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      border-radius: 999px;
      border: 1px solid #c7e8d3;
      background: #eefbf2;
      color: #16713b;
      font-size: 10px;
      font-weight: 750;
      padding: 6px 9px;
      white-space: nowrap;
    }

    .psai-mobile-status.pending {
      background: #fff8e7;
      border-color: #f6dda7;
      color: #9a6700;
    }

    /*
     * FOUR MOBILE METRIC CARDS
     */

    .psai-responsive-metrics {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
      margin-top: 0 !important;
      margin-bottom: 12px !important;
      min-width: 0;
    }

    .psai-responsive-metrics > * {
      min-width: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 12px !important;
    }

    .psai-responsive-metrics > * strong {
      display: block;
      font-size: clamp(17px, 5vw, 23px) !important;
      line-height: 1.25 !important;
      overflow-wrap: anywhere;
      margin-top: 5px;
    }

    .psai-responsive-metrics > * span {
      font-size: 10px !important;
    }

    .psai-responsive-metrics > * p {
      display: none !important;
    }

    /*
     * MOBILE ASSESSMENT SCOPE
     */

    .psai-mobile-scope {
      display: block !important;
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .psai-mobile-scope p {
      color: #475569;
      font-size: 11px;
      line-height: 1.55;
      margin: 0;
    }

    .psai-mobile-scope strong {
      color: #243b53;
    }

    /*
     * MOBILE TABS AND SWIPE INDICATOR
     */

    .psai-tab-navigation {
      position: relative;
      min-width: 0;
    }

    .psai-responsive-tabs {
      display: flex !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scroll-behavior: smooth;
      min-width: 0;
    }

    .psai-responsive-tabs > button {
      flex: 0 0 auto !important;
      white-space: nowrap;
      min-height: 40px;
      font-size: 11px !important;
      padding: 9px 13px !important;
    }

    .psai-mobile-tab-hint {
      display: flex !important;
      justify-content: flex-end;
      align-items: center;
      gap: 7px;
      padding: 8px 4px 12px;
      color: #5475bc;
      font-size: 10px;
      font-weight: 650;
    }

    .psai-mobile-tab-hint-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #eaf1ff;
      color: #275ad4;
      font-size: 17px;
      font-weight: 800;
    }

    .psai-mobile-tab-hint-hidden {
      display: none !important;
    }

    .psai-tab-right-control {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 2px;
      right: 0;
      height: 36px;
      width: 29px;
      z-index: 2;
      border: none;
      border-radius: 0 9px 9px 0;
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.8),
        #ffffff 55%
      );
      color: #2e5cce;
      font-size: 23px;
      font-weight: 800;
      cursor: pointer;
    }

    /*
     * MOBILE DOCUMENT CARDS
     */

    .psai-mobile-documents {
      display: flex !important;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      min-width: 0;
      margin-top: 16px;
    }

    .psai-mobile-document-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      gap: 12px;
      padding: 15px;
      border-radius: 14px;
      border: 1px solid #e0e7f0;
      background: #ffffff;
      box-shadow: 0 3px 10px rgba(24,44,74,0.04);
    }

    .psai-mobile-document-heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 9px;
    }

    .psai-mobile-document-identity {
      display: flex;
      min-width: 0;
      flex: 1;
      gap: 10px;
      align-items: flex-start;
    }

    .psai-mobile-document-number {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      height: 26px;
      min-width: 26px;
      border-radius: 8px;
      background: #eef3ff;
      color: #3564d9;
      font-size: 11px;
      font-weight: 800;
    }

    .psai-mobile-document-name {
      min-width: 0;
      flex: 1;
    }

    .psai-mobile-document-name h3 {
      margin: 0;
      color: #203452;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.4;
    }

    .psai-mobile-document-name p {
      margin: 5px 0 0;
      color: #718198;
      font-size: 11px;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .psai-mobile-document-confidence {
      flex-shrink: 0;
      color: #3156aa;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.3;
    }

    .psai-mobile-document-confidence small {
      display: block;
      color: #8190a2;
      font-size: 9px;
      font-weight: 500;
      text-align: right;
      margin-bottom: 2px;
    }

    .psai-mobile-document-status {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
    }

    .psai-mobile-document-status span {
      font-size: 10px;
      font-weight: 750;
      border-radius: 999px;
      padding: 6px 9px;
      background: #fff1ef;
      color: #c34a43;
      border: 1px solid #fbd9d4;
    }

    .psai-mobile-document-status span.reviewed {
      color: #236c51;
      background: #eef9f3;
      border-color: #d5eddf;
    }

    .psai-mobile-document-reference {
      color: #8491a3;
      font-size: 10px;
      overflow-wrap: anywhere;
    }

    .psai-mobile-view-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 43px;
      border-radius: 10px;
      border: 1px solid #2e60db;
      background: #2f66eb;
      color: #ffffff;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
    }

    .psai-mobile-view-button:active {
      background: #1947b6;
    }

    .psai-mobile-document-note {
      margin-top: 14px !important;
      padding: 12px !important;
    }

    .psai-mobile-document-note p {
      font-size: 11px;
    }

    /*
     * PREMIUM INDICATOR CARD MOBILE SPACING
     */

    .psai-indicator-list {
      gap: 10px;
      margin-top: 12px;
    }

    .psai-indicator-card {
      padding: 12px;
      gap: 11px;
      border-radius: 11px;
    }

    .psai-indicator-icon {
      flex-basis: 23px;
      width: 23px;
      height: 23px;
    }

    .psai-indicator-card p {
      font-size: 12px;
      line-height: 1.65;
      font-weight: 500;
    }

    /*
     * SUMMARY TYPOGRAPHY CONSISTENCY
     *
     * Identical paragraph styling for:
     * Executive Assessment
     * What This Means for You
     * Recommended Next Steps
     */

    .psai-summary-executive-text,
    .psai-summary-meaning-text,
    .psai-recommendation-text {
      font-size: 14px !important;
      line-height: 1.7 !important;
      font-weight: 650 !important;
      color: #344861 !important;
      letter-spacing: 0 !important;
    }

    .psai-recommendation-section {
      padding: 18px 15px;
    }

    /*
     * COMPACT MOBILE BOTTOM BUTTONS
     */

    .psai-mobile-actions {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      gap: 10px !important;
      width: 100% !important;
    }

    .psai-mobile-actions-right {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      flex-wrap: nowrap !important;
      gap: 10px !important;
      width: 100% !important;
      flex: 0 0 auto !important;
      min-height: 0 !important;
    }

    .psai-mobile-actions > button,
    .psai-mobile-actions-right > button {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 46px !important;
      min-height: 46px !important;
      max-height: 46px !important;
      flex: 0 0 46px !important;
      align-self: stretch !important;
      margin: 0 !important;
      padding: 0 14px !important;
      box-sizing: border-box !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      white-space: normal !important;
      cursor: pointer !important;
    }
  }

  /*
   * ----------------------------------------------------------
   * VERY SMALL SCREENS
   * ----------------------------------------------------------
   */

  @media (max-width: 360px) {
    .psai-mobile-heading h1 {
      font-size: 19px;
    }

    .psai-responsive-metrics {
      gap: 7px !important;
    }

    .psai-responsive-metrics > * {
      padding: 10px !important;
    }

    .psai-mobile-document-card {
      padding: 12px;
    }

    .psai-mobile-document-confidence {
      font-size: 13px;
    }
  }
`;

/*
 * ============================================================
 * MAIN REPORT
 * ============================================================
 */

function EssentialReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationId =
    searchParams.get("id") || "";

  const [
    verification,
    setVerification,
  ] = useState<VerificationRecord | null>(null);

  const [
    payment,
    setPayment,
  ] = useState<PaymentRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState<Tab>("documents");

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState<PackageDocument | null>(null);

  const [selectedIndex, setSelectedIndex] =
    useState(-1);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [
    previewError,
    setPreviewError,
  ] = useState("");

  const previewRequestId = useRef(0);

  /*
   * MOBILE TAB SCROLL STATE
   */

  const tabNavRef =
    useRef<HTMLElement | null>(null);

  const [canScrollTabsRight, setCanScrollTabsRight] =
    useState(false);

  const [canScrollTabsLeft, setCanScrollTabsLeft] =
    useState(false);

  /*
   * ==========================================================
   * LOAD VERIFICATION
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadResult() {
      setLoading(true);
      setError("");
      setVerification(null);

      const numericId = Number(verificationId);

      if (
        !verificationId ||
        !Number.isSafeInteger(numericId) ||
        numericId <= 0
      ) {
        if (mounted) {
          setError(
            "A valid verification ID is required.",
          );
          setLoading(false);
        }

        return;
      }

      try {
        const {
          data,
          error: dbError,
        } = await supabase
          .from("verifications")
          .select(
            "id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings",
          )
          .eq("id", numericId)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!data) {
          throw new Error(
            "Verification record not found.",
          );
        }

        const { data: paymentData } =
          await supabase
            .from("payments")
            .select(
              "plan,status,amount,paid_at",
            )
            .eq(
              "verification_id",
              numericId,
            )
            .order(
              "created_at",
              { ascending: false },
            )
            .limit(1)
            .maybeSingle();

        if (!mounted) return;

        setVerification(
          data as VerificationRecord,
        );

        setPayment(
          (paymentData || null) as
            PaymentRecord | null,
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "The verification result could not be loaded.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadResult();

    return () => {
      mounted = false;
    };
  }, [verificationId]);

  /*
   * ==========================================================
   * RESPONSIVE TAB SCROLL DETECTION
   * ==========================================================
   */

  useEffect(() => {
    const nav = tabNavRef.current;

    if (!nav) return;

    function updateTabScroll() {
      if (!nav) return;

      const remaining =
        nav.scrollWidth -
        nav.clientWidth -
        nav.scrollLeft;

      setCanScrollTabsRight(
        remaining > 5,
      );

      setCanScrollTabsLeft(
        nav.scrollLeft > 5,
      );
    }

    updateTabScroll();

    nav.addEventListener(
      "scroll",
      updateTabScroll,
      { passive: true },
    );

    window.addEventListener(
      "resize",
      updateTabScroll,
    );

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateTabScroll)
        : null;

    observer?.observe(nav);

    return () => {
      nav.removeEventListener(
        "scroll",
        updateTabScroll,
      );

      window.removeEventListener(
        "resize",
        updateTabScroll,
      );

      observer?.disconnect();
    };
  }, [loading, verification]);

  function scrollTabsRight() {
    const nav = tabNavRef.current;

    if (!nav) return;

    nav.scrollBy({
      left: Math.max(
        140,
        nav.clientWidth * 0.65,
      ),
      behavior: "smooth",
    });
  }

  function selectTab(tab: Tab) {
    setActiveTab(tab);

    const nav = tabNavRef.current;

    if (!nav) return;

    const buttons =
      nav.querySelectorAll("button[data-report-tab]");

    const matchingButton = Array.from(
      buttons,
    ).find(
      (button) =>
        button.getAttribute("data-report-tab") === tab,
    );

    if (matchingButton) {
      matchingButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  /*
   * ==========================================================
   * SAVED REPORT DATA
   * ==========================================================
   */

  const findings = useMemo(
    () =>
      asRecord(
        verification?.findings,
      ),
    [verification],
  );

  const essential = useMemo(
    () =>
      asRecord(
        findings.essential,
      ),
    [findings],
  );

  const documents = useMemo(
    () =>
      verification
        ? getPackageDocuments(
            findings,
            verification,
          )
        : [],
    [findings, verification],
  );

  const gpsAnalysis = useMemo(
    () => asRecord(firstValue(essential.gps_analysis, findings.gps_analysis)),
    [essential, findings],
  );

  const checks = useMemo(
    () =>
      normalizeChecks(
        firstValue(
          essential.checks,
          essential.verification_checks,
          findings.checks,
        ),
      ),
    [essential, findings],
  );

  const propertyDetails = useMemo(
    () =>
      getPropertyDetails(
        findings,
        documents,
      ),
    [findings, documents],
  );

  const trustScore = scoreValue(
    essential.trust_score,
    findings.trust_score,
    verification?.trust_score,
  );

  const confidence = scoreValue(
    essential.confidence,
    findings.confidence,
    verification?.confidence,
  );

  const risk = normalizeRisk(
    firstValue(
      essential.risk,
      findings.risk,
      verification?.risk,
    ),
  );

  const storedReviewStatus =
    stringValue(
      essential.review_status,
      findings.review_status,
    ).toLowerCase();

  const hasFlaggedChecks =
    CHECK_KEYS.some(
      (key) => checks[key] === false,
    );

  const hasAnyChecks =
    CHECK_KEYS.some(
      (key) => checks[key] !== null,
    );

  const completed =
    verification?.status === "processed" ||
    stringValue(
      nested(
        findings,
        "processing",
        "stage",
      ),
    ) === "complete";

  const packageStatus =
    storedReviewStatus === "flagged" ||
    risk === "High" ||
    hasFlaggedChecks
      ? "Flagged"
      : storedReviewStatus === "verified"
        ? "AI Reviewed"
        : completed && hasAnyChecks
          ? "AI Reviewed"
          : completed
            ? "Processed"
            : "Pending";

  const packageSummary = stringValue(
    essential.executive_summary,
    essential.summary,
    findings.executive_summary,
    findings.summary,
  );

  const documentSummaries =
    documents
      .map(
        (document) =>
          stringValue(
            document.summary,
          ),
      )
      .filter(Boolean);

  const manipulationIndicators =
    Array.from(
      new Set(
        documents.flatMap(
          (document) =>
            textArray(
              document.manipulationIndicators,
            ),
        ),
      ),
    );

  /*
   * OUTSTANDING ISSUES
   *
   * We keep this section.
   *
   * Key Findings is no longer presented as a separate
   * duplicate section in Analysis Summary.
   */

  const savedOutstandingIssues =
    textArray(
      firstValue(
        essential.outstanding_issues,
        findings.outstanding_issues,
        findings.issues,
      ),
    );

  const outstandingIssues =
    savedOutstandingIssues.length > 0
      ? savedOutstandingIssues
      : manipulationIndicators;

  const knowledgeUnderstanding =
    asRecord(
      firstValue(
        essential.documentUnderstanding,
        findings.documentUnderstanding,
        essential.document_understanding,
        findings.document_understanding,
      ),
    ) as DocumentUnderstanding;

  const understandingSections: Array<{
    label: string;
    values: string[];
  }> = [
    {
      label: "Observed Fields",
      values: textArray(
        knowledgeUnderstanding.observedFields,
      ),
    },
    {
      label: "Reference Structure",
      values: textArray(
        knowledgeUnderstanding.referenceStructure,
      ),
    },
    {
      label: "Terminology",
      values: textArray(
        knowledgeUnderstanding.terminology,
      ),
    },
    {
      label: "Missing or Unclear Fields",
      values: textArray(
        knowledgeUnderstanding.missingOrUnclearFields,
      ),
    },
    {
      label: "Understanding Notes",
      values: textArray(
        knowledgeUnderstanding.notes,
      ),
    },
  ];

  const hasKnowledgeUnderstanding =
    understandingSections.some(
      (section) =>
        section.values.length > 0,
    );

  const completedAt = stringValue(
    essential.completed_at,
    essential.completedAt,
  );

  const availablePropertyDetails =
    propertyDetails.filter(
      (item) =>
        item.source !== "unavailable",
    );

  const missingPropertyDetails =
    propertyDetails.filter(
      (item) =>
        item.source === "unavailable",
    );

  /*
   * ==========================================================
   * DOCUMENT PREVIEW
   * ==========================================================
   */

  async function openDocument(
    document: PackageDocument,
    index: number,
  ) {
    const requestId =
      ++previewRequestId.current;

    setSelectedDocument(document);
    setSelectedIndex(index);
    setPreviewUrl("");
    setPreviewError("");
    setPreviewLoading(true);

    try {
      const path =
        stringValue(
          document.path,
        );

      const storagePath =
        getStorageObjectPath(path);

      if (storagePath) {
        const {
          data,
          error: storageError,
        } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(
            storagePath,
            3600,
          );

        if (storageError) {
          throw storageError;
        }

        if (!data?.signedUrl) {
          throw new Error(
            "Secure preview URL unavailable.",
          );
        }

        if (
          requestId ===
          previewRequestId.current
        ) {
          setPreviewUrl(
            data.signedUrl,
          );
        }

        return;
      }

      if (/^https?:\/\//i.test(path)) {
        if (
          requestId ===
          previewRequestId.current
        ) {
          setPreviewUrl(path);
        }

        return;
      }

      throw new Error(
        "Document file location unavailable.",
      );
    } catch (err) {
      if (
        requestId ===
        previewRequestId.current
      ) {
        setPreviewError(
          err instanceof Error
            ? err.message
            : "Document preview could not be loaded.",
        );
      }
    } finally {
      if (
        requestId ===
        previewRequestId.current
      ) {
        setPreviewLoading(false);
      }
    }
  }

  function closeDocument() {
    ++previewRequestId.current;

    setSelectedDocument(null);
    setSelectedIndex(-1);
    setPreviewUrl("");
    setPreviewError("");
    setPreviewLoading(false);
  }

  function downloadReport() {
    window.open(
      `/api/report?id=${encodeURIComponent(
        String(
          verification?.id ||
          verificationId,
        ),
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/result"
      >
        <div className={styles.loadingPage}>
          <div className={styles.loadingCard}>
            <div
              className={styles.loadingSpinner}
            />

            <h2>
              Loading verification result
            </h2>

            <p>
              Retrieving your saved PropertySure AI analysis...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error || !verification) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/result"
      >
        <div className={styles.errorPage}>
          <div className={styles.errorCard}>
            <h2>
              Unable to load result
            </h2>

            <p>
              {error ||
                "Verification record unavailable."}
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                router.push("/dashboard")
              }
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  /*
   * ==========================================================
   * PAGE CONTENT
   * ==========================================================
   */

  return (
    <AppShell
      activePath="/verify"
      headerPath="/result"
    >
      <style>
        {RESPONSIVE_CSS}
      </style>

      <main className={styles.resultPage}>

        {/* ==================================================
            DESKTOP HEADER
           ================================================== */}

        <div className="psai-desktop-hero">
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div
                className={styles.completeBadge}
              >
                {completed
                  ? "ESSENTIAL ANALYSIS COMPLETED"
                  : "ESSENTIAL ANALYSIS PENDING"}
              </div>

              <h1>
                Property Verification Report
              </h1>

              <p>
                AI document assessment by PropertySure AI.
              </p>

              <p className={styles.heroSubtext}>
                Review document findings, combined
                verification checks, extracted property
                information, and recommended next steps.
              </p>

              <div className={styles.heroMeta}>
                <div
                  className={styles.heroMetaItem}
                >
                  <div>
                    <small>
                      Verification ID
                    </small>

                    <strong>
                      #{verification.id}
                    </strong>
                  </div>
                </div>

                <div
                  className={styles.heroMetaItem}
                >
                  <div>
                    <small>Plan</small>
                    <strong>Essential</strong>
                  </div>
                </div>

                <div
                  className={styles.heroMetaItem}
                >
                  <div>
                    <small>Documents</small>

                    <strong>
                      {documents.length}
                    </strong>
                  </div>
                </div>

                <div
                  className={styles.heroMetaItem}
                >
                  <div>
                    <small>
                      Analysis Completed
                    </small>

                    <strong>
                      {formatDate(completedAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ==================================================
            MOBILE HEADER
           ================================================== */}

        <header className="psai-mobile-heading">
          <div className="psai-mobile-heading-top">
            <div>
              <span className="psai-mobile-heading-eyebrow">
                PropertySure AI
              </span>

              <h1>
                Verification Results
              </h1>
            </div>

            <span
              className={`psai-mobile-status ${
                !completed ? "pending" : ""
              }`}
            >
              {completed
                ? "Completed"
                : "Pending"}
            </span>
          </div>

          <div className="psai-mobile-meta">
            <span>Essential</span>
            <span>•</span>

            <span>
              Report #{verification.id}
            </span>

            <span>•</span>

            <span>
              {documents.length} document
              {documents.length === 1
                ? ""
                : "s"}
            </span>
          </div>
        </header>

        {/* ==================================================
            FOUR METRIC CARDS
           ================================================== */}

        <section
          className={`${styles.metricsGrid} psai-responsive-metrics`}
          aria-label="Verification metrics"
        >
          <Metric
            label="Trust Score"
            value={
              trustScore !== null
                ? `${trustScore} / 100`
                : "—"
            }
            description="AI-derived document assessment score."
            tone={
              risk === "High"
                ? "warning"
                : "green"
            }
          />

          <Metric
            label="AI Confidence"
            value={
              confidence !== null
                ? `${confidence}%`
                : "—"
            }
            description="Confidence in the analysis, not proof of authenticity."
          />

          <Metric
            label="Overall Risk"
            value={risk}
            description="Combined risk assessment of the submitted documents."
            tone={
              risk === "High"
                ? "warning"
                : "blue"
            }
          />

          <Metric
            label="Package Status"
            value={packageStatus}
            description="AI review status, not government verification."
            tone={
              packageStatus === "Flagged"
                ? "warning"
                : "green"
            }
          />
        </section>

        {/* ==================================================
            VERIFICATION SCOPE — DESKTOP
           ================================================== */}

        <div className="psai-desktop-scope">
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span>!</span>

              <div>
                <h2>
                  Verification Scope
                </h2>

                <p>
                  Essential AI Document Assessment
                </p>
              </div>
            </div>

            <p>
              This report is an AI assessment of submitted
              documents. It does not independently confirm
              government issuance, ownership, title validity,
              registry records, or the legal right to sell.
            </p>

            <p>
              <strong>
                Authenticity status:
              </strong>{" "}
              {titleCase(
                stringValue(
                  essential.authenticity_status,
                ) ||
                  "not_independently_verified",
              )}
            </p>

            <p>
              Potential manipulation indicators are
              observations requiring further review,
              not confirmed forgery.
            </p>
          </section>
        </div>

        {/* ==================================================
            VERIFICATION SCOPE — MOBILE
           ================================================== */}

        <div className="psai-mobile-scope">
          <p>
            <strong>
              AI document assessment only.
            </strong>{" "}
            Authenticity and ownership have not
            been independently verified. Flagged
            indicators require further review and
            do not establish fraud.
          </p>
        </div>

        {/* ==================================================
            REPORT NAVIGATION — WITH SWIPE HINT
           ================================================== */}

        <div className="psai-tab-navigation">
          <nav
            ref={tabNavRef}
            className={`${styles.tabs} psai-responsive-tabs`}
            aria-label="Report sections"
          >
            <button
              type="button"
              data-report-tab="documents"
              className={
                activeTab === "documents"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                selectTab("documents")
              }
            >
              Document Results
            </button>

            <button
              type="button"
              data-report-tab="checks"
              className={
                activeTab === "checks"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                selectTab("checks")
              }
            >
              Verification Checks
            </button>

            <button
              type="button"
              data-report-tab="property"
              className={
                activeTab === "property"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                selectTab("property")
              }
            >
              Property Details
            </button>

            <button
              type="button"
              data-report-tab="gps"
              className={activeTab === "gps" ? styles.activeTab : ""}
              onClick={() => selectTab("gps")}
            >
              GPS Analysis
            </button>

            <button
              type="button"
              data-report-tab="summary"
              className={
                activeTab === "summary"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                selectTab("summary")
              }
            >
              Analysis Summary
            </button>
          </nav>

          {canScrollTabsRight && (
            <button
              type="button"
              className="psai-tab-right-control"
              aria-label="Show more report sections"
              onClick={scrollTabsRight}
            >
              ›
            </button>
          )}

          <div
            className={
              canScrollTabsRight
                ? "psai-mobile-tab-hint"
                : "psai-mobile-tab-hint psai-mobile-tab-hint-hidden"
            }
          >
            <span>
              Swipe left to explore more sections
            </span>

            <span
              className="psai-mobile-tab-hint-icon"
              aria-hidden="true"
            >
              →
            </span>
          </div>

          {canScrollTabsLeft &&
            !canScrollTabsRight && (
              <div className="psai-mobile-tab-hint">
                <span>
                  Swipe right for previous sections
                </span>

                <span
                  className="psai-mobile-tab-hint-icon"
                  aria-hidden="true"
                >
                  ←
                </span>
              </div>
            )}
        </div>

        {/* ==================================================
            TABBED REPORT CONTENT
           ================================================== */}

        <div
          className={styles.tabPanel}
          role="region"
        >

          {/* ================================================
              DOCUMENT RESULTS
             ================================================ */}

          {activeTab === "documents" && (
            <div className={styles.tabPanelContent}>
              <section className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2>
                      Documents Reviewed
                    </h2>

                    <p>
                      Each submitted document has its own
                      assessment. Open View Details for
                      the complete analysis.
                    </p>
                  </div>

                  <strong>
                    {documents.length} document
                    {documents.length === 1
                      ? ""
                      : "s"}
                  </strong>
                </div>

                {documents.length === 0 ? (
                  <div className={styles.emptyState}>
                    No uploaded documents are available.
                  </div>
                ) : (
                  <>
                    {/* DESKTOP DOCUMENT TABLE */}

                    <div className="psai-desktop-documents">
                      <div className={styles.tableWrap}>
                        <table
                          className={styles.documentTable}
                        >
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Document Type</th>
                              <th>Reference</th>
                              <th>AI Confidence</th>
                              <th>Assessment Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {documents.map(
                              (document, index) => {
                                const docConfidence =
                                  scoreValue(
                                    document.ai_confidence,
                                    document.confidence,
                                  );

                                const attentionRequired =
                                  document.assessmentStatus ===
                                  "attention_required";

                                return (
                                  <tr
                                    key={`desktop-${index}`}
                                  >
                                    <td>
                                      {index + 1}
                                    </td>

                                    <td>
                                      <div
                                        className={
                                          styles.documentTypeCell
                                        }
                                      >
                                        <strong>
                                          {documentType(document)}
                                        </strong>

                                        <small
                                          style={{
                                            display: "block",
                                            marginTop: 6,
                                            overflowWrap: "anywhere",
                                          }}
                                        >
                                          {stringValue(
                                            document.name,
                                            document.documentName,
                                          )}
                                        </small>
                                      </div>
                                    </td>

                                    <td>
                                      <span
                                        className={
                                          styles.documentReference
                                        }
                                      >
                                        {documentReference(
                                          document,
                                          index,
                                          verification.id,
                                        )}
                                      </span>
                                    </td>

                                    <td>
                                      {docConfidence !== null
                                        ? `${docConfidence}%`
                                        : "—"}
                                    </td>

                                    <td>
                                      <span
                                        className={`${styles.statusBadge} ${
                                          attentionRequired
                                            ? styles.statusAttention
                                            : styles.statusReviewed
                                        }`}
                                      >
                                        {document.assessmentStatus
                                          ? titleCase(
                                              document.assessmentStatus,
                                            )
                                          : "Not Available"}
                                      </span>
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        className={
                                          styles.viewButton
                                        }
                                        onClick={() =>
                                          void openDocument(
                                            document,
                                            index,
                                          )
                                        }
                                      >
                                        View Details →
                                      </button>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* MOBILE DOCUMENT CARDS */}

                    <div className="psai-mobile-documents">
                      {documents.map(
                        (document, index) => {
                          const docConfidence =
                            scoreValue(
                              document.ai_confidence,
                              document.confidence,
                            );

                          const attentionRequired =
                            document.assessmentStatus ===
                            "attention_required";

                          return (
                            <article
                              className="psai-mobile-document-card"
                              key={`mobile-${index}`}
                            >
                              <div className="psai-mobile-document-heading">
                                <div className="psai-mobile-document-identity">
                                  <span className="psai-mobile-document-number">
                                    {String(
                                      index + 1,
                                    ).padStart(
                                      2,
                                      "0",
                                    )}
                                  </span>

                                  <div className="psai-mobile-document-name">
                                    <h3>
                                      {documentType(document)}
                                    </h3>

                                    <p>
                                      {stringValue(
                                        document.name,
                                        document.documentName,
                                      ) ||
                                        "Property Document"}
                                    </p>
                                  </div>
                                </div>

                                <div className="psai-mobile-document-confidence">
                                  <small>
                                    AI Confidence
                                  </small>

                                  {docConfidence !== null
                                    ? `${docConfidence}%`
                                    : "—"}
                                </div>
                              </div>

                              <div className="psai-mobile-document-status">
                                <span
                                  className={
                                    attentionRequired
                                      ? ""
                                      : "reviewed"
                                  }
                                >
                                  {document.assessmentStatus
                                    ? titleCase(
                                        document.assessmentStatus,
                                      )
                                    : "Not Available"}
                                </span>
                              </div>

                              <div className="psai-mobile-document-reference">
                                Reference:{" "}
                                {documentReference(
                                  document,
                                  index,
                                  verification.id,
                                )}
                              </div>

                              <button
                                type="button"
                                className="psai-mobile-view-button"
                                onClick={() =>
                                  void openDocument(
                                    document,
                                    index,
                                  )
                                }
                              >
                                View Details →
                              </button>
                            </article>
                          );
                        },
                      )}
                    </div>
                  </>
                )}

                <div
                  className="psai-mobile-document-note"
                  style={{
                    marginTop: 20,
                    padding: "14px 18px",
                    background: "#f0f6ff",
                    border: "1px solid #dce8f8",
                    borderRadius: 12,
                    color: "#214c78",
                  }}
                >
                  <strong>
                    Detailed Document Assessments
                  </strong>

                  <p
                    style={{
                      margin: "6px 0 0",
                    }}
                  >
                    Select View Details to preview
                    each document and read its full
                    AI assessment, potential
                    manipulation indicators, and
                    individual verification checks.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* ================================================
              OVERALL VERIFICATION CHECKS
             ================================================ */}

          {activeTab === "checks" && (
            <div className={styles.tabPanelContent}>
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>✓</span>

                  <div>
                    <h2>
                      Overall Package Verification Checks
                    </h2>

                    <p>
                      Combined AI assessment of all{" "}
                      {documents.length} submitted document
                      {documents.length === 1
                        ? ""
                        : "s"}.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 22,
                    padding: "15px 18px",
                    background: "#f0f6ff",
                    border: "1px solid #dce8f8",
                    borderRadius: 12,
                    color: "#214c78",
                  }}
                >
                  <strong>
                    What These Results Represent
                  </strong>

                  <p
                    style={{
                      margin: "7px 0 0",
                    }}
                  >
                    These checks summarize all
                    documents submitted for this
                    verification. They do not
                    represent only one document.
                  </p>

                  <p
                    style={{
                      margin: "9px 0 0",
                    }}
                  >
                    If any document has a flagged
                    check, that check is flagged
                    for the entire package.
                    If none is flagged but at
                    least one result is inconclusive,
                    the combined check is inconclusive.
                  </p>

                  <p
                    style={{
                      margin: "9px 0 0",
                    }}
                  >
                    To identify the document responsible
                    for a finding, select Document
                    Results and click View Details.
                  </p>
                </div>

                <div className={styles.checkList}>
                  {CHECK_KEYS.map((key) => {
                    const value =
                      checks[key];

                    return (
                      <div
                        className={styles.checkRow}
                        key={key}
                      >
                        <div
                          className={`${styles.checkStatus} ${
                            value === true
                              ? styles.checkPassed
                              : value === false
                                ? styles.checkFailed
                                : styles.checkReview
                          }`}
                        >
                          {value === true
                            ? "✓"
                            : value === false
                              ? "!"
                              : "i"}
                        </div>

                        <div className={styles.checkText}>
                          <strong>
                            {CHECK_LABELS[key]}
                          </strong>

                          <p>
                            {value === true
                              ? "No issue was detected across the assessed documents for this check."
                              : value === false
                                ? "At least one document requires attention for this check."
                                : "The available AI assessments do not support a conclusive combined result."}
                          </p>
                        </div>

                        <span
                          className={`${styles.checkBadge} ${
                            value === true
                              ? styles.checkBadgePassed
                              : value === false
                                ? styles.checkBadgeFailed
                                : styles.checkBadgeReview
                          }`}
                        >
                          {checkText(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p
                  style={{
                    marginTop: 20,
                  }}
                >
                  These checks do not replace
                  official property registry searches,
                  legal review, physical inspection,
                  or independent authentication.
                </p>
              </section>
            </div>
          )}

          {/* ================================================
              PROPERTY DETAILS
             ================================================ */}

          {activeTab === "property" && (
            <div className={styles.tabPanelContent}>
              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>⌖</span>

                  <div>
                    <h2>
                      Property Information
                    </h2>

                    <p>
                      Extracted property and document
                      details from the saved
                      verification record.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 18,
                    padding: "13px 16px",
                    background: "#f0f6ff",
                    border: "1px solid #dce9fa",
                    borderRadius: 12,
                    color: "#214c78",
                  }}
                >
                  <strong>
                    Information Source
                  </strong>

                  <p
                    style={{
                      margin: "6px 0 0",
                    }}
                  >
                    These fields come from saved AI
                    extraction, document classification,
                    or other structured verification
                    data. They are not independently
                    verified property facts.
                  </p>
                </div>

                <div className={styles.propertyGrid}>
                  {propertyDetails.map(
                    (detail) => {
                      const missing =
                        detail.source ===
                        "unavailable";

                      return (
                        <div
                          className={
                            styles.propertyGridItem
                          }
                          key={detail.label}
                        >
                          <span>
                            {detail.label}
                          </span>

                          <strong
                            style={{
                              color: missing
                                ? "#8190a2"
                                : "#16385f",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {detail.value}
                          </strong>

                          {!missing && (
                            <small
                              style={{
                                display: "block",
                                marginTop: 8,
                                color: "#697f99",
                                fontSize: 10,
                              }}
                            >
                              Source:{" "}
                              {detail.source}
                            </small>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: "12px 16px",
                    background: "#f8fafc",
                    border: "1px solid #e5ebf3",
                    borderRadius: 10,
                  }}
                >
                  <strong>
                    Data Availability
                  </strong>

                  <p
                    style={{
                      margin: "6px 0 0",
                    }}
                  >
                    {availablePropertyDetails.length} structured
                    field
                    {availablePropertyDetails.length === 1
                      ? ""
                      : "s"}{" "}
                    available;{" "}
                    {missingPropertyDetails.length} field
                    {missingPropertyDetails.length === 1
                      ? ""
                      : "s"}{" "}
                    not available in the saved
                    structured data.
                  </p>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>!</span>

                  <div>
                    <h2>
                      Property Verification Limitations
                    </h2>

                    <p>
                      Essential provides AI document
                      assessment, not independent
                      field verification.
                    </p>
                  </div>
                </div>

                <p>
                  Missing structured property details
                  do not automatically mean that a
                  document is fraudulent. Some
                  details may be missing, unreadable,
                  or unavailable in the saved
                  structured record.
                </p>

                <p>
                  Ownership, title registration,
                  litigation, survey records,
                  planning approvals, and physical
                  location should be independently
                  checked where required.
                </p>
              </section>
            </div>
          )}

          {/* GPS — ONLY NEW TAB; all original tabs untouched */}
          {activeTab === "gps" && (
            <div className={styles.tabPanelContent}>
              <GPSReportSection analysis={gpsAnalysis} />
            </div>
          )}

          {/* ================================================
              ANALYSIS SUMMARY
             ================================================ */}

          {activeTab === "summary" && (
            <div className={styles.tabPanelContent}>

              {/* EXECUTIVE ASSESSMENT */}

              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>▤</span>

                  <div>
                    <h2>
                      Analysis Summary
                    </h2>

                    <p>
                      Consolidated Essential AI
                      document assessment.
                    </p>
                  </div>
                </div>

                <div className={styles.summaryContent}>
                  <div
                    className={
                      styles.summaryAssessmentPremium
                    }
                  >
                    <div
                      className={
                        styles.summaryAssessmentHeader
                      }
                    >
                      <span>
                        EXECUTIVE ASSESSMENT
                      </span>

                      <strong
                        className={riskStyle(risk)}
                      >
                        {risk === "Not Conclusive"
                          ? risk
                          : `${risk} Risk`}
                      </strong>
                    </div>

                    {/*
                     * SAME FONT SIZE AND WEIGHT AS
                     * "WHAT THIS MEANS FOR YOU".
                     */}

                    <p
                      className="psai-summary-executive-text"
                    >
                      {packageSummary ||
                        documentSummaries[0] ||
                        "No saved package summary is available."}
                    </p>

                    <div
                      className={
                        styles.summaryActionMessage
                      }
                    >
                      <span>
                        WHAT THIS MEANS FOR YOU
                      </span>

                      <p
                        className="psai-summary-meaning-text"
                      >
                        {risk === "High"
                          ? "Important warning signs were identified by the AI assessment. Resolve these concerns and complete appropriate independent checks before making payment or relying on the documents."
                          : risk === "Medium"
                            ? "Some matters require clarification before relying on these documents."
                            : risk === "Low"
                              ? "No major issue was identified in the available AI assessment. Independent verification may still be required."
                              : "The available information is insufficient for a conclusive risk assessment."}
                      </p>
                    </div>
                  </div>

                  {/*
                   * KEY FINDINGS REMOVED.
                   *
                   * OUTSTANDING ISSUES BELOW
                   * IS THE SINGLE LIST OF CONCERNS.
                   */}

                  <div
                    className={
                      styles.analysisInsightGrid
                    }
                  >
                    <article
                      className={`${styles.analysisInsightCard} ${
                        risk === "High"
                          ? styles.analysisRiskHigh
                          : risk === "Medium"
                            ? styles.analysisRiskMedium
                            : ""
                      }`}
                    >
                      <span>
                        RISK ASSESSMENT
                      </span>

                      <strong>
                        {risk}
                      </strong>

                      <p>
                        This is the combined AI
                        risk assessment, not
                        independent legal authentication.
                      </p>
                    </article>

                    <article
                      className={
                        styles.analysisInsightCard
                      }
                    >
                      <span>
                        AI CONFIDENCE
                      </span>

                      <strong>
                        {confidence !== null
                          ? `${confidence}%`
                          : "Not Available"}
                      </strong>

                      <p>
                        Confidence measures the engine's
                        confidence in its analysis, not
                        the probability that the
                        property is legitimate.
                      </p>
                    </article>

                    <article
                      className={
                        styles.analysisInsightCard
                      }
                    >
                      <span>
                        DOCUMENTS ANALYZED
                      </span>

                      <strong>
                        {documents.length}
                      </strong>

                      <p>
                        Essential document package.
                      </p>
                    </article>
                  </div>
                </div>
              </section>

              {/* OUTSTANDING ISSUES */}

              <section className={styles.card}>
                <div className={styles.cardTitle}>
                  <span>!</span>

                  <div>
                    <h2>
                      Outstanding Issues
                    </h2>

                    <p>
                      Observations requiring
                      further attention before
                      relying on the documents.
                    </p>
                  </div>
                </div>

                {outstandingIssues.length > 0 ? (
                  <div className="psai-outstanding-list">
                    {outstandingIssues.map(
                      (issue, index) => (
                        <article
                          className="psai-outstanding-item"
                          key={`${index}-${issue}`}
                        >
                          <div
                            className="psai-outstanding-dot"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </div>

                          <p>
                            {issue}
                          </p>
                        </article>
                      ),
                    )}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    No separate outstanding
                    issues were saved.
                  </div>
                )}
              </section>

              {/* DOCUMENT UNDERSTANDING */}

              {hasKnowledgeUnderstanding && (
                <section className={styles.card}>
                  <div className={styles.cardTitle}>
                    <span>◈</span>

                    <div>
                      <h2>
                        Document Understanding
                      </h2>

                      <p>
                        Structural observations informed
                        by available knowledge references.
                      </p>
                    </div>
                  </div>

                  <p>
                    Reference knowledge assists
                    document understanding but
                    does not independently
                    establish authenticity.
                  </p>

                  {understandingSections.map(
                    (section) => {
                      if (
                        section.values.length ===
                        0
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={section.label}
                          style={{
                            marginTop: 16,
                          }}
                        >
                          <h3>
                            {section.label}
                          </h3>

                          <ul
                            style={{
                              paddingLeft: 22,
                            }}
                          >
                            {section.values.map(
                              (value, index) => (
                                <li
                                  key={index}
                                >
                                  {value}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      );
                    },
                  )}
                </section>
              )}

              {/* RECOMMENDED NEXT STEPS */}

              <section
                className={`${styles.card} psai-recommendation-section`}
              >
                <span className="psai-recommendation-label">
                  RECOMMENDED NEXT STEPS
                </span>

                <p className="psai-recommendation-text">
                  Address flagged document irregularities,
                  obtain missing supporting documentation,
                  and independently confirm ownership,
                  title, survey, and property information.
                </p>

                <p className="psai-recommendation-text">
                  For deeper registry, legal, survey,
                  and physical due diligence, consider
                  the Professional or Premium plan
                  according to the verification required.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* ==================================================
            COMPACT MOBILE ACTION BUTTONS
           ================================================== */}

        <section
          className={`${styles.actions} psai-mobile-actions`}
        >
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              router.push("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div
            className={`${styles.actionRight} psai-mobile-actions-right`}
          >
            <button
              type="button"
              className={styles.outlineButton}
              onClick={downloadReport}
            >
              ↓ Download Full Report
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                router.push("/verify")
              }
            >
              + Verify Another Property
            </button>
          </div>
        </section>

        {/* ==================================================
            FOOTER
           ================================================== */}

        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <strong>
              PropertySure AI
            </strong>

            <span>
              Essential AI Document Assessment
            </span>
          </div>

          <div className={styles.footerMeta}>
            <span>
              Verification #{verification.id}
            </span>

            <span>
              Essential Plan
            </span>

            <span>
              {packageStatus}
            </span>

            {payment?.status && (
              <span>
                Payment Status:{" "}
                {titleCase(
                  payment.status,
                )}
              </span>
            )}
          </div>
        </footer>

        {/* ==================================================
            DOCUMENT DETAILS MODAL
           ================================================== */}

        {selectedDocument && (
          <div
            className={styles.modalBackdrop}
            onClick={closeDocument}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-label="Document details"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className={styles.modalHeader}>
                <div>
                  <span>
                    Document Details
                  </span>

                  <h2>
                    {documentType(
                      selectedDocument,
                    )}
                  </h2>

                  <small
                    className={
                      styles.modalReference
                    }
                  >
                    {documentReference(
                      selectedDocument,
                      selectedIndex,
                      verification.id,
                    )}
                  </small>
                </div>

                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={closeDocument}
                  aria-label="Close document preview"
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>

                {/* DOCUMENT PREVIEW */}

                <div
                  className={
                    styles.documentPreviewColumn
                  }
                >
                  <div className={styles.documentPreview}>
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
                          Loading secure document preview...
                        </span>
                      </div>
                    ) : previewError ? (
                      <div
                        className={
                          styles.previewError
                        }
                      >
                        <strong>
                          Preview unavailable
                        </strong>

                        <span>
                          {previewError}
                        </span>
                      </div>
                    ) : previewUrl ? (
                      /\.(jpg|jpeg|png|webp)(\?|$)/i.test(
                        stringValue(
                          selectedDocument.path,
                        ),
                      ) ? (
                        <img
                          src={previewUrl}
                          alt={
                            stringValue(
                              selectedDocument.name,
                            ) ||
                            "Uploaded property document"
                          }
                        />
                      ) : (
                        <iframe
                          src={previewUrl}
                          title="Property document preview"
                        />
                      )
                    ) : (
                      <p>
                        No preview available.
                      </p>
                    )}
                  </div>

                  {/* PREVIOUS / NEXT */}

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
                      disabled={
                        selectedIndex <= 0
                      }
                      onClick={() => {
                        const previous =
                          documents[
                            selectedIndex - 1
                          ];

                        if (previous) {
                          void openDocument(
                            previous,
                            selectedIndex - 1,
                          );
                        }
                      }}
                    >
                      ← Previous
                    </button>

                    <span
                      className={
                        styles.documentCounter
                      }
                    >
                      {selectedIndex + 1} of{" "}
                      {documents.length}
                    </span>

                    <button
                      type="button"
                      className={
                        styles.documentNavButton
                      }
                      disabled={
                        selectedIndex >=
                        documents.length - 1
                      }
                      onClick={() => {
                        const next =
                          documents[
                            selectedIndex + 1
                          ];

                        if (next) {
                          void openDocument(
                            next,
                            selectedIndex + 1,
                          );
                        }
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* DOCUMENT INFORMATION */}

                <div className={styles.modalDetails}>
                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Document Name
                    </span>

                    <strong>
                      {stringValue(
                        selectedDocument.name,
                        selectedDocument.documentName,
                      ) ||
                        "Property Document"}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Document Type
                    </span>

                    <strong>
                      {documentType(
                        selectedDocument,
                      )}
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
                      {scoreValue(
                        selectedDocument.ai_confidence,
                        selectedDocument.confidence,
                      ) !== null
                        ? `${scoreValue(
                            selectedDocument.ai_confidence,
                            selectedDocument.confidence,
                          )}%`
                        : "—"}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Assessment Status
                    </span>

                    <strong>
                      {selectedDocument.assessmentStatus
                        ? titleCase(
                            selectedDocument.assessmentStatus,
                          )
                        : "Not Available"}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Visual Fabrication Risk
                    </span>

                    <strong>
                      {selectedDocument.syntheticDocumentRisk
                        ? titleCase(
                            selectedDocument.syntheticDocumentRisk,
                          )
                        : "Inconclusive"}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.detailItem
                    }
                  >
                    <span>
                      Authenticity
                    </span>

                    <strong>
                      Not Independently Verified
                    </strong>
                  </div>

                  {/* SAVED AI ASSESSMENT */}

                  <div
                    className={
                      styles.detailSummary
                    }
                  >
                    <span>
                      Saved AI Assessment
                    </span>

                    <p>
                      {stringValue(
                        selectedDocument.summary,
                      ) ||
                        "No individual assessment summary available."}
                    </p>
                  </div>

                  {/* ========================================
                      PREMIUM MANIPULATION INDICATORS
                     ======================================== */}

                  {textArray(
                    selectedDocument.manipulationIndicators,
                  ).length > 0 && (
                    <div
                      className={
                        styles.detailSummary
                      }
                    >
                      <span>
                        Potential Manipulation Indicators
                      </span>

                      <p>
                        These are individual AI
                        observations requiring review.
                        They do not independently
                        establish forgery.
                      </p>

                      <PremiumIndicators
                        indicators={textArray(
                          selectedDocument.manipulationIndicators,
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================
                  INDIVIDUAL DOCUMENT CHECKS
                 ============================================ */}

              <div className={styles.modalChecks}>
                <h3>
                  Individual Document Verification Checks
                </h3>

                <p
                  style={{
                    marginBottom: 16,
                  }}
                >
                  These checks apply only to the
                  displayed document. The
                  Verification Checks tab shows
                  combined results for the
                  entire package.
                </p>

                {CHECK_KEYS.map((key) => {
                  const value =
                    documentChecks(
                      selectedDocument,
                    )[key];

                  return (
                    <div
                      className={
                        styles.modalCheckRow
                      }
                      key={key}
                    >
                      <span>
                        {CHECK_LABELS[key]}
                      </span>

                      <strong
                        className={
                          value === true
                            ? styles.modalPass
                            : value === false
                              ? styles.modalFail
                              : styles.modalReview
                        }
                      >
                        {checkText(value)}
                      </strong>
                    </div>
                  );
                })}
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
 * SUSPENSE FALLBACK
 * ============================================================
 */

function EssentialReportFallback() {
  return (
    <AppShell
      activePath="/verify"
      headerPath="/result"
    >
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div
            className={styles.loadingSpinner}
          />

          <h2>
            Loading verification result
          </h2>

          <p>
            Retrieving your completed property analysis...
          </p>
        </div>
      </div>
    </AppShell>
  );
}

/*
 * ============================================================
 * PAGE EXPORT
 * ============================================================
 */

export default function EssentialResultPage() {
  return (
    <Suspense
      fallback={
        <EssentialReportFallback />
      }
    >
      <EssentialReportContent />
    </Suspense>
  );
}
