import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/*
 * ============================================================
 * PROPERTYSURE AI — PROFESSIONAL VERIFICATION ENGINE
 * ============================================================
 *
 * Professional verification:
 *
 * - Multi-document analysis
 * - Cross-document consistency
 * - Ownership/title consistency analysis
 * - Property-information analysis
 * - GPS/location consistency when usable GPS data exists
 * - Structured risk assessment
 * - Professional recommendation
 *
 * IMPORTANT:
 *
 * This engine does NOT independently establish:
 * - government authenticity
 * - legal ownership
 * - registry confirmation
 * - litigation clearance
 * - physical inspection
 * - surveyor certification
 * - legal opinion
 *
 * Those require independent evidence or professional services.
 * ============================================================
 */

type CheckValue = boolean | null;

type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "inconclusive";

type LocationStatus =
  | "consistent"
  | "mismatch"
  | "inconclusive";

type DocumentPackageItem = {
  name?: string;
  path?: string;
  type?: string;
  documentType?: string;
  documentTitleDetected?: string;
  nameDetected?: string;
};

type DocumentChecks = {
  documentStructure: CheckValue;
  dataConsistency: CheckValue;
  signatureValid: CheckValue;
  stampValid: CheckValue;
  noForgery: CheckValue;
  noDuplicate: CheckValue;
  documentCompleteness: CheckValue;
};

type ProfessionalDocumentResult = {
  documentName: string;
  documentType: string;
  documentTitle: string;
  confidence: number;
  professionalStatus:
    | "reviewed"
    | "attention"
    | "inconclusive";
  summary: string;
  keyFindings: string[];
  checks: DocumentChecks;
  ownershipFindings: string[];
  titleFindings: string[];
  propertyFindings: string[];
  locationFindings: string[];
  manipulationIndicators: string[];
};

type CrossDocumentAnalysis = {
  ownerApplicantName: string;
  propertyDescription: string;
  plotBlock: string;
  surveyInformation: string;
  location: string;
  landSize: string;
  titleReferences: string;
  dates: string;
  documentRelationships: string[];
  consistencyStatus:
    | "consistent"
    | "attention"
    | "inconclusive";
  findings: string[];
  discrepancies: string[];
};

type OwnershipTitleAnalysis = {
  ownershipStatus:
    | "consistent"
    | "attention"
    | "inconclusive";

  titleStatus:
    | "consistent"
    | "attention"
    | "inconclusive";

  ownerApplicantName: string;
  ownershipFindings: string[];
  titleFindings: string[];
  outstandingIssues: string[];
};

type PropertyAnalysis = {
  propertyType: string;
  propertyDescription: string;
  location: string;
  landSize: string;
  plotBlock: string;
  surveyInformation: string;
  propertyFindings: string[];
};

type RiskAssessment = {
  documentRisk: RiskLevel;
  ownershipRisk: RiskLevel;
  titleRisk: RiskLevel;
  consistencyRisk: RiskLevel;
  fraudRisk: RiskLevel;
  locationRisk: RiskLevel;
  transactionRisk: RiskLevel;
};

type ProfessionalFindings = {
  document_package?: DocumentPackageItem[];
  document_count?: number;
  checks?: DocumentChecks;

  professional?: {
    plan: "professional";
    completed_at?: string;
    document_results?: ProfessionalDocumentResult[];
    confidence?: number;
    trust_score?: number;
    risk?: RiskLevel;
    summary?: string;
    assessment?: string;
    recommendation?: string;
    cross_document_analysis?: CrossDocumentAnalysis;
    ownership?: OwnershipTitleAnalysis;
    title?: OwnershipTitleAnalysis;
    property?: PropertyAnalysis;
    risk_assessment?: RiskAssessment;
    location?: Record<string, unknown>;
    gps?: Record<string, unknown>;
    scope?: Record<string, unknown>;
    outstanding_issues?: string[];
    next_steps?: string[];
  };

  cross_document_analysis?: CrossDocumentAnalysis;
  ownership?: OwnershipTitleAnalysis;
  title?: OwnershipTitleAnalysis;
  property?: PropertyAnalysis;
  risk_assessment?: RiskAssessment;
  location?: Record<string, unknown>;
  gps?: Record<string, unknown>;

  processing?: {
    stage?: string;
    progress?: number;
    message?: string;
  };
};

type GPSData = {
  latitude: number | null;
  longitude: number | null;
  source: string;
  documentLocation: string;
  detectedLocation: string;
};

const STORAGE_BUCKET = "property-documents";

const EMPTY_CHECKS: DocumentChecks = {
  documentStructure: null,
  dataConsistency: null,
  signatureValid: null,
  stampValid: null,
  noForgery: null,
  noDuplicate: null,
  documentCompleteness: null,
};

/*
 * ============================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured.",
    );
  }

  if (!supabaseSecret) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseSecret,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/*
 * ============================================================
 * JSON RESPONSE HELPERS
 * ============================================================
 */

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    },
  );
}

/*
 * ============================================================
 * GENERAL HELPERS
 * ============================================================
 */

function normalizeMimeType(
  value: unknown,
  fileName?: string,
  fileType?: string,
): string {
  const rawValue =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  const rawFileType =
    typeof fileType === "string"
      ? fileType.trim().toLowerCase()
      : "";

  const rawFileName =
    typeof fileName === "string"
      ? fileName.trim().toLowerCase()
      : "";

  if (
    rawValue === "application/pdf" ||
    rawFileType === "application/pdf"
  ) {
    return "application/pdf";
  }

  if (
    rawValue === "image/jpeg" ||
    rawFileType === "image/jpeg"
  ) {
    return "image/jpeg";
  }

  if (
    rawValue === "image/png" ||
    rawFileType === "image/png"
  ) {
    return "image/png";
  }

  if (
    ["jpeg", "jpg", ".jpeg", ".jpg"].includes(
      rawValue,
    )
  ) {
    return "image/jpeg";
  }

  if (
    ["png", ".png"].includes(rawValue)
  ) {
    return "image/png";
  }

  if (
    ["pdf", ".pdf"].includes(rawValue)
  ) {
    return "application/pdf";
  }

  if (
    rawFileName.endsWith(".jpg") ||
    rawFileName.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (rawFileName.endsWith(".png")) {
    return "image/png";
  }

  if (rawFileName.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (rawFileType.startsWith("image/")) {
    return rawFileType;
  }

  return (
    rawFileType ||
    "application/octet-stream"
  );
}

function resolveStoragePath(
  value: string,
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    const marker =
      "/storage/v1/object/";

    const markerIndex =
      url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return trimmed;
    }

    const remainder =
      url.pathname.slice(
        markerIndex + marker.length,
      );

    const prefixes = [
      "public/",
      "authenticated/",
      "sign/",
      "download/",
    ];

    for (const prefix of prefixes) {
      if (remainder.startsWith(prefix)) {
        return decodeURIComponent(
          remainder.slice(prefix.length),
        );
      }
    }

    return decodeURIComponent(
      remainder,
    );
  } catch {
    return trimmed;
  }
}

