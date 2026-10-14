import {
  NIGERIAN_JURISDICTIONS,
  type KnowledgeDocument,
  type KnowledgeReference,
  type KnowledgeSourceType,
  type KnowledgeVerificationOutcome,
  type NigerianJurisdiction,
  type PropertyDocumentType,
} from "./types";

/**
 * ============================================================
 * PROPERTYSURE AI
 * KNOWLEDGE BASE LAYER
 * ============================================================
 *
 * Controls how knowledge is represented before it is stored
 * and retrieved from the persistent knowledge database.
 *
 * IMPORTANT:
 *
 * Customer-uploaded documents must never automatically
 * become trusted knowledge.
 *
 * Knowledge approval and document authenticity are
 * separate decisions.
 * ============================================================
 */

/**
 * ============================================================
 * VALIDATE NIGERIAN JURISDICTION
 * ============================================================
 *
 * Accept only canonical state names or FCT.
 *
 * Location aliases are deliberately not guessed here.
 * Jurisdiction extraction and normalization will be
 * handled by the dedicated retrieval/ingestion layers.
 * ============================================================
 */

function validateJurisdiction(
  value?: NigerianJurisdiction | null,
): NigerianJurisdiction | null {
  if (value == null) {
    return null;
  }

  if (
    !NIGERIAN_JURISDICTIONS.some(
      (jurisdiction) =>
        jurisdiction === value,
    )
  ) {
    throw new Error(
      "Invalid Nigerian jurisdiction. Use a valid state name or FCT.",
    );
  }

  return value;
}

/**
 * ============================================================
 * VALIDATE VERIFICATION OUTCOME
 * ============================================================
 */

function validateVerificationOutcome(
  outcome?: KnowledgeVerificationOutcome,
  evidence?: string | null,
): KnowledgeVerificationOutcome {
  const normalizedOutcome =
    outcome ?? "unverified";

  if (
    normalizedOutcome !== "verified-legitimate" &&
    normalizedOutcome !== "confirmed-fraud" &&
    normalizedOutcome !== "unverified"
  ) {
    throw new Error(
      "Invalid knowledge verification outcome.",
    );
  }

  /**
   * Verified legitimacy and confirmed fraud must have
   * recorded supporting evidence.
   *
   * This checks that evidence exists; it does not prove
   * the evidence is authentic. Administrator review is
   * still required.
   */
  if (
    normalizedOutcome !== "unverified" &&
    !evidence?.trim()
  ) {
    throw new Error(
      "Verification evidence is required for verified-legitimate or confirmed-fraud knowledge.",
    );
  }

  return normalizedOutcome;
}

/**
 * ============================================================
 * CREATE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Creates an in-memory knowledge object.
 *
 * Does not write to Supabase.
 *
 * All newly created knowledge begins as pending.
 * ============================================================
 */

export function createKnowledgeDocument(input: {
  title: string;
  documentType: PropertyDocumentType;
  sourceType: KnowledgeSourceType;

  description?: string;
  content?: string;

  sourcePath?: string;
  sourceUrl?: string;

  jurisdiction?: NigerianJurisdiction | null;
  localGovernmentArea?: string | null;
  issuingAuthority?: string | null;
  documentYear?: number | null;

  verificationOutcome?: KnowledgeVerificationOutcome;
  verificationEvidence?: string | null;

  metadata?: Record<string, unknown>;
}): KnowledgeDocument {
  const jurisdiction =
    validateJurisdiction(
      input.jurisdiction,
    );

  const verificationOutcome =
    validateVerificationOutcome(
      input.verificationOutcome,
      input.verificationEvidence,
    );

  return {
    title: input.title,
    documentType: input.documentType,
    sourceType: input.sourceType,

    /**
     * Never auto-approve incoming knowledge.
     */
    approvalStatus: "pending",

    description: input.description,
    content: input.content,

    sourcePath: input.sourcePath,
    sourceUrl: input.sourceUrl,

    jurisdiction,

    localGovernmentArea:
      input.localGovernmentArea ?? null,

    issuingAuthority:
      input.issuingAuthority ?? null,

    documentYear:
      input.documentYear ?? null,

    verificationOutcome,

    verificationEvidence:
      input.verificationEvidence ?? null,

    metadata: input.metadata,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * ============================================================
 * APPROVED KNOWLEDGE CHECK
 * ============================================================
 */

export function isApprovedKnowledge(
  document: KnowledgeDocument,
): boolean {
  return (
    document.approvalStatus === "approved"
  );
}

/**
 * ============================================================
 * VALID KNOWLEDGE SOURCE CHECK
 * ============================================================
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
 * ============================================================
 * CONVERT DOCUMENT TO KNOWLEDGE REFERENCE
 * ============================================================
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

    jurisdiction:
      document.jurisdiction,

    localGovernmentArea:
      document.localGovernmentArea,

    issuingAuthority:
      document.issuingAuthority,

    documentYear:
      document.documentYear,

    verificationOutcome:
      document.verificationOutcome,

    verificationEvidence:
      document.verificationEvidence,

    metadata:
      document.metadata,
  };
}

/**
 * ============================================================
 * FILTER APPROVED KNOWLEDGE
 * ============================================================
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
 * ============================================================
 * PREPARE KNOWLEDGE FOR STORAGE
 * ============================================================
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

  if (
    document.approvalStatus !== "approved" &&
    document.approvalStatus !== "rejected" &&
    document.approvalStatus !== "pending"
  ) {
    throw new Error(
      "Invalid knowledge approval status.",
    );
  }

  const jurisdiction =
    validateJurisdiction(
      document.jurisdiction,
    );

  const verificationOutcome =
    validateVerificationOutcome(
      document.verificationOutcome,
      document.verificationEvidence,
    );

  if (
    document.documentYear != null &&
    (
      !Number.isInteger(
        document.documentYear,
      ) ||
      document.documentYear < 1800 ||
      document.documentYear > 2200
    )
  ) {
    throw new Error(
      "Document year must be a valid four-digit year.",
    );
  }

  return {
    ...document,

    jurisdiction,

    verificationOutcome,

    updatedAt:
      new Date().toISOString(),
  };
}

/**
 * ============================================================
 * APPROVE KNOWLEDGE
 * ============================================================
 *
 * Authorization must be checked by the calling API.
 *
 * Approval for reference use does not certify that the
 * underlying document is genuine.
 * ============================================================
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
 * ============================================================
 * REJECT KNOWLEDGE
 * ============================================================
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
 * ============================================================
 * FILTER BY DOCUMENT TYPE
 * ============================================================
 *
 * Preserved for compatibility with existing callers.
 *
 * IMPORTANT:
 * This function does not enforce jurisdiction.
 * Database retrieval must apply jurisdiction restrictions.
 * ============================================================
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