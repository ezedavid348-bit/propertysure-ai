import { supabaseServer } from "./supabase-server";

import type {
  KnowledgeReference,
  PropertyDocumentType,
  KnowledgeSourceType,
} from "./types";

import { generateEmbedding } from "./embeddings";

/**
 * ============================================================
 * PROPERTYsure AI
 * KNOWLEDGE RETRIEVAL LAYER
 * ============================================================
 *
 * This module is responsible for:
 *
 * 1. Building a searchable query.
 * 2. Generating an embedding for that query.
 * 3. Sending the embedding to Supabase.
 * 4. Calling the search_ai_knowledge() RPC function.
 * 5. Returning approved knowledge relevant to the document.
 *
 * IMPORTANT:
 *
 * The actual trust boundary is maintained in Supabase.
 *
 * Only knowledge with:
 *
 *     approval_status = "approved"
 *
 * should be returned by search_ai_knowledge().
 *
 * Customer-uploaded documents must NOT automatically become
 * trusted AI knowledge.
 * ============================================================
 */

/**
 * ============================================================
 * DEFAULT SEARCH SETTINGS
 * ============================================================
 */

const DEFAULT_LIMIT = 10;

const DEFAULT_MINIMUM_SIMILARITY = 0.5;

const MAX_LIMIT = 50;

/**
 * ============================================================
 * RPC RESULT TYPE
 * ============================================================
 *
 * The search_ai_knowledge() function may return some values
 * directly and some values inside metadata.
 *
 * We support both formats.
 */
interface KnowledgeSearchResult {
  id?: string;

  knowledge_document_id?: string;

  content?: string;

  chunk_index?: number;

  similarity?: number;

  title?: string;

  document_type?: string;

  source_type?: string;

  metadata?: Record<string, unknown>;
}

/**
 * ============================================================
 * BUILD RETRIEVAL QUERY
 * ============================================================
 *
 * Creates a searchable query from information already known
 * about the document.
 *
 * Example:
 *
 * Document type: certificate-of-occupancy
 *
 * Keywords: certificate, occupancy, ministry, title,
 * registration
 *
 * <extracted document text>
 * ============================================================
 */

export function buildRetrievalQuery(input: {
  documentType?: PropertyDocumentType;

  text?: string;

  keywords?: string[];
}): string {
  const parts: string[] = [];

  /**
   * Document type
   */
  if (input.documentType) {
    parts.push(
      `Document type: ${input.documentType}`,
    );
  }

  /**
   * Keywords
   */
  if (
    Array.isArray(input.keywords) &&
    input.keywords.length > 0
  ) {
    const cleanedKeywords =
      input.keywords
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

  /**
   * Document text
   */
  if (
    typeof input.text === "string" &&
    input.text.trim()
  ) {
    parts.push(
      input.text.trim(),
    );
  }

  return parts.join("\n\n").trim();
}

/**
 * ============================================================
 * CREATE RETRIEVAL EMBEDDING
 * ============================================================
 *
 * Converts the retrieval query into a vector.
 */
export async function createRetrievalEmbedding(
  query: string,
): Promise<number[]> {
  const cleanedQuery =
    query.trim();

  if (!cleanedQuery) {
    throw new Error(
      "A retrieval query is required.",
    );
  }

  return generateEmbedding(
    cleanedQuery,
  );
}

/**
 * ============================================================
 * NORMALIZE LIMIT
 * ============================================================
 *
 * Prevents accidental requests for an unreasonable number
 * of knowledge chunks.
 */
function normalizeLimit(
  value?: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_LIMIT;
  }

  const integer =
    Math.floor(value);

  if (integer < 1) {
    return 1;
  }

  return Math.min(
    integer,
    MAX_LIMIT,
  );
}

/**
 * ============================================================
 * NORMALIZE SIMILARITY
 * ============================================================
 */
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
 * READ METADATA VALUE
 * ============================================================
 */
function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value =
    metadata?.[key];

  return typeof value === "string"
    ? value
    : undefined;
}

/**
 * ============================================================
 * CONVERT DATABASE RESULT
 * ============================================================
 *
 * Converts the raw Supabase RPC result into the shared
 * KnowledgeReference structure used by the AI engine.
 */
