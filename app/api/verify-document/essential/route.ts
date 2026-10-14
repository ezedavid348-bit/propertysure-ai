
/*
 * ============================================================
 * PROPERTYSURE AI — ESSENTIAL VERIFICATION ENGINE
 * File: app/api/verify-document/essential/route.ts
 * ============================================================
 *
 * Essential AI document verification with:
 * - Paid verification validation
 * - Multi-document assessment
 * - Approved knowledge retrieval
 * - Document manipulation analysis
 * - Property and ownership-claim extraction
 * - GPS coordinate extraction
 * - Survey beacon extraction and conversion
 * - Survey boundary reconstruction
 * - Approximate plot dimensions and land-area analysis
 * - Document-to-document geographic comparisons
 * - GPS findings and map data storage
 *
 * IMPORTANT:
 * All GPS and survey findings are based on uploaded
 * documents. They are not independent proof of title,
 * registry records, boundaries, or physical location.
 * ============================================================
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  searchKnowledge,
  type PropertyDocumentType,
} from "@/app/lib/ai";

import {
  analyzeGPSDocuments,
  normalizeGPSCoordinates,
  normalizeDatum,
  normalizeBeaconId,
  isValidUTMZone,
  isValidUTMHemisphere,
  type CoordinateSystem,
  type CoordinateReferenceDetails,
  type ExtractedGPSData,
  type GPSAnalysisResult,
  type SurveyBeacon,
  type UTMCoordinates,
} from "@/app/lib/gps";

export const runtime = "nodejs";

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

type DocumentAssessmentStatus =
  | "no_significant_issues_detected"
  | "attention_required"
  | "inconclusive";

type PropertyDetails = {
  location: string;
  propertyType: string;
  propertyDescription: string;
  plotNumber: string;
  blockNumber: string;
  surveyNumber: string;
  surveyReference: string;
  landSize: string;
};

type DocumentParties = {
  grantor: string;
  grantee: string;
  owner: string;
  holder: string;
  otherParties: string[];
};

type DocumentDates = {
  documentDate: string;
  executionDate: string;
  registrationDate: string;
};

type ExtractedFields = {
  documentTitle: string;
  documentNumber: string;
  issuingAuthority: string;
  propertyDetails: PropertyDetails;
  parties: DocumentParties;
  dates: DocumentDates;
};

type DocumentGPSResult = ExtractedGPSData & {
  referencePointId: string;
  coordinateEvidence: string;
  coordinatesExplicitlyStated: boolean;
  boundarySequenceEvidence: string;
};

type EssentialGPSAnalysis = GPSAnalysisResult & {
  comparisonSafety:
    | "corresponding_reference_points"
    | "reference_points_not_established"
    | "insufficient_coordinates";

  extractionMethod: "ai_document_content";
  assessmentScope: "document_reported_geographic_analysis";
  requiresIndependentSurveyVerification: true;
  documentGPSResults: DocumentGPSResult[];
  surveyDiagnostics: Array<{
    sourceDocument: string;
    beaconCount: number;
    coordinateReferenceEstablished: boolean;
    supportedWGS84UTM: boolean;
    boundarySequenceEstablished: boolean;
    boundarySequenceEvidence: string;
    boundaryStatus: string;
    measurementAvailable: boolean;
    explanation: string;
  }>;
};

type DocumentPackageItem = {
  name?: string;
  path?: string;
  type?: string;
  documentType?: string;
  documentTitleDetected?: string;
  nameDetected?: string;
  [key: string]: unknown;
};

type DocumentAIResult = {
  documentName: string;
  documentType: string;
  documentTitle: string;
  confidence: number;
  summary: string;

  assessmentStatus: DocumentAssessmentStatus;
  authenticityStatus: "not_independently_verified";

  checks: VerificationChecks;

  syntheticDocumentRisk:
    | "low"
    | "medium"
    | "high"
    | "inconclusive";

  manipulationIndicators: string[];

  documentNumber: string;
  issuingAuthority: string;

  propertyDetails: PropertyDetails;
  parties: DocumentParties;
  dates: DocumentDates;
  extractedFields: ExtractedFields;

  propertyLocation: string;
  propertyDescription: string;
  propertyType: string;
  plotNumber: string;
  blockNumber: string;
  surveyReference: string;
  landSize: string;
  ownerName: string;
  holderName: string;

  gps: DocumentGPSResult;
};

type VerificationFindings = {
  [key: string]: unknown;

  document_package?: DocumentPackageItem[];
  document_count?: number;
  checks?: VerificationChecks;

  property?: Record<string, unknown>;
  ownership?: Record<string, unknown>;
  gps_analysis?: EssentialGPSAnalysis;

  essential?: {
    [key: string]: unknown;
    plan: "essential";
    completed_at?: string;
    document_results?: DocumentAIResult[];
    summary?: string;
    gps_analysis?: EssentialGPSAnalysis;
    authenticity_status?: "not_independently_verified";
    verification_scope?: "ai_document_assessment_only";
  };

  processing?: {
    stage?: string;
    progress?: number;
    message?: string;
  };
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

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

/*
 * ============================================================
 * SUPABASE ADMIN
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecret) {
    throw new Error(
      "Supabase server configuration is missing.",
    );
  }

  return createClient(supabaseUrl, supabaseSecret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/*
 * ============================================================
 * GENERAL HELPERS
 * ============================================================
 */

function asObject(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function safeString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function firstString(
  ...values: unknown[]
): string {
  for (const value of values) {
    const result = safeString(value);

    if (result) {
      return result;
    }
  }

  return "";
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 40);
}

function uniqueStrings(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function finiteNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .replace(/,/g, "");

  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(
      cleaned,
    )
  ) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}

function confidenceNumber(
  value: unknown,
): number | null {
  const number = finiteNumber(value);

  return number === null
    ? null
    : Math.round(clamp(number, 0, 100));
}

function normalizeCheckValue(
  value: unknown,
): CheckValue {
  if (value === true) return true;
  if (value === false) return false;

  const text = safeString(value).toLowerCase();

  if (
    ["passed", "pass", "true", "yes"].includes(text)
  ) {
    return true;
  }

  if (
    ["failed", "fail", "false", "no"].includes(text)
  ) {
    return false;
  }

  return null;
}

function normalizeSyntheticRisk(
  value: unknown,
): "low" | "medium" | "high" | "inconclusive" {
  const text = safeString(value).toLowerCase();

  if (
    text === "low" ||
    text === "medium" ||
    text === "high"
  ) {
    return text;
  }

  return "inconclusive";
}

/*
 * ============================================================
 * PROPERTY INFORMATION
 * ============================================================
 */

function normalizePropertyDetails(
  value: unknown,
): PropertyDetails {
  const data = asObject(value);

  return {
    location: firstString(
      data.location,
      data.propertyLocation,
      data.address,
    ),

    propertyType: firstString(
      data.propertyType,
      data.property_type,
    ),

    propertyDescription: firstString(
      data.propertyDescription,
      data.description,
    ),

    plotNumber: firstString(
      data.plotNumber,
      data.plot,
    ),

    blockNumber: firstString(
      data.blockNumber,
      data.block,
    ),

    surveyNumber: firstString(
      data.surveyNumber,
      data.survey_number,
    ),

    surveyReference: firstString(
      data.surveyReference,
      data.survey_number,
      data.surveyNumber,
    ),

    landSize: firstString(
      data.landSize,
      data.land_size,
      data.area,
    ),
  };
}

function normalizeParties(
  value: unknown,
): DocumentParties {
  const data = asObject(value);

  return {
    grantor: firstString(
      data.grantor,
      data.assignor,
    ),

    grantee: firstString(
      data.grantee,
      data.assignee,
    ),

    owner: safeString(data.owner),

    holder: firstString(
      data.holder,
      data.applicant,
    ),

    otherParties: normalizeStringArray(
      data.otherParties,
    ),
  };
}

function normalizeDates(
  value: unknown,
): DocumentDates {
  const data = asObject(value);

  return {
    documentDate: safeString(data.documentDate),
    executionDate: safeString(data.executionDate),
    registrationDate: safeString(data.registrationDate),
  };
}

function normalizeExtractedFields(
  value: unknown,
): ExtractedFields {
  const data = asObject(value);

  return {
    documentTitle: safeString(data.documentTitle),
    documentNumber: safeString(data.documentNumber),
    issuingAuthority: safeString(data.issuingAuthority),

    propertyDetails: normalizePropertyDetails(
      data.propertyDetails,
    ),

    parties: normalizeParties(data.parties),
    dates: normalizeDates(data.dates),
  };
}

/*
 * ============================================================
 * COORDINATE SYSTEM NORMALIZATION
 * ============================================================
 */

function normalizeCoordinateSystem(
  value: unknown,
): CoordinateSystem {
  const text = safeString(value)
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    text === "WGS84" ||
    text === "WGS_84" ||
    text === "WGS_1984"
  ) {
    return "WGS84";
  }

  if (
    text === "MINNA_UTM" ||
    text === "MINNA"
  ) {
    return "MINNA_UTM";
  }

  if (
    text === "UTM" ||
    text === "WGS84_UTM" ||
    text === "WGS_84_UTM"
  ) {
    return "UTM";
  }

  return "UNKNOWN";
}

