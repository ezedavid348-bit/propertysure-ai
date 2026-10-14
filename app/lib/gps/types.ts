/*
 * ============================================================
 * PROPERTYSURE AI — GPS ENGINE TYPES
 *
 * File: app/lib/gps/types.ts
 * ============================================================
 *
 * Shared types for:
 *
 * 1. GPS coordinate extraction
 * 2. Coordinate validation and conversion
 * 3. Survey beacon analysis
 * 4. Survey boundary reconstruction
 * 5. Plot dimensions and land-area calculations
 * 6. Geographic consistency comparisons
 * 7. Map visualization
 * 8. GPS findings and verification limitations
 *
 * IMPORTANT:
 *
 * All geographic information originates from uploaded
 * documents unless explicitly identified otherwise.
 *
 * Mathematical calculations do not establish:
 *
 * - Legal property ownership
 * - Government survey registration
 * - Official parcel boundaries
 * - Document authenticity
 * - Physical property verification
 *
 * ============================================================
 */

/*
 * ============================================================
 * GPS ASSESSMENT STATUS
 * ============================================================
 */

export type GPSStatus =
  | "consistent"
  | "mismatch"
  | "inconclusive"
  | "not_available";

/*
 * ============================================================
 * COORDINATE REFERENCE SYSTEM
 * ============================================================
 */

export type CoordinateSystem =
  | "WGS84"
  | "UTM"
  | "MINNA_UTM"
  | "UNKNOWN";

export type GPSHemisphere = "N" | "S";

export type CoordinateConversionStatus =
  | "converted"
  | "already_wgs84"
  | "unsupported_datum"
  | "incomplete"
  | "invalid";

/*
 * ============================================================
 * GEOGRAPHIC COORDINATES
 * ============================================================
 */

export type GPSCoordinates = {
  latitude: number;
  longitude: number;
};

/*
 * ============================================================
 * UTM COORDINATES
 * ============================================================
 */

export type UTMCoordinates = {
  easting: number;
  northing: number;

  zone: number | null;

  hemisphere: GPSHemisphere | null;

  datum: string;
};

/*
 * ============================================================
 * COORDINATE REFERENCE DETAILS
 * ============================================================
 *
 * The source reference system must be established before
 * projected coordinates can be converted to WGS84.
 *
 * This prevents unsupported transformations from producing
 * misleading map locations.
 * ============================================================
 */

export type CoordinateReferenceDetails = {
  coordinateSystem: CoordinateSystem;

  datum: string;

  projection: string;

  utmZone: number | null;

  hemisphere: GPSHemisphere | null;

  epsgCode: string;

  explicitlyStated: boolean;

  evidence: string;
};

/*
 * ============================================================
 * SURVEY BEACON
 * ============================================================
 *
 * A survey beacon represents a specific surveyed point.
 *
 * The latitude and longitude fields refer to coordinates
 * directly reported or safely converted for that point.
 *
 * The original easting and northing are preserved.
 *
 * Existing fields are retained for compatibility.
 * ============================================================
 */

export type SurveyBeacon = {
  beaconId: string;

  latitude: number | null;
  longitude: number | null;

  easting: number | null;
  northing: number | null;

  coordinateSystem: CoordinateSystem;

  sourceDocument: string;

  /*
   * Additional coordinate reference details.
   */
  utmZone?: number | null;

  hemisphere?: GPSHemisphere | null;

  datum?: string;

  /*
   * Original evidence from the uploaded document.
   */
  coordinateEvidence?: string;

  /*
   * Conversion results.
   */
  convertedCoordinates?: GPSCoordinates | null;

  conversionStatus?: CoordinateConversionStatus;

  conversionNotes?: string[];

  /*
   * Position in the reported boundary sequence.
   *
   * This must come from a reliable document-defined
   * sequence rather than alphabetical guessing.
   */
  boundaryOrder?: number | null;
};

/*
 * ============================================================
 * EXTRACTED DOCUMENT GPS INFORMATION
 * ============================================================
 *
 * Preserves all existing fields.
 *
 * Additional optional fields let the future Essential
 * extraction route retain coordinate-system evidence
 * and explicitly identified reference points.
 * ============================================================
 */

