/*
 * ============================================================
 * PROPERTYSURE AI — ADVANCED GPS ANALYSIS ENGINE
 *
 * File: app/lib/gps/analyze.ts
 * ============================================================
 *
 * RESPONSIBILITIES
 *
 * 1. Resolve document-reported geographic coordinates.
 * 2. Convert supported WGS84 UTM survey beacons.
 * 3. Validate survey boundary sequences.
 * 4. Reconstruct document-reported plot polygons.
 * 5. Calculate plot dimensions, perimeter and area.
 * 6. Compare calculated area with stated land area.
 * 7. Compare GPS positions with surveyed boundaries.
 * 8. Compare corresponding points across documents.
 * 9. Generate geographic findings and limitations.
 * 10. Prepare map data for desktop and mobile.
 *
 * SAFETY
 *
 * - Never invent missing coordinates.
 * - Never infer an unknown coordinate reference system.
 * - Never assume alphabetical beacon order.
 * - Never automatically transform Minna datum into WGS84.
 * - Never treat geographic proximity as proof of title.
 * - Never describe a reconstructed polygon as an
 *   independently verified legal property boundary.
 *
 * ============================================================
 */

import type {
  CoordinateSystem,
  ExtractedGPSData,
  GPSAnalysisResult,
  GPSCoordinates,
  GPSDocumentComparison,
  GPSFindingSeverity,
  GPSMapData,
  GPSStatus,
  GPSStructuredFinding,
  LandAreaComparison,
  SurveyBoundary,
  SurveyBoundaryPoint,
  SurveyLocationComparison,
  SurveyMeasurements,
} from "./types";

import {
  isValidGPSCoordinates,
  isWithinNigeriaBounds,
  normalizeBeaconId,
  normalizeGPSCoordinates,
  validateBoundarySequence,
} from "./coordinates";

import {
  convertSurveyBeacons,
  convertUTMToGPS,
  normalizeDatum,
} from "./converter";

import {
  calculateGPSDistance,
  calculateSurveyGeometry,
  compareGPSLocations,
  compareLandAreas,
  comparePointWithProjectedBoundary,
  formatDistance,
  type ProjectedPoint,
} from "./distance";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ResolvedDocument = {
  source: ExtractedGPSData;

  sourceDocument: string;

  statedAddress: string;

  coordinateSystem: CoordinateSystem;

  coordinates: GPSCoordinates | null;

  referencePointId: string;

  notes: string[];
};

type SurveyAnalysis = {
  boundary: SurveyBoundary;

  measurement: SurveyMeasurements;

  locationComparison: SurveyLocationComparison | null;

  findings: string[];

  limitations: string[];
};

export type GPSAnalysisOptions = {
  consistentThresholdMeters?: number;

  mismatchThresholdMeters?: number;

  areaTolerancePercent?: number;

  /*
   * Boundary/GPS comparison is descriptive unless
   * the document establishes the meaning of the
   * reported reference point.
   */
  enableBoundaryLocationComparison?: boolean;
};

