import { supabaseServer } from "./supabase-server";

import {
  NIGERIAN_JURISDICTIONS,
  type KnowledgeReference,
  type KnowledgeSourceType,
  type KnowledgeVerificationOutcome,
  type NigerianJurisdiction,
  type PropertyDocumentType,
} from "./types";

import { generateEmbedding } from "./embeddings";

/**
 * ============================================================
 * PROPERTYSURE AI
 * JURISDICTION-AWARE KNOWLEDGE RETRIEVAL
 * ============================================================
 *
 * Two retrieval modes:
 *
 * 1. document-understanding
 *    Approved, jurisdiction-matched reference material.
 *    May include unverified or synthetic examples.
 *
 * 2. verified-evidence
 *    Approved, jurisdiction-matched records with a
 *    verified-legitimate or confirmed-fraud outcome
 *    and supporting verification evidence.
 *
 * A reference match does not independently establish
 * authenticity of a newly submitted document.
 *
 * Unknown jurisdiction always returns zero references.
 * ============================================================
 */

const DEFAULT_LIMIT = 10;
const DEFAULT_MINIMUM_SIMILARITY = 0.5;
const MAX_LIMIT = 50;

const UNDERSTANDING_SEARCH_RPC =
  "search_ai_knowledge_by_jurisdiction";

const VERIFIED_EVIDENCE_SEARCH_RPC =
  "search_ai_verified_evidence_by_jurisdiction";

export type KnowledgeRetrievalMode =
  | "document-understanding"
  | "verified-evidence";

interface KnowledgeSearchResult {
  id?: string;
  knowledge_document_id?: string;
  content?: string;
  chunk_index?: number;
  similarity?: number;

  title?: string;
  document_type?: string;
  source_type?: string;

  jurisdiction?: string | null;
  local_government_area?: string | null;
  issuing_authority?: string | null;
  document_year?: number | null;

  verification_outcome?: string | null;
  verification_evidence?: string | null;

  metadata?: Record<string, unknown>;
}

/**
 * ============================================================
 * NORMALIZE JURISDICTION
 * ============================================================
 */

export function normalizeRetrievalJurisdiction(
  value?: string | null,
): NigerianJurisdiction | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (
    cleaned === "abuja" ||
    cleaned === "fct" ||
    cleaned === "f.c.t." ||
    cleaned === "federal capital territory" ||
    cleaned === "federal capital territory abuja"
  ) {
    return "FCT";
  }

  const withoutStateSuffix = cleaned
    .replace(/\s+state$/, "")
    .trim();

  return (
    NIGERIAN_JURISDICTIONS.find(
      (jurisdiction) =>
        jurisdiction.toLowerCase() ===
        withoutStateSuffix,
    ) ?? null
  );
}

/**
 * ============================================================
 * BUILD RETRIEVAL QUERY
 * ============================================================
 */

export function buildRetrievalQuery(input: {
  documentType?: PropertyDocumentType;
  jurisdiction?: string | null;
  text?: string;
  keywords?: string[];
}): string {
  const parts: string[] = [];

  if (input.documentType) {
    parts.push(
      `Document type: ${input.documentType}`,
    );
  }

  const jurisdiction =
    normalizeRetrievalJurisdiction(
      input.jurisdiction,
    );

  if (jurisdiction) {
    parts.push(
      `Jurisdiction: ${jurisdiction}`,
    );
  }

  if (
    Array.isArray(input.keywords) &&
    input.keywords.length > 0
  ) {
    const cleanedKeywords = input.keywords
      .map((keyword) =>
        typeof keyword === "string"
          ? keyword.trim()
          : "",
      )
      .filter(Boolean);

    if (cleanedKeywords.length > 0) {
      parts.push(
        `Keywords: ${cleanedKeywords.join(", ")}`,
      );
    }
  }

  if (
    typeof input.text === "string" &&
    input.text.trim()
  ) {
    parts.push(input.text.trim());
  }

  return parts.join("\n\n").trim();
}