function normalizeHemisphere(
  value: unknown,
): "N" | "S" | null {
  const text = safeString(value).toUpperCase();

  if (
    text === "N" ||
    text === "NORTH" ||
    text === "NORTHERN"
  ) {
    return "N";
  }

  if (
    text === "S" ||
    text === "SOUTH" ||
    text === "SOUTHERN"
  ) {
    return "S";
  }

  return null;
}

function normalizeUTMZone(
  value: unknown,
): number | null {
  const number = finiteNumber(value);

  return number !== null &&
    Number.isInteger(number) &&
    isValidUTMZone(number)
    ? number
    : null;
}

/*
 * ============================================================
 * DOCUMENT-LEVEL UTM DATA
 * ============================================================
 *
 * This represents an actual document-reported point.
 * The coordinate-reference declaration is stored
 * separately because a survey may identify the CRS
 * without specifying a single representative point.
 * ============================================================
 */

function normalizeUTMCoordinates(
  value: unknown,
): UTMCoordinates | null {
  const data = asObject(value);

  const easting = finiteNumber(data.easting);
  const northing = finiteNumber(data.northing);

  if (
    easting === null ||
    northing === null
  ) {
    return null;
  }

  return {
    easting,
    northing,

    zone: normalizeUTMZone(data.zone),

    hemisphere: normalizeHemisphere(
      data.hemisphere,
    ),

    datum: firstString(
      data.datum,
      data.geodeticDatum,
    ),
  };
}

/*
 * ============================================================
 * COORDINATE REFERENCE EXTRACTION
 * ============================================================
 *
 * IMPORTANT:
 *
 * WGS84 geographic coordinates and WGS84 UTM
 * projected coordinates are different representations.
 *
 * A Survey Plan saying "WGS84 / UTM Zone 31N"
 * must be classified as UTM for its beacon table.
 *
 * A datum reference alone does not establish the
 * UTM zone, projection, or hemisphere.
 * ============================================================
 */

function normalizeCoordinateReference(
  value: unknown,
): CoordinateReferenceDetails | null {
  const data = asObject(value);

  if (Object.keys(data).length === 0) {
    return null;
  }

  let coordinateSystem =
    normalizeCoordinateSystem(
      data.coordinateSystem,
    );

  const datum = safeString(data.datum);
  const projection = safeString(data.projection);

  const utmZone = normalizeUTMZone(
    data.utmZone ?? data.zone,
  );

  const hemisphere = normalizeHemisphere(
    data.hemisphere,
  );

  const epsgCode = safeString(data.epsgCode);
  const evidence = safeString(data.evidence);

  /*
   * "WGS84" describes the datum, whereas "UTM" describes
   * the projected coordinate representation. AI sometimes
   * labels an explicitly documented WGS84 / UTM survey
   * reference as plain WGS84. Correct that classification
   * only when independent structured UTM metadata confirms
   * the projection. Do not infer a zone or hemisphere.
   */
  const projectionIsUTM =
    /\bUTM\b/i.test(projection) ||
    /\bUTM\s*(?:ZONE)?\s*\d{1,2}\s*[NS]\b/i.test(evidence);

  if (
    coordinateSystem === "WGS84" &&
    normalizeDatum(datum) === "WGS84" &&
    projectionIsUTM &&
    isValidUTMZone(utmZone) &&
    isValidUTMHemisphere(hemisphere)
  ) {
    coordinateSystem = "UTM";
  }

  /*
   * Require actual document evidence.
   *
   * The model's boolean assertion alone is not
   * sufficient to establish a source declaration.
   */
  const explicitlyStated =
    data.explicitlyStated === true &&
    evidence.length > 0;

  return {
    coordinateSystem,
    datum,
    projection,
    utmZone,
    hemisphere,
    epsgCode,
    explicitlyStated,
    evidence,
  };
}

/*
 * ============================================================
 * SURVEY BEACON EXTRACTION
 * ============================================================
 *
 * Preserve original easting and northing.
 *
 * An individual beacon may omit its CRS metadata
 * if the Survey Plan declares the CRS for the table.
 *
 * Do not manufacture beacon order.
 * ============================================================
 */

function normalizeSurveyBeacons(
  value: unknown,
  sourceDocument: string,
  reference: CoordinateReferenceDetails | null = null,
): SurveyBeacon[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .slice(0, 40)
    .map((raw) => {
      const item = asObject(raw);

      let system = normalizeCoordinateSystem(
        item.coordinateSystem,
      );

      const hasProjectedPair =
        finiteNumber(item.easting) !== null &&
        finiteNumber(item.northing) !== null;

      /*
       * A beacon with easting/northing belongs to the
       * explicitly declared UTM beacon table even when
       * the model confuses the WGS84 datum for a geographic
       * coordinate system. An explicit incompatible datum
       * must not be silently overridden.
       */
      if (
        hasProjectedPair &&
        reference?.explicitlyStated === true &&
        reference.coordinateSystem === "UTM" &&
        (system === "UNKNOWN" ||
          (system === "WGS84" &&
            normalizeDatum(item.datum) !== "MINNA"))
      ) {
        system = "UTM";
      }

      const pair = normalizeGPSCoordinates(
        item.latitude,
        item.longitude,
      );

      const boundaryOrder = finiteNumber(
        item.boundaryOrder,
      );

      return {
        beaconId: normalizeBeaconId(
          firstString(
            item.beaconId,
            item.beacon,
            item.id,
          ),
        ),

        latitude:
          system === "WGS84" && pair
            ? pair.latitude
            : null,

        longitude:
          system === "WGS84" && pair
            ? pair.longitude
            : null,

        easting: finiteNumber(item.easting),
        northing: finiteNumber(item.northing),

        coordinateSystem: system,
        sourceDocument,

        utmZone: normalizeUTMZone(
          item.utmZone ?? item.zone,
        ),

        hemisphere: normalizeHemisphere(
          item.hemisphere,
        ),

        datum: safeString(item.datum),

        coordinateEvidence: firstString(
          item.coordinateEvidence,
          item.evidence,
        ),

        boundaryOrder:
          boundaryOrder !== null &&
          Number.isInteger(boundaryOrder) &&
          boundaryOrder >= 1
            ? boundaryOrder
            : null,
      };
    })
    .filter((beacon) => beacon.beaconId !== "");
}

/*
 * ============================================================
 * LAND AREA NORMALIZATION
 * ============================================================
 */

type LandAreaUnit =
  | "sqm"
  | "hectares"
  | "acres"
  | "sqft"
  | "unknown";

function normalizeLandAreaUnit(
  value: unknown,
): LandAreaUnit {
  const text = safeString(value)
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (
    [
      "sqm",
      "sq m",
      "m2",
      "m²",
      "square metre",
      "square metres",
      "square meter",
      "square meters",
    ].includes(text)
  ) {
    return "sqm";
  }

  if (
    [
      "ha",
      "hectare",
      "hectares",
    ].includes(text)
  ) {
    return "hectares";
  }

  if (
    [
      "acre",
      "acres",
    ].includes(text)
  ) {
    return "acres";
  }

  if (
    [
      "sqft",
      "sq ft",
      "ft2",
      "ft²",
      "square feet",
      "square foot",
    ].includes(text)
  ) {
    return "sqft";
  }

  return "unknown";
}

/*
 * ============================================================
 * NORMALIZE DOCUMENT GPS EXTRACTION
 * ============================================================
 */