function normalizeCheckValue(
  value: unknown,
): CheckValue {
  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  if (
    [
      "passed",
      "pass",
      "true",
      "yes",
      "consistent",
      "match",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "failed",
      "fail",
      "false",
      "no",
      "attention",
      "mismatch",
    ].includes(normalized)
  ) {
    return false;
  }

  return null;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(
  value: unknown,
  fallback = "",
) {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : fallback;
}

function stringArray(
  value: unknown,
  limit = 12,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item === "string",
    )
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean)
    .slice(0, limit);
}

function numberValue(
  value: unknown,
): number | null {
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
    const parsed =
      Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  return null;
}

function firstNumber(
  ...values: unknown[]
): number | null {
  for (const value of values) {
    const number =
      numberValue(value);

    if (number !== null) {
      return number;
    }
  }

  return null;
}

function firstString(
  ...values: unknown[]
): string {
  for (const value of values) {
    const text =
      asString(value);

    if (text) {
      return text;
    }
  }

  return "";
}

function normalizeRisk(
  value: unknown,
): RiskLevel {
  const normalized =
    asString(value)
      .toLowerCase();

  if (
    normalized.includes("high")
  ) {
    return "high";
  }

  if (
    normalized.includes("medium")
  ) {
    return "medium";
  }

  if (
    normalized.includes("low")
  ) {
    return "low";
  }

  return "inconclusive";
}

function normalizeLocationStatus(
  value: unknown,
): LocationStatus {
  const normalized =
    asString(value)
      .toLowerCase();

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

/*
 * ============================================================
 * OPENAI RESPONSE PARSING
 * ============================================================
 */

function extractAIOutputText(
  payload: any,
): string {
  if (
    typeof payload?.output_text ===
      "string" &&
    payload.output_text.trim()
  ) {
    return payload.output_text.trim();
  }

  const output =
    Array.isArray(payload?.output)
      ? payload.output
      : [];

  const parts: string[] = [];

  for (
    const outputItem of output
  ) {
    const content =
      Array.isArray(
        outputItem?.content,
      )
        ? outputItem.content
        : [];

    for (
      const contentItem of content
    ) {
      if (
        typeof contentItem?.text ===
        "string"
      ) {
        parts.push(
          contentItem.text.trim(),
        );
      } else if (
        typeof contentItem?.text
          ?.value === "string"
      ) {
        parts.push(
          contentItem.text.value.trim(),
        );
      }
    }
  }

  return parts
    .filter(Boolean)
    .join("\n")
    .trim();
}

function parseAIJson(
  outputText: string,
) {
  try {
    return JSON.parse(
      outputText,
    );
  } catch {
    const match =
      outputText.match(
        /\{[\s\S]*\}/,
      );

    if (!match) {
      throw new Error(
        "AI returned unreadable Professional verification data.",
      );
    }

    return JSON.parse(
      match[0],
    );
  }
}

async function callOpenAI(
  input: Array<Record<string, unknown>>,
  maxOutputTokens = 5000,
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  const model =
    process.env.OPENAI_DOCUMENT_MODEL ||
    "gpt-5.6";

  const response =
    await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model,

          input: [
            {
              role: "user",
              content: input,
            },
          ],

          max_output_tokens:
            maxOutputTokens,
        }),

        cache: "no-store",
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    console.error(
      "PROFESSIONAL OPENAI ERROR:",
      payload,
    );

    throw new Error(
      payload?.error?.message ||
        "OpenAI Professional verification analysis failed.",
    );
  }

  const outputText =
    extractAIOutputText(
      payload,
    );

  if (!outputText) {
    throw new Error(
      "AI returned no Professional verification result.",
    );
  }

  return parseAIJson(
    outputText,
  );
}

/*
 * ============================================================
 * DOCUMENT ANALYSIS
 * ============================================================
 */

