/*
 * ============================================================
 * PROPERTYSURE AI — GPS COORDINATES ENGINE
 *
 * File: app/lib/gps/coordinates.ts
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Validate latitude and longitude.
 * 2. Normalize AI-extracted coordinate values.
 * 3. Support decimal degrees and DMS notation.
 * 4. Reject invalid or incomplete coordinate pairs.
 * 5. Validate UTM coordinates.
 * 6. Validate survey beacon data.
 * 7. Validate boundary-point sequences.
 * 8. Detect duplicate and invalid geographic points.
 * 9. Assess coordinate reference system completeness.
 *
 * IMPORTANT:
 *
 * - Never invent geographic coordinates.
 * - Never assume an unknown datum is WGS84.
 * - Never assume an unknown UTM zone or hemisphere.
 * - Never interpret UTM values as latitude/longitude.
 * - Never invent the order of survey boundary points.
 * - Never equate geographic proximity with legal ownership.
 * - Never claim an official survey was independently checked.
 *
 * ============================================================
 */

import type {
  CoordinateReferenceDetails,
  CoordinateSystem,
  GPSCoordinates,
  GPSHemisphere,
  SurveyBeacon,
  UTMCoordinates,
} from "./types";

/*
 * ============================================================
 * GENERAL NUMBER HELPERS
 * ============================================================
 */

function toFiniteNumber(
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

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(
      cleaned,
    )
  ) {
    return null;
  }

  const result = Number(cleaned);

  return Number.isFinite(result)
    ? result
    : null;
}

/*
 * ============================================================
 * LATITUDE VALIDATION
 * ============================================================
 */