function mapKnowledgeResult(
  item: KnowledgeSearchResult,
  requestedDocumentType?: PropertyDocumentType,
): KnowledgeReference {
  const metadata =
    item.metadata ?? {};

  /**
   * Prefer direct database fields.
   *
   * Fall back to metadata when necessary.
   */
  const title =
    item.title ??
    getMetadataString(
      metadata,
      "title",
    );

  const rawDocumentType =
    item.document_type ??
    getMetadataString(
      metadata,
      "document_type",
    );

  const documentType =
    rawDocumentType &&
    isPropertyDocumentType(
      rawDocumentType,
    )
      ? rawDocumentType
      : requestedDocumentType;

  const rawSourceType =
    item.source_type ??
    getMetadataString(
      metadata,
      "source_type",
    );

  const sourceType =
    isKnowledgeSourceType(
      rawSourceType,
    )
      ? rawSourceType
      : "reference-document";

  /**
   * Preserve useful database metadata.
   */
  const combinedMetadata: Record<
    string,
    unknown
  > = {
    ...metadata,

    knowledgeDocumentId:
      item.knowledge_document_id,

    chunkIndex:
      item.chunk_index,
  };

  /**
   * Remove undefined values from metadata.
   */
  Object.keys(
    combinedMetadata,
  ).forEach((key) => {
    if (
      combinedMetadata[key] ===
      undefined
    ) {
      delete combinedMetadata[key];
    }
  });

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
      typeof item.similarity ===
      "number"
        ? item.similarity
        : undefined,

    content:
      typeof item.content ===
      "string"
        ? item.content
        : undefined,

    metadata:
      combinedMetadata,
  };
}

/**
 * ============================================================
 * DOCUMENT TYPE VALIDATION
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
 * KNOWLEDGE SOURCE VALIDATION
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
  ].includes(
    value ?? "",
  );
}

/**
 * ============================================================
 * SEARCH KNOWLEDGE BASE
 * ============================================================
 *
 * Calls:
 *
 *     public.search_ai_knowledge()
 *
 * The Supabase RPC function performs the vector search
 * against:
 *
 *     ai_knowledge_chunks
 *
 * and should restrict results to APPROVED knowledge.
 *
 * Flow:
 *
 * embedding
 *     ↓
 * search_ai_knowledge()
 *     ↓
 * vector similarity
 *     ↓
 * approved knowledge
 *     ↓
 * KnowledgeReference[]
 * ============================================================
 */

export async function retrieveKnowledge(
  embedding: number[],
  options?: {
    documentType?: PropertyDocumentType;

    limit?: number;

    minimumSimilarity?: number;
  },
): Promise<KnowledgeReference[]> {
  /**
   * Validate embedding.
   */
  if (
    !Array.isArray(embedding) ||
    embedding.length === 0
  ) {
    throw new Error(
      "A valid embedding is required for knowledge retrieval.",
    );
  }

  /**
   * Validate that the embedding contains numbers.
   */
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

  /**
   * Search settings.
   */
  const limit =
    normalizeLimit(
      options?.limit,
    );

  const minimumSimilarity =
    normalizeSimilarity(
      options?.minimumSimilarity,
    );

  /**
   * ==========================================================
   * SUPABASE VECTOR SEARCH
   * ==========================================================
   */

  const {
    data,
    error,
  } =
    await supabaseServer.rpc(
      "search_ai_knowledge",
      {
        query_embedding:
          embedding,

        match_count:
          limit,

        minimum_similarity:
          minimumSimilarity,

        filter_document_type:
          options?.documentType ??
          null,
      },
    );

  /**
   * Database error.
   */
  if (error) {
    console.error(
      "PropertySure AI knowledge search error:",
      error,
    );

    throw new Error(
      `Knowledge retrieval failed: ${error.message}`,
    );
  }

  /**
   * No results.
   */
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return [];
  }

  /**
   * Convert database results into the format expected
   * by the rest of the PropertySure AI engine.
   */
  const references =
    data.map(
      (item: KnowledgeSearchResult) =>
        mapKnowledgeResult(
          item,
          options?.documentType,
        ),
    );

  /**
   * Remove duplicate chunks/documents where possible.
   */
  const uniqueReferences =
    new Map<
      string,
      KnowledgeReference
    >();

  for (
    const reference of references
  ) {
    const key =
      reference.id;

    if (
      !uniqueReferences.has(
        key,
      )
    ) {
      uniqueReferences.set(
        key,
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
 * Convenience function.
 *
 * Flow:
 *
 * document information
 *       ↓
 * retrieval query
 *       ↓
 * OpenAI embedding
 *       ↓
 * Supabase pgvector search
 *       ↓
 * approved knowledge references
 * ============================================================
 */

export async function searchKnowledge(
  input: {
    documentType?: PropertyDocumentType;

    text?: string;

    keywords?: string[];
  },
  options?: {
    limit?: number;

    minimumSimilarity?: number;
  },
): Promise<KnowledgeReference[]> {
  /**
   * Build the searchable query.
   */
  const query =
    buildRetrievalQuery(
      input,
    );

  /**
   * Nothing to search.
   */
  if (!query) {
    return [];
  }

  /**
   * Convert query to vector.
   */
  const embedding =
    await createRetrievalEmbedding(
      query,
    );

  /**
   * Search Supabase.
   */
  return retrieveKnowledge(
    embedding,
    {
      documentType:
        input.documentType,

      limit:
        options?.limit ??
        DEFAULT_LIMIT,

      minimumSimilarity:
        options?.minimumSimilarity ??
        DEFAULT_MINIMUM_SIMILARITY,
    },
  );
}