/*
 * ============================================================
 * GENERAL HELPERS
 * ============================================================
 */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function uniqueStrings(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function finiteNumber(
  value: unknown,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function rounded(
  value: number,
  places = 3,
): number {
  return Number(
    value.toFixed(places),
  );
}

function validGPS(
  value: GPSCoordinates | null,
): value is GPSCoordinates {
  return (
    value !== null &&
    isValidGPSCoordinates(value)
  );
}

function addFinding(
  findings: GPSStructuredFinding[],
  code: string,
  title: string,
  description: string,
  severity: GPSFindingSeverity,
  sourceDocuments: string[],
  requiresReview = false,
): void {
  findings.push({
    code,
    title,
    description,
    severity,
    sourceDocuments,
    requiresReview,
  });
}

/*
 * ============================================================
 * EMPTY RESULT
 * ============================================================
 */

function emptyResult(): GPSAnalysisResult {
  return {
    status: "not_available",

    coordinates: null,

    statedAddress: "",

    coordinateSystem: "UNKNOWN",

    sourceDocuments: [],

    documentComparisons: [],

    mapAvailable: false,

    findings: [
      "No property documents were available for GPS analysis.",
    ],

    limitations: [
      "No usable geographic information was supplied.",
      "Property location and legal parcel boundaries have not been independently verified.",
    ],

    independentlyVerified: false,

    surveyBoundaries: [],

    surveyMeasurements: [],

    surveyLocationComparisons: [],

    structuredFindings: [],

    mapData: null,

    analysisMethod:
      "Document-based GPS and survey-coordinate analysis",

    dataSource: "uploaded_documents",

    requiresSurveyorReview: false,
  };
}

/*
 * ============================================================
 * RESOLVE DOCUMENT LOCATION
 * ============================================================
 *
 * The existing Essential route can provide:
 *
 * - Geographic latitude/longitude
 * - WGS84 UTM easting/northing
 * - Survey beacon coordinates
 *
 * Document reference metadata must be explicitly
 * established before advanced boundary reconstruction.
 * ============================================================
 */

function resolveDocument(
  document: ExtractedGPSData,
): ResolvedDocument {
  const sourceDocument =
    cleanText(document.sourceDocument) ||
    "Unnamed property document";

  const notes = Array.isArray(
    document.extractionNotes,
  )
    ? [...document.extractionNotes]
    : [];

  const statedAddress =
    cleanText(document.statedAddress);

  const system =
    document.coordinateSystem;

  const referencePointId =
    normalizeBeaconId(
      document.referencePointId,
    );

  let coordinates:
    GPSCoordinates | null = null;

  if (system === "WGS84") {
    coordinates =
      normalizeGPSCoordinates(
        document.latitude,
        document.longitude,
      );

    if (!coordinates) {
      notes.push(
        "No complete valid WGS84 latitude/longitude pair was available.",
      );
    }
  } else if (
    system === "UTM" ||
    system === "MINNA_UTM"
  ) {
    if (document.utm) {
      const conversion =
        convertUTMToGPS(
          document.utm,
        );

      coordinates =
        conversion.coordinates;

      notes.push(
        conversion.message,
      );
    } else {
      notes.push(
        "The document indicates projected coordinates, but no complete document-level UTM point was available.",
      );
    }
  } else {
    notes.push(
      "The document coordinate reference system is unknown; no geographic location was inferred.",
    );
  }

  if (
    coordinates &&
    !isWithinNigeriaBounds(
      coordinates,
    )
  ) {
    notes.push(
      "The extracted position lies outside Nigeria's approximate geographic bounds. Review the original coordinate reference and transcription.",
    );
  }

  return {
    source: document,

    sourceDocument,

    statedAddress,

    coordinateSystem:
      system,

    coordinates,

    referencePointId,

    notes: uniqueStrings(
      notes,
    ),
  };
}

/*
 * ============================================================
 * DETERMINE POINT CORRESPONDENCE
 * ============================================================
 *
 * Named survey points can only be compared as the same
 * location when their explicit identifiers match.
 *
 * Generic words like "property" are not sufficient.
 * ============================================================
 */

function correspondingReference(
  first: ResolvedDocument,
  second: ResolvedDocument,
): boolean {
  const firstId =
    first.referencePointId;

  const secondId =
    second.referencePointId;

  return Boolean(
    firstId &&
    secondId &&
    firstId === secondId,
  );
}

/*
 * ============================================================
 * CROSS-DOCUMENT COMPARISON
 * ============================================================
 *
 * Distance may be calculated for two valid positions.
 *
 * The engine will only assign proximity/mismatch
 * status when corresponding reference points
 * have been established.
 *
 * Different survey beacons must not be treated
 * as fraudulent coordinates.
 * ============================================================
 */

function compareDocuments(
  documents: ResolvedDocument[],
  options: GPSAnalysisOptions,
): GPSDocumentComparison[] {
  const comparisons:
    GPSDocumentComparison[] = [];

  for (
    let i = 0;
    i < documents.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < documents.length;
      j++
    ) {
      const first =
        documents[i];

      const second =
        documents[j];

      const corresponding =
        correspondingReference(
          first,
          second,
        );

      const comparison =
        compareGPSLocations(
          first.coordinates,
          second.coordinates,
          {
            consistentThresholdMeters:
              options.consistentThresholdMeters,

            mismatchThresholdMeters:
              options.mismatchThresholdMeters,

            correspondingPointsEstablished:
              corresponding,
          },
        );

      comparisons.push({
        firstDocument:
          first.sourceDocument,

        secondDocument:
          second.sourceDocument,

        distanceMeters:
          comparison.distanceMeters,

        status:
          comparison.status,

        explanation:
          comparison.explanation,

        firstReferencePoint:
          first.referencePointId,

        secondReferencePoint:
          second.referencePointId,

        correspondingPointsEstablished:
          corresponding,

        comparisonType:
          corresponding
            ? "same_reference_point"
            : first.coordinates &&
                second.coordinates
              ? "different_reference_points"
              : "unavailable",

        requiresReview:
          corresponding &&
          comparison.status === "mismatch",
      });
    }
  }

  return comparisons;
}

/*
 * ============================================================
 * OVERALL DOCUMENT-LOCATION STATUS
 * ============================================================
 *
 * Insufficient point correspondence cannot yield
 * a positive or negative verification conclusion.
 * ============================================================
 */

function documentLocationStatus(
  documents: ResolvedDocument[],
  comparisons: GPSDocumentComparison[],
): GPSStatus {
  const usable =
    documents.filter(
      (document) =>
        validGPS(
          document.coordinates,
        ),
    );

  if (
    usable.length === 0
  ) {
    return "not_available";
  }

  const comparable =
    comparisons.filter(
      (comparison) =>
        comparison.correspondingPointsEstablished &&
        comparison.distanceMeters !== null,
    );

  if (
    comparable.some(
      (comparison) =>
        comparison.status === "mismatch",
    )
  ) {
    return "mismatch";
  }

  if (
    comparable.length > 0 &&
    comparable.every(
      (comparison) =>
        comparison.status === "consistent",
    ) &&
    usable.length === documents.length
  ) {
    return "consistent";
  }

  return "inconclusive";
}

/*
 * ============================================================
 * MAP COORDINATE SELECTION
 * ============================================================
 *
 * Choose a single document-reported position only
 * when doing so will not conceal competing points.
 * ============================================================
 */

function selectDocumentMapCoordinates(
  documents: ResolvedDocument[],
  status: GPSStatus,
): GPSCoordinates | null {
  if (
    status === "mismatch"
  ) {
    return null;
  }

  const usable =
    documents
      .map(
        (document) =>
          document.coordinates,
      )
      .filter(validGPS);

  if (
    usable.length === 0
  ) {
    return null;
  }

  if (
    usable.length === 1
  ) {
    return usable[0];
  }

  if (
    status === "consistent"
  ) {
    return usable[0];
  }

  return null;
}

/*
 * ============================================================
 * SURVEY BOUNDARY HELPERS
 * ============================================================
 */

function unavailableBoundary(
  sourceDocument: string,
  reason: string,
  status: SurveyBoundary["status"] =
    "not_available",
): SurveyBoundary {
  return {
    status,

    sourceDocument,

    points: [],

    closed: false,

    coordinateSystem:
      "WGS84",

    sequenceEstablished:
      false,

    mapReady:
      false,

    centroid:
      null,

    documentReported:
      true,

    independentlyVerified:
      false,

    findings: [],

    limitations: [
      reason,
    ],
  };
}

function emptyMeasurements(
  sourceDocument: string,
  reason: string,
): SurveyMeasurements {
  return {
    sourceDocument,

    coordinateSystem:
      "UNKNOWN",

    sideLengths: [],

    perimeterMeters:
      null,

    calculatedAreaSquareMeters:
      null,

    calculatedAreaHectares:
      null,

    statedAreaSquareMeters:
      null,

    areaComparison:
      null,

    calculationMethod:
      "Unavailable",

    geometryValid:
      false,

    requiresSurveyorReview:
      false,

    findings: [],

    limitations: [
      reason,
    ],
  };
}

/*
 * ============================================================
 * STATED LAND AREA CONVERSION
 * ============================================================
 *
 * Missing or unsupported units do not receive
 * an assumed conversion.
 * ============================================================
 */

function statedAreaSquareMeters(
  document: ExtractedGPSData,
): number | null {
  const value =
    finiteNumber(
      document.statedLandArea,
    );

  if (
    value === null ||
    value <= 0
  ) {
    return null;
  }

  switch (
    document.statedLandAreaUnit
  ) {
    case "sqm":
      return value;

    case "hectares":
      return value * 10000;

    case "acres":
      return value * 4046.8564224;

    case "sqft":
      return value * 0.09290304;

    default:
      return null;
  }
}

/*
 * ============================================================
 * WGS84 GEOGRAPHIC COORDINATES TO UTM
 * ============================================================
 *
 * Needed to compare a document-stated geographic
 * reference point with a valid projected survey boundary.
 *
 * This is a forward Transverse Mercator calculation
 * for WGS84 only.
 *
 * The UTM zone and hemisphere come from the validated
 * survey reference, never from guesswork.
 *
 * This function is private to the analysis module.
 * ============================================================
 */

function wgs84ToUTM(
  coordinates: GPSCoordinates,
  zone: number,
  hemisphere: "N" | "S",
): ProjectedPoint | null {
  if (
    !isValidGPSCoordinates(
      coordinates,
    ) ||
    !Number.isInteger(zone) ||
    zone < 1 ||
    zone > 60
  ) {
    return null;
  }

  const latitude =
    coordinates.latitude;

  if (
    latitude < -80 ||
    latitude > 84
  ) {
    return null;
  }

  if (
    hemisphere === "N" &&
    latitude < 0
  ) {
    return null;
  }

  if (
    hemisphere === "S" &&
    latitude > 0
  ) {
    return null;
  }

  const a =
    6378137.0;

  const f =
    1 / 298.257223563;

  const e2 =
    f * (2 - f);

  const ep2 =
    e2 / (1 - e2);

  const k0 =
    0.9996;

  const phi =
    latitude * Math.PI / 180;

  const lambda =
    coordinates.longitude *
    Math.PI / 180;

  const centralMeridianDegrees =
    (zone - 1) * 6 -
    180 +
    3;

  const lambda0 =
    centralMeridianDegrees *
    Math.PI / 180;

  const sinPhi =
    Math.sin(phi);

  const cosPhi =
    Math.cos(phi);

  const tanPhi =
    Math.tan(phi);

  const N =
    a /
    Math.sqrt(
      1 -
      e2 *
      sinPhi *
      sinPhi,
    );

  const T =
    tanPhi * tanPhi;

  const C =
    ep2 * cosPhi * cosPhi;

  const A =
    cosPhi *
    (lambda - lambda0);

  const e4 =
    e2 * e2;

  const e6 =
    e4 * e2;

  const M =
    a *
    (
      (
        1 -
        e2 / 4 -
        3 * e4 / 64 -
        5 * e6 / 256
      ) * phi -

      (
        3 * e2 / 8 +
        3 * e4 / 32 +
        45 * e6 / 1024
      ) * Math.sin(2 * phi) +

      (
        15 * e4 / 256 +
        45 * e6 / 1024
      ) * Math.sin(4 * phi) -

      (
        35 * e6 / 3072
      ) * Math.sin(6 * phi)
    );

  const easting =
    k0 *
    N *
    (
      A +

      (
        1 -
        T +
        C
      ) *
      Math.pow(A, 3) /
      6 +

      (
        5 -
        18 * T +
        T * T +
        72 * C -
        58 * ep2
      ) *
      Math.pow(A, 5) /
      120
    ) +
    500000;

  let northing =
    k0 *
    (
      M +

      N *
      tanPhi *
      (
        A * A / 2 +

        (
          5 -
          T +
          9 * C +
          4 * C * C
        ) *
        Math.pow(A, 4) /
        24 +

        (
          61 -
          58 * T +
          T * T +
          600 * C -
          330 * ep2
        ) *
        Math.pow(A, 6) /
        720
      )
    );

  if (
    hemisphere === "S"
  ) {
    northing +=
      10000000;
  }

  if (
    !Number.isFinite(easting) ||
    !Number.isFinite(northing)
  ) {
    return null;
  }

  /*
   * This comparison is intended for the
   * local region of the declared UTM zone.
   *
   * Avoid interpreting far-away coordinates
   * through an unrelated UTM projection.
   */
  const longitudeDifference =
    Math.abs(
      coordinates.longitude -
      centralMeridianDegrees,
    );

  if (
    longitudeDifference > 6
  ) {
    return null;
  }

  return {
    id:
      "DOCUMENT_REPORTED_LOCATION",

    easting,

    northing,
  };
}

/*
 * ============================================================
 * GPS LOCATION VERSUS SURVEY BOUNDARY
 * ============================================================
 *
 * A coordinate is compared with the survey polygon
 * only when the polygon has valid projected geometry.
 *
 * Containment is a geometric observation.
 *
 * It is NOT proof of legal ownership, and a point
 * outside the polygon is not automatically fraud.
 * ============================================================
 */

function compareLocationToBoundary(
  document: ResolvedDocument,
  geometry: ReturnType<
    typeof calculateSurveyGeometry
  >,
): SurveyLocationComparison | null {
  if (
    !geometry.valid ||
    !geometry.reference ||
    !validGPS(
      document.coordinates,
    )
  ) {
    return null;
  }

  const projected =
    wgs84ToUTM(
      document.coordinates,
      geometry.reference.zone,
      geometry.reference.hemisphere,
    );

  if (!projected) {
    return {
      status:
        "inconclusive",

      reportedCoordinates:
        document.coordinates,

      boundaryCentroid:
        geometry.centroid,

      distanceToCentroidMeters:
        null,

      distanceToBoundaryMeters:
        null,

      pointInsideBoundary:
        null,

      referenceRelationshipEstablished:
        false,

      explanation:
        "The stated geographic coordinate could not be safely compared using the declared survey projection.",

      requiresReview:
        true,
    };
  }

  const comparison =
    comparePointWithProjectedBoundary(
      projected,
      geometry.orderedPoints,
    );

  if (
    !comparison.valid
  ) {
    return {
      status:
        "inconclusive",

      reportedCoordinates:
        document.coordinates,

      boundaryCentroid:
        geometry.centroid,

      distanceToCentroidMeters:
        null,

      distanceToBoundaryMeters:
        null,

      pointInsideBoundary:
        null,

      referenceRelationshipEstablished:
        false,

      explanation:
        comparison.explanation,

      requiresReview:
        true,
    };
  }

  const beaconIds =
    new Set(
      geometry.orderedPoints.map(
        (point) =>
          normalizeBeaconId(
            point.id,
          ),
      ),
    );

  const referenceRelationshipEstablished =
    Boolean(
      document.referencePointId &&
      beaconIds.has(
        document.referencePointId,
      ),
    );

  /*
   * Do not assign a parcel consistency verdict
   * merely because the point is inside or outside
   * an indicative document-derived polygon.
   *
   * The point may represent a control point,
   * a plot centroid, a road location, or another
   * named reference position.
   */
  return {
    status:
      "inconclusive",

    reportedCoordinates:
      document.coordinates,

    boundaryCentroid:
      geometry.centroid,

    distanceToCentroidMeters:
      comparison.distanceToCentroidMeters,

    distanceToBoundaryMeters:
      comparison.distanceToBoundaryMeters,

    pointInsideBoundary:
      comparison.insideBoundary,

    referenceRelationshipEstablished,

    explanation:
      comparison.explanation +
      " The meaning of the stated GPS reference point must be established before using this observation as a parcel-consistency conclusion.",

    requiresReview:
      comparison.insideBoundary === false,
  };
}

/*
 * ============================================================
 * ANALYZE SURVEY BEACONS AND BOUNDARY
 * ============================================================
 *
 * A document may declare the UTM CRS once and then
 * list multiple beacon coordinates in a table.
 *
 * The reference declaration must be explicit.
 *
 * The boundary sequence must also be explicit.
 * ============================================================
 */

function analyzeSurvey(
  resolved: ResolvedDocument,
  options: GPSAnalysisOptions,
): SurveyAnalysis | null {
  const document =
    resolved.source;

  const originalBeacons =
    Array.isArray(
      document.surveyBeacons,
    )
      ? document.surveyBeacons
      : [];

  if (
    originalBeacons.length === 0
  ) {
    return null;
  }

  const sourceDocument =
    resolved.sourceDocument;

  const findings: string[] = [];

  const limitations: string[] = [];

  const reference =
    document.coordinateReference ??
    null;

  /*
   * Explicit source-reference information
   * is required before creating a plot.
   */
  const referenceEstablished =
    reference?.explicitlyStated === true;

  if (
    !referenceEstablished
  ) {
    const reason =
      "Survey beacons were extracted, but a complete explicitly established coordinate reference is required before geographic boundary reconstruction.";

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "incomplete",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings: [
        `${originalBeacons.length} survey beacon(s) were extracted from ${sourceDocument}.`,
      ],

      limitations: [
        reason,
      ],
    };
  }

  if (
    reference.coordinateSystem ===
      "MINNA_UTM" ||
    normalizeDatum(
      reference.datum,
    ) === "MINNA"
  ) {
    const reason =
      "The survey uses Minna datum. An appropriate validated transformation is required before displaying its boundary on a WGS84 map.";

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "unsupported_coordinate_system",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings: [],

      limitations: [
        reason,
      ],
    };
  }

  if (
    reference.coordinateSystem !== "UTM" ||
    normalizeDatum(
      reference.datum,
    ) !== "WGS84"
  ) {
    const reason =
      "The extracted survey reference does not establish a supported WGS84 UTM projection.";

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "unsupported_coordinate_system",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings: [],

      limitations: [
        reason,
      ],
    };
  }

  /*
   * Individual beacons often omit CRS details
   * because the survey-plan heading applies
   * to the entire coordinate table.
   *
   * Inherit metadata only from the explicitly
   * established source reference.
   */
  const beaconsWithReference =
    originalBeacons.map(
      (beacon) => ({
        ...beacon,

        coordinateSystem:
          beacon.coordinateSystem === "UNKNOWN" &&
          beacon.easting !== null &&
          beacon.northing !== null
            ? ("UTM" as const)
            : beacon.coordinateSystem,

        sourceDocument:
          beacon.sourceDocument ||
          sourceDocument,
      }),
    );

  const converted =
    convertSurveyBeacons(
      beaconsWithReference,
      {
        coordinateReference:
          reference,

        documentUTM:
          document.utm,

        documentUTMExplicitlyStated:
          referenceEstablished &&
          document.utm !== null,
      },
    );

  findings.push(
    ...converted.findings,
  );

  const sequence =
    Array.isArray(
      document.boundarySequence,
    )
      ? document.boundarySequence
      : [];

  if (
    document.boundarySequenceEstablished !== true
  ) {
    const reason =
      "The survey beacon boundary sequence was not explicitly established from the original plan. No polygon or land-area calculation was generated.";

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "incomplete",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings,

      limitations: [
        reason,
      ],
    };
  }

  const sequenceValidation =
    validateBoundarySequence(
      converted.convertedBeacons,
      sequence,
    );

  if (
    !sequenceValidation.valid
  ) {
    const reason =
      sequenceValidation.errors.join(" ");

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "invalid_geometry",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings,

      limitations: [
        reason,
      ],
    };
  }

  /*
   * ==========================================================
   * GEOMETRIC CALCULATION
   * ==========================================================
   */

  const geometry =
    calculateSurveyGeometry(
      converted.convertedBeacons,
      sequence,
      sourceDocument,
    );

  if (!geometry.valid) {
    const reason =
      geometry.errors.join(" ") ||
      "The survey polygon could not be calculated.";

    return {
      boundary:
        unavailableBoundary(
          sourceDocument,
          reason,
          "invalid_geometry",
        ),

      measurement:
        emptyMeasurements(
          sourceDocument,
          reason,
        ),

      locationComparison:
        null,

      findings,

      limitations: [
        reason,
        ...geometry.warnings,
      ],
    };
  }

  /*
   * ==========================================================
   * BOUNDARY POINTS
   * ==========================================================
   */

  const points:
    SurveyBoundaryPoint[] =
    geometry.orderedPoints.map(
      (point, index) => ({
        beaconId:
          point.id,

        order:
          index + 1,

        originalEasting:
          point.easting,

        originalNorthing:
          point.northing,

        coordinates:
          geometry.geographicPoints[index],

        sourceDocument,

        coordinateSystem:
          "UTM",

        conversionStatus:
          "converted",
      }),
    );

  const boundary:
    SurveyBoundary = {
      status:
        "available",

      sourceDocument,

      points,

      closed:
        true,

      coordinateSystem:
        "WGS84",

      sequenceEstablished:
        true,

      mapReady:
        true,

      centroid:
        geometry.centroid,

      documentReported:
        true,

      independentlyVerified:
        false,

      findings: [
        `${points.length} survey beacons formed a geometrically valid document-reported polygon.`,
      ],

      limitations: [
        "This polygon was reconstructed from submitted survey coordinates, not from official cadastral boundary records.",
      ],
    };

  /*
   * ==========================================================
   * AREA COMPARISON
   * ==========================================================
   */

  const statedArea =
    statedAreaSquareMeters(
      document,
    );

  const areaComparison:
    LandAreaComparison =
    compareLandAreas(
      geometry.areaSquareMeters,
      statedArea,
      options.areaTolerancePercent ?? 2,
    );

  const measurementFindings: string[] = [
    `Approximate survey-grid area: ${geometry.areaSquareMeters?.toFixed(2) ?? "unavailable"} square metres.`,

    `Approximate survey-grid perimeter: ${geometry.perimeterMeters?.toFixed(2) ?? "unavailable"} metres.`,
  ];

  if (
    areaComparison.status ===
    "difference_detected"
  ) {
    measurementFindings.push(
      areaComparison.explanation,
    );
  } else if (
    areaComparison.status ===
    "within_tolerance"
  ) {
    measurementFindings.push(
      areaComparison.explanation,
    );
  } else {
    measurementFindings.push(
      "The land-area comparison was not completed because a usable document-stated area was unavailable.",
    );
  }

  const measurements:
    SurveyMeasurements = {
      sourceDocument,

      coordinateSystem:
        "UTM",

      sideLengths:
        geometry.sideLengths,

      perimeterMeters:
        geometry.perimeterMeters,

      calculatedAreaSquareMeters:
        geometry.areaSquareMeters,

      calculatedAreaHectares:
        geometry.areaHectares,

      statedAreaSquareMeters:
        statedArea,

      areaComparison,

      calculationMethod:
        "Shoelace formula using document-reported WGS84 UTM grid coordinates; planar side lengths and perimeter.",

      geometryValid:
        true,

      requiresSurveyorReview:
        areaComparison.requiresReview,

      findings:
        measurementFindings,

      limitations:
        geometry.warnings,
    };

  findings.push(
    ...measurementFindings,
  );

  limitations.push(
    ...geometry.warnings,
  );

  /*
   * ==========================================================
   * LOCATION-TO-BOUNDARY COMPARISON
   * ==========================================================
   */

  const locationComparison =
    options.enableBoundaryLocationComparison === false
      ? null
      : compareLocationToBoundary(
          resolved,
          geometry,
        );

  if (
    locationComparison
  ) {
    findings.push(
      locationComparison.explanation,
    );
  }

  return {
    boundary,

    measurement:
      measurements,

    locationComparison,

    findings:
      uniqueStrings(
        findings,
      ),

    limitations:
      uniqueStrings(
        limitations,
      ),
  };
}

