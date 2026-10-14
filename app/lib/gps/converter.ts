/*
 * ============================================================
 * PROPERTYSURE AI — GPS COORDINATE CONVERTER
 *
 * File: app/lib/gps/converter.ts
 * ============================================================
 *
 * PURPOSE
 *
 * 1. Convert supported WGS84 UTM coordinates to GPS.
 * 2. Convert individual survey beacon coordinates.
 * 3. Convert batches of survey beacons.
 * 4. Preserve original geographic survey values.
 * 5. Use explicitly established coordinate references.
 * 6. Detect unsupported or incomplete conversions.
 * 7. Prepare geographic positions for survey mapping.
 *
 * SUPPORTED:
 *
 * - WGS84 latitude / longitude
 * - WGS84 UTM zones 1–60
 * - Northern and southern hemispheres
 * - Beacon-specific or explicitly documented CRS metadata
 *
 * NOT AUTOMATICALLY SUPPORTED:
 *
 * - Minna datum transformations
 * - Unknown coordinate datum
 * - Unknown UTM zone
 * - Unknown hemisphere
 * - Arbitrary local survey grids
 *
 * IMPORTANT:
 *
 * Converted positions are derived from submitted documents.
 *
 * They are not independently verified physical,
 * cadastral, or legal boundary positions.
 *
 * ============================================================
 */

import type {
  CoordinateConversionStatus,
  CoordinateReferenceDetails,
  CoordinateSystem,
  GPSCoordinates,
  GPSHemisphere,
  SurveyBeacon,
  UTMCoordinates,
} from "./types";

import {
  isValidGPSCoordinates,
  isValidUTMCoordinates,
  isValidUTMZone,
  isValidUTMHemisphere,
  normalizeBeaconId,
  normalizeGPSCoordinates,
  roundCoordinate,
} from "./coordinates";

/*
 * ============================================================
 * CONVERSION RESULT
 * ============================================================
 *
 * Existing result structure preserved.
 * ============================================================
 */

export type CoordinateConversionResult = {
  success: boolean;

  coordinates: GPSCoordinates | null;

  sourceSystem: CoordinateSystem;

  targetSystem: "WGS84";

  status: CoordinateConversionStatus;

  message: string;

  independentlyVerified: false;
};

/*
 * ============================================================
 * BEACON CONVERSION OPTIONS
 * ============================================================
 *
 * A survey plan may list all beacon coordinates in one
 * table while declaring the CRS only once in its heading.
 *
 * The caller may supply the document's explicitly stated
 * coordinate reference to each beacon.
 *
 * It must not supply guessed projection metadata.
 * ============================================================
 */

export type SurveyBeaconConversionOptions = {
  coordinateReference?: CoordinateReferenceDetails | null;

  /*
   * Optional document-level UTM metadata.
   *
   * Use only when these fields were explicitly supported
   * by the uploaded document.
   */
  documentUTM?: UTMCoordinates | null;

  /*
   * True only when documentUTM metadata was extracted
   * from the actual submitted document.
   */
  documentUTMExplicitlyStated?: boolean;
};

/*
 * ============================================================
 * BEACON CONVERSION RESULT
 * ============================================================
 */

export type SurveyBeaconConversionResult = {
  beaconId: string;

  sourceDocument: string;

  success: boolean;

  coordinates: GPSCoordinates | null;

  originalEasting: number | null;

  originalNorthing: number | null;

  sourceSystem: CoordinateSystem;

  status: CoordinateConversionStatus;

  message: string;

  beacon: SurveyBeacon;

  independentlyVerified: false;
};

/*
 * ============================================================
 * BATCH CONVERSION RESULT
 * ============================================================
 */

export type SurveyBeaconBatchResult = {
  totalBeacons: number;

  convertedCount: number;

  alreadyGeographicCount: number;

  failedCount: number;

  allConverted: boolean;

  results: SurveyBeaconConversionResult[];

  convertedBeacons: SurveyBeacon[];

  findings: string[];

  independentlyVerified: false;
};

/*
 * ============================================================
 * DATUM NORMALIZATION
 * ============================================================
 *
 * Keep the public function compatible with existing
 * references in the Essential verification engine.
 *
 * EPSG:4326 identifies WGS84 geographic coordinates,
 * but should not be used by itself to identify a UTM
 * projection.
 * ============================================================
 */