/**
 * ============================================================
 * CREATE RETRIEVAL EMBEDDING
 * ============================================================
 */

export async function createRetrievalEmbedding(
  query: string,
): Promise<number[]> {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    throw new Error(
      "A retrieval query is required.",
    );
  }

  return generateEmbedding(cleanedQuery);
}

/**
 * ============================================================
 * NORMALIZE LIMIT AND SIMILARITY
 * ============================================================
 */

function normalizeLimit(value?: number): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_LIMIT;
  }

  const integer = Math.floor(value);

  if (integer < 1) {
    return 1;
  }

  return Math.min(integer, MAX_LIMIT);
}

function normalizeSimilarity(
  value?: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_MINIMUM_SIMILARITY;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

/**
 * ============================================================
 * READ METADATA VALUES
 * ============================================================
 */

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];

  return typeof value === "string"
    ? value
    : undefined;
}

function getMetadataNumber(
  metadata: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const value = metadata?.[key];

  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : undefined;
}

/**
 * ============================================================
 * VALIDATE DOCUMENT TYPE
 * ============================================================
 */

function isPropertyDocumentType(
  value: string,
): value is PropertyDocumentType {
  return [
    "certificate-of-occupancy",
    "deed-of-assignment",
    "survey-plan",
    "allocation-letter",
    "governors-consent",
    "power-of-attorney",
    "receipt-payment",
    "building-planning",
    "other",
    "unknown",
  ].includes(value);
}

/**
 * ============================================================
 * VALIDATE KNOWLEDGE SOURCE TYPE
 * ============================================================
 */

function isKnowledgeSourceType(
  value?: string,
): value is KnowledgeSourceType {
  return [
    "reference-document",
    "approved-example",
    "fraud-pattern",
    "verification-rule",
    "verified-case",
  ].includes(value ?? "");
}

/**
 * ============================================================
 * NORMALIZE VERIFICATION OUTCOME
 * ============================================================
 */

function normalizeVerificationOutcome(
  value?: string | null,
): KnowledgeVerificationOutcome {
  if (
    value === "verified-legitimate" ||
    value === "confirmed-fraud"
  ) {
    return value;
  }

  return "unverified";
}

/**
 * ============================================================
 * CHECK SYNTHETIC METADATA
 * ============================================================
 *
 * This is additional application-side filtering.
 *
 * The verified-evidence SQL function also checks
 * the parent document's metadata.
 * ============================================================
 */

function isSyntheticMetadata(
  metadata: Record<string, unknown> | undefined,
): boolean {
  if (!metadata) {
    return false;
  }

  const syntheticFlag =
    metadata["is_synthetic"];

  if (
    syntheticFlag === true ||
    (
      typeof syntheticFlag === "string" &&
      syntheticFlag.toLowerCase().trim() ===
        "true"
    )
  ) {
    return true;
  }

  const category =
    metadata["knowledge_category"];

  if (typeof category !== "string") {
    return false;
  }

  return [
    "synthetic",
    "synthetic-test",
    "test-data",
  ].includes(
    category.toLowerCase().trim(),
  );
}

/**
 * ============================================================
 * CONVERT DATABASE RESULT
 * ============================================================
 */

