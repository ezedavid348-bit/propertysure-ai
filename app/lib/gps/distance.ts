
/*
 * ============================================================
 * PROPERTYSURE AI — GPS DISTANCE & LAND MEASUREMENT ENGINE
 *
 * File: app/lib/gps/distance.ts
 * ============================================================
 *
 * RESPONSIBILITIES
 *
 * 1. Calculate distance between geographic coordinates.
 * 2. Compare document-reported geographic locations.
 * 3. Calculate multiple coordinate distances.
 * 4. Calculate distances between survey beacons.
 * 5. Calculate plot perimeter.
 * 6. Calculate approximate land area.
 * 7. Validate survey boundary geometry.
 * 8. Detect self-intersecting boundaries.
 * 9. Compare stated and calculated land areas.
 * 10. Calculate projected polygon centroids.
 * 11. Check whether a GPS point falls inside a polygon.
 * 12. Calculate approximate distance to plot boundaries.
 *
 * IMPORTANT SAFEGUARDS
 *
 * - No invented coordinates.
 * - No guessed survey beacon sequence.
 * - No automatic Minna-to-WGS84 transformation.
 * - No mixing incompatible coordinate reference systems.
 * - No treating distance alone as proof of document fraud.
 * - No independent authentication of legal boundaries.
 *
 * AREA MEASUREMENT NOTE
 *
 * Projected UTM coordinates allow geometric calculations
 * in metres, subject to projection scale distortion.
 *
 * Calculated area is an estimate based on document-reported
 * grid coordinates, not a certified ground survey area.
 *
 * ============================================================
 */

import type {
  GPSCoordinates,
  GPSDistanceResult,
  GPSStatus,
  LandAreaComparison,
  SurveyBeacon,
  SurveySideMeasurement,
} from "./types";

import {
  isValidGPSCoordinates,
  isValidUTMZone,
  isValidUTMHemisphere,
  normalizeBeaconId,
  validateBoundarySequence,
} from "./coordinates";

import {
  normalizeDatum,
  convertWGS84UTMToGPS,
} from "./converter";

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const EARTH_RADIUS_METERS = 6371008.8;

const GEOMETRY_EPSILON = 1e-9;

const MIN_POLYGON_AREA_SQM = 0.000001;

/*
 * ============================================================
 * BASIC TYPES
 * ============================================================
 */

export type ProjectedPoint = {
  id: string;
  easting: number;
  northing: number;
};

export type ProjectedCoordinateReference = {
  zone: number;
  hemisphere: "N" | "S";
  datum: "WGS84";
};

export type ProjectedPolygon = {
  points: ProjectedPoint[];
  reference: ProjectedCoordinateReference;
};

export type PolygonValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type SurveyGeometryResult = {
  valid: boolean;

  sourceDocument: string;

  reference: ProjectedCoordinateReference | null;

  orderedPoints: ProjectedPoint[];

  geographicPoints: GPSCoordinates[];

  sideLengths: SurveySideMeasurement[];

  perimeterMeters: number | null;

  areaSquareMeters: number | null;

  areaHectares: number | null;

  centroid: GPSCoordinates | null;

  errors: string[];

  warnings: string[];

  independentlyVerified: false;
};

export type PointToBoundaryResult = {
  valid: boolean;

  insideBoundary: boolean | null;

  distanceToBoundaryMeters: number | null;

  distanceToCentroidMeters: number | null;

  explanation: string;

  independentlyVerified: false;
};

/*
 * ============================================================
 * GENERAL HELPERS
 * ============================================================
 */

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function roundMeasurement(
  value: number,
  places = 2,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(
    value.toFixed(places),
  );
}

function sameProjectedReference(
  first: ProjectedCoordinateReference,
  second: ProjectedCoordinateReference,
): boolean {
  return (
    first.zone === second.zone &&
    first.hemisphere === second.hemisphere &&
    first.datum === second.datum
  );
}

/*
 * ============================================================
 * DEGREES TO RADIANS
 * ============================================================
 */

export function degreesToRadians(
  degrees: number,
): number {
  return degrees * Math.PI / 180;
}

/*
 * ============================================================
 * RADIANS TO DEGREES
 * ============================================================
 */

export function radiansToDegrees(
  radians: number,
): number {
  return radians * 180 / Math.PI;
}

/*
 * ============================================================
 * HAVERSINE DISTANCE
 * ============================================================
 *
 * Calculates approximate shortest surface distance
 * between geographic coordinate pairs.
 *
 * Both inputs must represent the same geographic CRS.
 *
 * This is not a cadastral boundary measurement.
 * ============================================================
 */

export function calculateDistanceMeters(
  first: GPSCoordinates,
  second: GPSCoordinates,
): number | null {
  if (
    !isValidGPSCoordinates(first) ||
    !isValidGPSCoordinates(second)
  ) {
    return null;
  }

  const latitude1 =
    degreesToRadians(
      first.latitude,
    );

  const latitude2 =
    degreesToRadians(
      second.latitude,
    );

  const latitudeDifference =
    degreesToRadians(
      second.latitude -
      first.latitude,
    );

  const longitudeDifference =
    degreesToRadians(
      second.longitude -
      first.longitude,
    );

  const sinLatitude =
    Math.sin(
      latitudeDifference / 2,
    );

  const sinLongitude =
    Math.sin(
      longitudeDifference / 2,
    );

  const haversine =
    sinLatitude * sinLatitude +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      sinLongitude *
      sinLongitude;

  const safeHaversine =
    Math.max(
      0,
      Math.min(
        1,
        haversine,
      ),
    );

  const centralAngle =
    2 *
    Math.asin(
      Math.sqrt(safeHaversine),
    );

  const result =
    EARTH_RADIUS_METERS *
    centralAngle;

  return Number.isFinite(result)
    ? result
    : null;
}