export function normalizeDatum(
  value: unknown,
): "WGS84" | "MINNA" | "UNKNOWN" {
  if (typeof value !== "string") {
    return "UNKNOWN";
  }

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, "");

  if (
    normalized === "WGS84" ||
    normalized === "WGS1984" ||
    normalized === "EPSG4326" ||
    normalized === "WORLDGEODETICSYSTEM1984"
  ) {
    return "WGS84";
  }

  if (
    normalized === "MINNA" ||
    normalized === "MINNADATUM" ||
    normalized === "MINNAUTM" ||
    normalized === "MINNAELLIPSOID"
  ) {
    return "MINNA";
  }

  return "UNKNOWN";
}

/*
 * ============================================================
 * UTM ZONE FROM KNOWN LONGITUDE
 * ============================================================
 *
 * This is for geographic reference purposes.
 *
 * It must NOT be used to guess the UTM zone
 * of a survey plan from an unknown point.
 * ============================================================
 */

export function longitudeToUTMZone(
  longitude: number,
): number | null {
  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  if (longitude === 180) {
    return 60;
  }

  return Math.floor(
    (longitude + 180) / 6,
  ) + 1;
}

/*
 * ============================================================
 * WGS84 UTM TO GPS
 * ============================================================
 *
 * Uses an inverse Transverse Mercator calculation
 * with WGS84 ellipsoid parameters.
 *
 * The source must have:
 *
 * - Valid UTM easting/northing
 * - Explicit WGS84 datum
 * - Known zone
 * - Known hemisphere
 *
 * This function does not transform Minna coordinates.
 * ============================================================
 */

export function convertWGS84UTMToGPS(
  utm: UTMCoordinates,
): GPSCoordinates | null {
  if (!isValidUTMCoordinates(utm)) {
    return null;
  }

  if (
    normalizeDatum(utm.datum) !== "WGS84"
  ) {
    return null;
  }

  const {
    easting,
    northing,
    zone,
    hemisphere,
  } = utm;

  if (
    !isValidUTMZone(zone) ||
    !isValidUTMHemisphere(hemisphere)
  ) {
    return null;
  }

  /*
   * WGS84 ellipsoid.
   */
  const a = 6378137.0;

  const f = 1 / 298.257223563;

  const e2 = f * (2 - f);

  const ep2 = e2 / (1 - e2);

  const k0 = 0.9996;

  /*
   * Remove false easting.
   */
  const x = easting - 500000;

  /*
   * Remove southern hemisphere false northing.
   */
  let y = northing;

  if (hemisphere === "S") {
    y -= 10000000;
  }

  /*
   * Central meridian of the declared UTM zone.
   */
  const centralMeridianDegrees =
    (zone - 1) * 6 - 180 + 3;

  const centralMeridian =
    (centralMeridianDegrees * Math.PI) /
    180;

  const m = y / k0;

  const mu =
    m /
    (
      a *
      (
        1 -
        e2 / 4 -
        (3 * e2 * e2) / 64 -
        (5 * e2 * e2 * e2) / 256
      )
    );

  const e1 =
    (1 - Math.sqrt(1 - e2)) /
    (1 + Math.sqrt(1 - e2));

  const phi1 =
    mu +
    (
      3 * e1 / 2 -
      27 * Math.pow(e1, 3) / 32
    ) * Math.sin(2 * mu) +
    (
      21 * e1 * e1 / 16 -
      55 * Math.pow(e1, 4) / 32
    ) * Math.sin(4 * mu) +
    (
      151 * Math.pow(e1, 3) / 96
    ) * Math.sin(6 * mu) +
    (
      1097 * Math.pow(e1, 4) / 512
    ) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);

  const cosPhi1 = Math.cos(phi1);

  const tanPhi1 = Math.tan(phi1);

  if (
    Math.abs(cosPhi1) < 1e-12
  ) {
    return null;
  }

  const n1 =
    a /
    Math.sqrt(
      1 - e2 * sinPhi1 * sinPhi1,
    );

  const r1 =
    (
      a * (1 - e2)
    ) /
    Math.pow(
      1 - e2 * sinPhi1 * sinPhi1,
      1.5,
    );

  const t1 =
    tanPhi1 * tanPhi1;

  const c1 =
    ep2 * cosPhi1 * cosPhi1;

  const d =
    x / (n1 * k0);

  const latitudeRadians =
    phi1 -
    (
      (n1 * tanPhi1) / r1
    ) *
    (
      d * d / 2 -
      (
        (
          5 +
          3 * t1 +
          10 * c1 -
          4 * c1 * c1 -
          9 * ep2
        ) * Math.pow(d, 4)
      ) / 24 +
      (
        (
          61 +
          90 * t1 +
          298 * c1 +
          45 * t1 * t1 -
          252 * ep2 -
          3 * c1 * c1
        ) * Math.pow(d, 6)
      ) / 720
    );

  const longitudeRadians =
    centralMeridian +
    (
      d -
      (
        (
          1 +
          2 * t1 +
          c1
        ) * Math.pow(d, 3)
      ) / 6 +
      (
        (
          5 -
          2 * c1 +
          28 * t1 -
          3 * c1 * c1 +
          8 * ep2 +
          24 * t1 * t1
        ) * Math.pow(d, 5)
      ) / 120
    ) / cosPhi1;

  const latitude =
    latitudeRadians * 180 / Math.PI;

  const longitude =
    longitudeRadians * 180 / Math.PI;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const result: GPSCoordinates = {
    latitude:
      roundCoordinate(
        latitude,
        8,
      ),

    longitude:
      roundCoordinate(
        longitude,
        8,
      ),
  };

  if (
    !isValidGPSCoordinates(result)
  ) {
    return null;
  }

  /*
   * UTM is conventionally defined within
   * approximately 80°S to 84°N.
   */
  if (
    result.latitude < -80 ||
    result.latitude > 84
  ) {
    return null;
  }

  return result;
}