/*
 * ============================================================
 * PREPARE MAP DATA
 * ============================================================
 *
 * The frontend can use:
 *
 * - markerCoordinates
 * - center
 * - boundaryPoints
 * - showBoundary
 * - fullMapUrl
 *
 * OpenStreetMap does not independently verify
 * the submitted geographic data.
 *
 * The full-map URL is a navigation fallback.
 * ============================================================
 */

function buildMapData(
  documentMarker: GPSCoordinates | null,
  boundaries: SurveyBoundary[],
): GPSMapData | null {
  const availableBoundaries =
    boundaries.filter(
      (boundary) =>
        boundary.status === "available" &&
        boundary.mapReady &&
        boundary.points.length >= 3,
    );

  /*
   * A single polygon can be used as the
   * representative map boundary.
   *
   * Multiple competing boundaries require a
   * more explicit map comparison interface.
   */
  const selectedBoundary =
    availableBoundaries.length === 1
      ? availableBoundaries[0]
      : null;

  const polygonPoints =
    selectedBoundary
      ? selectedBoundary.points.map(
          (point) =>
            point.coordinates,
        )
      : [];

  const center =
    documentMarker ||
    selectedBoundary?.centroid ||
    polygonPoints[0] ||
    null;

  if (
    !center ||
    !isValidGPSCoordinates(
      center,
    ) ||
    !isWithinNigeriaBounds(
      center,
    )
  ) {
    return null;
  }

  const latitude =
    center.latitude;

  const longitude =
    center.longitude;

  const mapUrl =
    "https://www.openstreetmap.org/" +
    `?mlat=${encodeURIComponent(String(latitude))}` +
    `&mlon=${encodeURIComponent(String(longitude))}` +
    `#map=17/${latitude}/${longitude}`;

  return {
    available:
      true,

    center,

    markerCoordinates:
      documentMarker,

    boundaryPoints:
      polygonPoints,

    showBoundary:
      selectedBoundary !== null,

    sourceDocument:
      selectedBoundary?.sourceDocument ||
      "Document-reported location",

    mapProvider:
      "openstreetmap",

    label:
      selectedBoundary
        ? "Document-Reported Survey Boundary"
        : "Document-Reported GPS Location",

    fullMapUrl:
      mapUrl,

    documentReported:
      true,

    independentlyVerified:
      false,
  };
}