/*
 * ============================================================
 * GPS DISTANCE RESULT
 * ============================================================
 */

export function calculateGPSDistance(
  first: GPSCoordinates,
  second: GPSCoordinates,
): GPSDistanceResult | null {
  const metres =
    calculateDistanceMeters(
      first,
      second,
    );

  if (metres === null) {
    return null;
  }

  return {
    distanceMeters:
      roundMeasurement(metres, 2),

    distanceKilometers:
      roundMeasurement(
        metres / 1000,
        3,
      ),
  };
}

/*
 * ============================================================
 * DISTANCE FORMATTING
 * ============================================================
 */

export function formatDistance(
  distanceMeters: number | null,
): string {
  if (
    distanceMeters === null ||
    !Number.isFinite(distanceMeters) ||
    distanceMeters < 0
  ) {
    return "Distance unavailable";
  }

  if (distanceMeters < 1000) {
    return `${distanceMeters.toFixed(2)} m`;
  }

  return `${
    (distanceMeters / 1000).toFixed(3)
  } km`;
}

/*
 * ============================================================
 * EXISTING DOCUMENT LOCATION COMPARISON
 * ============================================================
 *
 * Existing public function retained.
 *
 * Thresholds are configurable proximity indicators,
 * not official Nigerian cadastral standards.
 *
 * IMPORTANT:
 *
 * The caller must establish whether the two locations
 * represent corresponding reference points.
 * ============================================================
 */

export type DistanceComparisonOptions = {
  consistentThresholdMeters?: number;

  mismatchThresholdMeters?: number;

  correspondingPointsEstablished?: boolean;
};

export type DistanceComparisonResult = {
  status: GPSStatus;

  distanceMeters: number | null;

  distanceKilometers: number | null;

  explanation: string;
};

export function compareGPSLocations(
  first: GPSCoordinates | null,
  second: GPSCoordinates | null,
  options: DistanceComparisonOptions = {},
): DistanceComparisonResult {
  if (!first || !second) {
    return {
      status: "inconclusive",

      distanceMeters: null,

      distanceKilometers: null,

      explanation:
        "Both documents must provide usable geographic coordinates before comparison.",
    };
  }

  const distance =
    calculateGPSDistance(
      first,
      second,
    );

  if (!distance) {
    return {
      status: "inconclusive",

      distanceMeters: null,

      distanceKilometers: null,

      explanation:
        "The reported coordinates could not be validated.",
    };
  }

  /*
   * When the caller explicitly states that
   * corresponding reference points are not
   * established, return a distance only.
   */
  if (
    options.correspondingPointsEstablished === false
  ) {
    return {
      status: "inconclusive",

      distanceMeters:
        distance.distanceMeters,

      distanceKilometers:
        distance.distanceKilometers,

      explanation:
        `The reported locations are approximately ${
          formatDistance(
            distance.distanceMeters,
          )
        } apart. Corresponding reference points were not established, so geographic consistency cannot be concluded.`,
    };
  }

  const consistentThreshold =
    options.consistentThresholdMeters ?? 100;

  const mismatchThreshold =
    options.mismatchThresholdMeters ?? 1000;

  if (
    !Number.isFinite(consistentThreshold) ||
    !Number.isFinite(mismatchThreshold) ||
    consistentThreshold < 0 ||
    mismatchThreshold <= consistentThreshold
  ) {
    return {
      status: "inconclusive",

      distanceMeters:
        distance.distanceMeters,

      distanceKilometers:
        distance.distanceKilometers,

      explanation:
        "Invalid comparison thresholds. The geographic distance was calculated without assigning a consistency status.",
    };
  }

  /*
   * If correspondence is unspecified,
   * preserve the previous proximity behaviour.
   *
   * Future callers should explicitly establish
   * the reference relationship.
   */
  if (
    distance.distanceMeters <=
    consistentThreshold
  ) {
    return {
      status: "consistent",

      distanceMeters:
        distance.distanceMeters,

      distanceKilometers:
        distance.distanceKilometers,

      explanation:
        `The reported points are ${
          formatDistance(
            distance.distanceMeters,
          )
        } apart, within the configured proximity threshold. This does not establish legal parcel identity.`,
    };
  }

  if (
    distance.distanceMeters >=
    mismatchThreshold
  ) {
    return {
      status: "mismatch",

      distanceMeters:
        distance.distanceMeters,

      distanceKilometers:
        distance.distanceKilometers,

      explanation:
        `The reported points are ${
          formatDistance(
            distance.distanceMeters,
          )
        } apart, exceeding the configured discrepancy threshold. Investigate the source coordinates, datum and reference-point relationship before drawing conclusions.`,
    };
  }

  return {
    status: "inconclusive",

    distanceMeters:
      distance.distanceMeters,

    distanceKilometers:
      distance.distanceKilometers,

    explanation:
      `The reported points are ${
        formatDistance(
          distance.distanceMeters,
        )
      } apart. The geographic difference is inconclusive.`,
  };
}

/*
 * ============================================================
 * MULTIPLE GPS POINT DISTANCES
 * ============================================================
 */