async function analyzeDocument(
  file: Blob,
  fileName: string,
  mimeType: string,
  documentType?: string,
) {
  const bytes =
    Buffer.from(
      await file.arrayBuffer(),
    );

  const actualMimeType =
    normalizeMimeType(
      mimeType,
      fileName,
      file.type,
    );

  const dataUrl =
    `data:${actualMimeType};base64,${bytes.toString("base64")}`;

  const prompt = `
You are PropertySure AI's Professional property-document verification engine.

Analyze the ACTUAL supplied Nigerian property document as part of a professional multi-document property due-diligence workflow.

Document type from package review:
${documentType || "Unknown"}

Inspect for:

- internal consistency
- title and ownership information
- property identifiers
- dates and references
- survey/plot/block information
- location/address
- land size
- signatures and stamps as document-level signals only
- manipulation/fabrication indicators
- contradictions
- document completeness

DO NOT claim:

- government registry confirmation
- legal ownership confirmation
- litigation clearance
- physical inspection
- surveyor certification
- lawyer's legal opinion
- authenticity solely because the document looks official

Return JSON only:

{
  "documentType":"string",
  "documentTitle":"string",
  "confidence":0,
  "summary":"string",
  "professionalStatus":"reviewed",
  "keyFindings":[],
  "ownershipFindings":[],
  "titleFindings":[],
  "propertyFindings":[],
  "locationFindings":[],
  "manipulationIndicators":[],
  "checks":{
    "documentStructure":null,
    "dataConsistency":null,
    "signatureValid":null,
    "stampValid":null,
    "noForgery":null,
    "noDuplicate":null,
    "documentCompleteness":null
  }
}

Rules:

- confidence means confidence in the AI analysis.
- It is NOT probability of authenticity.
- Use null when a check cannot reasonably be assessed.
- Never invent names, dates, locations, plot numbers, title references or land sizes.
- A clean-looking document is NOT proof of authenticity.
`;

  const content:
    Array<Record<string, unknown>> = [
      {
        type: "input_text",
        text: prompt,
      },
    ];

  if (
    actualMimeType ===
    "application/pdf"
  ) {
    content.push({
      type: "input_file",
      filename:
        fileName ||
        "property-document.pdf",
      file_data: dataUrl,
    });
  } else if (
    actualMimeType ===
      "image/jpeg" ||
    actualMimeType ===
      "image/png"
  ) {
    content.push({
      type: "input_image",
      image_url: dataUrl,
      detail: "high",
    });
  } else {
    throw new Error(
      `Unsupported document type: ${mimeType}`,
    );
  }

  const parsed =
    await callOpenAI(
      content,
      3500,
    );

  const rawChecks =
    asRecord(
      parsed.checks,
    );

  const manipulationIndicators =
    stringArray(
      parsed.manipulationIndicators,
    );

  const checks:
    DocumentChecks = {
    documentStructure:
      normalizeCheckValue(
        rawChecks.documentStructure,
      ),

    dataConsistency:
      normalizeCheckValue(
        rawChecks.dataConsistency,
      ),

    signatureValid:
      normalizeCheckValue(
        rawChecks.signatureValid,
      ),

    stampValid:
      normalizeCheckValue(
        rawChecks.stampValid,
      ),

    noForgery:
      normalizeCheckValue(
        rawChecks.noForgery,
      ),

    noDuplicate:
      normalizeCheckValue(
        rawChecks.noDuplicate,
      ),

    documentCompleteness:
      normalizeCheckValue(
        rawChecks.documentCompleteness,
      ),
  };

  if (
    manipulationIndicators.length >
    0
  ) {
    checks.noForgery = false;
  }

  const allChecks =
    Object.values(
      checks,
    );

  const professionalStatus =
    checks.noForgery === false ||
    allChecks.some(
      (value) =>
        value === false,
    )
      ? "attention"
      : allChecks.every(
          (value) =>
            value === null,
        )
        ? "inconclusive"
        : asString(
              parsed.professionalStatus,
            )
              .toLowerCase() ===
            "inconclusive"
          ? "inconclusive"
          : "reviewed";

  return {
    documentName:
      fileName ||
      "Property Document",

    documentType:
      asString(
        parsed.documentType,
        documentType ||
          "Other Property Document",
      ),

    documentTitle:
      asString(
        parsed.documentTitle,
        parsed.documentType ||
          documentType ||
          fileName ||
          "Property Document",
      ),

    confidence:
      clamp(
        Number(
          parsed.confidence,
        ) || 0,
        0,
        100,
      ),

    professionalStatus,

    summary:
      `${asString(
        parsed.summary,
        "Professional document analysis completed.",
      )} This analysis does not independently establish government authenticity or legal ownership.`,

    keyFindings:
      stringArray(
        parsed.keyFindings,
      ),

    ownershipFindings:
      stringArray(
        parsed.ownershipFindings,
      ),

    titleFindings:
      stringArray(
        parsed.titleFindings,
      ),

    propertyFindings:
      stringArray(
        parsed.propertyFindings,
      ),

    locationFindings:
      stringArray(
        parsed.locationFindings,
      ),

    manipulationIndicators,

    checks,
  } as ProfessionalDocumentResult;
}

/*
 * ============================================================
 * PACKAGE ANALYSIS
 * ============================================================
 */