function normalizeDocumentGPS(
  value: unknown,
  sourceDocument: string,
  fallbackAddress: string,
): DocumentGPSResult {
  const data = asObject(value);

  const notes = normalizeStringArray(
    data.extractionNotes,
  );

  let coordinateSystem =
    normalizeCoordinateSystem(
      data.coordinateSystem,
    );

  const coordinateReference =
    normalizeCoordinateReference(
      data.coordinateReference,
    );

  const utm = normalizeUTMCoordinates(
    data.utm,
  );

  const surveyBeacons =
    normalizeSurveyBeacons(
      data.surveyBeacons,
      sourceDocument,
      coordinateReference,
    );

  /*
   * Correct a projected system whose datum
   * was explicitly identified as Minna.
   */
  const referenceDatum = normalizeDatum(
    coordinateReference?.datum,
  );

  const utmDatum = normalizeDatum(
    utm?.datum,
  );

  if (
    coordinateSystem === "UTM" &&
    (
      referenceDatum === "MINNA" ||
      utmDatum === "MINNA"
    )
  ) {
    coordinateSystem = "MINNA_UTM";
  }

  /*
   * Reject conflicting coordinate declarations.
   */
  if (
    coordinateReference?.explicitlyStated &&
    coordinateReference.coordinateSystem !== "UNKNOWN" &&
    coordinateSystem !== "UNKNOWN" &&
    coordinateSystem !==
      coordinateReference.coordinateSystem &&
    !(
      coordinateSystem === "WGS84" &&
      coordinateReference.coordinateSystem === "UTM"
    )
  ) {
    notes.push(
      "Document-level coordinate system and coordinate-reference metadata differ. Geographic interpretation requires review.",
    );
  }

  /*
   * The document may contain a WGS84 geographic
   * position as well as WGS84 UTM beacon points.
   *
   * Preserve the geographic position only when its
   * coordinate system is explicitly established.
   */
  const parsedPair =
    normalizeGPSCoordinates(
      data.latitude,
      data.longitude,
    );

  const coordinatesExplicitlyStated =
    data.coordinatesExplicitlyStated === true;

  const geographicWGS84Established =
    coordinateSystem === "WGS84" &&
    coordinatesExplicitlyStated &&
    (
      coordinateReference?.explicitlyStated === true ||
      safeString(data.coordinateEvidence).length > 0
    );

  const latitude =
    geographicWGS84Established && parsedPair
      ? parsedPair.latitude
      : null;

  const longitude =
    geographicWGS84Established && parsedPair
      ? parsedPair.longitude
      : null;

  if (
    parsedPair &&
    !geographicWGS84Established
  ) {
    notes.push(
      "Latitude and longitude were found, but an explicit WGS84 geographic reference was not established for safe mapping.",
    );
  }

  /*
   * A boundary sequence is only accepted
   * when the document visibly establishes
   * the point order.
   */
  const boundarySequence =
    normalizeStringArray(
      data.boundarySequence,
    ).map(normalizeBeaconId);

  /*
   * The model sometimes describes a fully evidenced traverse
   * in extractionNotes but omits boundarySequenceEvidence or
   * returns a contradictory boolean. Recover only explicit
   * source-described edge chains, never alphabetical ordering.
   */
  const suppliedBoundaryEvidence = safeString(
    data.boundarySequenceEvidence,
  );

  const orderedSequence = [...boundarySequence];
  if (
    orderedSequence.length > 3 &&
    orderedSequence[0] === orderedSequence[orderedSequence.length - 1]
  ) {
    orderedSequence.pop();
  }

  const normalizedEdges = orderedSequence.map((id, index) => {
    const next = orderedSequence[(index + 1) % orderedSequence.length];
    return [id, next];
  });

  function describesActualTraverse(evidence: string): boolean {
    if (!evidence || normalizedEdges.length < 3) return false;
    const normalized = evidence.toUpperCase()
      .replace(/[–—→]/g, "-")
      .replace(/\s+/g, " ");
    const explicitEdges = normalizedEdges.every(([a, b]) => {
      return normalized.includes(`${a}-${b}`) || normalized.includes(`${a} - ${b}`);
    });
    return explicitEdges &&
      /\b(?:TRAVERSE|BEARINGS|SIDES|DRAWING|BOUNDARY|PARCEL)\b/.test(normalized);
  }

  const documentedNote = notes.find(describesActualTraverse) || "";
  const boundarySequenceEvidence =
    describesActualTraverse(suppliedBoundaryEvidence)
      ? suppliedBoundaryEvidence
      : documentedNote;

  const beaconIds = new Set(surveyBeacons.map((b) => b.beaconId));
  const sequenceValid = orderedSequence.length >= 3 &&
    new Set(orderedSequence).size === orderedSequence.length &&
    orderedSequence.every((id) => beaconIds.has(id));

  const boundarySequenceEstablished =
    sequenceValid &&
    boundarySequenceEvidence.length > 0 &&
    (data.boundarySequenceEstablished === true || documentedNote.length > 0);

  if (boundarySequenceEstablished && data.boundarySequenceEstablished !== true) {
    notes.push(
      "Boundary order established from a specifically described traverse in the document extraction notes; the original survey still requires independent review.",
    );
  }

  if (
    boundarySequence.length > 0 &&
    !boundarySequenceEstablished
  ) {
    notes.push(
      boundarySequenceEvidence.length === 0
        ? "A boundary order was proposed, but the document-based evidence explaining that order is missing. The plot will not be drawn."
        : "A proposed boundary sequence was not explicitly confirmed by the extraction. The plot will not be drawn.",
    );
  }

  if (
    surveyBeacons.length >= 3 &&
    coordinateReference?.explicitlyStated !== true
  ) {
    notes.push(
      "Survey beacons were found, but the source coordinate-reference declaration was not sufficiently supported. The plot cannot be mapped safely.",
    );
  }

  const statedLandArea =
    finiteNumber(
      data.statedLandArea,
    );

  const statedLandAreaUnit =
    normalizeLandAreaUnit(
      data.statedLandAreaUnit,
    );

  /*
   * A stated numeric area must have a unit.
   * Never assume square metres.
   */
  if (
    statedLandArea !== null &&
    statedLandAreaUnit === "unknown"
  ) {
    notes.push(
      "A land-area number was extracted without a supported unit. No numerical area comparison will be made.",
    );
  }

  /*
   * Keep the original document GPS classification.
   *
   * If beacon rows use WGS84 UTM, their specific
   * reference is stored under coordinateReference.
   */
  return {
    sourceDocument,

    statedAddress: firstString(
      data.statedAddress,
      fallbackAddress,
    ),

    coordinateSystem,

    latitude,
    longitude,

    utm,

    surveyBeacons,

    coordinateReference,

    referencePointId: normalizeBeaconId(
      data.referencePointId,
    ),

    coordinateEvidence: safeString(
      data.coordinateEvidence,
    ),

    coordinatesExplicitlyStated,

    extractionNotes: uniqueStrings(notes),

    extractionConfidence: confidenceNumber(
      data.extractionConfidence,
    ),

    statedLandArea:
      statedLandArea !== null &&
      statedLandArea > 0
        ? statedLandArea
        : null,

    statedLandAreaUnit,

    boundarySequence,

    boundarySequenceEvidence,

    boundarySequenceEstablished,
  };
}

/*
 * ============================================================
 * PACKAGE GPS ANALYSIS
 * ============================================================
 *
 * The GPS analysis remains separate from the
 * Essential trust score.
 *
 * Inconclusive document locations do not disable
 * an independently calculable survey boundary.
 * ============================================================
 */

function buildPackageGPSAnalysis(
  documentResults: DocumentAIResult[],
): EssentialGPSAnalysis {
  const gpsDocuments =
    documentResults.map(
      (document) => document.gps,
    );

  const calculated =
    analyzeGPSDocuments(
      gpsDocuments,
      {
        consistentThresholdMeters: 100,
        mismatchThresholdMeters: 1000,
        areaTolerancePercent: 2,
        enableBoundaryLocationComparison: true,
      },
    );

  const correspondingComparisons =
    calculated.documentComparisons.filter(
      (comparison) =>
        comparison.correspondingPointsEstablished ===
          true &&
        comparison.distanceMeters !== null,
    );

  const coordinateDocumentCount =
    gpsDocuments.filter(
      (document) =>
        document.latitude !== null &&
        document.longitude !== null,
    ).length;

  let comparisonSafety:
    EssentialGPSAnalysis["comparisonSafety"] =
      "insufficient_coordinates";

  if (correspondingComparisons.length > 0) {
    comparisonSafety =
      "corresponding_reference_points";
  } else if (coordinateDocumentCount >= 2) {
    comparisonSafety =
      "reference_points_not_established";
  }

  /*
   * Preserve an actionable explanation of WHY a submitted
   * survey did or did not produce geometry. These diagnostic
   * fields must never be interpreted as proof of legal title.
   */
  const surveyDiagnostics = gpsDocuments
    .filter((document) => document.surveyBeacons.length > 0)
    .map((document) => {
     const reference = document.coordinateReference;

const boundary = (calculated.surveyBoundaries ?? []).find(
  (item) => item.sourceDocument === document.sourceDocument,
);

const measurement = (calculated.surveyMeasurements ?? []).find(
  (item) => item.sourceDocument === document.sourceDocument,
);
      const supportedWGS84UTM =
        reference?.explicitlyStated === true &&
        reference.coordinateSystem === "UTM" &&
        normalizeDatum(reference.datum) === "WGS84" &&
        isValidUTMZone(reference.utmZone) &&
        isValidUTMHemisphere(reference.hemisphere);
      const measurementAvailable =
        measurement?.geometryValid === true &&
        measurement.calculatedAreaSquareMeters !== null;
      const explanation =
        boundary?.status === "available"
          ? "Document-based survey geometry was calculated. Independent field or registry confirmation is still required."
          : boundary?.limitations?.filter(Boolean).join(" ") ||
            (!document.boundarySequenceEstablished
              ? "The document did not sufficiently establish the boundary order."
              : !supportedWGS84UTM
                ? "The source does not establish a complete supported WGS84 UTM coordinate reference."
                : "The supplied survey coordinates could not form a valid plot.");

      return {
        sourceDocument: document.sourceDocument,
        beaconCount: document.surveyBeacons.length,
        coordinateReferenceEstablished:
          reference?.explicitlyStated === true,
        supportedWGS84UTM,
        boundarySequenceEstablished:
          document.boundarySequenceEstablished === true,
        boundarySequenceEvidence:
          document.boundarySequenceEvidence,
        boundaryStatus: boundary?.status || "not_available",
        measurementAvailable,
        explanation,
      };
    });

  const findings = [
    ...calculated.findings,
  ];

  const limitations = [
    ...calculated.limitations,
  ];

  if (
    comparisonSafety ===
    "reference_points_not_established"
  ) {
    findings.push(
      "Multiple geographic points were extracted, but their correspondence was not established. Distances alone cannot confirm whether the documents describe the same parcel.",
    );

    limitations.push(
      "Different survey beacons and property reference points may legitimately occupy different positions.",
    );
  }

  limitations.push(
    "Calculated survey boundaries, dimensions and land areas are document-derived and have not been independently certified by a licensed surveyor.",
  );

  /*
   * Preserve calculated map data.
   *
   * A valid survey polygon may be available even
   * when document-to-document comparisons remain
   * inconclusive.
   */
  return {
    ...calculated,

    findings: uniqueStrings(findings),

    limitations: uniqueStrings(limitations),

    comparisonSafety,

    extractionMethod: "ai_document_content",

    assessmentScope:
      "document_reported_geographic_analysis",

    requiresIndependentSurveyVerification: true,

    documentGPSResults: gpsDocuments,

    surveyDiagnostics,

    independentlyVerified: false,
  };
}