export type GPSPoint = {
  id: string;

  coordinates: GPSCoordinates;
};

export type GPSPointDistance = {
  firstPointId: string;

  secondPointId: string;

  distanceMeters: number;

  distanceKilometers: number;
};

export function compareMultipleGPSPoints(
  points: GPSPoint[],
): GPSPointDistance[] {
  const results: GPSPointDistance[] = [];

  for (
    let firstIndex = 0;
    firstIndex < points.length;
    firstIndex++
  ) {
    const first =
      points[firstIndex];

    if (
      !isValidGPSCoordinates(
        first.coordinates,
      )
    ) {
      continue;
    }

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < points.length;
      secondIndex++
    ) {
      const second =
        points[secondIndex];

      if (
        !isValidGPSCoordinates(
          second.coordinates,
        )
      ) {
        continue;
      }

      const distance =
        calculateGPSDistance(
          first.coordinates,
          second.coordinates,
        );

      if (!distance) {
        continue;
      }

      results.push({
        firstPointId:
          first.id,

        secondPointId:
          second.id,

        distanceMeters:
          distance.distanceMeters,

        distanceKilometers:
          distance.distanceKilometers,
      });
    }
  }

  return results;
}

/*
 * ============================================================
 * DISTANCE SUMMARY
 * ============================================================
 */

export function summarizeGPSDistances(
  distances: GPSPointDistance[],
): {
  comparisonCount: number;

  minimumDistanceMeters: number | null;

  maximumDistanceMeters: number | null;

  averageDistanceMeters: number | null;
} {
  const values =
    distances
      .map(
        (item) =>
          item.distanceMeters,
      )
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value >= 0,
      );

  if (values.length === 0) {
    return {
      comparisonCount: 0,

      minimumDistanceMeters: null,

      maximumDistanceMeters: null,

      averageDistanceMeters: null,
    };
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return {
    comparisonCount:
      values.length,

    minimumDistanceMeters:
      Math.min(...values),

    maximumDistanceMeters:
      Math.max(...values),

    averageDistanceMeters:
      roundMeasurement(
        total / values.length,
        2,
      ),
  };
}

/*
 * ============================================================
 * PROJECTED DISTANCE
 * ============================================================
 *
 * Calculates Euclidean distance between two points
 * in a common metre-based projected coordinate system.
 *
 * Callers must establish compatible CRS metadata.
 * ============================================================
 */

export function calculateProjectedDistance(
  first: ProjectedPoint,
  second: ProjectedPoint,
): number | null {
  if (
    !isFiniteNumber(first.easting) ||
    !isFiniteNumber(first.northing) ||
    !isFiniteNumber(second.easting) ||
    !isFiniteNumber(second.northing)
  ) {
    return null;
  }

  return Math.hypot(
    second.easting -
      first.easting,

    second.northing -
      first.northing,
  );
}

/*
 * ============================================================
 * POLYGON POINT NORMALIZATION
 * ============================================================
 *
 * Removes only an explicitly repeated closing point.
 *
 * Does not infer missing beacons or reorder vertices.
 * ============================================================
 */

function normalizePolygonPoints(
  points: ProjectedPoint[],
): ProjectedPoint[] {
  if (
    !Array.isArray(points)
  ) {
    return [];
  }

  const normalized =
    [...points];

  if (
    normalized.length > 1
  ) {
    const first =
      normalized[0];

    const last =
      normalized[
        normalized.length - 1
      ];

    if (
      first.easting === last.easting &&
      first.northing === last.northing
    ) {
      normalized.pop();
    }
  }

  return normalized;
}

/*
 * ============================================================
 * POLYGON GEOMETRY HELPERS
 * ============================================================
 */

function orientation(
  first: ProjectedPoint,
  second: ProjectedPoint,
  third: ProjectedPoint,
): number {
  return (
    (second.easting - first.easting) *
      (third.northing - first.northing) -
    (second.northing - first.northing) *
      (third.easting - first.easting)
  );
}

function pointOnSegment(
  point: ProjectedPoint,
  first: ProjectedPoint,
  second: ProjectedPoint,
): boolean {
  const distance =
    calculateProjectedDistance(
      first,
      second,
    );

  if (
    distance === null
  ) {
    return false;
  }

  const cross =
    Math.abs(
      orientation(
        first,
        second,
        point,
      ),
    );

  /*
   * Tolerance expressed in metres relative
   * to the segment length.
   */
  const tolerance =
    GEOMETRY_EPSILON *
    Math.max(
      1,
      distance,
    );

  if (
    cross > tolerance
  ) {
    return false;
  }

  return (
    point.easting >=
      Math.min(
        first.easting,
        second.easting,
      ) - GEOMETRY_EPSILON &&

    point.easting <=
      Math.max(
        first.easting,
        second.easting,
      ) + GEOMETRY_EPSILON &&

    point.northing >=
      Math.min(
        first.northing,
        second.northing,
      ) - GEOMETRY_EPSILON &&

    point.northing <=
      Math.max(
        first.northing,
        second.northing,
      ) + GEOMETRY_EPSILON
  );
}