async function analyzePackage(
  documentResults:
    ProfessionalDocumentResult[],
  gps: GPSData,
) {
  const packageData =
    documentResults.map(
      (document) => ({
        documentName:
          document.documentName,

        documentType:
          document.documentType,

        documentTitle:
          document.documentTitle,

        confidence:
          document.confidence,

        professionalStatus:
          document.professionalStatus,

        summary:
          document.summary,

        keyFindings:
          document.keyFindings,

        ownershipFindings:
          document.ownershipFindings,

        titleFindings:
          document.titleFindings,

        propertyFindings:
          document.propertyFindings,

        locationFindings:
          document.locationFindings,

        manipulationIndicators:
          document.manipulationIndicators,

        checks:
          document.checks,
      }),
    );

  const prompt = `
You are PropertySure AI's Professional cross-document property due-diligence engine.

Analyze the following document package as ONE property transaction.

Compare where present:

- owner/applicant names
- property description
- plot/block numbers
- survey information
- location/address
- land size
- title references
- document dates
- relationships between documents
- ownership consistency
- title consistency

GPS information:

${JSON.stringify(
  gps,
  null,
  2,
)}

GPS is only an additional geographic verification signal.

GPS does NOT independently prove:

- authenticity
- ownership
- government issuance
- legal title

If GPS coordinates are unavailable, location status must be inconclusive.

Do not claim:

- government registry confirmation
- legal ownership confirmation
- litigation clearance
- physical inspection
- surveyor certification
- legal opinion

Return JSON only:

{
  "crossDocumentAnalysis":{
    "ownerApplicantName":"string",
    "propertyDescription":"string",
    "plotBlock":"string",
    "surveyInformation":"string",
    "location":"string",
    "landSize":"string",
    "titleReferences":"string",
    "dates":"string",
    "documentRelationships":[],
    "consistencyStatus":"consistent",
    "findings":[],
    "discrepancies":[]
  },

  "ownership":{
    "ownershipStatus":"consistent",
    "titleStatus":"consistent",
    "ownerApplicantName":"string",
    "ownershipFindings":[],
    "titleFindings":[],
    "outstandingIssues":[]
  },

  "property":{
    "propertyType":"string",
    "propertyDescription":"string",
    "location":"string",
    "landSize":"string",
    "plotBlock":"string",
    "surveyInformation":"string",
    "propertyFindings":[]
  },

  "location":{
    "status":"inconclusive",
    "confidence":0,
    "document_location":"string",
    "detected_location":"string",
    "distance_meters":null,
    "discrepancy":"string",
    "message":"string"
  },

  "riskAssessment":{
    "documentRisk":"medium",
    "ownershipRisk":"medium",
    "titleRisk":"medium",
    "consistencyRisk":"medium",
    "fraudRisk":"medium",
    "locationRisk":"medium",
    "transactionRisk":"medium"
  },

  "assessment":"Reviewed",
  "recommendation":"Further Verification Required",
  "summary":"string",
  "outstandingIssues":[],
  "nextSteps":[],
  "confidence":0
}

Allowed assessment values:

- Reviewed
- Attention Required
- Partially Verified
- Pending External Confirmation
- High Risk
- Pending

Allowed recommendation values:

- Proceed
- Proceed With Caution
- Further Verification Required
- Do Not Proceed Until Resolved

Do not invent missing facts.

"Verified" should not be used unless independent verification evidence was actually supplied.
`;

  const parsed =
    await callOpenAI(
      [
        {
          type: "input_text",
          text:
            `${prompt}\n\nDOCUMENT PACKAGE DATA:\n${JSON.stringify(
              packageData,
              null,
              2,
            )}`,
        },
      ],
      6500,
    );

  const cross =
    asRecord(
      parsed.crossDocumentAnalysis,
    );

  const ownership =
    asRecord(
      parsed.ownership,
    );

  const property =
    asRecord(
      parsed.property,
    );

  const location =
    asRecord(
      parsed.location,
    );

  const risks =
    asRecord(
      parsed.riskAssessment,
    );

  const normalizedLocationStatus =
    normalizeLocationStatus(
      location.status,
    );

  const locationResult =
    buildLocationResult(
      gps,
      {
        ...location,
        status:
          normalizedLocationStatus,
      },
    );

  const locationHasGPS =
    gps.latitude !== null &&
    gps.longitude !== null;

  const finalLocationStatus =
    locationHasGPS
      ? normalizedLocationStatus
      : "inconclusive";

  return {
    crossDocumentAnalysis: {
      ownerApplicantName:
        asString(
          cross.ownerApplicantName,
          "Not conclusive",
        ),

      propertyDescription:
        asString(
          cross.propertyDescription,
          "Not conclusive",
        ),

      plotBlock:
        asString(
          cross.plotBlock,
          "Not conclusive",
        ),

      surveyInformation:
        asString(
          cross.surveyInformation,
          "Not conclusive",
        ),

      location:
        asString(
          cross.location,
          "Not conclusive",
        ),

      landSize:
        asString(
          cross.landSize,
          "Not conclusive",
        ),

      titleReferences:
        asString(
          cross.titleReferences,
          "Not conclusive",
        ),

      dates:
        asString(
          cross.dates,
          "Not conclusive",
        ),

      documentRelationships:
        stringArray(
          cross.documentRelationships,
        ),

      consistencyStatus:
        asString(
          cross.consistencyStatus,
        )
          .toLowerCase()
          .includes("attention")
          ? "attention"
          : asString(
                cross.consistencyStatus,
              )
                .toLowerCase()
                .includes(
                  "consistent",
                )
            ? "consistent"
            : "inconclusive",

      findings:
        stringArray(
          cross.findings,
        ),

      discrepancies:
        stringArray(
          cross.discrepancies,
        ),
    } as CrossDocumentAnalysis,

    ownership: {
      ownershipStatus:
        asString(
          ownership.ownershipStatus,
        )
          .toLowerCase()
          .includes("attention")
          ? "attention"
          : asString(
                ownership.ownershipStatus,
              )
                .toLowerCase()
                .includes(
                  "consistent",
                )
            ? "consistent"
            : "inconclusive",

      titleStatus:
        asString(
          ownership.titleStatus,
        )
          .toLowerCase()
          .includes("attention")
          ? "attention"
          : asString(
                ownership.titleStatus,
              )
                .toLowerCase()
                .includes(
                  "consistent",
                )
            ? "consistent"
            : "inconclusive",

      ownerApplicantName:
        asString(
          ownership.ownerApplicantName,
          "Not conclusive",
        ),

      ownershipFindings:
        stringArray(
          ownership.ownershipFindings,
        ),

      titleFindings:
        stringArray(
          ownership.titleFindings,
        ),

      outstandingIssues:
        stringArray(
          ownership.outstandingIssues,
        ),
    } as OwnershipTitleAnalysis,

    property: {
      propertyType:
        asString(
          property.propertyType,
          "Not conclusive",
        ),

      propertyDescription:
        asString(
          property.propertyDescription,
          "Not conclusive",
        ),

      location:
        asString(
          property.location,
          "Not conclusive",
        ),

      landSize:
        asString(
          property.landSize,
          "Not conclusive",
        ),

      plotBlock:
        asString(
          property.plotBlock,
          "Not conclusive",
        ),

      surveyInformation:
        asString(
          property.surveyInformation,
          "Not conclusive",
        ),

      propertyFindings:
        stringArray(
          property.propertyFindings,
        ),
    } as PropertyAnalysis,

    location: {
      ...locationResult,
      status:
        finalLocationStatus,
    },

    riskAssessment: {
      documentRisk:
        normalizeRisk(
          risks.documentRisk,
        ),

      ownershipRisk:
        normalizeRisk(
          risks.ownershipRisk,
        ),

      titleRisk:
        normalizeRisk(
          risks.titleRisk,
        ),

      consistencyRisk:
        normalizeRisk(
          risks.consistencyRisk,
        ),

      fraudRisk:
        normalizeRisk(
          risks.fraudRisk,
        ),

      locationRisk:
        normalizeRisk(
          risks.locationRisk,
        ),

      transactionRisk:
        normalizeRisk(
          risks.transactionRisk,
        ),
    } as RiskAssessment,

    assessment:
      asString(
        parsed.assessment,
        "Pending External Confirmation",
      ),

    recommendation:
      asString(
        parsed.recommendation,
        "Further Verification Required",
      ),

    summary:
      asString(
        parsed.summary,
        "Professional property verification analysis completed.",
      ),

    outstandingIssues:
      stringArray(
        parsed.outstandingIssues,
        20,
      ),

    nextSteps:
      stringArray(
        parsed.nextSteps,
        12,
      ),

    confidence:
      clamp(
        Number(
          parsed.confidence,
        ) || 0,
        0,
        100,
      ),
  };
}