export type ExtractedGPSData = {
  sourceDocument: string;

  statedAddress: string;

  coordinateSystem: CoordinateSystem;

  latitude: number | null;
  longitude: number | null;

  utm: UTMCoordinates | null;

  surveyBeacons: SurveyBeacon[];

  extractionNotes: string[];

  extractionConfidence: number | null;

  /*
   * Additional geographic extraction details.
   */
  coordinateReference?: CoordinateReferenceDetails | null;

  referencePointId?: string;

  coordinateEvidence?: string;

  coordinatesExplicitlyStated?: boolean;

  /*
   * Land area claimed by the submitted document.
   */
  statedLandArea?: number | null;

  statedLandAreaUnit?:
    | "sqm"
    | "hectares"
    | "acres"
    | "sqft"
    | "unknown";

  /*
   * Original reported boundary order, if established.
   */
  boundarySequence?: string[];

  boundarySequenceEstablished?: boolean;
};

/*
 * ============================================================
 * GPS DISTANCE
 * ============================================================
 */

export type GPSDistanceResult = {
  distanceMeters: number;
  distanceKilometers: number;
};

/*
 * ============================================================
 * GEOGRAPHIC DOCUMENT COMPARISON
 * ============================================================
 *
 * Existing required fields remain unchanged.
 * ============================================================
 */

export type GPSDocumentComparison = {
  firstDocument: string;
  secondDocument: string;

  distanceMeters: number | null;

  status: GPSStatus;

  explanation: string;

  /*
   * Additional comparison information.
   */
  firstReferencePoint?: string;

  secondReferencePoint?: string;

  correspondingPointsEstablished?: boolean;

  comparisonType?:
    | "same_reference_point"
    | "document_location"
    | "survey_boundary"
    | "different_reference_points"
    | "unavailable";

  requiresReview?: boolean;
};

/*
 * ============================================================
 * SURVEY BOUNDARY POINT
 * ============================================================
 *
 * Represents a beacon that is eligible for inclusion
 * in a document-derived boundary polygon.
 * ============================================================
 */

export type SurveyBoundaryPoint = {
  beaconId: string;

  order: number;

  originalEasting: number | null;
  originalNorthing: number | null;

  coordinates: GPSCoordinates;

  sourceDocument: string;

  coordinateSystem: CoordinateSystem;

  conversionStatus: CoordinateConversionStatus;
};

/*
 * ============================================================
 * SURVEY BOUNDARY
 * ============================================================
 *
 * A reconstructed polygon based on the uploaded
 * survey document.
 *
 * A polygon is only produced when its reference system
 * and boundary sequence have been reliably established.
 * ============================================================
 */

export type SurveyBoundaryStatus =
  | "available"
  | "incomplete"
  | "unsupported_coordinate_system"
  | "invalid_geometry"
  | "not_available";

export type SurveyBoundary = {
  status: SurveyBoundaryStatus;

  sourceDocument: string;

  points: SurveyBoundaryPoint[];

  closed: boolean;

  coordinateSystem: "WGS84";

  sequenceEstablished: boolean;

  mapReady: boolean;

  /*
   * An indicative representative position.
   *
   * A centroid is not necessarily inside an irregular
   * parcel and is not an official survey reference point.
   */
  centroid: GPSCoordinates | null;

  /*
   * Origin and reliability information.
   */
  documentReported: true;

  independentlyVerified: false;

  findings: string[];

  limitations: string[];
};

/*
 * ============================================================
 * SURVEY SIDE MEASUREMENTS
 * ============================================================
 */

export type SurveySideMeasurement = {
  fromBeacon: string;

  toBeacon: string;

  lengthMeters: number;
};

/*
 * ============================================================
 * LAND AREA COMPARISON
 * ============================================================
 */

export type LandAreaComparisonStatus =
  | "within_tolerance"
  | "difference_detected"
  | "inconclusive"
  | "not_available";

export type LandAreaComparison = {
  status: LandAreaComparisonStatus;

  statedAreaSquareMeters: number | null;

  calculatedAreaSquareMeters: number | null;

  differenceSquareMeters: number | null;

  differencePercent: number | null;

  tolerancePercent: number | null;

  explanation: string;

  requiresReview: boolean;
};

/*
 * ============================================================
 * SURVEY MEASUREMENTS
 * ============================================================
 *
 * Area calculations require coordinates in an appropriate
 * projected reference system and a reliable parcel sequence.
 *
 * Results are geometric estimates, not certified surveys.
 * ============================================================
 */