function segmentsIntersect(
  firstA: ProjectedPoint,
  firstB: ProjectedPoint,
  secondA: ProjectedPoint,
  secondB: ProjectedPoint,
): boolean {
  const o1 =
    orientation(
      firstA,
      firstB,
      secondA,
    );

  const o2 =
    orientation(
      firstA,
      firstB,
      secondB,
    );

  const o3 =
    orientation(
      secondA,
      secondB,
      firstA,
    );

  const o4 =
    orientation(
      secondA,
      secondB,
      firstB,
    );

  const opposite =
    (first: number, second: number) =>
      (
        first > GEOMETRY_EPSILON &&
        second < -GEOMETRY_EPSILON
      ) ||
      (
        first < -GEOMETRY_EPSILON &&
        second > GEOMETRY_EPSILON
      );

  if (
    opposite(o1, o2) &&
    opposite(o3, o4)
  ) {
    return true;
  }

  if (
    Math.abs(o1) <= GEOMETRY_EPSILON &&
    pointOnSegment(
      secondA,
      firstA,
      firstB,
    )
  ) {
    return true;
  }

  if (
    Math.abs(o2) <= GEOMETRY_EPSILON &&
    pointOnSegment(
      secondB,
      firstA,
      firstB,
    )
  ) {
    return true;
  }

  if (
    Math.abs(o3) <= GEOMETRY_EPSILON &&
    pointOnSegment(
      firstA,
      secondA,
      secondB,
    )
  ) {
    return true;
  }

  if (
    Math.abs(o4) <= GEOMETRY_EPSILON &&
    pointOnSegment(
      firstB,
      secondA,
      secondB,
    )
  ) {
    return true;
  }

  return false;
}

/*
 * ============================================================
 * POLYGON VALIDATION
 * ============================================================
 *
 * Rejects:
 *
 * - Fewer than three vertices
 * - Invalid coordinates
 * - Repeated vertices
 * - Zero-length sides
 * - Self-intersecting boundaries
 * - Degenerate polygons
 *
 * Does not determine whether the polygon matches
 * any registered legal parcel.
 * ============================================================
 */

export function validateProjectedPolygon(
  points: ProjectedPoint[],
): PolygonValidationResult {
  const errors: string[] = [];

  const warnings: string[] = [];

  const polygon =
    normalizePolygonPoints(
      points,
    );

  if (
    polygon.length < 3
  ) {
    errors.push(
      "A survey boundary requires at least three distinct points.",
    );
  }

  if (
    polygon.some(
      (point) =>
        !isFiniteNumber(
          point.easting,
        ) ||
        !isFiniteNumber(
          point.northing,
        ),
    )
  ) {
    errors.push(
      "The survey boundary contains invalid projected coordinates.",
    );
  }

  if (
    errors.length > 0
  ) {
    return {
      valid: false,
      errors,
      warnings,
    };
  }

  /*
   * Duplicate coordinate positions.
   */
  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < polygon.length;
      j++
    ) {
      const distance =
        calculateProjectedDistance(
          polygon[i],
          polygon[j],
        );

      if (
        distance !== null &&
        distance < 0.000001
      ) {
        errors.push(
          `Boundary points ${
            polygon[i].id
          } and ${
            polygon[j].id
          } occupy the same projected position.`,
        );
      }
    }
  }

  /*
   * Zero-length or extremely short sides.
   */
  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const next =
      (i + 1) %
      polygon.length;

    const distance =
      calculateProjectedDistance(
        polygon[i],
        polygon[next],
      );

    if (
      distance === null ||
      distance < 0.000001
    ) {
      errors.push(
        `The side from ${
          polygon[i].id
        } to ${
          polygon[next].id
        } is invalid or has zero length.`,
      );
    }
  }

  /*
   * Detect crossing non-adjacent edges.
   */
  const count =
    polygon.length;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const nextI =
      (i + 1) %
      count;

    for (
      let j = i + 1;
      j < count;
      j++
    ) {
      const nextJ =
        (j + 1) %
        count;

      const adjacent =
        i === j ||
        nextI === j ||
        nextJ === i;

      if (
        adjacent
      ) {
        continue;
      }

      if (
        segmentsIntersect(
          polygon[i],
          polygon[nextI],
          polygon[j],
          polygon[nextJ],
        )
      ) {
        errors.push(
          `Survey boundary edges ${
            polygon[i].id
          }–${
            polygon[nextI].id
          } and ${
            polygon[j].id
          }–${
            polygon[nextJ].id
          } intersect.`,
        );
      }
    }
  }

  /*
   * Shoelace area test.
   */
  const area =
    calculateRawPolygonArea(
      polygon,
    );

  if (
    area === null ||
    area < MIN_POLYGON_AREA_SQM
  ) {
    errors.push(
      "The survey boundary has no meaningful enclosed area.",
    );
  }

  return {
    valid:
      errors.length === 0,

    errors:
      Array.from(
        new Set(errors),
      ),

    warnings,
  };
}

/*
 * ============================================================
 * RAW POLYGON AREA
 * ============================================================
 *
 * Shoelace formula.
 *
 * Returns area in squared grid metres for a projected CRS.
 *
 * This internal helper does not validate the polygon.
 * ============================================================
 */

function calculateRawPolygonArea(
  points: ProjectedPoint[],
): number | null {
  const polygon =
    normalizePolygonPoints(
      points,
    );

  if (
    polygon.length < 3
  ) {
    return null;
  }

  /*
   * Translate the coordinate origin to the first point.
   *
   * This reduces floating-point cancellation when
   * UTM easting/northing values are large.
   */
  const origin =
    polygon[0];

  let twiceSignedArea = 0;

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const current =
      polygon[i];

    const next =
      polygon[
        (i + 1) %
        polygon.length
      ];

    const currentX =
      current.easting -
      origin.easting;

    const currentY =
      current.northing -
      origin.northing;

    const nextX =
      next.easting -
      origin.easting;

    const nextY =
      next.northing -
      origin.northing;

    twiceSignedArea +=
      currentX * nextY -
      nextX * currentY;
  }

  const area =
    Math.abs(
      twiceSignedArea,
    ) / 2;

  return Number.isFinite(area)
    ? area
    : null;
}