/*
 * ============================================================
 * LOCATION
 * ============================================================
 */

function normalizeGPS(
  findings: ProfessionalFindings,
  body: Record<string, unknown>,
): GPSData {
  const raw =
    asRecord(
      findings.gps ||
        findings.location ||
        findings.professional
          ?.gps ||
        findings.professional
          ?.location,
    );

  const coordinates =
    asRecord(
      raw.coordinates,
    );

  const latitude =
    firstNumber(
      body.latitude,
      body.lat,
      raw.latitude,
      raw.lat,
      raw.gps_latitude,
      coordinates.latitude,
      coordinates.lat,
    );

  const longitude =
    firstNumber(
      body.longitude,
      body.lng,
      body.lon,
      raw.longitude,
      raw.lng,
      raw.lon,
      raw.gps_longitude,
      coordinates.longitude,
      coordinates.lng,
      coordinates.lon,
    );

  return {
    latitude,
    longitude,

    source:
      firstString(
        body.gpsSource,
        raw.source,
        raw.gps_source,
        raw.location_source,
      ) ||
      (
        latitude !== null &&
        longitude !== null
          ? "Recorded GPS coordinates"
          : "No property GPS data recorded"
      ),

    documentLocation:
      firstString(
        body.documentLocation,
        raw.document_location,
        raw.stated_location,
        raw.property_location_from_document,
        raw.document_stated_location,
      ) ||
      "Not available",

    detectedLocation:
      firstString(
        raw.detected_location,
        body.detectedLocation,
        raw.gps_location,
        raw.resolved_location,
        raw.reported_location,
      ) ||
      "Not available",
  };
}

function buildLocationResult(
  gps: GPSData,
  aiLocation: Record<string, unknown>,
): Record<string, unknown> {
  const status =
    normalizeLocationStatus(
      aiLocation.status ||
        aiLocation.location_status ||
        aiLocation.verification_status ||
        aiLocation.consistency,
    );

  const confidence =
    firstNumber(
      aiLocation.confidence,
      aiLocation.location_confidence,
      aiLocation.gps_confidence,
    );

  const distanceMeters =
    firstNumber(
      aiLocation.distance_meters,
      aiLocation.distanceMeters,
      aiLocation.distance,
    );

  const documentLocation =
    firstString(
      aiLocation.document_location,
      aiLocation.stated_location,
      gps.documentLocation,
    ) ||
    "Not available";

  const detectedLocation =
    firstString(
      aiLocation.detected_location,
      aiLocation.gps_location,
      aiLocation.resolved_location,
      gps.detectedLocation,
    ) ||
    "Not available";

  const discrepancy =
    firstString(
      aiLocation.discrepancy,
      aiLocation.location_discrepancy,
      aiLocation.finding,
    );

  return {
    status,

    status_label:
      status === "consistent"
        ? "Location Consistent"
        : status === "mismatch"
          ? "Location Mismatch"
          : "Location Not Conclusive",

    latitude:
      gps.latitude,

    longitude:
      gps.longitude,

    coordinates:
      gps.latitude !== null &&
      gps.longitude !== null
        ? {
            latitude:
              gps.latitude,
            longitude:
              gps.longitude,
          }
        : null,

    document_location:
      documentLocation,

    detected_location:
      detectedLocation,

    confidence,

    distance_meters:
      distanceMeters,

    source:
      gps.source,

    discrepancy,

    message:
      status === "consistent"
        ? "Location information is consistent with the submitted property documents based on the available GPS/location data."
        : status === "mismatch"
          ? discrepancy ||
            "A geographic discrepancy was identified between the available GPS/location information and the submitted property documents."
          : firstString(
              aiLocation.message,
              aiLocation.summary,
              aiLocation.analysis,
            ) ||
            "Property GPS/location information is not yet conclusive from the available verification data.",
  };
}

/*
 * ============================================================
 * CHECKS / SCORE
 * ============================================================
 */

function mergeChecks(
  results: ProfessionalDocumentResult[],
): DocumentChecks {
  if (results.length === 0) {
    return {
      ...EMPTY_CHECKS,
    };
  }

  const keys:
    Array<keyof DocumentChecks> = [
    "documentStructure",
    "dataConsistency",
    "signatureValid",
    "stampValid",
    "noForgery",
    "noDuplicate",
    "documentCompleteness",
  ];

  const merged = {
    ...EMPTY_CHECKS,
  };

  for (const key of keys) {
    const values =
      results.map(
        (result) =>
          result.checks[key],
      );

    if (
      values.some(
        (value) =>
          value === false,
      )
    ) {
      merged[key] = false;
    } else if (
      values.every(
        (value) =>
          value === true,
      )
    ) {
      merged[key] = true;
    } else {
      merged[key] = null;
    }
  }

  return merged;
}

function calculateTrustScore(
  checks: DocumentChecks,
  crossDocumentStatus:
    CrossDocumentAnalysis["consistencyStatus"],
  ownershipStatus:
    OwnershipTitleAnalysis["ownershipStatus"],
  titleStatus:
    OwnershipTitleAnalysis["titleStatus"],
  locationStatus: LocationStatus,
) {
  const values =
    Object.values(
      checks,
    ).filter(
      (
        value,
      ): value is boolean =>
        value !== null,
    );

  const documentScore =
    values.length > 0
      ? (
          values.filter(
            (value) =>
              value === true,
          ).length /
          values.length
        ) *
        100
      : 0;

  const componentScores = [
    documentScore,
  ];

  const addStatus = (
    status: string,
    weight: number,
  ) => {
    if (
      status === "consistent"
    ) {
      componentScores.push(
        100 * weight,
      );
    } else if (
      status === "attention" ||
      status === "mismatch"
    ) {
      componentScores.push(
        35 * weight,
      );
    } else {
      componentScores.push(
        60 * weight,
      );
    }
  };

  addStatus(
    crossDocumentStatus,
    0.2,
  );

  addStatus(
    ownershipStatus,
    0.15,
  );

  addStatus(
    titleStatus,
    0.15,
  );

  addStatus(
    locationStatus,
    0.1,
  );

  const totalWeight =
    1 +
    0.2 +
    0.15 +
    0.15 +
    0.1;

  const weighted =
    componentScores.reduce(
      (
        sum,
        score,
      ) =>
        sum + score,
      0,
    ) / totalWeight;

  return clamp(
    Math.round(weighted),
    0,
    100,
  );
}