/*
 * ============================================================
 * DOCUMENT MIME TYPE
 * ============================================================
 */

function normalizeMimeType(
  value: unknown,
  fileName?: string,
  fileType?: string,
): string {
  const rawValue =
    safeString(value).toLowerCase();

  const rawFileType =
    safeString(fileType).toLowerCase();

  const rawFileName =
    safeString(fileName).toLowerCase();

  if (
    rawValue === "application/pdf" ||
    rawFileType === "application/pdf" ||
    rawFileName.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    ["image/jpeg", "image/jpg"].includes(rawValue) ||
    ["image/jpeg", "image/jpg"].includes(rawFileType) ||
    rawFileName.endsWith(".jpeg") ||
    rawFileName.endsWith(".jpg")
  ) {
    return "image/jpeg";
  }

  if (
    rawValue === "image/png" ||
    rawFileType === "image/png" ||
    rawFileName.endsWith(".png")
  ) {
    return "image/png";
  }

  return (
    rawFileType ||
    "application/octet-stream"
  );
}

/*
 * ============================================================
 * RESOLVE STORAGE PATH
 * ============================================================
 */

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

    if (markerIndex < 0) {
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

    return decodeURIComponent(remainder);
  } catch {
    return trimmed;
  }
}

/*
 * ============================================================
 * TRUST SCORE — PRESERVED
 * ============================================================
 */

function calculateTrustScore(
  checks: VerificationChecks,
): number {
  const values =
    Object.values(checks).filter(
      (value): value is boolean =>
        value !== null,
    );

  if (values.length === 0) {
    return 0;
  }

  const passed =
    values.filter(
      (value) => value === true,
    ).length;

  return clamp(
    Math.round(
      (passed / values.length) * 100,
    ),
    0,
    100,
  );
}

function calculateConfidence(
  documentResults: Array<{
    confidence?: number;
  }>,
): number {
  const values =
    documentResults
      .map(
        (item) =>
          Number(item.confidence),
      )
      .filter(Number.isFinite);

  if (values.length === 0) {
    return 0;
  }

  const average =
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length;

  return Math.round(
    clamp(average, 0, 100),
  );
}

function valuesContainFalse(
  checks: VerificationChecks,
): boolean {
  return Object.values(checks).some(
    (value) => value === false,
  );
}

function calculateRisk(
  trustScore: number,
  checks: VerificationChecks,
): string {
  if (valuesContainFalse(checks)) {
    return trustScore >= 80
      ? "medium"
      : "high";
  }

  const values = Object.values(checks);

  if (
    values.some(
      (value) => value === null,
    )
  ) {
    return trustScore >= 80
      ? "medium"
      : "incomplete";
  }

  if (trustScore >= 85) return "medium";
  if (trustScore >= 60) return "medium";

  return "high";
}

function deriveDocumentAssessment(
  checks: VerificationChecks,
): DocumentAssessmentStatus {
  const failed =
    Object.values(checks).filter(
      (value) => value === false,
    ).length;

  if (failed > 0) {
    return "attention_required";
  }

  const assessed =
    Object.values(checks).filter(
      (value) => value !== null,
    ).length;

  if (assessed === 0) {
    return "inconclusive";
  }

  return "no_significant_issues_detected";
}

function deriveEssentialReviewStatus(
  documentResults: DocumentAIResult[],
  checks: VerificationChecks,
): "verified" | "flagged" {
  const hasAttention =
    documentResults.some(
      (result) =>
        result.assessmentStatus ===
          "attention_required" ||
        result.syntheticDocumentRisk === "high",
    );

  const hasInconclusive =
    documentResults.some(
      (result) =>
        result.assessmentStatus ===
        "inconclusive",
    );

  if (
    hasAttention ||
    hasInconclusive ||
    valuesContainFalse(checks)
  ) {
    return "flagged";
  }

  return "verified";
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
    typeof payload?.output_text === "string" &&
    payload.output_text.trim()
  ) {
    return payload.output_text.trim();
  }

  const output =
    Array.isArray(payload?.output)
      ? payload.output
      : [];

  const textParts: string[] = [];

  for (const outputItem of output) {
    const content =
      Array.isArray(outputItem?.content)
        ? outputItem.content
        : [];

    for (const contentItem of content) {
      if (
        typeof contentItem?.text === "string"
      ) {
        const text =
          contentItem.text.trim();

        if (text) {
          textParts.push(text);
        }
      } else if (
        typeof contentItem?.text?.value ===
        "string"
      ) {
        const text =
          contentItem.text.value.trim();

        if (text) {
          textParts.push(text);
        }
      }
    }
  }

  return textParts.join("\n").trim();
}

function parseAIJson(
  outputText: string,
): any {
  try {
    return JSON.parse(outputText);
  } catch {
    const match =
      outputText.match(
        /\{[\s\S]*\}/,
      );

    if (!match) {
      throw new Error(
        "AI returned unreadable verification data.",
      );
    }

    return JSON.parse(match[0]);
  }
}

/*
 * ============================================================
 * APPROVED KNOWLEDGE RETRIEVAL
 * ============================================================
 */

function formatKnowledgeContext(
  references: any[],
): string {
  if (
    !references ||
    references.length === 0
  ) {
    return [
      "No approved PropertySure AI knowledge",
      "references were retrieved.",
      "Do not invent missing standards or facts.",
      "Analyze the supplied document directly.",
    ].join("\n");
  }

  return references
    .slice(0, 10)
    .map((reference, index) => {
      const title =
        reference?.title ||
        `Approved knowledge reference ${index + 1}`;

      const sourceType =
        reference?.sourceType ||
        reference?.source_type ||
        "approved-reference";

      const referenceDocumentType =
        reference?.documentType ||
        reference?.document_type ||
        "general";

      const similarity =
        typeof reference?.similarity === "number"
          ? reference.similarity.toFixed(3)
          : "unknown";

      const content =
        reference?.content ||
        reference?.description ||
        "";

      return [
        `REFERENCE ${index + 1}`,
        `Title: ${title}`,
        `Source type: ${sourceType}`,
        `Document type: ${referenceDocumentType}`,
        `Similarity: ${similarity}`,
        `Reference content: ${content}`,
      ].join("\n");
    })
    .join("\n\n");
}

async function retrieveApprovedKnowledge(
  documentType?: string,
) {
  try {
    return await searchKnowledge(
      {
        documentType:
          documentType as
            | PropertyDocumentType
            | undefined,

        keywords: [
          "Nigeria",
          "property document",
          documentType || "property document",
          "verification",
          "fraud",
          "manipulation",
        ],

        text: [
          "Nigerian property document verification",
          documentType
            ? `document type: ${documentType}`
            : "property document",
          "document structure",
          "document fields",
          "fraud indicators",
          "manipulation indicators",
          "authenticity assessment",
        ].join("\n"),
      },
      {
        limit: 10,
        minimumSimilarity: 0.5,
      },
    );
  } catch (error) {
    console.error(
      "ESSENTIAL KNOWLEDGE RETRIEVAL ERROR:",
      error,
    );

    return [];
  }
}

/*
 * ============================================================
 * DOCUMENT AI ANALYSIS
 * ============================================================
 */