/*
 * ============================================================
 * SAFE UTM CONVERSION
 * ============================================================
 *
 * Keeps the original public function.
 *
 * Returns an explanation rather than silently
 * substituting guessed reference parameters.
 * ============================================================
 */

export function convertUTMToGPS(
  utm: UTMCoordinates | null,
): CoordinateConversionResult {
  if (!utm) {
    return {
      success: false,
      coordinates: null,
      sourceSystem: "UNKNOWN",
      targetSystem: "WGS84",
      status: "incomplete",
      message:
        "No UTM coordinate information was provided.",
      independentlyVerified: false,
    };
  }

  const datum = normalizeDatum(
    utm.datum,
  );

  const sourceSystem: CoordinateSystem =
    datum === "MINNA"
      ? "MINNA_UTM"
      : datum === "WGS84"
        ? "UTM"
        : "UNKNOWN";

  /*
   * Minna datum must not be interpreted
   * as WGS84 without a validated transformation.
   */
  if (
    datum === "MINNA"
  ) {
    return {
      success: false,
      coordinates: null,
      sourceSystem: "MINNA_UTM",
      targetSystem: "WGS84",
      status: "unsupported_datum",
      message:
        "Minna datum coordinates were detected. A validated datum transformation is required. No geographic location was generated.",
      independentlyVerified: false,
    };
  }

  if (
    datum === "UNKNOWN"
  ) {
    return {
      success: false,
      coordinates: null,
      sourceSystem,
      targetSystem: "WGS84",
      status: "unsupported_datum",
      message:
        "The survey datum is unknown or unsupported. Conversion to WGS84 was not attempted.",
      independentlyVerified: false,
    };
  }

  if (
    !isValidUTMCoordinates(utm)
  ) {
    return {
      success: false,
      coordinates: null,
      sourceSystem,
      targetSystem: "WGS84",
      status: "incomplete",
      message:
        "UTM conversion requires valid easting, northing, zone, hemisphere and explicitly identified datum.",
      independentlyVerified: false,
    };
  }

  const coordinates =
    convertWGS84UTMToGPS(
      utm,
    );

  if (!coordinates) {
    return {
      success: false,
      coordinates: null,
      sourceSystem,
      targetSystem: "WGS84",
      status: "invalid",
      message:
        "The supplied UTM values did not produce valid geographic coordinates.",
      independentlyVerified: false,
    };
  }

  return {
    success: true,
    coordinates,
    sourceSystem,
    targetSystem: "WGS84",
    status: "converted",
    message:
      "Document-reported WGS84 UTM coordinates were mathematically converted into latitude and longitude. The surveyed location has not been independently verified.",
    independentlyVerified: false,
  };
}

/*
 * ============================================================
 * EXISTING WGS84 NORMALIZATION
 * ============================================================
 */

