/**
 * PropertySure AI
 * Core AI Intelligence Types
 *
 * This file defines the shared data structures used by
 * the document classification, extraction, retrieval,
 * analysis, learning, and risk-scoring systems.
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

  fields?: Record<string, string | number | boolean | null>;
}

export interface KnowledgeReference {
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
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  documentTypes?: PropertyDocumentType[];
  indicators: string[];
  severity: "low" | "medium" | "high" | "critical";
}

export interface DocumentFinding {
  category: string;
  title: string;
  description: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  confidence: number;
  evidence?: string[];
}

export interface RiskScore {
  score: number;
  level: "low" | "moderate" | "high" | "critical";
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

export interface KnowledgeDocument {
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

  feedbackSource?: "admin" | "system" | "verified-case";

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