async function analyzeDocument(
  file: Blob,
  fileName: string,
  mimeType: string,
  documentType?: string,
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  const bytes = Buffer.from(
    await file.arrayBuffer(),
  );

  const base64 =
    bytes.toString("base64");

  const actualMimeType =
    normalizeMimeType(
      mimeType,
      fileName,
      file.type,
    );

  const dataUrl =
    `data:${actualMimeType};base64,${base64}`;

  const knowledgeReferences =
    await retrieveApprovedKnowledge(
      documentType,
    );

  const knowledgeContext =
    formatKnowledgeContext(
      knowledgeReferences,
    );

  console.log(
    "ESSENTIAL KNOWLEDGE REFERENCES:",
    knowledgeReferences.length,
  );

  /*
   * ==========================================================
   * OPENAI EXTRACTION PROMPT
   * ==========================================================
   */

  const prompt = `
You are PropertySure AI's Essential Nigerian property-document
verification and geographic extraction engine.

Analyze the ACTUAL CONTENT and visible appearance of the
uploaded document.

The filename is metadata only. It is never evidence
of document authenticity.

Previously identified document type:
${documentType || "Unknown"}

============================================================
APPROVED PROPERTYSURE AI KNOWLEDGE
============================================================

${knowledgeContext}

KNOWLEDGE SAFETY:

- Knowledge references provide supporting context only.
- Similarity to a reference does not prove authenticity.
- Do not copy facts from references into customer results.
- Do not use synthetic or unverified references as fraud proof.
- Do not invent registry verification.
- Only extract customer details from the uploaded document.

============================================================
AUTHENTICITY LIMITATIONS
============================================================

Essential performs AI document assessment only.

Never claim that:

- Government issuance was confirmed.
- Legal ownership was independently verified.
- Registry ownership records were checked.
- Title validity was established.
- Litigation clearance was completed.
- Physical inspection was performed.
- Survey boundaries were officially registered or verified.
- Survey beacon coordinates were physically confirmed.
- A government survey database was accessed.

A document may look genuine and still be fabricated.

============================================================
DOCUMENT MANIPULATION ANALYSIS
============================================================

Examine the supplied document for:

- Inconsistent fonts and typography.
- Suspicious text alignment or spacing.
- Pasted or digitally composited text.
- Inconsistent rendering between elements.
- Suspiciously reconstructed stamps and seals.
- Suspicious signature appearance.
- Repeated visual elements.
- Altered or overwritten values.
- Contradictory names, dates, numbers and locations.
- Unusual logos, borders or document formatting.
- Internally inconsistent survey references.
- Visible signs of digital reconstruction.
- Missing or incomplete document sections.

Describe specific concerns where visible.

Visual suspicion is not forensic proof of forgery.

============================================================
DOCUMENT CHECKS
============================================================

Return true, false or null for:

documentStructure:
Assess visible document structure and formatting.

dataConsistency:
Assess internal consistency of visible data.

signatureValid:
Assess signature presentation only.
Do not claim forensic signature authentication.

stampValid:
Assess visible stamp or seal presentation only.
Do not claim government authentication.

noForgery:
Assess visible manipulation or reconstruction indicators.

noDuplicate:
Assess suspicious repeated elements inside the document.
Do not claim a historical duplicate database search.

documentCompleteness:
Assess apparent completeness of the submitted document.

============================================================
STRUCTURED DOCUMENT EXTRACTION
============================================================

Extract only clearly readable document information.

If a textual value is unavailable, return "".

documentTitle:
Visible document heading.

documentNumber:
Visible certificate or registration number.

issuingAuthority:
Named issuing authority, when present.

propertyDetails.location:
Written property address or location.

propertyDetails.propertyType:
Explicitly stated type or use.

propertyDetails.propertyDescription:
Visible parcel description.

propertyDetails.plotNumber:
Plot identifier.

propertyDetails.blockNumber:
Block identifier.

propertyDetails.surveyNumber:
Survey number.

propertyDetails.surveyReference:
Complete survey reference.

propertyDetails.landSize:
Stated land size including units.

PARTIES:

grantor:
Person or company transferring an interest.

grantee:
Person or company receiving an interest.

owner:
Only when explicitly named as owner.

holder:
Named certificate holder or applicant.

otherParties:
Other explicitly named people or organizations.

DATES:

documentDate:
Visible document date.

executionDate:
Date executed or signed.

registrationDate:
Visible registration date.

A grantor or grantee is not automatically a legally
verified owner.

A Deed of Assignment does not independently establish
that a transfer was validly registered.

============================================================
ADVANCED GPS AND SURVEY INFORMATION EXTRACTION
============================================================

Perform geographic DATA EXTRACTION from actual
document content.

Look for:

- Latitude and longitude.
- Decimal geographic coordinates.
- Degrees, minutes and seconds.
- UTM easting and northing.
- UTM zone and hemisphere.
- Datum and coordinate-reference declarations.
- EPSG codes.
- Survey coordinate tables.
- Survey beacon identifiers.
- Beacon ordering or boundary traverse descriptions.
- Boundary closure notation.
- Survey side lengths.
- Stated land area and units.
- Visible coordinate evidence.

Never invent missing coordinates.

Never geocode an address or infer GPS coordinates
from general knowledge of a Nigerian city.

Never copy geographic coordinates from retrieved
knowledge references.

Never assume that Nigerian survey coordinates
use WGS84.

Some Nigerian survey plans use Minna datum
or other local coordinate systems.

Never interpret UTM easting and northing
as latitude and longitude.

============================================================
COORDINATE SYSTEM CLASSIFICATION
============================================================

Allowed values:

"WGS84"
"UTM"
"MINNA_UTM"
"UNKNOWN"

"WGS84":
Use for explicitly established WGS84
geographic latitude and longitude.

"UTM":
Use for identifiable UTM projected coordinates.
The datum, zone and hemisphere must be
recorded separately.

"MINNA_UTM":
Use for explicitly identified Minna UTM coordinates.

"UNKNOWN":
Use when the coordinate reference system
cannot be established.

IMPORTANT:

A document containing "WGS84 / UTM Zone 31N"
has a WGS84 DATUM with a UTM PROJECTION.

Its easting and northing belong to coordinateSystem
"UTM", not geographic coordinateSystem "WGS84".

A document may contain BOTH a stated WGS84
latitude/longitude and a UTM beacon table.

In that situation, preserve the geographic location
and separately describe the projected coordinate
reference for the beacon table.

Do not merge these different coordinate representations.

============================================================
COORDINATE REFERENCE METADATA
============================================================

Return gps.coordinateReference as an object.

coordinateSystem:
"WGS84", "UTM", "MINNA_UTM" or "UNKNOWN".

datum:
Exact visible datum, or "" if missing.

projection:
Visible projection name, or "" if missing.

utmZone:
An integer 1–60 if explicitly supported by
the document's coordinate-system declaration.
Otherwise null.

hemisphere:
"N", "S" or null.

epsgCode:
Visible EPSG designation, or "".

explicitlyStated:
true only when the document visibly establishes
the reported coordinate reference.

evidence:
A short description or transcription of the
visible line or heading establishing the reference.

IMPORTANT:

Do not mark explicitlyStated true based only on
geographic plausibility or the model's assumptions.

Do not infer a missing zone from a Nigerian address.

Do not infer a missing hemisphere merely because
the property is claimed to be in Nigeria.

A survey plan may state one common coordinate
reference for all its beacon coordinates.

If so, record the shared reference under
gps.coordinateReference.

Individual beacon rows do not need to repeat
that reference.

============================================================
DOCUMENT-LEVEL GPS LOCATION
============================================================

gps.latitude and gps.longitude:

Use only when clearly reported as a geographic
coordinate pair in the actual document and the
geographic reference is supported.

Do not automatically use the latitude and longitude
of beacon A as the property's reference location.

gps.utm:

Use only for an actual separately identifiable
document-level UTM reference point.

Do not create a document-level UTM reference point
from an arbitrary survey beacon.

If the document contains only a beacon table,
preserve the beacons in surveyBeacons and use
null document-level easting/northing.

gps.referencePointId:

Use only when the geographic point is explicitly
identified with a meaningful source reference.

Examples:

"PB123"
"BEACON A1"
"CONTROL POINT 2"

Do not invent a reference identifier.

Do not use generic identifiers such as:

"property"
"plot"
"land"
"survey"

gps.coordinateEvidence:

Describe the visible text or table from which the
document-level geographic coordinate was extracted.

gps.coordinatesExplicitlyStated:

true only when the relevant geographic values
are actually stated in the submitted document.

============================================================
SURVEY BEACON EXTRACTION
============================================================

Extract all readable identified survey beacons,
up to 40.

For each beacon return:

beaconId:
Exact visible beacon label.

latitude:
Directly stated geographic latitude, or null.

longitude:
Directly stated geographic longitude, or null.

easting:
Original numeric easting, or null.

northing:
Original numeric northing, or null.

coordinateSystem:
The system used by the beacon record.
Use "UTM" for a UTM beacon table.

utmZone:
Only when explicitly stated for that beacon,
or null if stated at the document level.

hemisphere:
Only when explicitly stated for that beacon,
or null if stated at the document level.

datum:
Visible beacon-specific datum, or "" if
defined only at the document level.

coordinateEvidence:
Visible beacon table entry or supporting heading.

boundaryOrder:
Only an explicitly established positive integer
indicating that beacon's boundary sequence position.
Otherwise null.

Preserve all original survey coordinate values.

Do not change original easting/northing during
geographic conversion.

Do not fabricate missing beacons.

============================================================
SURVEY BOUNDARY SEQUENCE
============================================================

Return gps.boundarySequence as an array of beacon IDs.

Examples:

["A", "B", "C", "D"]

or

["PB123", "PB124", "PB125", "PB126"]

Only return this ordered sequence when the original
survey plan establishes the traverse or parcel
boundary order.

Valid evidence may include:

- A clear drawn boundary with identified corners.
- A readable traverse sequence.
- Boundary sides explicitly joining named beacons.
- Explicit point-order annotations.

IMPORTANT:

A table listing beacons A, B, C and D does NOT,
by itself, establish that the boundary runs
A -> B -> C -> D -> A.

When the plan contains a parcel drawing or a sides-and-bearings
traverse table establishing A-B, B-C, C-D, D-A, report the
explicit ordered sequence and identify THAT evidence clearly
in boundarySequenceEvidence. Do not withhold clear visible
traverse evidence, but do not fabricate it from alphabetic order.

The structured fields must agree with your evidence description.
If the source clearly shows A-B, B-C, C-D, D-A in a
sides-and-bearings table or identified boundary drawing,
set boundarySequenceEstablished to true and provide the exact
visible traverse in boundarySequenceEvidence. Do not describe
an established traverse in extractionNotes while simultaneously
marking its structured flag false. If source evidence is uncertain,
return false and explain why rather than guessing.

Never assume alphabetical order.

Never create a polygon by sorting beacon IDs.

If the boundary order is unclear:

boundarySequence = []
boundarySequenceEstablished = false
boundarySequenceEvidence = ""

If the document clearly establishes the order:

boundarySequence = ordered beacon IDs
boundarySequenceEstablished = true
boundarySequenceEvidence = visible evidence explaining
how the point order was established.

A final repeated first beacon may be included when
the document explicitly describes polygon closure.

============================================================
STATED LAND AREA
============================================================

Return:

gps.statedLandArea:
Positive numeric area when explicitly shown.

gps.statedLandAreaUnit:
One of:

"sqm"
"hectares"
"acres"
"sqft"
"unknown"

Never guess land-size units.

If the area is unreadable, use null.

If the numeric area is visible but units are
not established, return "unknown".

The land-size number should originate from
the document, not from estimated GPS coordinates.

============================================================
GEOGRAPHIC EXTRACTION ACCURACY
============================================================

gps.extractionConfidence:

0–100 confidence in reading/extracting
geographic data.

This is NOT confidence that the survey is genuine.

gps.extractionNotes:

Concise warnings about unreadable, ambiguous,
missing or unsupported geographic data.

Include ambiguity between geographic and
projected coordinates.

Include uncertainty about beacon sequence.

Include unclear datum, UTM zone or hemisphere.

============================================================
PROPERTY VERIFICATION LIMITATIONS
============================================================

A mathematical UTM conversion does not establish
registered survey accuracy.

A reconstructed boundary is only a document-derived
geometric representation.

A calculated parcel area is not a certified ground
survey measurement.

Two documents with nearby GPS coordinates are not
automatically records of the same legal parcel.

A GPS mismatch alone does not prove forgery.

A map marker does not prove ownership.

No external government registry was checked.

============================================================
OWNERSHIP AND DOCUMENT SAFETY
============================================================

Do not assume that:

- A grantor is a verified owner.
- A grantee is a verified current owner.
- A certificate holder has valid current title.
- A signed deed is automatically registered.
- A matching survey number proves authenticity.
- A coordinate match proves parcel registration.

============================================================
CONFIDENCE
============================================================

confidence is the AI's confidence in its
document assessment, not the probability
that the document is authentic.

============================================================
REQUIRED JSON
============================================================

Return exactly one valid JSON object.

Follow this structure:

{
  "documentType": "",
  "documentTitle": "",
  "confidence": 0,
  "summary": "",
  "syntheticDocumentRisk": "inconclusive",
  "manipulationIndicators": [],

  "checks": {
    "documentStructure": null,
    "dataConsistency": null,
    "signatureValid": null,
    "stampValid": null,
    "noForgery": null,
    "noDuplicate": null,
    "documentCompleteness": null
  },

  "documentNumber": "",
  "issuingAuthority": "",

  "propertyDetails": {
    "location": "",
    "propertyType": "",
    "propertyDescription": "",
    "plotNumber": "",
    "blockNumber": "",
    "surveyNumber": "",
    "surveyReference": "",
    "landSize": ""
  },

  "parties": {
    "grantor": "",
    "grantee": "",
    "owner": "",
    "holder": "",
    "otherParties": []
  },

  "dates": {
    "documentDate": "",
    "executionDate": "",
    "registrationDate": ""
  },

  "gps": {
    "statedAddress": "",
    "coordinateSystem": "UNKNOWN",
    "latitude": null,
    "longitude": null,

    "utm": {
      "easting": null,
      "northing": null,
      "zone": null,
      "hemisphere": null,
      "datum": ""
    },

    "coordinateReference": {
      "coordinateSystem": "UNKNOWN",
      "datum": "",
      "projection": "",
      "utmZone": null,
      "hemisphere": null,
      "epsgCode": "",
      "explicitlyStated": false,
      "evidence": ""
    },

    "surveyBeacons": [],

    "boundarySequence": [],
    "boundarySequenceEstablished": false,
    "boundarySequenceEvidence": "",

    "statedLandArea": null,
    "statedLandAreaUnit": "unknown",

    "referencePointId": "",
    "coordinateEvidence": "",
    "coordinatesExplicitlyStated": false,

    "extractionNotes": [],
    "extractionConfidence": null
  }
}

Each surveyBeacons item must follow:

{
  "beaconId": "",
  "latitude": null,
  "longitude": null,
  "easting": null,
  "northing": null,
  "coordinateSystem": "UNKNOWN",
  "utmZone": null,
  "hemisphere": null,
  "datum": "",
  "coordinateEvidence": "",
  "boundaryOrder": null
}

RULES:

- confidence must be an integer from 0 to 100.
- syntheticDocumentRisk must be low, medium, high,
  or inconclusive.
- Missing text must be "".
- Missing numeric GPS fields must be null.
- Missing UTM zone must be null.
- Missing hemisphere must be null.
- Unknown datum must be "".
- Missing survey beacons must be [].
- Missing boundary sequence must be [].
- Unknown land-area unit must be "unknown".
- Do not invent geographic values.
- Do not invent boundary order.
- Do not claim independent government verification.
- Return JSON only.
`;

  /*
   * ==========================================================
   * BUILD OPENAI INPUT
   * ==========================================================
   */

  const content: Array<
    Record<string, unknown>
  > = [
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
    actualMimeType === "image/jpeg" ||
    actualMimeType === "image/png"
  ) {
    content.push({
      type: "input_image",
      image_url: dataUrl,
      detail: "high",
    });
  } else {
    throw new Error(
      `Unsupported document type: ${actualMimeType}`,
    );
  }

  const model =
    process.env.OPENAI_DOCUMENT_MODEL ||
    "gpt-5.6";

  const openAIResponse = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model,

        input: [
          {
            role: "user",
            content,
          },
        ],

        /*
         * Allow enough space for structured
         * survey beacon tables and metadata.
         */
        max_output_tokens: 8500,
      }),

      cache: "no-store",
    },
  );

  const payload =
    await openAIResponse.json();

  if (!openAIResponse.ok) {
    console.error(
      "ESSENTIAL OPENAI ERROR:",
      payload,
    );

    throw new Error(
      payload?.error?.message ||
        "OpenAI verification analysis failed.",
    );
  }

  const outputText =
    extractAIOutputText(payload);

  if (!outputText) {
    throw new Error(
      "AI returned no verification result.",
    );
  }

  const parsed =
    parseAIJson(outputText);

  /*
   * ==========================================================
   * NORMALIZE CHECKS
   * ==========================================================
   */

  const parsedChecks =
    asObject(parsed.checks);

  const checks: VerificationChecks = {
    documentStructure: normalizeCheckValue(
      parsedChecks.documentStructure,
    ),

    dataConsistency: normalizeCheckValue(
      parsedChecks.dataConsistency,
    ),

    signatureValid: normalizeCheckValue(
      parsedChecks.signatureValid,
    ),

    stampValid: normalizeCheckValue(
      parsedChecks.stampValid,
    ),

    noForgery: normalizeCheckValue(
      parsedChecks.noForgery,
    ),

    noDuplicate: normalizeCheckValue(
      parsedChecks.noDuplicate,
    ),

    documentCompleteness: normalizeCheckValue(
      parsedChecks.documentCompleteness,
    ),
  };

  const manipulationIndicators =
    normalizeStringArray(
      parsed.manipulationIndicators,
    );

  const syntheticDocumentRisk =
    normalizeSyntheticRisk(
      parsed.syntheticDocumentRisk,
    );

  if (
    manipulationIndicators.length > 0 &&
    checks.noForgery !== false
  ) {
    checks.noForgery = false;
  }

  const assessmentStatus =
    deriveDocumentAssessment(checks);

  /*
   * ==========================================================
   * STRUCTURED PROPERTY INFORMATION
   * ==========================================================
   */

  const extractedFields =
    normalizeExtractedFields({
      documentTitle: parsed.documentTitle,
      documentNumber: parsed.documentNumber,
      issuingAuthority: parsed.issuingAuthority,
      propertyDetails: parsed.propertyDetails,
      parties: parsed.parties,
      dates: parsed.dates,
    });

  /*
   * ==========================================================
   * GEOGRAPHIC EXTRACTION
   * ==========================================================
   */

  const gps =
    normalizeDocumentGPS(
      parsed.gps,
      fileName,
      extractedFields.propertyDetails.location,
    );

  /*
   * ==========================================================
   * SUMMARY
   * ==========================================================
   */

  let summary =
    firstString(
      parsed.summary,
      "AI document assessment completed.",
    );

  if (
    !summary
      .toLowerCase()
      .includes(
        "not been independently verified",
      )
  ) {
    summary +=
      " This is an AI document assessment only; authenticity has not been independently verified.";
  }

  return {
    documentType: firstString(
      parsed.documentType,
      documentType,
      "Other Property Document",
    ),

    documentTitle: firstString(
      extractedFields.documentTitle,
      parsed.documentType,
      documentType,
      "Property Document",
    ),

    confidence: Math.round(
      clamp(
        Number(parsed.confidence) || 0,
        0,
        100,
      ),
    ),

    summary,
    assessmentStatus,

    authenticityStatus:
      "not_independently_verified" as const,

    checks,
    syntheticDocumentRisk,
    manipulationIndicators,

    documentNumber:
      extractedFields.documentNumber,

    issuingAuthority:
      extractedFields.issuingAuthority,

    propertyDetails:
      extractedFields.propertyDetails,

    parties:
      extractedFields.parties,

    dates:
      extractedFields.dates,

    extractedFields,

    gps,
  };
}