export function convertWGS84Coordinates(
  latitude: unknown,
  longitude: unknown,
): CoordinateConversionResult {
  const coordinates =
    normalizeGPSCoordinates(
      latitude,
      longitude,
    );

  if (!coordinates) {
    return {
      success: false,
      coordinates: null,
      sourceSystem: "WGS84",
      targetSystem: "WGS84",
      status: "invalid",
      message:
        "The supplied latitude and longitude are missing or invalid.",
      independentlyVerified: false,
    };
  }

  return {
    success: true,
    coordinates,
    sourceSystem: "WGS84",
    targetSystem: "WGS84",
    status: "already_wgs84",
    message:
      "Valid document-reported WGS84 coordinates were normalized. Their physical accuracy has not been independently verified.",
    independentlyVerified: false,
  };
}

/*
 * ============================================================
 * RESOLVE BEACON COORDINATE REFERENCE
 * ============================================================
 *
 * A survey beacon may have easting/northing
 * without repeating the datum and UTM zone
 * shown in the survey plan's heading.
 *
 * Inheritance is allowed only when the
 * document-level metadata is explicitly established.
 *
 * Conflicting reference information is rejected.
 * ============================================================
 */

function resolveBeaconUTM(
  beacon: SurveyBeacon,
  options: SurveyBeaconConversionOptions,
): {
  utm: UTMCoordinates | null;
  issue: string | null;
} {
  if (
    typeof beacon.easting !== "number" ||
    !Number.isFinite(beacon.easting) ||
    typeof beacon.northing !== "number" ||
    !Number.isFinite(beacon.northing)
  ) {
    return {
      utm: null,
      issue:
        "Beacon easting or northing is unavailable.",
    };
  }

  const reference =
    options.coordinateReference || null;

  const referenceTrusted =
    reference?.explicitlyStated === true;

  const documentUTMTrusted =
    options.documentUTMExplicitlyStated === true &&
    options.documentUTM !== null &&
    options.documentUTM !== undefined;

  const documentUTM =
    documentUTMTrusted
      ? options.documentUTM!
      : null;

  /*
   * Explicit beacon metadata takes precedence.
   * If two documented sources disagree, reject.
   */
  const declaredZones: number[] = [];

  if (
    isValidUTMZone(beacon.utmZone)
  ) {
    declaredZones.push(
      beacon.utmZone,
    );
  }

  if (
    referenceTrusted &&
    isValidUTMZone(reference?.utmZone)
  ) {
    declaredZones.push(
      reference!.utmZone!,
    );
  }

  if (
    documentUTM &&
    isValidUTMZone(documentUTM.zone)
  ) {
    declaredZones.push(
      documentUTM.zone,
    );
  }

  if (
    new Set(declaredZones).size > 1
  ) {
    return {
      utm: null,
      issue:
        "Conflicting UTM zones were found in the beacon and document reference information.",
    };
  }

  const declaredHemispheres:
    GPSHemisphere[] = [];

  if (
    isValidUTMHemisphere(beacon.hemisphere)
  ) {
    declaredHemispheres.push(
      beacon.hemisphere,
    );
  }

  if (
    referenceTrusted &&
    isValidUTMHemisphere(
      reference?.hemisphere,
    )
  ) {
    declaredHemispheres.push(
      reference!.hemisphere!,
    );
  }

  if (
    documentUTM &&
    isValidUTMHemisphere(
      documentUTM.hemisphere,
    )
  ) {
    declaredHemispheres.push(
      documentUTM.hemisphere,
    );
  }

  if (
    new Set(declaredHemispheres).size > 1
  ) {
    return {
      utm: null,
      issue:
        "Conflicting UTM hemispheres were found in the beacon and document reference information.",
    };
  }

  const declaredDatumValues =
    [
      beacon.datum || "",

      referenceTrusted
        ? reference?.datum || ""
        : "",

      documentUTM
        ? documentUTM.datum
        : "",
    ].filter(
      (value) =>
        value.trim().length > 0,
    );

  const recognizedDatums =
    declaredDatumValues.map(
      normalizeDatum,
    );

  if (
    declaredDatumValues.length > 1 &&
    (
      new Set(recognizedDatums).size > 1 ||
      (
        recognizedDatums.includes("UNKNOWN") &&
        new Set(
          declaredDatumValues.map(
            (value) =>
              value.trim().toUpperCase(),
          ),
        ).size > 1
      )
    )
  ) {
    return {
      utm: null,
      issue:
        "Conflicting coordinate datums were identified. Automatic geographic conversion is unsafe.",
    };
  }

  const zone =
    declaredZones[0] ?? null;

  const hemisphere =
    declaredHemispheres[0] ?? null;

  const datum =
    declaredDatumValues[0] || "";

  if (
    !isValidUTMZone(zone) ||
    !isValidUTMHemisphere(hemisphere) ||
    !datum
  ) {
    return {
      utm: null,
      issue:
        "The beacon lacks an explicitly established datum, UTM zone or hemisphere.",
    };
  }

  return {
    utm: {
      easting:
        beacon.easting,

      northing:
        beacon.northing,

      zone,

      hemisphere,

      datum,
    },

    issue: null,
  };
}