function calculateOverallRisk(
  trustScore: number,
  risks: RiskAssessment,
  locationStatus: LocationStatus,
): RiskLevel {
  const values =
    Object.values(
      risks,
    );

  if (
    values.includes("high")
  ) {
    return "high";
  }

  if (
    locationStatus ===
    "mismatch"
  ) {
    return trustScore < 70
      ? "high"
      : "medium";
  }

  if (
    values.includes("medium")
  ) {
    return "medium";
  }

  if (
    values.every(
      (value) =>
        value === "low",
    ) &&
    trustScore >= 85
  ) {
    return "medium";
  }

  return "inconclusive";
}

function buildFinalRisk(
  calculatedOverallRisk: RiskLevel,
  risks: RiskAssessment,
  outstandingIssues: string[],
): RiskLevel {
  if (
    calculatedOverallRisk ===
    "high"
  ) {
    return "high";
  }

  if (
    outstandingIssues.length >
    0
  ) {
    return "medium";
  }

  if (
    Object.values(
      risks,
    ).includes("medium")
  ) {
    return "medium";
  }

  if (
    calculatedOverallRisk ===
    "low"
  ) {
    return "medium";
  }

  return "inconclusive";
}

/*
 * ============================================================
 * ASSESSMENT / RECOMMENDATION
 * ============================================================
 */

function sanitizeAssessment(
  value: string,
) {
  const normalized =
    value.trim().toLowerCase();

  if (
    normalized.includes(
      "high risk",
    )
  ) {
    return "High Risk";
  }

  if (
    normalized.includes(
      "attention",
    )
  ) {
    return "Attention Required";
  }

  if (
    normalized.includes(
      "partial",
    )
  ) {
    return "Partially Verified";
  }

  if (
    normalized.includes(
      "pending",
    )
  ) {
    return "Pending External Confirmation";
  }

  return "Reviewed";
}

function sanitizeRecommendation(
  value: string,
) {
  const normalized =
    value.trim().toLowerCase();

  if (
    normalized.includes(
      "do not proceed",
    )
  ) {
    return "Do Not Proceed Until Resolved";
  }

  if (
    normalized.includes(
      "caution",
    )
  ) {
    return "Proceed With Caution";
  }

  if (
    normalized === "proceed" ||
    normalized.startsWith(
      "proceed ",
    )
  ) {
    return "Proceed";
  }

  return "Further Verification Required";
}

function buildProfessionalSummary(
  assessment: string,
  recommendation: string,
  documentCount: number,
  cross: CrossDocumentAnalysis,
  locationStatus: LocationStatus,
  outstandingIssues: string[],
) {
  const locationText =
    locationStatus ===
    "consistent"
      ? "Available GPS/location information is consistent with the submitted property information."
      : locationStatus ===
          "mismatch"
        ? "A geographic discrepancy was identified and should be reviewed before relying on the property location information."
        : "GPS/location evidence is not conclusive from the available data.";

  return `${assessment}. Professional analysis covered ${documentCount} submitted document${documentCount === 1 ? "" : "s"}, cross-document consistency, ownership/title consistency, property information, and location signals. ${locationText} ${
    cross.discrepancies.length >
    0
      ? `${cross.discrepancies.length} cross-document discrepancy item${
          cross.discrepancies.length ===
          1
            ? ""
            : "s"
        } were identified. `
      : ""
  }${
    outstandingIssues.length >
    0
      ? `${outstandingIssues.length} outstanding issue${
          outstandingIssues.length ===
          1
            ? ""
            : "s"
        } require attention. `
      : ""
  }Recommendation: ${recommendation}. This report does not independently establish government authenticity, legal ownership, registry confirmation, litigation clearance, or physical inspection.`;
}

/*
 * ============================================================
 * POST — RUN PROFESSIONAL VERIFICATION
 * ============================================================
 */