/*
 * ============================================================
 * PACKAGE CHECK MERGING
 * ============================================================
 */

function mergeChecks(
  documentResults: Array<{
    checks: VerificationChecks;
  }>,
): VerificationChecks {
  if (documentResults.length === 0) {
    return {
      ...EMPTY_CHECKS,
    };
  }

  const keys: Array<
    keyof VerificationChecks
  > = [
    "documentStructure",
    "dataConsistency",
    "signatureValid",
    "stampValid",
    "noForgery",
    "noDuplicate",
    "documentCompleteness",
  ];

  const merged: VerificationChecks = {
    ...EMPTY_CHECKS,
  };

  for (const key of keys) {
    const values =
      documentResults.map(
        (result) => result.checks[key],
      );

    if (
      values.some(
        (value) => value === false,
      )
    ) {
      merged[key] = false;
      continue;
    }

    if (
      values.every(
        (value) => value === true,
      )
    ) {
      merged[key] = true;
      continue;
    }

    merged[key] = null;
  }

  return merged;
}

/*
 * ============================================================
 * PACKAGE SUMMARY
 * ============================================================
 */

function buildPackageSummary(
  documentResults: DocumentAIResult[],
  checks: VerificationChecks,
): string {
  const attentionCount =
    documentResults.filter(
      (result) =>
        result.assessmentStatus ===
        "attention_required",
    ).length;

  const inconclusiveCount =
    documentResults.filter(
      (result) =>
        result.assessmentStatus ===
        "inconclusive",
    ).length;

  const highSyntheticRiskCount =
    documentResults.filter(
      (result) =>
        result.syntheticDocumentRisk === "high",
    ).length;

  const mediumSyntheticRiskCount =
    documentResults.filter(
      (result) =>
        result.syntheticDocumentRisk === "medium",
    ).length;

  const failedChecks =
    Object.values(checks).filter(
      (value) => value === false,
    ).length;

  if (highSyntheticRiskCount > 0) {
    return (
      `AI analysis identified a high synthetic/fabrication risk in ` +
      `${highSyntheticRiskCount} document` +
      `${highSyntheticRiskCount === 1 ? "" : "s"}. ` +
      `Further verification is required.`
    );
  }

  if (
    attentionCount > 0 ||
    failedChecks > 0
  ) {
    const count =
      Math.max(attentionCount, 1);

    return (
      `AI document assessment identified ${count} ` +
      `document${count === 1 ? "" : "s"} requiring attention. ` +
      `Independent authenticity verification has not been performed.`
    );
  }

  if (mediumSyntheticRiskCount > 0) {
    return (
      `AI document assessment did not establish government authenticity ` +
      `and identified medium synthetic-document risk in ` +
      `${mediumSyntheticRiskCount} document` +
      `${mediumSyntheticRiskCount === 1 ? "" : "s"}. ` +
      `Further verification is recommended.`
    );
  }

  if (inconclusiveCount > 0) {
    return (
      `AI document assessment completed, but ${inconclusiveCount} ` +
      `document${inconclusiveCount === 1 ? "" : "s"} could not be ` +
      `conclusively assessed. Independent authenticity verification ` +
      `has not been performed.`
    );
  }

  return (
    "AI document assessment found no significant visible issues " +
    "in the submitted package. This does not establish that the " +
    "documents are genuine or government-issued; independent " +
    "authenticity verification has not been performed."
  );
}