/*
 * ============================================================
 * CONVERT INDIVIDUAL SURVEY BEACON
 * ============================================================
 *
 * Supports:
 *
 * - Direct WGS84 beacon coordinates
 * - Supported WGS84 UTM beacon coordinates
 *
 * Refuses:
 *
 * - Unknown datum
 * - Minna datum without transformation
 * - Missing zone or hemisphere
 * - Conflicting CRS metadata
 *
 * The returned SurveyBeacon retains the
 * original easting and northing values.
 * ============================================================
 */

export function convertSurveyBeacon(
  beacon: SurveyBeacon,
  options: SurveyBeaconConversionOptions = {},
): SurveyBeaconConversionResult {
  const beaconId =
    normalizeBeaconId(
      beacon.beaconId,
    );

  const sourceDocument =
    beacon.sourceDocument || "";

  function failure(
    status: CoordinateConversionStatus,
    message: string,
  ): SurveyBeaconConversionResult {
    const updatedBeacon: SurveyBeacon = {
      ...beacon,

      beaconId,

      convertedCoordinates: null,

      conversionStatus: status,

      conversionNotes: [
        ...(beacon.conversionNotes || []),
        message,
      ],
    };

    return {
      beaconId,

      sourceDocument,

      success: false,

      coordinates: null,

      originalEasting:
        beacon.easting,

      originalNorthing:
        beacon.northing,

      sourceSystem:
        beacon.coordinateSystem,

      status,

      message,

      beacon: updatedBeacon,

      independentlyVerified: false,
    };
  }

  if (!beaconId) {
    return failure(
      "invalid",
      "Survey beacon identifier is missing.",
    );
  }

  /*
   * ----------------------------------------------------------
   * DIRECT WGS84 BEACON
   * ----------------------------------------------------------
   */

  if (
    beacon.coordinateSystem === "WGS84"
  ) {
    const reference =
      options.coordinateReference;

    /*
     * Require explicit support for geographic WGS84.
     * Beacon datum or explicit document-level reference
     * must establish it.
     */
    const beaconDatum =
      normalizeDatum(
        beacon.datum,
      );

    const referenceEstablishesWGS84 =
      reference?.explicitlyStated === true &&
      reference.coordinateSystem === "WGS84" &&
      normalizeDatum(reference.datum) ===
        "WGS84";

    if (
      beaconDatum !== "WGS84" &&
      !referenceEstablishesWGS84
    ) {
      return failure(
        "incomplete",
        "The beacon's WGS84 geographic reference was not explicitly established.",
      );
    }

    if (
      beaconDatum === "MINNA"
    ) {
      return failure(
        "unsupported_datum",
        "The beacon datum conflicts with WGS84. Conversion was not performed.",
      );
    }

    const coordinates =
      normalizeGPSCoordinates(
        beacon.latitude,
        beacon.longitude,
      );

    if (!coordinates) {
      return failure(
        "invalid",
        "The beacon latitude or longitude is invalid.",
      );
    }

    const message =
      "Document-reported WGS84 beacon coordinates are usable for geographic calculations. Physical survey accuracy has not been independently verified.";

    const updatedBeacon: SurveyBeacon = {
      ...beacon,

      beaconId,

      latitude:
        coordinates.latitude,

      longitude:
        coordinates.longitude,

      convertedCoordinates:
        coordinates,

      conversionStatus:
        "already_wgs84",

      conversionNotes: [
        ...(beacon.conversionNotes || []),
        message,
      ],
    };

    return {
      beaconId,

      sourceDocument,

      success: true,

      coordinates,

      originalEasting:
        beacon.easting,

      originalNorthing:
        beacon.northing,

      sourceSystem:
        "WGS84",

      status:
        "already_wgs84",

      message,

      beacon: updatedBeacon,

      independentlyVerified: false,
    };
  }

  /*
   * ----------------------------------------------------------
   * UNKNOWN REFERENCE SYSTEM
   * ----------------------------------------------------------
   */

  if (
    beacon.coordinateSystem === "UNKNOWN"
  ) {
    return failure(
      "incomplete",
      "The survey beacon coordinate system is unknown. Geographic conversion was not attempted.",
    );
  }

  /*
   * ----------------------------------------------------------
   * MINNA REFERENCE SYSTEM
   * ----------------------------------------------------------
   */

  if (
    beacon.coordinateSystem === "MINNA_UTM"
  ) {
    return failure(
      "unsupported_datum",
      "Minna-based survey coordinates require a validated datum transformation before geographic mapping.",
    );
  }

  /*
   * ----------------------------------------------------------
   * PROJECTED UTM BEACON
   * ----------------------------------------------------------
   */

  const resolved =
    resolveBeaconUTM(
      beacon,
      options,
    );

  if (
    !resolved.utm
  ) {
    return failure(
      "incomplete",
      resolved.issue ||
        "The beacon's UTM reference is incomplete.",
    );
  }

  if (
    normalizeDatum(
      resolved.utm.datum,
    ) !== "WGS84"
  ) {
    return failure(
      "unsupported_datum",
      "The beacon's UTM datum is unsupported for automatic WGS84 conversion.",
    );
  }

  const conversion =
    convertUTMToGPS(
      resolved.utm,
    );

  if (
    !conversion.success ||
    !conversion.coordinates
  ) {
    return failure(
      conversion.status,
      conversion.message,
    );
  }

  const coordinates =
    conversion.coordinates;

  const updatedBeacon: SurveyBeacon = {
    ...beacon,

    beaconId,

    latitude:
      coordinates.latitude,

    longitude:
      coordinates.longitude,

    utmZone:
      resolved.utm.zone,

    hemisphere:
      resolved.utm.hemisphere,

    datum:
      resolved.utm.datum,

    convertedCoordinates:
      coordinates,

    conversionStatus:
      "converted",

    conversionNotes: [
      ...(beacon.conversionNotes || []),
      conversion.message,
    ],
  };

  return {
    beaconId,

    sourceDocument,

    success: true,

    coordinates,

    originalEasting:
      beacon.easting,

    originalNorthing:
      beacon.northing,

    sourceSystem:
      "UTM",

    status:
      "converted",

    message:
      conversion.message,

    beacon:
      updatedBeacon,

    independentlyVerified: false,
  };
}