export type SurveyMeasurements = {
  sourceDocument: string;

  coordinateSystem: CoordinateSystem;

  sideLengths: SurveySideMeasurement[];

  perimeterMeters: number | null;

  calculatedAreaSquareMeters: number | null;

  calculatedAreaHectares: number | null;

  statedAreaSquareMeters: number | null;

  areaComparison: LandAreaComparison | null;

  calculationMethod: string;

  geometryValid: boolean;

  requiresSurveyorReview: boolean;

  findings: string[];

  limitations: string[];
};

/*
 * ============================================================
 * REPORTED GPS LOCATION VERSUS SURVEY BOUNDARY
 * ============================================================
 *
 * Compares a reported geographic reference position with
 * a reconstructed boundary when both are reliable enough
 * for mathematical comparison.
 *
 * The comparison must identify whether the reported
 * reference point is intended to represent the same plot.
 * ============================================================
 */

export type SurveyLocationComparison = {
  status: GPSStatus;

  reportedCoordinates: GPSCoordinates | null;

  boundaryCentroid: GPSCoordinates | null;

  distanceToCentroidMeters: number | null;

  distanceToBoundaryMeters: number | null;

  pointInsideBoundary: boolean | null;

  referenceRelationshipEstablished: boolean;

  explanation: string;

  requiresReview: boolean;
};

/*
 * ============================================================
 * GPS MAP DATA
 * ============================================================
 *
 * The frontend can use this information to display
 * a coordinate marker and, when available, a boundary.
 *
 * Mobile browsers may open the full map if an embedded
 * provider cannot render successfully.
 * ============================================================
 */

export type GPSMapData = {
  available: boolean;

  center: GPSCoordinates | null;

  markerCoordinates: GPSCoordinates | null;

  boundaryPoints: GPSCoordinates[];

  showBoundary: boolean;

  sourceDocument: string;

  mapProvider: "openstreetmap";

  label: string;

  /*
   * The actual URL is generated by the map presentation
   * layer after coordinate validation.
   */
  fullMapUrl: string | null;

  documentReported: true;

  independentlyVerified: false;
};

/*
 * ============================================================
 * GEOGRAPHIC FINDING
 * ============================================================
 *
 * Structured findings complement the existing string-based
 * findings array without breaking the current Results page.
 * ============================================================
 */

export type GPSFindingSeverity =
  | "information"
  | "attention"
  | "critical";

export type GPSStructuredFinding = {
  code: string;

  title: string;

  description: string;

  severity: GPSFindingSeverity;

  sourceDocuments: string[];

  requiresReview: boolean;
};

/*
 * ============================================================
 * GPS ANALYSIS RESULT
 * ============================================================
 *
 * All original required properties are preserved.
 *
 * New properties are optional so previously saved
 * verifications and existing GPS functions remain
 * compatible while the engine is being upgraded.
 * ============================================================
 */

export type GPSAnalysisResult = {
  status: GPSStatus;

  coordinates: GPSCoordinates | null;

  statedAddress: string;

  coordinateSystem: CoordinateSystem;

  sourceDocuments: string[];

  documentComparisons: GPSDocumentComparison[];

  mapAvailable: boolean;

  findings: string[];

  limitations: string[];

  independentlyVerified: false;

  /*
   * Survey boundary reconstruction.
   */
  surveyBoundaries?: SurveyBoundary[];

  /*
   * Dimensions and land area.
   */
  surveyMeasurements?: SurveyMeasurements[];

  /*
   * Comparison between document-reported GPS
   * and reconstructed survey boundaries.
   */
  surveyLocationComparisons?: SurveyLocationComparison[];

  /*
   * Geographic map data for desktop and mobile.
   */
  mapData?: GPSMapData | null;

  /*
   * Additional structured geographic findings.
   */
  structuredFindings?: GPSStructuredFinding[];

  /*
   * Overall methodology.
   */
  analysisMethod?: string;

  /*
   * Explicit provenance statement.
   */
  dataSource?:
    | "uploaded_documents"
    | "mixed_sources";

  /*
   * Whether a licensed surveyor should review
   * the geographic findings.
   */
  requiresSurveyorReview?: boolean;
};