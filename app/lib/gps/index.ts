/*
 * ============================================================
 * PROPERTYSURE AI — ADVANCED GPS ENGINE
 *
 * File: app/lib/gps/index.ts
 * ============================================================
 *
 * CENTRAL EXPORT MODULE
 *
 * Provides access to:
 *
 * 1. Shared GPS and survey data types
 * 2. Coordinate validation and normalization
 * 3. Coordinate reference system validation
 * 4. WGS84 UTM geographic conversion
 * 5. Individual survey beacon conversion
 * 6. Multiple survey beacon conversion
 * 7. Geographic distance calculations
 * 8. Survey polygon geometry validation
 * 9. Survey boundary reconstruction
 * 10. Plot side lengths and perimeter
 * 11. Approximate land-area calculations
 * 12. Geographic point-to-boundary comparisons
 * 13. Cross-document GPS consistency analysis
 * 14. GPS findings and map data preparation
 *
 * IMPORTANT LIMITATIONS
 *
 * GPS calculations are based on document-reported data.
 *
 * These functions do not independently establish:
 *
 * - Government document authenticity
 * - Registered survey-plan validity
 * - Legal property ownership
 * - Certified cadastral boundaries
 * - Physical property location
 * - Government registry verification
 *
 * ============================================================
 */

/*
 * ============================================================
 * 1. SHARED GPS TYPES
 * ============================================================
 */

export type {
  GPSStatus,
  CoordinateSystem,
  GPSHemisphere,
  CoordinateConversionStatus,
  GPSCoordinates,
  UTMCoordinates,
  CoordinateReferenceDetails,
  SurveyBeacon,
  ExtractedGPSData,
  GPSDistanceResult,
  GPSDocumentComparison,
  SurveyBoundaryPoint,
  SurveyBoundaryStatus,
  SurveyBoundary,
  SurveySideMeasurement,
  LandAreaComparisonStatus,
  LandAreaComparison,
  SurveyMeasurements,
  SurveyLocationComparison,
  GPSMapData,
  GPSFindingSeverity,
  GPSStructuredFinding,
  GPSAnalysisResult,
} from "./types";

/*
 * ============================================================
 * 2. COORDINATE VALIDATION AND PARSING
 * ============================================================
 */

export {
  isValidLatitude,
  isValidLongitude,
  isValidGPSCoordinates,
  parseDecimalCoordinate,
  parseDMSCoordinate,
  parseCoordinate,
  normalizeGPSCoordinates,
  isWithinNigeriaBounds,
  isValidUTMZone,
  isValidUTMHemisphere,
  isValidUTMCoordinates,
  normalizeBeaconId,
  isUsableSurveyBeacon,
  findDuplicateBeaconIds,
  findDuplicateBeaconPositions,
  validateBoundarySequence,
  validateCoordinateReference,
  roundCoordinate,
  formatGPSCoordinates,
} from "./coordinates";

/*
 * ============================================================
 * 3. COORDINATE CONVERSION TYPES
 * ============================================================
 */

export type {
  CoordinateConversionResult,
  SurveyBeaconConversionOptions,
  SurveyBeaconConversionResult,
  SurveyBeaconBatchResult,
} from "./converter";

/*
 * ============================================================
 * 4. COORDINATE CONVERSION FUNCTIONS
 * ============================================================
 */

export {
  normalizeDatum,
  longitudeToUTMZone,
  convertWGS84UTMToGPS,
  convertUTMToGPS,
  convertWGS84Coordinates,
  convertSurveyBeacon,
  convertSurveyBeacons,
} from "./converter";

/*
 * ============================================================
 * 5. GEOGRAPHIC DISTANCE TYPES
 * ============================================================
 */

export type {
  DistanceComparisonOptions,
  DistanceComparisonResult,
  GPSPoint,
  GPSPointDistance,
  ProjectedPoint,
  ProjectedCoordinateReference,
  ProjectedPolygon,
  PolygonValidationResult,
  SurveyGeometryResult,
  PointToBoundaryResult,
  LandAreaUnit,
} from "./distance";

/*
 * ============================================================
 * 6. GEOGRAPHIC DISTANCE FUNCTIONS
 * ============================================================
 */

export {
  degreesToRadians,
  radiansToDegrees,
  calculateDistanceMeters,
  calculateGPSDistance,
  formatDistance,
  compareGPSLocations,
  compareMultipleGPSPoints,
  summarizeGPSDistances,
  calculateProjectedDistance,
} from "./distance";

/*
 * ============================================================
 * 7. SURVEY POLYGON AND LAND MEASUREMENTS
 * ============================================================
 */

export {
  validateProjectedPolygon,
  calculatePolygonArea,
  calculatePolygonSides,
  calculatePolygonPerimeter,
  calculateProjectedCentroid,
  calculateSurveyGeometry,
  convertLandAreaToSquareMeters,
  compareLandAreas,
} from "./distance";

/*
 * ============================================================
 * 8. GEOGRAPHIC BOUNDARY COMPARISONS
 * ============================================================
 */

export {
  isPointInsidePolygon,
  distanceToProjectedSegment,
  calculateDistanceToPolygonBoundary,
  comparePointWithProjectedBoundary,
} from "./distance";

/*
 * ============================================================
 * 9. GPS ANALYSIS TYPES
 * ============================================================
 */

export type {
  GPSAnalysisOptions,
} from "./analyze";

/*
 * ============================================================
 * 10. GPS ANALYSIS FUNCTIONS
 * ============================================================
 */

export {
  analyzeGPSDocuments,
  analyzeSingleGPSDocument,
  summarizeGPSAnalysis,
} from "./analyze";