function mapKnowledgeResult(
  item: KnowledgeSearchResult,
  requestedDocumentType?: PropertyDocumentType,
): KnowledgeReference {
  const metadata =
    item.metadata &&
    typeof item.metadata === "object" &&
    !Array.isArray(item.metadata)
      ? item.metadata
      : {};

  const title =
    item.title ??
    getMetadataString(metadata, "title");

  const rawDocumentType =
    item.document_type ??
    getMetadataString(
      metadata,
      "document_type",
    );

  const documentType =
    rawDocumentType &&
    isPropertyDocumentType(rawDocumentType)
      ? rawDocumentType
      : requestedDocumentType;

  const rawSourceType =
    item.source_type ??
    getMetadataString(
      metadata,
      "source_type",
    );

  const sourceType =
    isKnowledgeSourceType(rawSourceType)
      ? rawSourceType
      : "reference-document";

  const jurisdiction =
    normalizeRetrievalJurisdiction(
      item.jurisdiction ??
      getMetadataString(
        metadata,
        "jurisdiction",
      ),
    );

  const verificationOutcome =
    normalizeVerificationOutcome(
      item.verification_outcome ??
      getMetadataString(
        metadata,
        "verification_outcome",
      ),
    );

  const verificationEvidence =
    item.verification_evidence ??
    getMetadataString(
      metadata,
      "verification_evidence",
    ) ??
    null;

  const documentYear =
    item.document_year ??
    getMetadataNumber(
      metadata,
      "document_year",
    );

  const combinedMetadata:
    Record<string, unknown> = {
      ...metadata,

      knowledgeDocumentId:
        item.knowledge_document_id,

      chunkIndex:
        item.chunk_index,

      jurisdiction,

      verificationOutcome,
    };

  Object.keys(combinedMetadata).forEach(
    (key) => {
      if (
        combinedMetadata[key] === undefined
      ) {
        delete combinedMetadata[key];
      }
    },
  );

  return {
    id:
      item.id ??
      item.knowledge_document_id ??
      `knowledge-match-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    title,

    documentType,

    sourceType,

    similarity:
      typeof item.similarity === "number"
        ? item.similarity
        : undefined,

    content:
      typeof item.content === "string"
        ? item.content
        : undefined,

    jurisdiction,

    localGovernmentArea:
      item.local_government_area ??
      getMetadataString(
        metadata,
        "local_government_area",
      ) ??
      null,

    issuingAuthority:
      item.issuing_authority ??
      getMetadataString(
        metadata,
        "issuing_authority",
      ) ??
      null,

    documentYear:
      documentYear ?? null,

    verificationOutcome,

    verificationEvidence,

    metadata: combinedMetadata,
  };
}

/**
 * ============================================================
 * DETERMINE RETRIEVAL MODE
 * ============================================================
 */

function normalizeRetrievalMode(
  mode?: KnowledgeRetrievalMode,
): KnowledgeRetrievalMode {
  return mode === "verified-evidence"
    ? "verified-evidence"
    : "document-understanding";
}

/**
 * ============================================================
 * CHECK VERIFIED EVIDENCE
 * ============================================================
 *
 * A database record's verification label and evidence
 * do not independently prove authenticity.
 *
 * This function checks eligibility for retrieval,
 * not whether the underlying evidence is true.
 * ============================================================
 */

function isEligibleVerifiedEvidence(
  reference: KnowledgeReference,
): boolean {
  if (
    reference.verificationOutcome !==
      "verified-legitimate" &&
    reference.verificationOutcome !==
      "confirmed-fraud"
  ) {
    return false;
  }

  if (
    typeof reference.verificationEvidence !==
      "string" ||
    !reference.verificationEvidence.trim()
  ) {
    return false;
  }

  if (
    isSyntheticMetadata(reference.metadata)
  ) {
    return false;
  }

  return true;
}

/**
 * ============================================================
 * RETRIEVE KNOWLEDGE
 * ============================================================
 *
 * Jurisdiction is mandatory for both modes.
 *
 * document-understanding:
 *   General approved reference knowledge.
 *
 * verified-evidence:
 *   Approved records with qualifying verification
 *   outcome, evidence, and synthetic exclusions.
 *
 * SQL performs the primary security filtering.
 * This module adds defense-in-depth filtering.
 * ============================================================
 */

export async function retrieveKnowledge(
  embedding: number[],
  options?: {
    documentType?: PropertyDocumentType;
    jurisdiction?: string | null;
    limit?: number;
    minimumSimilarity?: number;
    mode?: KnowledgeRetrievalMode;
  },
): Promise<KnowledgeReference[]> {
  if (
    !Array.isArray(embedding) ||
    embedding.length === 0
  ) {
    throw new Error(
      "A valid embedding is required for knowledge retrieval.",
    );
  }

  const invalidEmbeddingValue =
    embedding.some(
      (value) =>
        typeof value !== "number" ||
        !Number.isFinite(value),
    );

  if (invalidEmbeddingValue) {
    throw new Error(
      "The retrieval embedding contains invalid values.",
    );
  }

  const jurisdiction =
    normalizeRetrievalJurisdiction(
      options?.jurisdiction,
    );

  /**
   * Unknown jurisdiction:
   * absolutely no reference retrieval.
   */

  if (!jurisdiction) {
    return [];
  }

  const mode =
    normalizeRetrievalMode(
      options?.mode,
    );

  const rpcName =
    mode === "verified-evidence"
      ? VERIFIED_EVIDENCE_SEARCH_RPC
      : UNDERSTANDING_SEARCH_RPC;

  const limit =
    normalizeLimit(
      options?.limit,
    );

  const minimumSimilarity =
    normalizeSimilarity(
      options?.minimumSimilarity,
    );

  const { data, error } =
    await supabaseServer.rpc(
      rpcName,
      {
        query_embedding:
          embedding,

        match_count:
          limit,

        minimum_similarity:
          minimumSimilarity,

        filter_document_type:
          options?.documentType ?? null,

        filter_jurisdiction:
          jurisdiction,
      },
    );

  if (error) {
    console.error(
      "PropertySure AI knowledge retrieval error:",
      {
        mode,
        jurisdiction,
        error,
      },
    );

    throw new Error(
      `Knowledge retrieval failed (${mode}): ${error.message}`,
    );
  }

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return [];
  }

  const references =
    data.map(
      (item: KnowledgeSearchResult) =>
        mapKnowledgeResult(
          item,
          options?.documentType,
        ),
    );

  /**
   * Defense-in-depth:
   * reject any reference that does not match
   * the requested jurisdiction.
   */

  let matchingReferences =
    references.filter(
      (reference) =>
        reference.jurisdiction ===
        jurisdiction,
    );

  /**
   * In verified-evidence mode, also discard
   * references that fail application-side
   * eligibility checks.
   */

  if (mode === "verified-evidence") {
    matchingReferences =
      matchingReferences.filter(
        isEligibleVerifiedEvidence,
      );
  }

  /**
   * Deduplicate by chunk/reference ID.
   */

  const uniqueReferences =
    new Map<
      string,
      KnowledgeReference
    >();

  for (const reference of matchingReferences) {
    if (
      !uniqueReferences.has(
        reference.id,
      )
    ) {
      uniqueReferences.set(
        reference.id,
        reference,
      );
    }
  }

  return Array.from(
    uniqueReferences.values(),
  );
}

/**
 * ============================================================
 * SEARCH KNOWLEDGE
 * ============================================================
 *
 * Default mode preserves existing integration behavior.
 *
 * For authenticity-related reasoning, callers must
 * explicitly request mode: "verified-evidence".
 * ============================================================
 */

export async function searchKnowledge(
  input: {
    documentType?: PropertyDocumentType;
    jurisdiction?: string | null;
    text?: string;
    keywords?: string[];
  },
  options?: {
    limit?: number;
    minimumSimilarity?: number;
    mode?: KnowledgeRetrievalMode;
  },
): Promise<KnowledgeReference[]> {
  const jurisdiction =
    normalizeRetrievalJurisdiction(
      input.jurisdiction,
    );

  if (!jurisdiction) {
    return [];
  }

  const query =
    buildRetrievalQuery({
      ...input,
      jurisdiction,
    });

  if (!query) {
    return [];
  }

  const embedding =
    await createRetrievalEmbedding(
      query,
    );

  return retrieveKnowledge(
    embedding,
    {
      documentType:
        input.documentType,

      jurisdiction,

      limit:
        options?.limit ??
        DEFAULT_LIMIT,

      minimumSimilarity:
        options?.minimumSimilarity ??
        DEFAULT_MINIMUM_SIMILARITY,

      mode:
        options?.mode ??
        "document-understanding",
    },
  );
}