export async function POST(
  request: Request,
) {
  try {
    /*
     * ----------------------------------------------------------
     * 1. READ REQUEST
     * ----------------------------------------------------------
     */

    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const verificationId =
      String(
        body?.verificationId ||
          "",
      ).trim();

    if (!verificationId) {
      return jsonError(
        "Verification ID is required.",
        400,
      );
    }

    /*
     * ----------------------------------------------------------
     * 2. SUPABASE
     * ----------------------------------------------------------
     */

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ----------------------------------------------------------
     * 3. LOAD VERIFICATION
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * DO NOT add created_at or updated_at here.
     *
     * The current PropertySure AI verifications schema used by
     * the status route does not rely on those columns.
     * ----------------------------------------------------------
     */

    const {
      data: verification,
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from("verifications")
        .select(
          "id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings",
        )
        .eq(
          "id",
          verificationId,
        )
        .maybeSingle();

    if (
      verificationError
    ) {
      console.error(
        "PROFESSIONAL VERIFICATION LOAD ERROR:",
        verificationError,
      );

      return jsonError(
        `Verification record could not be loaded: ${verificationError.message}`,
        500,
      );
    }

    if (!verification) {
      console.error(
        "PROFESSIONAL VERIFICATION NOT FOUND:",
        verificationId,
      );

      return jsonError(
        "Verification record was not found.",
        404,
      );
    }

    console.log(
      "PROFESSIONAL VERIFICATION LOADED:",
      {
        verificationId:
          verification.id,

        userId:
          verification.user_id,

        status:
          verification.status,

        document:
          verification.doc_name,
      },
    );

    /*
     * ----------------------------------------------------------
     * 4. CONFIRM PROFESSIONAL PAYMENT
     * ----------------------------------------------------------
     *
     * The status route already confirmed that payment exists.
     *
     * We independently check it here before allowing the
     * Professional engine to run.
     * ----------------------------------------------------------
     */

    const {
      data: payment,
      error:
        paymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id,verification_id,user_id,plan,amount,currency,provider,payment_method,provider_reference,status,paid_at,created_at",
        )
        .eq(
          "verification_id",
          verificationId,
        )
        .eq(
          "provider",
          "paystack",
        )
        .eq(
          "plan",
          "professional",
        )
        .eq(
          "status",
          "paid",
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(1)
        .maybeSingle();

    if (
      paymentError
    ) {
      console.error(
        "PROFESSIONAL PAYMENT LOOKUP ERROR:",
        paymentError,
      );

      return jsonError(
        `Professional payment record could not be checked: ${paymentError.message}`,
        500,
      );
    }

    if (!payment) {
      return jsonError(
        "A confirmed Professional payment is required before verification can begin.",
        402,
      );
    }

    /*
     * ----------------------------------------------------------
     * 5. LOAD DOCUMENT PACKAGE
     * ----------------------------------------------------------
     */

    const storedFindings =
      (verification.findings ||
        {}) as ProfessionalFindings;

    let documentPackage =
      Array.isArray(
        storedFindings.document_package,
      )
        ? storedFindings.document_package
        : [];

    /*
     * FALLBACK:
     *
     * If the package is not stored but the verification itself
     * has a file_url, use that document.
     */

    if (
      documentPackage.length ===
        0 &&
      verification.file_url
    ) {
      documentPackage = [
        {
          name:
            verification.doc_name ||
            "Property Document",

          path:
            verification.file_url,

          type:
            verification.doc_type ||
            "application/pdf",
        },
      ];
    }

    if (
      documentPackage.length ===
      0
    ) {
      return jsonError(
        "No property documents were found for this verification.",
        400,
      );
    }

    /*
     * ----------------------------------------------------------
     * 6. INITIAL PROCESSING STATE
     * ----------------------------------------------------------
     */

    const initialFindings:
      ProfessionalFindings = {
      ...storedFindings,

      document_package:
        documentPackage,

      document_count:
        documentPackage.length,

      processing: {
        stage:
          "professional_document_analysis",

        progress: 15,

        message:
          "Professional AI verification analysis has started.",
      },
    };

    const {
      error:
        initialUpdateError,
    } =
      await supabaseAdmin
        .from("verifications")
        .update({
          status:
            "processing",

          findings:
            initialFindings,
        })
        .eq(
          "id",
          verificationId,
        );

    if (
      initialUpdateError
    ) {
      throw new Error(
        `Professional processing state could not be saved: ${initialUpdateError.message}`,
      );
    }

    /*
     * ----------------------------------------------------------
     * 7. ANALYZE EACH DOCUMENT
     * ----------------------------------------------------------
     */

    const documentResults:
      ProfessionalDocumentResult[] =
      [];

    for (
      let index = 0;
      index <
      documentPackage.length;
      index++
    ) {
      const document =
        documentPackage[index];

      if (!document.path) {
        continue;
      }

      const progress =
        Math.round(
          18 +
            (index /
              documentPackage.length) *
              47,
        );

      await supabaseAdmin
        .from("verifications")
        .update({
          findings: {
            ...initialFindings,

            processing: {
              stage:
                "professional_document_analysis",

              progress,

              message:
                `Professional analysis of document ${
                  index + 1
                } of ${
                  documentPackage.length
                }.`,
            },
          },
        })
        .eq(
          "id",
          verificationId,
        );

      const storagePath =
        resolveStoragePath(
          document.path,
        );

      if (!storagePath) {
        throw new Error(
          `Could not determine the storage path for ${
            document.name ||
            "property document"
          }.`,
        );
      }

      console.log(
        "PROFESSIONAL DOCUMENT DOWNLOAD:",
        {
          verificationId,
          document:
            document.name,
          storagePath,
        },
      );

      const {
        data: fileBlob,
        error:
          downloadError,
      } =
        await supabaseAdmin
          .storage
          .from(
            STORAGE_BUCKET,
          )
          .download(
            storagePath,
          );

      if (
        downloadError ||
        !fileBlob
      ) {
        console.error(
          "PROFESSIONAL DOCUMENT DOWNLOAD ERROR:",
          downloadError,
        );

        throw new Error(
          `Could not retrieve ${
            document.name ||
            "property document"
          } from secure storage.`,
        );
      }

      const actualMimeType =
        normalizeMimeType(
          document.type,
          document.name,
          fileBlob.type,
        );

      const result =
        await analyzeDocument(
          fileBlob,
          document.name ||
            "property-document",
          actualMimeType,
          document.documentType,
        );

      documentResults.push(
        result,
      );
    }

    /*
     * ----------------------------------------------------------
     * 8. MAKE SURE AT LEAST ONE DOCUMENT WAS ANALYZED
     * ----------------------------------------------------------
     */

    if (
      documentResults.length ===
      0
    ) {
      throw new Error(
        "No documents could be analyzed.",
      );
    }

    /*
     * ----------------------------------------------------------
     * 9. GPS
     * ----------------------------------------------------------
     */

    const gps =
      normalizeGPS(
        storedFindings,
        body,
      );

    /*
     * ----------------------------------------------------------
     * 10. SAVE DOCUMENT ANALYSIS
     * ----------------------------------------------------------
     */

    await supabaseAdmin
      .from("verifications")
      .update({
        findings: {
          ...initialFindings,

          professional: {
            plan:
              "professional",

            document_results:
              documentResults,
          },

          processing: {
            stage:
              "cross_document_analysis",

            progress: 70,

            message:
              "Comparing ownership, title, property and location information across the document package.",
          },
        },
      })
      .eq(
        "id",
        verificationId,
      );

    /*
     * ----------------------------------------------------------
     * 11. CROSS-DOCUMENT ANALYSIS
     * ----------------------------------------------------------
     */

    const packageAnalysis =
      await analyzePackage(
        documentResults,
        gps,
      );

    /*
     * ----------------------------------------------------------
     * 12. MERGE CHECKS
     * ----------------------------------------------------------
     */

    const checks =
      mergeChecks(
        documentResults,
      );

    /*
     * ----------------------------------------------------------
     * 13. CONFIDENCE
     * ----------------------------------------------------------
     */

    const confidenceValues =
      documentResults.map(
        (item) =>
          item.confidence,
      );

    const documentConfidence =
      confidenceValues.length >
      0
        ? Math.round(
            confidenceValues.reduce(
              (
                sum,
                value,
              ) =>
                sum + value,
              0,
            ) /
              confidenceValues.length,
          )
        : 0;

    /*
     * ----------------------------------------------------------
     * 14. CORE ANALYSIS OBJECTS
     * ----------------------------------------------------------
     */

    const cross =
      packageAnalysis.crossDocumentAnalysis;

    const ownership =
      packageAnalysis.ownership;

    const property =
      packageAnalysis.property;

    const locationRecord =
      asRecord(
        packageAnalysis.location,
      );

    const locationStatus =
      normalizeLocationStatus(
        locationRecord.status,
      );

    const risks =
      packageAnalysis.riskAssessment;

    /*
     * ----------------------------------------------------------
     * 15. TRUST SCORE
     * ----------------------------------------------------------
     */

    const trustScore =
      calculateTrustScore(
        checks,
        cross.consistencyStatus,
        ownership.ownershipStatus,
        ownership.titleStatus,
        locationStatus,
      );

    /*
     * ----------------------------------------------------------
     * 16. FINAL CONFIDENCE
     * ----------------------------------------------------------
     */

    const confidence =
      Math.round(
        clamp(
          documentConfidence *
              0.65 +
            packageAnalysis.confidence *
              0.35,
          0,
          100,
        ),
      );

    /*
     * ----------------------------------------------------------
     * 17. OUTSTANDING ISSUES
     * ----------------------------------------------------------
     */

    const outstandingIssues = [
      ...packageAnalysis.outstandingIssues,

      ...ownership.outstandingIssues,

      ...cross.discrepancies,

      ...(locationStatus ===
      "mismatch"
        ? [
            asString(
              locationRecord.discrepancy,
              "Property location information requires further review.",
            ),
          ]
        : []),
    ]
      .filter(
        (
          item,
          index,
          array,
        ) =>
          item &&
          array.indexOf(
            item,
          ) === index,
      )
      .slice(0, 20);

    /*
     * ----------------------------------------------------------
     * 18. FINAL RISK
     * ----------------------------------------------------------
     */

    const overallRisk =
      calculateOverallRisk(
        trustScore,
        risks,
        locationStatus,
      );

    const risk =
      buildFinalRisk(
        overallRisk,
        risks,
        outstandingIssues,
      );

    /*
     * ----------------------------------------------------------
     * 19. ASSESSMENT / RECOMMENDATION
     * ----------------------------------------------------------
     */

    const assessment =
      sanitizeAssessment(
        packageAnalysis.assessment,
      );

    const recommendation =
      sanitizeRecommendation(
        packageAnalysis.recommendation,
      );

    /*
     * ----------------------------------------------------------
     * 20. SUMMARY
     * ----------------------------------------------------------
     */

    const summary =
      buildProfessionalSummary(
        assessment,
        recommendation,
        documentPackage.length,
        cross,
        locationStatus,
        outstandingIssues,
      );

    /*
     * ----------------------------------------------------------
     * 21. FINAL FINDINGS
     * ----------------------------------------------------------
     */

    const finalFindings:
      ProfessionalFindings = {
      ...storedFindings,

      document_package:
        documentPackage,

      document_count:
        documentPackage.length,

      checks,

      professional: {
        plan:
          "professional",

        completed_at:
          new Date().toISOString(),

        document_results:
          documentResults,

        confidence,

        trust_score:
          trustScore,

        risk,

        summary,

        assessment,

        recommendation,

        cross_document_analysis:
          cross,

        ownership,

        title:
          ownership,

        property,

        risk_assessment:
          risks,

        location:
          locationRecord,

        gps:
          locationRecord,

        scope: {
          ai_document_analysis:
            "completed",

          cross_document_analysis:
            "completed",

          ownership_consistency_analysis:
            "completed",

          property_information_analysis:
            "completed",

          property_location_gps_analysis:
            gps.latitude !== null &&
            gps.longitude !== null
              ? "completed"
              : "not_conclusive",

          external_registry_search:
            "not_performed",

          physical_property_inspection:
            "not_performed",

          legal_opinion:
            "not_performed",

          government_issuance_confirmation:
            "not_performed",
        },

        outstanding_issues:
          outstandingIssues,

        next_steps:
          packageAnalysis
            .nextSteps.length >
          0
            ? packageAnalysis
                .nextSteps
            : [
                "Resolve outstanding issues identified in the report.",

                "Confirm ownership and title through the relevant land registry or qualified professional.",

                "Complete any required physical inspection or survey confirmation before transaction completion.",
              ],
      },

      cross_document_analysis:
        cross,

      ownership,

      title:
        ownership,

      property,

      risk_assessment:
        risks,

      location:
        locationRecord,

      gps:
        locationRecord,

      processing: {
        stage:
          "complete",

        progress: 100,

        message:
          "Professional property verification analysis completed.",
      },
    };

    /*
     * ----------------------------------------------------------
     * 22. SAVE FINAL RESULT
     * ----------------------------------------------------------
     */

    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from("verifications")
        .update({
          status:
            "processed",

          trust_score:
            trustScore,

          confidence,

          risk,

          findings:
            finalFindings,
        })
        .eq(
          "id",
          verificationId,
        );

    if (
      updateError
    ) {
      console.error(
        "PROFESSIONAL FINAL UPDATE ERROR:",
        updateError,
      );

      throw new Error(
        `Professional verification result could not be saved: ${updateError.message}`,
      );
    }

    /*
     * ----------------------------------------------------------
     * 23. SUCCESS RESPONSE
     * ----------------------------------------------------------
     */

    console.log(
      "PROFESSIONAL VERIFICATION COMPLETED:",
      {
        verificationId,
        documentCount:
          documentPackage.length,
        trustScore,
        confidence,
        risk,
        assessment,
        recommendation,
      },
    );

    return NextResponse.json(
      {
        success: true,

        plan:
          "professional",

        verificationId,

        documentCount:
          documentPackage.length,

        trustScore,

        confidence,

        risk,

        assessment,

        recommendation,

        checks,

        summary,

        location:
          locationRecord,

        crossDocumentAnalysis:
          cross,

        ownership,

        property,

        riskAssessment:
          risks,

        outstandingIssues,

        nextSteps:
          packageAnalysis.nextSteps,

        documentResults,

        scope:
          finalFindings
            .professional
            ?.scope,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error(
      "PROFESSIONAL VERIFICATION ERROR:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Professional verification failed.",
      500,
    );
  }
}