/*
 * ============================================================
 * PUBLIC POLYGON AREA
 * ============================================================
 */

export function calculatePolygonArea(
  points: ProjectedPoint[],
): number | null {
  const validation =
    validateProjectedPolygon(
      points,
    );

  if (
    !validation.valid
  ) {
    return null;
  }

  const area =
    calculateRawPolygonArea(
      points,
    );

  return area === null
    ? null
    : roundMeasurement(
        area,
        4,
      );
}

/*
 * ============================================================
 * POLYGON SIDE LENGTHS
 * ============================================================
 *
 * Includes the closing segment:
 *
 * A -> B
 * B -> C
 * C -> D
 * D -> A
 *
 * The input order must come from an established
 * survey boundary sequence.
 * ============================================================
 */

export function calculatePolygonSides(
  points: ProjectedPoint[],
): SurveySideMeasurement[] {
  const validation =
    validateProjectedPolygon(
      points,
    );

  if (
    !validation.valid
  ) {
    return [];
  }

  const polygon =
    normalizePolygonPoints(
      points,
    );

  const results:
    SurveySideMeasurement[] = [];

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const next =
      polygon[
        (i + 1) %
        polygon.length
      ];

    const current =
      polygon[i];

    const length =
      calculateProjectedDistance(
        current,
        next,
      );

    if (
      length === null
    ) {
      return [];
    }

    results.push({
      fromBeacon:
        current.id,

      toBeacon:
        next.id,

      lengthMeters:
        roundMeasurement(
          length,
          3,
        ),
    });
  }

  return results;
}

/*
 * ============================================================
 * PLOT PERIMETER
 * ============================================================
 */

export function calculatePolygonPerimeter(
  points: ProjectedPoint[],
): number | null {
  const validation =
    validateProjectedPolygon(
      points,
    );

  if (
    !validation.valid
  ) {
    return null;
  }

  const polygon =
    normalizePolygonPoints(
      points,
    );

  let total = 0;

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const next =
      (i + 1) %
      polygon.length;

    const distance =
      calculateProjectedDistance(
        polygon[i],
        polygon[next],
      );

    if (
      distance === null
    ) {
      return null;
    }

    total += distance;
  }

  return roundMeasurement(
    total,
    3,
  );
}

/*
 * ============================================================
 * POLYGON CENTROID — PROJECTED
 * ============================================================
 *
 * Geometric centroid of a valid simple polygon.
 *
 * The centroid may lie outside a concave polygon.
 * It is not necessarily a survey-control point.
 * ============================================================
 */

export function calculateProjectedCentroid(
  points: ProjectedPoint[],
): ProjectedPoint | null {
  const validation =
    validateProjectedPolygon(
      points,
    );

  if (
    !validation.valid
  ) {
    return null;
  }

  const polygon =
    normalizePolygonPoints(
      points,
    );

  const origin =
    polygon[0];

  let crossSum = 0;

  let centroidXSum = 0;

  let centroidYSum = 0;

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const current =
      polygon[i];

    const next =
      polygon[
        (i + 1) %
        polygon.length
      ];

    const x1 =
      current.easting -
      origin.easting;

    const y1 =
      current.northing -
      origin.northing;

    const x2 =
      next.easting -
      origin.easting;

    const y2 =
      next.northing -
      origin.northing;

    const cross =
      x1 * y2 -
      x2 * y1;

    crossSum += cross;

    centroidXSum +=
      (x1 + x2) * cross;

    centroidYSum +=
      (y1 + y2) * cross;
  }

  if (
    Math.abs(crossSum) <
    GEOMETRY_EPSILON
  ) {
    return null;
  }

  const easting =
    origin.easting +
    centroidXSum /
      (3 * crossSum);

  const northing =
    origin.northing +
    centroidYSum /
      (3 * crossSum);

  if (
    !Number.isFinite(easting) ||
    !Number.isFinite(northing)
  ) {
    return null;
  }

  return {
    id:
      "GEOMETRIC_CENTROID",

    easting,

    northing,
  };
}

/*
 * ============================================================
 * POINT INSIDE PROJECTED POLYGON
 * ============================================================
 *
 * Ray-casting algorithm.
 *
 * Points on a boundary are treated as inside.
 *
 * This is a mathematical containment check, not a
 * legal title or cadastral ownership verification.
 * ============================================================
 */