/*
 * ============================================================
 * CONVERT MULTIPLE SURVEY BEACONS
 * ============================================================
 *
 * Example:
 *
 * A, B, C and D from a single Survey Plan.
 *
 * Conversion does NOT assume those beacons are in
 * the correct legal boundary sequence.
 *
 * Polygon assembly occurs separately after
 * validating the source-defined sequence.
 * ============================================================
 */

export function convertSurveyBeacons(
  beacons: SurveyBeacon[],
  options: SurveyBeaconConversionOptions = {},
): SurveyBeaconBatchResult {
  const results =
    beacons.map(
      (beacon) =>
        convertSurveyBeacon(
          beacon,
          options,
        ),
    );

  const convertedCount =
    results.filter(
      (item) =>
        item.success &&
        item.status === "converted",
    ).length;

  const alreadyGeographicCount =
    results.filter(
      (item) =>
        item.success &&
        item.status === "already_wgs84",
    ).length;

  const failedCount =
    results.filter(
      (item) =>
        !item.success,
    ).length;

  const convertedBeacons =
    results.map(
      (item) =>
        item.beacon,
    );

  const findings: string[] = [];

  findings.push(
    `${results.length} survey beacon(s) were examined.`,
  );

  findings.push(
    `${convertedCount} survey beacon(s) were converted from WGS84 UTM coordinates.`,
  );

  findings.push(
    `${alreadyGeographicCount} survey beacon(s) already supplied supported WGS84 geographic coordinates.`,
  );

  if (
    failedCount > 0
  ) {
    findings.push(
      `${failedCount} survey beacon(s) could not be safely converted.`,
    );
  }

  for (const result of results) {
    if (
      !result.success
    ) {
      findings.push(
        `${result.beaconId || "Unnamed beacon"}: ${result.message}`,
      );
    }
  }

  findings.push(
    "Converted survey coordinates are document-derived. Independent survey registry and physical boundary verification have not been performed.",
  );

  return {
    totalBeacons:
      results.length,

    convertedCount,

    alreadyGeographicCount,

    failedCount,

    allConverted:
      results.length > 0 &&
      failedCount === 0,

    results,

    convertedBeacons,

    findings,

    independentlyVerified: false,
  };
}