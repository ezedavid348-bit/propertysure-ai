/**
 * PropertySure AI
 * Core AI Intelligence Types
 *
 * Shared structures for classification, extraction,
 * retrieval, analysis, learning, and risk scoring.
 */

export type PropertyDocumentType =
  | "certificate-of-occupancy"
  | "deed-of-assignment"
  | "survey-plan"
  | "allocation-letter"
  | "governors-consent"
  | "power-of-attorney"
  | "receipt-payment"
  | "building-planning"
  | "other"
  | "unknown";

export type AIProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "uncertain";

export type KnowledgeApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type KnowledgeSourceType =
  | "reference-document"
  | "approved-example"
  | "fraud-pattern"
  | "verification-rule"
  | "verified-case";

/**
 * ============================================================
 * NIGERIAN PROPERTY JURISDICTIONS
 * ============================================================
 *
 * All 36 Nigerian states plus the Federal Capital Territory.
 *
 * Canonical values are used for database filtering.
 *
 * Abuja is represented by "FCT".
 * Port Harcourt is represented by "Rivers".
 *
 * These types do not automatically detect jurisdiction.
 * Detection and normalization happen in the application.
 * ============================================================
 */

export const NIGERIAN_JURISDICTIONS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
] as const;

export type NigerianJurisdiction =
  (typeof NIGERIAN_JURISDICTIONS)[number];

/**
 * ============================================================
 * KNOWLEDGE VERIFICATION OUTCOME
 * ============================================================
 *
 * This is not the same as knowledge approval.
 *
 * An approved knowledge record can describe a confirmed
 * fraudulent document.
 *
 * "verified-legitimate" and "confirmed-fraud" must be
 * supported by independent verification evidence.
 * ============================================================
 */

export type KnowledgeVerificationOutcome =
  | "verified-legitimate"
  | "confirmed-fraud"
  | "unverified";

/**
 * ============================================================
 * JURISDICTION AND VERIFICATION INFORMATION
 * ============================================================
 *
 * Jurisdiction is optional at the type level because existing
 * records and documents may not have a known jurisdiction.
 *
 * A missing jurisdiction must never trigger an automatic
 * cross-state reference fallback.
 * ============================================================
 */

export interface KnowledgeJurisdiction {
  jurisdiction?: NigerianJurisdiction | null;
  localGovernmentArea?: string | null;
  issuingAuthority?: string | null;
  documentYear?: number | null;
  verificationOutcome?: KnowledgeVerificationOutcome;
  verificationEvidence?: string | null;
}

export interface DocumentInput {
  documentId?: string;
  fileName: string;
  fileUrl?: string;
  fileType?: string;
  documentType?: PropertyDocumentType;
}

export interface DocumentClassification {
  documentType: PropertyDocumentType;
  confidence: number;
  status: "identified" | "uncertain" | "failed";
  message?: string;
  documentTitleDetected?: string;
  nameDetected?: string;
  reasoning?: string[];
}

export interface ExtractedDocumentData {
  documentType?: PropertyDocumentType;

  documentTitle?: string;
  ownerName?: string;

  propertyAddress?: string;
  propertyDescription?: string;

  documentNumber?: string;
  plotNumber?: string;
  blockNumber?: string;
  district?: string;
  location?: string;

  issueDate?: string;
  executionDate?: string;

  surveyPlanNumber?: string;
  fileNumber?: string;

  issuingAuthority?: string;
  registrationAuthority?: string;

  rawText?: string;

  fields?: Record<
    string,
    string | number | boolean | null
  >;

  /**
   * Jurisdiction extracted from document content.
   *
   * Do not infer jurisdiction from filename alone.
   */
  jurisdiction?: NigerianJurisdiction | null;
  localGovernmentArea?: string | null;
}

export interface KnowledgeReference
  extends KnowledgeJurisdiction {
  id: string;
  title?: string;
  documentType?: PropertyDocumentType;
  sourceType: KnowledgeSourceType;
  similarity?: number;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface VerificationRule {
  id: string;
  name: string;
  description: string;
  documentTypes: PropertyDocumentType[];
  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";
  enabled: boolean;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  documentTypes?: PropertyDocumentType[];
  indicators: string[];
  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";
}

export interface DocumentFinding {
  category: string;
  title: string;
  description: string;
  severity:
    | "info"
    | "low"
    | "medium"
    | "high"
    | "critical";
  confidence: number;
  evidence?: string[];
}

export interface RiskScore {
  score: number;
  level:
    | "low"
    | "moderate"
    | "high"
    | "critical";
  reasons: string[];
}

export interface DocumentAnalysis {
  classification: DocumentClassification;
  extractedData: ExtractedDocumentData;
  references: KnowledgeReference[];
  findings: DocumentFinding[];
  risk: RiskScore;
  status: AIProcessingStatus;
}

export interface KnowledgeDocument
  extends KnowledgeJurisdiction {
  id?: string;
  title: string;
  documentType: PropertyDocumentType;
  sourceType: KnowledgeSourceType;
  approvalStatus: KnowledgeApprovalStatus;

  sourcePath?: string;
  sourceUrl?: string;

  description?: string;
  content?: string;

  metadata?: Record<string, unknown>;

  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeChunk {
  id?: string;
  knowledgeDocumentId: string;

  content: string;
  chunkIndex: number;

  embedding?: number[];

  metadata?: Record<string, unknown>;
}

export interface ClassificationFeedback {
  documentId: string;
  predictedType: PropertyDocumentType;
  correctedType?: PropertyDocumentType;

  confidence?: number;

  feedbackSource?:
    | "admin"
    | "system"
    | "verified-case";

  notes?: string;
}

export interface AIProcessingRun {
  id?: string;

  documentId?: string;

  stage:
    | "classification"
    | "extraction"
    | "retrieval"
    | "analysis"
    | "learning";

  status: AIProcessingStatus;

  startedAt?: string;
  completedAt?: string;

  error?: string;

  metadata?: Record<string, unknown>;
}