export function isPointInsidePolygon(
  point: ProjectedPoint,
  polygonPoints: ProjectedPoint[],
): boolean | null {
  const validation =
    validateProjectedPolygon(
      polygonPoints,
    );

  if (
    !validation.valid
  ) {
    return null;
  }

  if (
    !isFiniteNumber(point.easting) ||
    !isFiniteNumber(point.northing)
  ) {
    return null;
  }

  const polygon =
    normalizePolygonPoints(
      polygonPoints,
    );

  let inside = false;

  for (
    let i = 0,
    j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const current =
      polygon[i];

    const previous =
      polygon[j];

    if (
      pointOnSegment(
        point,
        previous,
        current,
      )
    ) {
      return true;
    }

    const crossesLatitude =
      (
        current.northing >
          point.northing
      ) !== (
        previous.northing >
          point.northing
      );

    if (
      !crossesLatitude
    ) {
      continue;
    }

    const intersectionEasting =
      (
        (
          previous.easting -
          current.easting
        ) *
        (
          point.northing -
          current.northing
        )
      ) /
      (
        previous.northing -
        current.northing
      ) +
      current.easting;

    if (
      point.easting <
      intersectionEasting
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/*
 * ============================================================
 * DISTANCE FROM POINT TO PROJECTED SEGMENT
 * ============================================================
 */

export function distanceToProjectedSegment(
  point: ProjectedPoint,
  first: ProjectedPoint,
  second: ProjectedPoint,
): number | null {
  if (
    !isFiniteNumber(point.easting) ||
    !isFiniteNumber(point.northing) ||
    !isFiniteNumber(first.easting) ||
    !isFiniteNumber(first.northing) ||
    !isFiniteNumber(second.easting) ||
    !isFiniteNumber(second.northing)
  ) {
    return null;
  }

  const dx =
    second.easting -
    first.easting;

  const dy =
    second.northing -
    first.northing;

  const lengthSquared =
    dx * dx +
    dy * dy;

  if (
    lengthSquared === 0
  ) {
    return Math.hypot(
      point.easting -
        first.easting,

      point.northing -
        first.northing,
    );
  }

  const projection =
    (
      (
        point.easting -
        first.easting
      ) * dx +
      (
        point.northing -
        first.northing
      ) * dy
    ) /
    lengthSquared;

  const t =
    Math.max(
      0,
      Math.min(
        1,
        projection,
      ),
    );

  const closestEasting =
    first.easting +
    t * dx;

  const closestNorthing =
    first.northing +
    t * dy;

  return Math.hypot(
    point.easting -
      closestEasting,

    point.northing -
      closestNorthing,
  );
}

/*
 * ============================================================
 * MINIMUM DISTANCE TO POLYGON BOUNDARY
 * ============================================================
 */

export function calculateDistanceToPolygonBoundary(
  point: ProjectedPoint,
  polygonPoints: ProjectedPoint[],
): number | null {
  const validation =
    validateProjectedPolygon(
      polygonPoints,
    );

  if (
    !validation.valid
  ) {
    return null;
  }

  const polygon =
    normalizePolygonPoints(
      polygonPoints,
    );

  let minimum =
    Number.POSITIVE_INFINITY;

  for (
    let i = 0;
    i < polygon.length;
    i++
  ) {
    const current =
      polygon[i];

    const next =
      polygon[
        (i + 1) %
        polygon.length
      ];

    const distance =
      distanceToProjectedSegment(
        point,
        current,
        next,
      );

    if (
      distance === null
    ) {
      return null;
    }

    minimum =
      Math.min(
        minimum,
        distance,
      );
  }

  if (
    !Number.isFinite(minimum)
  ) {
    return null;
  }

  return roundMeasurement(
    minimum,
    3,
  );
}

/*
 * ============================================================
 * SURVEY CRS EXTRACTION
 * ============================================================
 *
 * Only accepts a complete WGS84 UTM reference.
 *
 * Different projected systems must never be
 * mixed into the same parcel calculation.
 * ============================================================
 */

function getBeaconReference(
  beacon: SurveyBeacon,
): ProjectedCoordinateReference | null {
  if (
    !isValidUTMZone(
      beacon.utmZone,
    ) ||
    !isValidUTMHemisphere(
      beacon.hemisphere,
    ) ||
    normalizeDatum(
      beacon.datum,
    ) !== "WGS84"
  ) {
    return null;
  }

  if (
    beacon.coordinateSystem !== "UTM"
  ) {
    return null;
  }

  return {
    zone:
      beacon.utmZone,

    hemisphere:
      beacon.hemisphere,

    datum:
      "WGS84",
  };
}

/*
 * ============================================================
 * BUILD PROJECTED SURVEY GEOMETRY
 * ============================================================
 *
 * This function:
 *
 * - Validates the documented boundary sequence.
 * - Requires compatible WGS84 UTM beacon metadata.
 * - Checks polygon geometry.
 * - Calculates area and perimeter.
 * - Calculates side lengths.
 * - Converts plot points into geographic coordinates.
 *
 * It does not infer alphabetical beacon ordering.
 *
 * Before calling this function, the Essential engine
 * must supply correctly extracted and explicitly
 * established boundary sequence information.
 * ============================================================
 */

export function calculateSurveyGeometry(
  beacons: SurveyBeacon[],
  boundarySequence: string[],
  sourceDocument: string,
): SurveyGeometryResult {
  const errors: string[] = [];

  const warnings: string[] = [];

  const emptyResult = (
    problems: string[],
  ): SurveyGeometryResult => ({
    valid: false,

    sourceDocument,

    reference: null,

    orderedPoints: [],

    geographicPoints: [],

    sideLengths: [],

    perimeterMeters: null,

    areaSquareMeters: null,

    areaHectares: null,

    centroid: null,

    errors:
      problems,

    warnings,

    independentlyVerified: false,
  });

  /*
   * ----------------------------------------------------------
   * VALIDATE BOUNDARY SEQUENCE
   * ----------------------------------------------------------
   */

  const sequenceResult =
    validateBoundarySequence(
      beacons,
      boundarySequence,
    );

  if (
    !sequenceResult.valid
  ) {
    return emptyResult(
      sequenceResult.errors,
    );
  }

  const orderedBeacons =
    sequenceResult.orderedBeacons;

  const projectedPoints:
    ProjectedPoint[] = [];

  let commonReference:
    ProjectedCoordinateReference | null =
      null;

  /*
   * ----------------------------------------------------------
   * VALIDATE ALL BEACON COORDINATE REFERENCES
   * ----------------------------------------------------------
   */

  for (const beacon of orderedBeacons) {
    const id =
      normalizeBeaconId(
        beacon.beaconId,
      );

    const reference =
      getBeaconReference(
        beacon,
      );

    if (!reference) {
      errors.push(
        `Beacon ${id} does not have a complete supported WGS84 UTM coordinate reference.`,
      );

      continue;
    }

    if (
      commonReference &&
      !sameProjectedReference(
        commonReference,
        reference,
      )
    ) {
      errors.push(
        `Beacon ${id} uses a different UTM coordinate reference system.`,
      );

      continue;
    }

    if (
      !commonReference
    ) {
      commonReference =
        reference;
    }

    if (
      !isFiniteNumber(
        beacon.easting,
      ) ||
      !isFiniteNumber(
        beacon.northing,
      )
    ) {
      errors.push(
        `Beacon ${id} has invalid easting or northing values.`,
      );

      continue;
    }

    projectedPoints.push({
      id,

      easting:
        beacon.easting,

      northing:
        beacon.northing,
    });
  }

  if (
    errors.length > 0 ||
    !commonReference
  ) {
    return emptyResult(
      errors.length > 0
        ? errors
        : [
            "A complete WGS84 UTM reference could not be established.",
          ],
    );
  }

  /*
   * ----------------------------------------------------------
   * VALIDATE POLYGON GEOMETRY
   * ----------------------------------------------------------
   */

  const validation =
    validateProjectedPolygon(
      projectedPoints,
    );

  warnings.push(
    ...validation.warnings,
  );

  if (
    !validation.valid
  ) {
    return emptyResult(
      validation.errors,
    );
  }

  /*
   * ----------------------------------------------------------
   * CALCULATE AREA, PERIMETER, SIDE LENGTHS
   * ----------------------------------------------------------
   */

  const area =
    calculatePolygonArea(
      projectedPoints,
    );

  const perimeter =
    calculatePolygonPerimeter(
      projectedPoints,
    );

  const sides =
    calculatePolygonSides(
      projectedPoints,
    );

  if (
    area === null ||
    perimeter === null ||
    sides.length !==
      projectedPoints.length
  ) {
    return emptyResult([
      "The survey polygon could not be measured reliably.",
    ]);
  }

  /*
   * ----------------------------------------------------------
   * CONVERT BOUNDARY POINTS TO LATITUDE/LONGITUDE
   * ----------------------------------------------------------
   */

  const geographicPoints:
    GPSCoordinates[] = [];

  for (const point of projectedPoints) {
    const coordinates =
      convertWGS84UTMToGPS({
        easting:
          point.easting,

        northing:
          point.northing,

        zone:
          commonReference.zone,

        hemisphere:
          commonReference.hemisphere,

        datum:
          commonReference.datum,
      });

    if (!coordinates) {
      return emptyResult([
        `Beacon ${point.id} could not be converted to geographic coordinates.`,
      ]);
    }

    geographicPoints.push(
      coordinates,
    );
  }

  /*
   * ----------------------------------------------------------
   * PROJECTED CENTROID TO GPS
   * ----------------------------------------------------------
   */

  const projectedCentroid =
    calculateProjectedCentroid(
      projectedPoints,
    );

  const centroid =
    projectedCentroid
      ? convertWGS84UTMToGPS({
          easting:
            projectedCentroid.easting,

          northing:
            projectedCentroid.northing,

          zone:
            commonReference.zone,

          hemisphere:
            commonReference.hemisphere,

          datum:
            commonReference.datum,
        })
      : null;

  warnings.push(
    "Calculated dimensions use document-reported WGS84 UTM grid coordinates. Grid distances and areas may differ slightly from ground-survey measurements because of projection scale.",
  );

  warnings.push(
    "The reconstructed boundary and centroid are mathematical results, not independently verified cadastral survey positions.",
  );

  return {
    valid: true,

    sourceDocument,

    reference:
      commonReference,

    orderedPoints:
      projectedPoints,

    geographicPoints,

    sideLengths:
      sides,

    perimeterMeters:
      perimeter,

    areaSquareMeters:
      area,

    areaHectares:
      roundMeasurement(
        area / 10000,
        6,
      ),

    centroid,

    errors: [],

    warnings,

    independentlyVerified: false,
  };
}

/*
 * ============================================================
 * LAND AREA UNIT CONVERSION
 * ============================================================
 */

export type LandAreaUnit =
  | "sqm"
  | "hectares"
  | "acres"
  | "sqft";

export function convertLandAreaToSquareMeters(
  area: number,
  unit: LandAreaUnit,
): number | null {
  if (
    !Number.isFinite(area) ||
    area <= 0
  ) {
    return null;
  }

  const factors:
    Record<LandAreaUnit, number> = {
      sqm: 1,

      hectares:
        10000,

      acres:
        4046.8564224,

      sqft:
        0.09290304,
  };

  return area *
    factors[unit];
}

/*
 * ============================================================
 * STATED AREA COMPARISON
 * ============================================================
 *
 * The tolerance is configurable.
 *
 * It is not an official cadastral acceptance standard.
 *
 * Land measurement differences may result from:
 *
 * - Coordinate rounding
 * - Projection scale
 * - Survey methodology
 * - Incorrect boundary sequence
 * - OCR/AI extraction mistakes
 * - Different legal parcel definitions
 * ============================================================
 */

export function compareLandAreas(
  calculatedAreaSquareMeters: number | null,
  statedAreaSquareMeters: number | null,
  tolerancePercent = 2,
): LandAreaComparison {
  const unavailable:
    LandAreaComparison = {
      status:
        "not_available",

      statedAreaSquareMeters:
        statedAreaSquareMeters,

      calculatedAreaSquareMeters:
        calculatedAreaSquareMeters,

      differenceSquareMeters:
        null,

      differencePercent:
        null,

      tolerancePercent:
        Number.isFinite(tolerancePercent)
          ? tolerancePercent
          : null,

      explanation:
        "A calculated survey area and a stated document area are both required for comparison.",

      requiresReview:
        false,
    };

  if (
    calculatedAreaSquareMeters === null ||
    statedAreaSquareMeters === null ||
    !Number.isFinite(
      calculatedAreaSquareMeters,
    ) ||
    !Number.isFinite(
      statedAreaSquareMeters,
    ) ||
    calculatedAreaSquareMeters <= 0 ||
    statedAreaSquareMeters <= 0
  ) {
    return unavailable;
  }

  if (
    !Number.isFinite(tolerancePercent) ||
    tolerancePercent < 0
  ) {
    return {
      ...unavailable,

      status:
        "inconclusive",

      explanation:
        "The land-area comparison tolerance is invalid.",
    };
  }

  const difference =
    Math.abs(
      calculatedAreaSquareMeters -
      statedAreaSquareMeters,
    );

  const differencePercent =
    difference /
    statedAreaSquareMeters *
    100;

  const withinTolerance =
    differencePercent <=
    tolerancePercent;

  return {
    status:
      withinTolerance
        ? "within_tolerance"
        : "difference_detected",

    statedAreaSquareMeters:
      roundMeasurement(
        statedAreaSquareMeters,
        3,
      ),

    calculatedAreaSquareMeters:
      roundMeasurement(
        calculatedAreaSquareMeters,
        3,
      ),

    differenceSquareMeters:
      roundMeasurement(
        difference,
        3,
      ),

    differencePercent:
      roundMeasurement(
        differencePercent,
        3,
      ),

    tolerancePercent,

    explanation:
      withinTolerance
        ? `The calculated survey area differs from the document-stated area by ${
            differencePercent.toFixed(2)
          }%, within the configured preliminary comparison tolerance. This does not certify the land area.`
        : `The calculated survey area differs from the document-stated area by ${
            differencePercent.toFixed(2)
          }%, exceeding the configured preliminary comparison tolerance. Check the survey boundary sequence, coordinate reference system, and original plan.`,

    requiresReview:
      !withinTolerance,
  };
}

/*
 * ============================================================
 * COMPARE PROJECTED LOCATION WITH BOUNDARY
 * ============================================================
 *
 * The input point must already have been transformed
 * into the same projected CRS as the polygon.
 *
 * This function does not convert arbitrary GPS data
 * into UTM automatically.
 * ============================================================
 */

export function comparePointWithProjectedBoundary(
  point: ProjectedPoint,
  polygonPoints: ProjectedPoint[],
): PointToBoundaryResult {
  const validation =
    validateProjectedPolygon(
      polygonPoints,
    );

  if (
    !validation.valid
  ) {
    return {
      valid: false,

      insideBoundary: null,

      distanceToBoundaryMeters: null,

      distanceToCentroidMeters: null,

      explanation:
        "The survey boundary geometry is invalid or incomplete.",

      independentlyVerified: false,
    };
  }

  const inside =
    isPointInsidePolygon(
      point,
      polygonPoints,
    );

  const boundaryDistance =
    calculateDistanceToPolygonBoundary(
      point,
      polygonPoints,
    );

  const centroid =
    calculateProjectedCentroid(
      polygonPoints,
    );

  const centroidDistance =
    centroid
      ? calculateProjectedDistance(
          point,
          centroid,
        )
      : null;

  if (
    inside === null ||
    boundaryDistance === null
  ) {
    return {
      valid: false,

      insideBoundary: null,

      distanceToBoundaryMeters: null,

      distanceToCentroidMeters: null,

      explanation:
        "A reliable point-to-boundary comparison could not be completed.",

      independentlyVerified: false,
    };
  }

  return {
    valid: true,

    insideBoundary:
      inside,

    distanceToBoundaryMeters:
      boundaryDistance,

    distanceToCentroidMeters:
      centroidDistance === null
        ? null
        : roundMeasurement(
            centroidDistance,
            3,
          ),

    explanation:
      inside
        ? "The document-reported geographic point falls inside the reconstructed survey boundary under the supplied coordinate system. This does not independently confirm physical location or parcel identity."
        : `The document-reported geographic point falls outside the reconstructed survey boundary. Its approximate shortest distance to the boundary is ${
            formatDistance(
              boundaryDistance,
            )
          }. The coordinate source, reference relationship, and survey plan require review.`,

    independentlyVerified: false,
  };
}