/*
 * ============================================================
 * MAIN GPS ANALYSIS
 * ============================================================
 */

export function analyzeGPSDocuments(
  extractedDocuments: ExtractedGPSData[],
  options: GPSAnalysisOptions = {},
): GPSAnalysisResult {
  if (
    !Array.isArray(extractedDocuments) ||
    extractedDocuments.length === 0
  ) {
    return emptyResult();
  }

  /*
   * ==========================================================
   * RESOLVE DOCUMENTS
   * ==========================================================
   */

  const documents =
    extractedDocuments.map(
      resolveDocument,
    );

  const sourceDocuments =
    uniqueStrings(
      documents.map(
        (document) =>
          document.sourceDocument,
      ),
    );

  const addresses =
    uniqueStrings(
      documents.map(
        (document) =>
          document.statedAddress,
      ),
    );

  const findings: string[] = [];

  const limitations: string[] = [
    "All geographic information is derived from uploaded documents and has not been independently authenticated.",

    "Document-coordinate consistency is not proof of legal title, land ownership, physical occupation, or registered survey accuracy.",

    "No government cadastral registry, official survey records, or physical site inspection were checked.",
  ];

  const structuredFindings:
    GPSStructuredFinding[] = [];

  /*
   * ==========================================================
   * DOCUMENT COORDINATE COMPARISONS
   * ==========================================================
   */

  const documentComparisons =
    compareDocuments(
      documents,
      options,
    );

  let status =
    documentLocationStatus(
      documents,
      documentComparisons,
    );

  const usableCoordinateDocuments =
    documents.filter(
      (document) =>
        validGPS(
          document.coordinates,
        ),
    );

  if (
    usableCoordinateDocuments.length === 0
  ) {
    findings.push(
      "No safely convertible document-level latitude/longitude coordinate pair was available.",
    );
  } else {
    findings.push(
      `${usableCoordinateDocuments.length} of ${documents.length} document(s) supplied usable document-level geographic coordinates.`,
    );
  }

  /*
   * ==========================================================
   * WRITTEN ADDRESS OBSERVATIONS
   * ==========================================================
   */

  if (
    addresses.length > 1
  ) {
    const description =
      "Different written property locations were extracted. Text differences alone do not establish a geographic mismatch.";

    findings.push(
      description,
    );

    addFinding(
      structuredFindings,
      "GPS_ADDRESS_VARIATION",
      "Different stated property locations",
      description,
      "attention",
      sourceDocuments,
      true,
    );
  }

  /*
   * ==========================================================
   * CROSS-DOCUMENT FINDINGS
   * ==========================================================
   */

  for (
    const comparison of
    documentComparisons
  ) {
    const description =
      `${comparison.firstDocument} versus ` +
      `${comparison.secondDocument}: ` +
      comparison.explanation;

    findings.push(
      description,
    );

    if (
      comparison.status === "mismatch" &&
      comparison.correspondingPointsEstablished
    ) {
      addFinding(
        structuredFindings,
        "GPS_CORRESPONDING_POINT_MISMATCH",
        "Corresponding reference-point discrepancy",
        description,
        "attention",
        [
          comparison.firstDocument,
          comparison.secondDocument,
        ],
        true,
      );
    }
  }

  /*
   * ==========================================================
   * SURVEY BOUNDARIES AND LAND MEASUREMENTS
   * ==========================================================
   */

  const surveyBoundaries:
    SurveyBoundary[] = [];

  const surveyMeasurements:
    SurveyMeasurements[] = [];

  const surveyLocationComparisons:
    SurveyLocationComparison[] = [];

  for (
    const document of documents
  ) {
    const survey =
      analyzeSurvey(
        document,
        options,
      );

    if (!survey) {
      continue;
    }

    surveyBoundaries.push(
      survey.boundary,
    );

    surveyMeasurements.push(
      survey.measurement,
    );

    if (
      survey.locationComparison
    ) {
      surveyLocationComparisons.push(
        survey.locationComparison,
      );
    }

    findings.push(
      ...survey.findings,
    );

    limitations.push(
      ...survey.limitations,
    );

    if (
      survey.boundary.status ===
      "available"
    ) {
      addFinding(
        structuredFindings,
        "GPS_SURVEY_BOUNDARY_RECONSTRUCTED",
        "Survey boundary reconstructed",
        "A document-reported survey polygon was reconstructed from a validated WGS84 UTM reference and explicit beacon sequence. Official boundary registration was not checked.",
        "information",
        [
          document.sourceDocument,
        ],
      );
    } else {
      addFinding(
        structuredFindings,
        "GPS_SURVEY_BOUNDARY_UNAVAILABLE",
        "Survey boundary not reconstructed",
        survey.boundary.limitations.join(" "),
        "information",
        [
          document.sourceDocument,
        ],
      );
    }

    const areaComparison =
      survey.measurement.areaComparison;

    if (
      areaComparison?.status ===
      "difference_detected"
    ) {
      addFinding(
        structuredFindings,
        "GPS_LAND_AREA_DIFFERENCE",
        "Calculated and stated land areas differ",
        areaComparison.explanation,
        "attention",
        [
          document.sourceDocument,
        ],
        true,
      );
    }

    if (
      survey.locationComparison?.pointInsideBoundary ===
      false
    ) {
      addFinding(
        structuredFindings,
        "GPS_POINT_OUTSIDE_RECONSTRUCTED_BOUNDARY",
        "Reported coordinate lies outside reconstructed boundary",
        survey.locationComparison.explanation,
        "attention",
        [
          document.sourceDocument,
        ],
        true,
      );
    }
  }

  /*
   * ==========================================================
   * GEOGRAPHIC BOUNDS WARNINGS
   * ==========================================================
   */

  const outsideNigeria =
    usableCoordinateDocuments.filter(
      (document) =>
        document.coordinates &&
        !isWithinNigeriaBounds(
          document.coordinates,
        ),
    );

  if (
    outsideNigeria.length > 0
  ) {
    const description =
      `${outsideNigeria.length} document(s) contained geographic positions outside Nigeria's approximate bounds. Confirm source coordinate systems and extracted numbers.`;

    findings.push(
      description,
    );

    addFinding(
      structuredFindings,
      "GPS_OUTSIDE_NIGERIA",
      "Coordinates outside approximate Nigeria bounds",
      description,
      "attention",
      outsideNigeria.map(
        (document) =>
          document.sourceDocument,
      ),
      true,
    );

    if (
      status === "consistent"
    ) {
      status =
        "inconclusive";
    }
  }

  /*
   * ==========================================================
   * EXTRACTION WARNINGS
   * ==========================================================
   */

  for (
    const document of documents
  ) {
    for (
      const note of document.notes
    ) {
      findings.push(
        `${document.sourceDocument}: ${note}`,
      );
    }
  }

  /*
   * ==========================================================
   * SELECT MAP POSITION
   * ==========================================================
   */

  const documentMarker =
    selectDocumentMapCoordinates(
      documents,
      status,
    );

  const mapData =
    buildMapData(
      documentMarker,
      surveyBoundaries,
    );

  const mapCoordinates =
    mapData?.center || null;

  const mapAvailable =
    mapData?.available === true;

  /*
   * A reconstructed boundary may exist even when
   * cross-document GPS consistency is inconclusive.
   */
  const availableBoundaries =
    surveyBoundaries.filter(
      (boundary) =>
        boundary.status === "available",
    );

  if (
    status === "not_available" &&
    availableBoundaries.length > 0
  ) {
    status =
      "inconclusive";

    findings.push(
      "Survey boundary geometry was reconstructed, but sufficient corresponding document-level reference points were not available for an overall GPS consistency verdict.",
    );
  }

  /*
   * ==========================================================
   * SURVEYOR REVIEW REQUIREMENT
   * ==========================================================
   */

  const requiresSurveyorReview =
    structuredFindings.some(
      (finding) =>
        finding.requiresReview,
    ) ||
    surveyMeasurements.some(
      (measurement) =>
        measurement.requiresSurveyorReview,
    ) ||
    surveyLocationComparisons.some(
      (comparison) =>
        comparison.requiresReview,
    );

  /*
   * ==========================================================
   * FINAL GPS ASSESSMENT
   * ==========================================================
   */

  return {
    status,

    coordinates:
      mapCoordinates,

    statedAddress:
      addresses.length === 1
        ? addresses[0]
        : "",

    coordinateSystem:
      mapCoordinates
        ? "WGS84"
        : documents.length === 1
          ? documents[0].coordinateSystem
          : "UNKNOWN",

    sourceDocuments,

    documentComparisons,

    mapAvailable,

    findings:
      uniqueStrings(
        findings,
      ),

    limitations:
      uniqueStrings(
        limitations,
      ),

    independentlyVerified:
      false,

    surveyBoundaries,

    surveyMeasurements,

    surveyLocationComparisons,

    mapData,

    structuredFindings,

    analysisMethod:
      "AI-extracted document coordinates, validated WGS84 UTM transformation, projected survey polygon geometry, geographic distance assessment and document-to-document comparison.",

    dataSource:
      "uploaded_documents",

    requiresSurveyorReview,
  };
}