/*
 * ============================================================
 * CONSISTENT PROPERTY VALUES
 * ============================================================
 */

function uniqueConsistentValue(
  values: string[],
): string {
  const nonEmpty =
    values
      .map((value) => value.trim())
      .filter(Boolean);

  if (nonEmpty.length === 0) {
    return "";
  }

  const normalized =
    new Set(
      nonEmpty.map(
        (value) => value.toLowerCase(),
      ),
    );

  return normalized.size === 1
    ? nonEmpty[0]
    : "";
}

/*
 * ============================================================
 * BUILD PACKAGE PROPERTY
 * ============================================================
 */

function buildPackageProperty(
  documents: DocumentAIResult[],
): Record<string, unknown> {
  return {
    location: uniqueConsistentValue(
      documents.map(
        (item) => item.propertyDetails.location,
      ),
    ),

    description: uniqueConsistentValue(
      documents.map(
        (item) =>
          item.propertyDetails.propertyDescription,
      ),
    ),

    property_type: uniqueConsistentValue(
      documents.map(
        (item) => item.propertyDetails.propertyType,
      ),
    ),

    land_size: uniqueConsistentValue(
      documents.map(
        (item) => item.propertyDetails.landSize,
      ),
    ),

    plot: uniqueConsistentValue(
      documents.map(
        (item) => item.propertyDetails.plotNumber,
      ),
    ),

    block: uniqueConsistentValue(
      documents.map(
        (item) => item.propertyDetails.blockNumber,
      ),
    ),

    survey_reference: uniqueConsistentValue(
      documents.map(
        (item) =>
          item.propertyDetails.surveyReference ||
          item.propertyDetails.surveyNumber,
      ),
    ),

    extraction_source: "ai_document_content",

    authenticity_status:
      "not_independently_verified",
  };
}

/*
 * ============================================================
 * BUILD PACKAGE OWNERSHIP
 * ============================================================
 */

function buildPackageOwnership(
  documents: DocumentAIResult[],
): Record<string, unknown> {
  return {
    owner_name: uniqueConsistentValue(
      documents.map(
        (item) => item.parties.owner,
      ),
    ),

    grantor: uniqueConsistentValue(
      documents.map(
        (item) => item.parties.grantor,
      ),
    ),

    grantee: uniqueConsistentValue(
      documents.map(
        (item) => item.parties.grantee,
      ),
    ),

    holder: uniqueConsistentValue(
      documents.map(
        (item) => item.parties.holder,
      ),
    ),

    status: "not_independently_verified",

    extraction_source:
      "ai_document_content",
  };
}