export function isValidLatitude(
  value: unknown,
): boolean {
  const latitude = toFiniteNumber(value);

  return (
    latitude !== null &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/*
 * ============================================================
 * LONGITUDE VALIDATION
 * ============================================================
 */

export function isValidLongitude(
  value: unknown,
): boolean {
  const longitude = toFiniteNumber(value);

  return (
    longitude !== null &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/*
 * ============================================================
 * GPS COORDINATE PAIR VALIDATION
 * ============================================================
 */

export function isValidGPSCoordinates(
  value: unknown,
): value is GPSCoordinates {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const coordinates = value as Record<
    string,
    unknown
  >;

  return (
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number" &&
    isValidLatitude(coordinates.latitude) &&
    isValidLongitude(coordinates.longitude)
  );
}

/*
 * ============================================================
 * DECIMAL COORDINATE PARSING
 * ============================================================
 *
 * Supported examples:
 *
 * 6.5244
 * "6.5244"
 * "-0.1276"
 * "6.5244° N"
 * "3.3792 E"
 * "N 6.5244"
 * "W 0.1276"
 *
 * Hemisphere directions must agree with the
 * sign of the numeric coordinate.
 * ============================================================
 */

export function parseDecimalCoordinate(
  value: unknown,
  axis: "latitude" | "longitude",
): number | null {
  const numericValue = toFiniteNumber(value);

  if (numericValue !== null) {
    const valid =
      axis === "latitude"
        ? isValidLatitude(numericValue)
        : isValidLongitude(numericValue);

    return valid ? numericValue : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/[°º˚]/g, "")
    .replace(/\s+/g, "");

  let match = cleaned.match(
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))([NSEW])?$/,
  );

  let numericText = "";
  let hemisphere = "";

  if (match) {
    numericText = match[1];
    hemisphere = match[2] || "";
  } else {
    match = cleaned.match(
      /^([NSEW])([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/,
    );

    if (!match) {
      return null;
    }

    hemisphere = match[1];
    numericText = match[2];
  }

  const numeric = Number(numericText);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  if (
    axis === "latitude" &&
    (hemisphere === "E" || hemisphere === "W")
  ) {
    return null;
  }

  if (
    axis === "longitude" &&
    (hemisphere === "N" || hemisphere === "S")
  ) {
    return null;
  }

  /*
   * Reject contradictory signs.
   *
   * Example:
   *
   * -6 N
   * -3 E
   * +6 S
   *
   * A minus sign is permitted with S/W.
   */
  if (
    hemisphere &&
    numericText.startsWith("-") &&
    (hemisphere === "N" || hemisphere === "E")
  ) {
    return null;
  }

  if (
    hemisphere &&
    numericText.startsWith("+") &&
    (hemisphere === "S" || hemisphere === "W")
  ) {
    return null;
  }

  let result = numeric;

  if (hemisphere === "S" || hemisphere === "W") {
    result = -Math.abs(numeric);
  }

  if (hemisphere === "N" || hemisphere === "E") {
    result = Math.abs(numeric);
  }

  const valid =
    axis === "latitude"
      ? isValidLatitude(result)
      : isValidLongitude(result);

  return valid ? result : null;
}

/*
 * ============================================================
 * DEGREES / MINUTES / SECONDS PARSING
 * ============================================================
 *
 * Examples:
 *
 * 6° 31' 27.84" N
 * 3° 22' 45.12" E
 * 6 31 27.84 N
 * N 6 31 27.84
 *
 * Minutes and seconds must be between 0 and 60.
 * ============================================================
 */

export function parseDMSCoordinate(
  value: unknown,
  axis: "latitude" | "longitude",
): number | null {
  if (typeof value !== "string") {
    return null;
  }

  let cleaned = value
    .trim()
    .toUpperCase()
    .replace(/[°º˚]/g, " ")
    .replace(/[′’']/g, " ")
    .replace(/[″”"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let prefixDirection = "";

  const prefix = cleaned.match(
    /^([NSEW])\s+(.+)$/,
  );

  if (prefix) {
    prefixDirection = prefix[1];
    cleaned = prefix[2];
  }

  const match = cleaned.match(
    /^([+-]?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s+([NSEW]))?$/,
  );

  if (!match) {
    return null;
  }

  const degreesText = match[1];

  const degrees = Number(
    degreesText,
  );

  const minutes = Number(
    match[2],
  );

  const seconds = Number(
    match[3],
  );

  const suffixDirection =
    match[4] || "";

  if (
    prefixDirection &&
    suffixDirection &&
    prefixDirection !== suffixDirection
  ) {
    return null;
  }

  const direction =
    suffixDirection ||
    prefixDirection;

  if (
    !Number.isFinite(degrees) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return null;
  }

  if (
    minutes < 0 ||
    minutes >= 60 ||
    seconds < 0 ||
    seconds >= 60
  ) {
    return null;
  }

  if (
    axis === "latitude" &&
    (direction === "E" || direction === "W")
  ) {
    return null;
  }

  if (
    axis === "longitude" &&
    (direction === "N" || direction === "S")
  ) {
    return null;
  }

  if (
    degreesText.startsWith("-") &&
    (direction === "N" || direction === "E")
  ) {
    return null;
  }

  if (
    degreesText.startsWith("+") &&
    (direction === "S" || direction === "W")
  ) {
    return null;
  }

  const absoluteDegrees =
    Math.abs(degrees) +
    minutes / 60 +
    seconds / 3600;

  let result =
    degreesText.startsWith("-")
      ? -absoluteDegrees
      : absoluteDegrees;

  if (
    direction === "S" ||
    direction === "W"
  ) {
    result = -absoluteDegrees;
  }

  if (
    direction === "N" ||
    direction === "E"
  ) {
    result = absoluteDegrees;
  }

  const valid =
    axis === "latitude"
      ? isValidLatitude(result)
      : isValidLongitude(result);

  return valid ? result : null;
}

/*
 * ============================================================
 * UNIVERSAL COORDINATE PARSER
 * ============================================================
 */

export function parseCoordinate(
  value: unknown,
  axis: "latitude" | "longitude",
): number | null {
  const decimal = parseDecimalCoordinate(
    value,
    axis,
  );

  if (decimal !== null) {
    return decimal;
  }

  return parseDMSCoordinate(
    value,
    axis,
  );
}

/*
 * ============================================================
 * NORMALIZE GPS COORDINATE PAIR
 * ============================================================
 *
 * Numeric normalization only.
 *
 * The caller must independently establish
 * the coordinate reference system.
 * ============================================================
 */

export function normalizeGPSCoordinates(
  latitude: unknown,
  longitude: unknown,
): GPSCoordinates | null {
  const parsedLatitude =
    parseCoordinate(
      latitude,
      "latitude",
    );

  const parsedLongitude =
    parseCoordinate(
      longitude,
      "longitude",
    );

  if (
    parsedLatitude === null ||
    parsedLongitude === null
  ) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
}

/*
 * ============================================================
 * NIGERIAN GEOGRAPHIC BOUNDS
 * ============================================================
 *
 * Broad geographic plausibility check only.
 *
 * These approximate bounds are not an official
 * Nigerian cadastral boundary.
 * ============================================================
 */

export function isWithinNigeriaBounds(
  coordinates: GPSCoordinates,
): boolean {
  return (
    isValidGPSCoordinates(coordinates) &&
    coordinates.latitude >= 4 &&
    coordinates.latitude <= 14.5 &&
    coordinates.longitude >= 2.5 &&
    coordinates.longitude <= 15
  );
}

/*
 * ============================================================
 * UTM ZONE VALIDATION
 * ============================================================
 */

export function isValidUTMZone(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 60
  );
}

/*
 * ============================================================
 * UTM HEMISPHERE VALIDATION
 * ============================================================
 */

export function isValidUTMHemisphere(
  value: unknown,
): value is GPSHemisphere {
  return value === "N" || value === "S";
}

/*
 * ============================================================
 * UTM VALIDATION
 * ============================================================
 *
 * This validates general numeric ranges and metadata.
 *
 * The datum may be WGS84, Minna, or another identified
 * datum, but successful numeric validation does not
 * establish that transformation is supported.
 *
 * Conversion must be handled by converter.ts.
 * ============================================================
 */

export function isValidUTMCoordinates(
  value: unknown,
): value is UTMCoordinates {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const utm = value as Record<
    string,
    unknown
  >;

  const easting =
    toFiniteNumber(
      utm.easting,
    );

  const northing =
    toFiniteNumber(
      utm.northing,
    );

  const zone =
    utm.zone;

  const hemisphere =
    utm.hemisphere;

  const datum =
    utm.datum;

  if (
    easting === null ||
    northing === null
  ) {
    return false;
  }

  return (
    easting >= 100000 &&
    easting <= 900000 &&
    northing >= 0 &&
    northing <= 10000000 &&
    isValidUTMZone(zone) &&
    isValidUTMHemisphere(hemisphere) &&
    typeof datum === "string" &&
    datum.trim().length > 0
  );
}

/*
 * ============================================================
 * BEACON ID NORMALIZATION
 * ============================================================
 */

export function normalizeBeaconId(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

/*
 * ============================================================
 * BASIC BEACON VALIDATION
 * ============================================================
 *
 * A beacon is usable for geographic calculations only when
 * either:
 *
 * - it has a valid WGS84 geographic coordinate pair, or
 * - it has a valid projected easting/northing pair that
 *   will undergo reference-system validation.
 *
 * This helper does not itself perform conversion.
 * ============================================================
 */

export function isUsableSurveyBeacon(
  value: unknown,
): value is SurveyBeacon {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const beacon =
    value as Record<
      string,
      unknown
    >;

  const beaconId =
    normalizeBeaconId(
      beacon.beaconId,
    );

  if (!beaconId) {
    return false;
  }

  const system =
    beacon.coordinateSystem;

  if (
    system !== "WGS84" &&
    system !== "UTM" &&
    system !== "MINNA_UTM" &&
    system !== "UNKNOWN"
  ) {
    return false;
  }

  const gps =
    normalizeGPSCoordinates(
      beacon.latitude,
      beacon.longitude,
    );

  /*
   * WGS84 values are usable directly.
   */
  if (
    system === "WGS84" &&
    gps !== null
  ) {
    return true;
  }

  /*
   * Projected values need a complete coordinate
   * reference system before conversion.
   *
   * We only validate that the pair exists here.
   */
  const easting =
    toFiniteNumber(
      beacon.easting,
    );

  const northing =
    toFiniteNumber(
      beacon.northing,
    );

  return (
    easting !== null &&
    northing !== null &&
    easting >= 100000 &&
    easting <= 900000 &&
    northing >= 0 &&
    northing <= 10000000
  );
}

/*
 * ============================================================
 * DUPLICATE BEACON IDENTIFIER DETECTION
 * ============================================================
 */

export function findDuplicateBeaconIds(
  beacons: SurveyBeacon[],
): string[] {
  const seen =
    new Set<string>();

  const duplicates =
    new Set<string>();

  for (const beacon of beacons) {
    const id =
      normalizeBeaconId(
        beacon.beaconId,
      );

    if (!id) continue;

    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }

  return Array.from(
    duplicates,
  );
}

/*
 * ============================================================
 * DUPLICATE PROJECTED POSITION DETECTION
 * ============================================================
 *
 * This compares raw UTM easting/northing only within
 * the same explicitly identified coordinate system.
 *
 * Separate coordinate reference systems must not be
 * compared as though their numbers were interchangeable.
 * ============================================================
 */

export function findDuplicateBeaconPositions(
  beacons: SurveyBeacon[],
  toleranceMeters = 0.01,
): string[] {
  const duplicates =
    new Set<string>();

  if (
    !Number.isFinite(toleranceMeters) ||
    toleranceMeters < 0
  ) {
    return [];
  }

  for (
    let i = 0;
    i < beacons.length;
    i++
  ) {
    const first =
      beacons[i];

    const firstEasting =
      toFiniteNumber(
        first.easting,
      );

    const firstNorthing =
      toFiniteNumber(
        first.northing,
      );

    if (
      firstEasting === null ||
      firstNorthing === null
    ) {
      continue;
    }

    for (
      let j = i + 1;
      j < beacons.length;
      j++
    ) {
      const second =
        beacons[j];

      if (
        first.coordinateSystem !==
        second.coordinateSystem
      ) {
        continue;
      }

      const firstDatum =
        (
          first.datum || ""
        ).trim().toUpperCase();

      const secondDatum =
        (
          second.datum || ""
        ).trim().toUpperCase();

      if (
        !firstDatum ||
        !secondDatum ||
        firstDatum !== secondDatum
      ) {
        continue;
      }

      if (
        first.utmZone === null ||
        first.utmZone === undefined ||
        second.utmZone === null ||
        second.utmZone === undefined ||
        first.utmZone !== second.utmZone
      ) {
        continue;
      }

      if (
        !first.hemisphere ||
        !second.hemisphere ||
        first.hemisphere !== second.hemisphere
      ) {
        continue;
      }

      const secondEasting =
        toFiniteNumber(
          second.easting,
        );

      const secondNorthing =
        toFiniteNumber(
          second.northing,
        );

      if (
        secondEasting === null ||
        secondNorthing === null
      ) {
        continue;
      }

      const distance =
        Math.hypot(
          secondEasting - firstEasting,
          secondNorthing - firstNorthing,
        );

      if (
        distance <= toleranceMeters
      ) {
        duplicates.add(
          normalizeBeaconId(
            first.beaconId,
          ),
        );

        duplicates.add(
          normalizeBeaconId(
            second.beaconId,
          ),
        );
      }
    }
  }

  return Array.from(
    duplicates,
  ).filter(Boolean);
}

/*
 * ============================================================
 * BOUNDARY SEQUENCE VALIDATION
 * ============================================================
 *
 * Accept a boundary order only when explicitly supplied
 * and unambiguous.
 *
 * Never assume alphabetical beacon order is the same as
 * a legal survey boundary sequence.
 * ============================================================
 */

export function validateBoundarySequence(
  beacons: SurveyBeacon[],
  sequence: string[],
): {
  valid: boolean;
  orderedBeacons: SurveyBeacon[];
  errors: string[];
} {
  const errors: string[] = [];

  if (
    !Array.isArray(beacons) ||
    !Array.isArray(sequence)
  ) {
    return {
      valid: false,
      orderedBeacons: [],
      errors: [
        "Survey beacons and boundary sequence must be arrays.",
      ],
    };
  }

  if (sequence.length < 3) {
    errors.push(
      "At least three boundary points are required.",
    );
  }

  /*
   * Boundary sequence is allowed to repeat
   * the first beacon at the end as a closure marker.
   */
  const normalizedSequence =
    sequence.map(
      normalizeBeaconId,
    );

  if (
    normalizedSequence.length >= 4 &&
    normalizedSequence[0] ===
      normalizedSequence[
        normalizedSequence.length - 1
      ]
  ) {
    normalizedSequence.pop();
  }

  const ids =
    new Set(
      normalizedSequence,
    );

  if (
    ids.size !==
    normalizedSequence.length
  ) {
    errors.push(
      "The boundary sequence contains repeated beacon identifiers.",
    );
  }

  if (
    normalizedSequence.some(
      (id) => !id,
    )
  ) {
    errors.push(
      "The boundary sequence contains an empty beacon identifier.",
    );
  }

  const beaconMap =
    new Map<
      string,
      SurveyBeacon
    >();

  for (const beacon of beacons) {
    const id =
      normalizeBeaconId(
        beacon.beaconId,
      );

    if (
      id &&
      !beaconMap.has(id)
    ) {
      beaconMap.set(
        id,
        beacon,
      );
    }
  }

  const duplicateIds =
    findDuplicateBeaconIds(
      beacons,
    );

  if (
    duplicateIds.length > 0
  ) {
    errors.push(
      `The beacon list has duplicate identifiers: ${duplicateIds.join(", ")}.`,
    );
  }

  const orderedBeacons:
    SurveyBeacon[] = [];

  for (const id of normalizedSequence) {
    const beacon =
      beaconMap.get(
        id,
      );

    if (!beacon) {
      errors.push(
        `Boundary beacon ${id} was not found in the extracted survey points.`,
      );
      continue;
    }

    orderedBeacons.push(
      beacon,
    );
  }

  if (
    orderedBeacons.length < 3
  ) {
    errors.push(
      "The boundary sequence does not contain three valid points.",
    );
  }

  return {
    valid:
      errors.length === 0,

    orderedBeacons:
      errors.length === 0
        ? orderedBeacons
        : [],

    errors,
  };
}

/*
 * ============================================================
 * COORDINATE REFERENCE SYSTEM COMPLETENESS
 * ============================================================
 *
 * Validates whether sufficient metadata exists
 * to interpret the coordinates.
 *
 * This does not confirm that the stated CRS
 * is truthful or officially certified.
 * ============================================================
 */

export function validateCoordinateReference(
  value: CoordinateReferenceDetails | null,
): {
  valid: boolean;
  convertibleToWGS84: boolean;
  reason: string;
} {
  if (!value) {
    return {
      valid: false,
      convertibleToWGS84: false,
      reason:
        "Coordinate reference details were not supplied.",
    };
  }

  if (!value.explicitlyStated) {
    return {
      valid: false,
      convertibleToWGS84: false,
      reason:
        "The coordinate reference system was not explicitly established from the document.",
    };
  }

  const system:
    CoordinateSystem =
      value.coordinateSystem;

  const datum =
    value.datum
      .trim()
      .toUpperCase()
      .replace(/[\s_-]/g, "");

  if (
    system === "WGS84"
  ) {
    if (
      datum !== "WGS84" &&
      datum !== "WGS1984"
    ) {
      return {
        valid: false,
        convertibleToWGS84: false,
        reason:
          "The document's coordinate-system label and datum do not establish WGS84 consistently.",
      };
    }

    return {
      valid: true,
      convertibleToWGS84: true,
      reason:
        "The document explicitly identifies WGS84 geographic coordinates.",
    };
  }

  if (
    system === "MINNA_UTM"
  ) {
    return {
      valid: true,
      convertibleToWGS84: false,
      reason:
        "Minna UTM coordinates require a validated datum transformation before WGS84 conversion.",
    };
  }

  if (
    system === "UTM"
  ) {
    if (
      !isValidUTMZone(
        value.utmZone,
      ) ||
      !isValidUTMHemisphere(
        value.hemisphere,
      )
    ) {
      return {
        valid: false,
        convertibleToWGS84: false,
        reason:
          "UTM zone or hemisphere information is missing or invalid.",
      };
    }

    if (
      datum === "WGS84" ||
      datum === "WGS1984"
    ) {
      return {
        valid: true,
        convertibleToWGS84: true,
        reason:
          "The document identifies a complete WGS84 UTM coordinate reference system.",
      };
    }

    return {
      valid: true,
      convertibleToWGS84: false,
      reason:
        "The identified UTM datum is unsupported for automatic WGS84 conversion.",
    };
  }

  return {
    valid: false,
    convertibleToWGS84: false,
    reason:
      "The geographic coordinate reference system is unknown.",
  };
}

/*
 * ============================================================
 * SAFE COORDINATE ROUNDING
 * ============================================================
 */

export function roundCoordinate(
  value: number,
  decimalPlaces = 6,
): number {
  if (
    !Number.isFinite(value)
  ) {
    throw new Error(
      "Cannot round an invalid coordinate.",
    );
  }

  const places =
    Math.max(
      0,
      Math.min(
        10,
        Math.trunc(
          decimalPlaces,
        ),
      ),
    );

  return Number(
    value.toFixed(
      places,
    ),
  );
}

/*
 * ============================================================
 * COORDINATE FORMATTING
 * ============================================================
 */

export function formatGPSCoordinates(
  coordinates: GPSCoordinates | null,
): string {
  if (
    !coordinates ||
    !isValidGPSCoordinates(
      coordinates,
    )
  ) {
    return "Coordinates unavailable";
  }

  return (
    `${roundCoordinate(coordinates.latitude, 6)}, ` +
    `${roundCoordinate(coordinates.longitude, 6)}`
  );
}