/*
 * ============================================================
 * SINGLE-DOCUMENT ANALYSIS
 * ============================================================
 */

export function analyzeSingleGPSDocument(
  document: ExtractedGPSData,
): GPSAnalysisResult {
  return analyzeGPSDocuments([
    document,
  ]);
}

/*
 * ============================================================
 * GPS ANALYSIS SUMMARY
 * ============================================================
 */

export function summarizeGPSAnalysis(
  result: GPSAnalysisResult,
): string {
  const boundaryCount =
    (
      result.surveyBoundaries ||
      []
    ).filter(
      (boundary) =>
        boundary.status === "available",
    ).length;

  const boundaryStatement =
    boundaryCount > 0
      ? ` ${boundaryCount} document-reported survey boundary polygon(s) were reconstructed for geographic review.`
      : "";

  if (
    result.status === "consistent"
  ) {
    return (
      "Corresponding document-reported geographic points are " +
      "within the configured proximity threshold." +
      boundaryStatement +
      " This does not establish legal parcel identity or official survey validity."
    );
  }

  if (
    result.status === "mismatch"
  ) {
    return (
      "Corresponding document-reported geographic points show a discrepancy requiring investigation." +
      boundaryStatement +
      " This does not independently establish forgery or fraud."
    );
  }

  if (
    result.status === "not_available"
  ) {
    return (
      "Insufficient safely interpretable geographic information was available for a GPS assessment." +
      boundaryStatement
    );
  }

  return (
    "The available document-reported geographic information " +
    "does not establish a conclusive GPS consistency result." +
    boundaryStatement +
    " Further review may be needed to establish reference-point relationships, survey boundaries and coordinate accuracy."
  );
}