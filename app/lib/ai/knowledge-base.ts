import type {
  KnowledgeApprovalStatus,
  KnowledgeDocument,
  KnowledgeReference,
  KnowledgeSourceType,
  PropertyDocumentType,
} from "./types";

/**
 * PropertySure AI
 * Knowledge Base Layer
 *
 * This module controls how knowledge is represented before it
 * is stored and retrieved from the persistent knowledge base.
 *
 * IMPORTANT:
 * Customer-uploaded documents must NOT automatically become
 * trusted knowledge.
 *
 * Knowledge must have an approval status and a known source.
 */

/**
 * Create a new knowledge document object.
 *
 * This does not save anything to the database yet.
 */
export function createKnowledgeDocument(input: {
  title: string;
  documentType: PropertyDocumentType;
  sourceType: KnowledgeSourceType;

  description?: string;
  content?: string;

  sourcePath?: string;
  sourceUrl?: string;

  metadata?: Record<string, unknown>;
}): KnowledgeDocument {
  return {
    title: input.title,
    documentType: input.documentType,
    sourceType: input.sourceType,

    /*
     * Every new knowledge item starts as pending.
     *
     * An administrator or approved process must explicitly
     * approve it before it becomes trusted knowledge.
     */
    approvalStatus: "pending",

    description: input.description,
    content: input.content,

    sourcePath: input.sourcePath,
    sourceUrl: input.sourceUrl,

    metadata: input.metadata,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check whether a knowledge document can be used as
 * an approved reference for AI retrieval.
 */
export function isApprovedKnowledge(
  document: KnowledgeDocument,
): boolean {
  return (
    document.approvalStatus === "approved"
  );
}

/**
 * Check whether a source type is allowed to become
 * part of the trusted knowledge base.
 */
export function isValidKnowledgeSource(
  sourceType: KnowledgeSourceType,
): boolean {
  return [
    "reference-document",
    "approved-example",
    "fraud-pattern",
    "verification-rule",
    "verified-case",
  ].includes(sourceType);
}

/**
 * Convert a stored knowledge document into the smaller
 * reference object used by the analysis engine.
 */
export function toKnowledgeReference(
  document: KnowledgeDocument,
  options?: {
    similarity?: number;
    content?: string;
  },
): KnowledgeReference {
  return {
    id:
      document.id ||
      `knowledge-${Date.now()}`,

    title: document.title,

    documentType:
      document.documentType,

    sourceType:
      document.sourceType,

    similarity:
      options?.similarity,

    content:
      options?.content ||
      document.content,

    metadata:
      document.metadata,
  };
}

/**
 * Filter a collection so only approved knowledge can be
 * supplied to the analysis engine.
 */
export function filterApprovedKnowledge(
  documents: KnowledgeDocument[],
): KnowledgeDocument[] {
  return documents.filter(
    (document) =>
      isApprovedKnowledge(document) &&
      isValidKnowledgeSource(
        document.sourceType,
      ),
  );
}

/**
 * Prepare knowledge metadata before storage.
 *
 * This gives us one controlled place to validate knowledge
 * before it enters the persistent database.
 */
export function prepareKnowledgeForStorage(
  document: KnowledgeDocument,
): KnowledgeDocument {
  if (!document.title.trim()) {
    throw new Error(
      "Knowledge document title is required.",
    );
  }

  if (
    !isValidKnowledgeSource(
      document.sourceType,
    )
  ) {
    throw new Error(
      "Invalid knowledge source type.",
    );
  }

  /*
   * Never silently promote pending knowledge to approved.
   */
  if (
    document.approvalStatus !==
      "approved" &&
    document.approvalStatus !==
      "rejected" &&
    document.approvalStatus !==
      "pending"
  ) {
    throw new Error(
      "Invalid knowledge approval status.",
    );
  }

  return {
    ...document,
    updatedAt:
      new Date().toISOString(),
  };
}

/**
 * Mark a knowledge document as approved.
 *
 * The caller will later be required to verify that the
 * person performing this action is an authorized admin.
 */
export function approveKnowledge(
  document: KnowledgeDocument,
): KnowledgeDocument {
  return {
    ...document,
    approvalStatus: "approved",
    updatedAt:
      new Date().toISOString(),
  };
}

/**
 * Reject a knowledge document.
 */
export function rejectKnowledge(
  document: KnowledgeDocument,
): KnowledgeDocument {
  return {
    ...document,
    approvalStatus: "rejected",
    updatedAt:
      new Date().toISOString(),
  };
}

/**
 * Return only knowledge relevant to a particular document type.
 */
export function filterKnowledgeByDocumentType(
  documents: KnowledgeDocument[],
  documentType: PropertyDocumentType,
): KnowledgeDocument[] {
  return documents.filter(
    (document) =>
      document.documentType ===
        documentType ||
      document.documentType === "other",
  );
}