/*
 * ============================================================
 * POST — ESSENTIAL VERIFICATION
 * ============================================================
 */

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const verificationId =
      String(
        body?.verificationId || "",
      ).trim();

    if (!verificationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ========================================================
     * LOAD VERIFICATION
     * ========================================================
     */

    const {
      data: verification,
      error: verificationError,
    } = await supabaseAdmin
      .from("verifications")
      .select(
        "id,doc_name,file_url,doc_type,status,findings",
      )
      .eq("id", verificationId)
      .maybeSingle();

    if (verificationError) {
      console.error(
        "ESSENTIAL VERIFICATION LOAD ERROR:",
        verificationError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Verification record could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification record was not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ========================================================
     * PAYMENT VALIDATION
     * ========================================================
     *
     * Existing Paystack Essential payment
     * verification is preserved.
     * ========================================================
     */

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .select(
        "id,plan,status,amount,currency,provider",
      )
      .eq(
        "verification_id",
        verificationId,
      )
      .eq("provider", "paystack")
      .eq("plan", "essential")
      .eq("status", "paid")
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      console.error(
        "ESSENTIAL PAYMENT LOOKUP ERROR:",
        paymentError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment record could not be checked.",
        },
        {
          status: 500,
        },
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A confirmed Essential payment is required before verification can begin.",
        },
        {
          status: 402,
        },
      );
    }

    /*
     * ========================================================
     * DOCUMENT PACKAGE
     * ========================================================
     */

    const storedFindings =
      asObject(
        verification.findings,
      ) as VerificationFindings;

    let documentPackage:
      DocumentPackageItem[] =
        Array.isArray(
          storedFindings.document_package,
        )
          ? storedFindings.document_package
          : [];

    if (
      documentPackage.length === 0 &&
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

          documentType: undefined,
        },
      ];
    }

    if (documentPackage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No property documents were found for this verification.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ========================================================
     * MARK PROCESSING
     * ========================================================
     */

    const {
      error: startError,
    } = await supabaseAdmin
      .from("verifications")
      .update({
        status: "processing",

        findings: {
          ...storedFindings,

          document_package:
            documentPackage,

          document_count:
            documentPackage.length,

          checks: {
            ...EMPTY_CHECKS,
          },

          processing: {
            stage: "structure",
            progress: 22,

            message:
              "AI is analyzing your property documents.",
          },
        },
      })
      .eq(
        "id",
        verificationId,
      );

    if (startError) {
      throw new Error(
        `Unable to start Essential analysis: ${startError.message}`,
      );
    }

    /*
     * ========================================================
     * ANALYZE DOCUMENTS
     * ========================================================
     */

    const documentResults:
      DocumentAIResult[] = [];

    for (
      let index = 0;
      index < documentPackage.length;
      index++
    ) {
      const document =
        documentPackage[index];

      if (!document.path) {
        continue;
      }

      const progress =
        Math.round(
          25 +
          (
            index /
            documentPackage.length
          ) * 55,
        );

      /*
       * ======================================================
       * UPDATE DOCUMENT PROGRESS
       * ======================================================
       */

      const {
        error: progressError,
      } = await supabaseAdmin
        .from("verifications")
        .update({
          findings: {
            ...storedFindings,

            document_package:
              documentPackage,

            document_count:
              documentPackage.length,

            checks: {
              ...EMPTY_CHECKS,
            },

            processing: {
              stage: "authenticity",
              progress,

              message:
                `Analyzing document ${index + 1} of ${documentPackage.length}.`,
            },
          },
        })
        .eq(
          "id",
          verificationId,
        );

      if (progressError) {
        throw new Error(
          `Unable to update Essential progress: ${progressError.message}`,
        );
      }

      /*
       * ======================================================
       * DOWNLOAD DOCUMENT
       * ======================================================
       */

      const storagePath =
        resolveStoragePath(
          document.path,
        );

      if (!storagePath) {
        throw new Error(
          `Could not determine the storage path for ${
            document.name || "property document"
          }.`,
        );
      }

      const {
        data: fileBlob,
        error: downloadError,
      } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(storagePath);

      if (
        downloadError ||
        !fileBlob
      ) {
        throw new Error(
          `Could not retrieve ${
            document.name || "property document"
          } from secure storage.`,
        );
      }

      const actualMimeType =
        normalizeMimeType(
          document.type,
          document.name,
          fileBlob.type,
        );

      /*
       * ======================================================
       * DOCUMENT AI AND GPS EXTRACTION
       * ======================================================
       */

      const result =
        await analyzeDocument(
          fileBlob,

          document.name ||
            "property-document",

          actualMimeType,

          document.documentType,
        );

      /*
       * ======================================================
       * NORMALIZE STRUCTURED PROPERTY INFORMATION
       * ======================================================
       */

      const propertyDetails =
        normalizePropertyDetails(
          result.propertyDetails,
        );

      const parties =
        normalizeParties(
          result.parties,
        );

      const dates =
        normalizeDates(
          result.dates,
        );

      const extractedFields =
        normalizeExtractedFields({
          documentTitle:
            result.documentTitle,

          documentNumber:
            result.documentNumber,

          issuingAuthority:
            result.issuingAuthority,

          propertyDetails,
          parties,
          dates,
        });

      /*
       * ======================================================
       * NORMALIZE ADVANCED GPS INFORMATION
       * ======================================================
       *
       * Includes:
       *
       * - Geographic coordinates
       * - Survey coordinate reference
       * - Original beacon coordinates
       * - Boundary point sequence
       * - Stated land area and units
       * - Extraction evidence
       *
       * These are passed to the GPS analysis
       * engine after all documents are processed.
       * ======================================================
       */

      const gps =
        normalizeDocumentGPS(
          result.gps,

          document.name ||
            "Property Document",

          propertyDetails.location,
        );

      /*
       * ======================================================
       * INDIVIDUAL DOCUMENT RESULT
       * ======================================================
       */

      documentResults.push({
        documentName:
          document.name ||
          "Property Document",

        documentType:
          result.documentType,

        documentTitle:
          result.documentTitle,

        confidence:
          result.confidence,

        summary:
          result.summary,

        assessmentStatus:
          result.assessmentStatus,

        authenticityStatus:
          "not_independently_verified",

        checks:
          result.checks,

        syntheticDocumentRisk:
          result.syntheticDocumentRisk,

        manipulationIndicators:
          result.manipulationIndicators,

        documentNumber:
          result.documentNumber,

        issuingAuthority:
          result.issuingAuthority,

        propertyDetails,

        parties,

        dates,

        extractedFields,

        propertyLocation:
          propertyDetails.location,

        propertyDescription:
          propertyDetails.propertyDescription,

        propertyType:
          propertyDetails.propertyType,

        plotNumber:
          propertyDetails.plotNumber,

        blockNumber:
          propertyDetails.blockNumber,

        surveyReference:
          propertyDetails.surveyReference ||
          propertyDetails.surveyNumber,

        landSize:
          propertyDetails.landSize,

        ownerName:
          parties.owner,

        holderName:
          parties.holder,

        gps,
      });
    }

    if (documentResults.length === 0) {
      throw new Error(
        "No documents could be analyzed.",
      );
    }

    /*
     * ========================================================
     * PACKAGE SCORES
     * ========================================================
     *
     * Original Essential scoring formulas preserved.
     *
     * Preliminary GPS or survey calculations
     * do not automatically change the trust score.
     * ========================================================
     */

    const checks =
      mergeChecks(
        documentResults,
      );

    const completenessValues =
      documentResults.map(
        (result) =>
          result.checks.documentCompleteness,
      );

    if (completenessValues.length > 0) {
      if (
        completenessValues.every(
          (value) => value === true,
        )
      ) {
        checks.documentCompleteness = true;
      } else if (
        completenessValues.some(
          (value) => value === false,
        )
      ) {
        checks.documentCompleteness = false;
      } else {
        checks.documentCompleteness = null;
      }
    }

    const trustScore =
      calculateTrustScore(checks);

    const confidence =
      calculateConfidence(
        documentResults,
      );

    const risk =
      calculateRisk(
        trustScore,
        checks,
      );

    const summary =
      buildPackageSummary(
        documentResults,
        checks,
      );

    const reviewStatus =
      deriveEssentialReviewStatus(
        documentResults,
        checks,
      );

    /*
     * ========================================================
     * PACKAGE PROPERTY AND OWNERSHIP
     * ========================================================
     */

    const packageProperty =
      buildPackageProperty(
        documentResults,
      );

    const packageOwnership =
      buildPackageOwnership(
        documentResults,
      );

    /*
     * ========================================================
     * ADVANCED GPS PACKAGE ANALYSIS
     * ========================================================
     *
     * Includes:
     *
     * - Safe WGS84 coordinate interpretation
     * - Supported survey beacon conversion
     * - Projected boundary reconstruction
     * - Approximate side lengths
     * - Approximate plot perimeter
     * - Approximate land area
     * - Stated versus calculated area comparison
     * - GPS location versus plot boundary comparison
     * - Cross-document coordinate assessment
     * - Surveyor-review findings
     * - Map-ready geographic information
     *
     * The GPS engine must not manufacture
     * missing boundary or CRS information.
     * ========================================================
     */

    const gpsAnalysis =
      buildPackageGPSAnalysis(
        documentResults,
      );

    console.log(
      "ESSENTIAL SURVEY DIAGNOSTICS:",
      JSON.stringify(gpsAnalysis.surveyDiagnostics),
    );

    console.log(
      "ESSENTIAL GPS ANALYSIS:",
      {
        verificationId,

        status:
          gpsAnalysis.status,

        comparisonSafety:
          gpsAnalysis.comparisonSafety,

        mapAvailable:
          gpsAnalysis.mapAvailable,

        documents:
          gpsAnalysis.documentGPSResults.length,

        comparisons:
          gpsAnalysis.documentComparisons.length,

        surveyBoundaries:
          gpsAnalysis.surveyBoundaries?.length || 0,

        availableBoundaries:
          (
            gpsAnalysis.surveyBoundaries || []
          ).filter(
            (boundary) =>
              boundary.status === "available",
          ).length,

        surveyMeasurements:
          gpsAnalysis.surveyMeasurements?.length || 0,

        requiresSurveyorReview:
          gpsAnalysis.requiresSurveyorReview === true,
      },
    );

    /*
     * ========================================================
     * FINAL FINDINGS
     * ========================================================
     *
     * Existing findings are retained.
     *
     * GPS data saved at:
     *
     * findings.gps_analysis
     *
     * findings.essential.gps_analysis
     *
     * findings.essential.document_results[].gps
     *
     * No additional database table is required
     * when findings is a JSONB column.
     * ========================================================
     */

    const finalFindings:
      VerificationFindings = {
        ...storedFindings,

        document_package:
          documentPackage,

        document_count:
          documentPackage.length,

        checks,

        property: {
          ...asObject(
            storedFindings.property,
          ),

          ...packageProperty,
        },

        ownership: {
          ...asObject(
            storedFindings.ownership,
          ),

          ...packageOwnership,
        },

        gps_analysis:
          gpsAnalysis,

        essential: {
          ...asObject(
            storedFindings.essential,
          ),

          plan: "essential",

          completed_at:
            new Date().toISOString(),

          document_results:
            documentResults,

          summary,

          gps_analysis:
            gpsAnalysis,

          authenticity_status:
            "not_independently_verified",

          verification_scope:
            "ai_document_assessment_only",
        },

        processing: {
          stage: "complete",

          progress: 100,

          message:
            "Essential AI document and geographic assessment completed.",
        },
      };

    /*
     * ========================================================
     * SAVE FINAL RESULT TO SUPABASE
     * ========================================================
     */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("verifications")
      .update({
        status: "processed",

        review_status:
          reviewStatus,

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

    if (updateError) {
      console.error(
        "ESSENTIAL FINAL UPDATE ERROR:",
        updateError,
      );

      throw new Error(
        `Essential verification result could not be saved: ${updateError.message}`,
      );
    }

    /*
     * ========================================================
     * SUCCESS RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      success: true,

      plan: "essential",

      verificationId,

      documentCount:
        documentPackage.length,

      trustScore,

      confidence,

      risk,

      reviewStatus,

      checks,

      summary,

      authenticityStatus:
        "not_independently_verified",

      verificationScope:
        "ai_document_assessment_only",

      documentResults,

      property:
        packageProperty,

      ownership:
        packageOwnership,

      gpsAnalysis,
    });
  } catch (error) {
    console.error(
      "ESSENTIAL VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Essential verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}
