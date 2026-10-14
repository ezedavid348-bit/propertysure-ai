import { supabaseServer } from "./supabase-server";

import {
  deleteKnowledgeChunks,
  saveKnowledgeChunks,
} from "./knowledge-chunks";

import {
  NIGERIAN_JURISDICTIONS,
  type KnowledgeApprovalStatus,
  type KnowledgeDocument,
  type KnowledgeSourceType,
  type KnowledgeVerificationOutcome,
  type NigerianJurisdiction,
  type PropertyDocumentType,
} from "./types";

/**
 * ============================================================
 * PROPERTYSURE AI
 * KNOWLEDGE STORE
 * ============================================================
 *
 * All new knowledge enters as pending.
 *
 * Administrative approval controls whether knowledge
 * is eligible for retrieval.
 *
 * Verification outcome describes the independently
 * supported authenticity status of a document.
 *
 * Approval alone does not establish authenticity.
 *
 * Jurisdiction-specific retrieval must never fall back
 * to another Nigerian state or FCT.
 * ============================================================
 */

const TABLE_NAME = "ai_knowledge_documents";
const CHUNKS_TABLE = "ai_knowledge_chunks";

/**
 * ============================================================
 * NORMALIZE AND VALIDATE KNOWLEDGE ID
 * ============================================================
 */

function normalizeKnowledgeId(id: string): string {
  return String(id ?? "")
    .trim()
    .replace(/^[\\\"']+|[\\\"']+$/g, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

function validateKnowledgeId(id: string): string {
  const cleanId = normalizeKnowledgeId(id);

  if (!cleanId) {
    throw new Error(
      "Knowledge document ID is required.",
    );
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(cleanId)) {
    throw new Error(
      `Invalid knowledge document ID: ${cleanId}`,
    );
  }

  return cleanId;
}

/**
 * ============================================================
 * OPTIONAL TEXT
 * ============================================================
 */

function optionalText(
  value?: string | null,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

/**
 * ============================================================
 * NORMALIZE JURISDICTION
 * ============================================================
 *
 * Recognizes the canonical 36 states and FCT.
 *
 * City names are not used to infer jurisdiction.
 * ============================================================
 */

export function normalizeJurisdiction(
  value?: string | null,
): NigerianJurisdiction | null {
  const cleaned = optionalText(value);

  if (!cleaned) {
    return null;
  }

  const normalized = cleaned
    .toLowerCase()
    .replace(/\s+/g, " ");

  const fctAliases = [
    "abuja",
    "fct",
    "f.c.t.",
    "federal capital territory",
    "federal capital territory abuja",
    "abuja fct",
    "fct abuja",
  ];

  if (fctAliases.includes(normalized)) {
    return "FCT";
  }

  const withoutStateSuffix = normalized
    .replace(/\s+state$/, "")
    .trim();

  const match = NIGERIAN_JURISDICTIONS.find(
    (jurisdiction) =>
      jurisdiction.toLowerCase() ===
      withoutStateSuffix,
  );

  return match ?? null;
}

/**
 * ============================================================
 * NORMALIZE VERIFICATION OUTCOME
 * ============================================================
 */

function normalizeVerificationOutcome(
  value?: KnowledgeVerificationOutcome,
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
 * SAVE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Every new document remains pending.
 * ============================================================
 */

export async function saveKnowledgeDocument(
  document: KnowledgeDocument,
) {
  const jurisdiction = normalizeJurisdiction(
    document.jurisdiction,
  );

  const verificationOutcome =
    normalizeVerificationOutcome(
      document.verificationOutcome,
    );

  const verificationEvidence = optionalText(
    document.verificationEvidence,
  );

  if (
    verificationOutcome !== "unverified" &&
    !verificationEvidence
  ) {
    throw new Error(
      "Supporting verification evidence is required for verified-legitimate or confirmed-fraud knowledge.",
    );
  }

  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .insert({
      title: document.title,

      document_type: document.documentType,

      source_type: document.sourceType,

      approval_status: "pending",

      jurisdiction,

      local_government_area: optionalText(
        document.localGovernmentArea,
      ),

      issuing_authority: optionalText(
        document.issuingAuthority,
      ),

      document_year:
        typeof document.documentYear === "number" &&
        Number.isInteger(document.documentYear) &&
        document.documentYear >= 1800 &&
        document.documentYear <= 2200
          ? document.documentYear
          : null,

      verification_outcome: verificationOutcome,

      verification_evidence: verificationEvidence,

      description: document.description ?? null,

      content: document.content ?? null,

      source_path: document.sourcePath ?? null,

      source_url: document.sourceUrl ?? null,

      metadata: document.metadata ?? {},

      created_at:
        document.createdAt ?? new Date().toISOString(),

      updated_at:
        document.updatedAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error(
      "PropertySure AI knowledge save error:",
      error,
    );

    throw new Error(
      `Failed to save knowledge document: ${error.message}`,
    );
  }

  return data;
}

/**
 * ============================================================
 * GET KNOWLEDGE DOCUMENT
 * ============================================================
 */

export async function getKnowledgeDocument(id: string) {
  const cleanId = validateKnowledgeId(id);

  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select("*")
    .eq("id", cleanId)
    .maybeSingle();

  if (error) {
    console.error(
      "PropertySure AI knowledge retrieval error:",
      error,
    );

    throw new Error(
      `Failed to retrieve knowledge document: ${error.message}`,
    );
  }

  return data;
}

/**
 * ============================================================
 * GET APPROVED KNOWLEDGE
 * ============================================================
 *
 * A valid jurisdiction is mandatory.
 *
 * Unknown jurisdiction returns no knowledge.
 * No cross-state fallback is permitted.
 * ============================================================
 */

export async function getApprovedKnowledge(
  options?: {
    documentType?: PropertyDocumentType;
    sourceType?: KnowledgeSourceType;
    jurisdiction?: string;
    limit?: number;
  },
) {
  const jurisdiction = normalizeJurisdiction(
    options?.jurisdiction,
  );

  if (!jurisdiction) {
    return [];
  }

  let query = supabaseServer
    .from(TABLE_NAME)
    .select("*")
    .eq("approval_status", "approved")
    .eq("jurisdiction", jurisdiction);

  if (options?.documentType) {
    query = query.or(
      `document_type.eq.${options.documentType},document_type.eq.other`,
    );
  }

  if (options?.sourceType) {
    query = query.eq(
      "source_type",
      options.sourceType,
    );
  }

  const requestedLimit = options?.limit ?? 20;

  const safeLimit =
    Number.isInteger(requestedLimit) &&
    requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;

  const { data, error } = await query
    .order("created_at", {
      ascending: false,
    })
    .limit(safeLimit);

  if (error) {
    console.error(
      "PropertySure AI approved knowledge error:",
      error,
    );

    throw new Error(
      `Failed to retrieve approved knowledge: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * ============================================================
 * UPDATE KNOWLEDGE APPROVAL STATUS
 * ============================================================
 *
 * This function must only be called by trusted
 * server-side administrative workflows.
 *
 * Approval must pass through approveKnowledgeDocument().
 * ============================================================
 */

export async function updateKnowledgeApprovalStatus(
  id: string,
  approvalStatus: KnowledgeApprovalStatus,
) {
  const cleanId = validateKnowledgeId(id);

  if (approvalStatus === "approved") {
    throw new Error(
      "Direct approval is disabled. Use approveKnowledgeDocument() to enforce knowledge approval safeguards.",
    );
  }

  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .update({
      approval_status: approvalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cleanId)
    .select()
    .single();

  if (error) {
    console.error(
      "PropertySure AI knowledge status update error:",
      error,
    );

    throw new Error(
      `Failed to update knowledge approval status: ${error.message}`,
    );
  }

  return data;
}

/**
 * ============================================================
 * APPROVE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Reuses previously generated embeddings.
 *
 * Does not delete existing chunks.
 *
 * An administrator must independently review evidence
 * before assigning a verified or fraud outcome.
 * ============================================================
 */

export async function approveKnowledgeDocument(
  id: string,
) {
  const cleanId = validateKnowledgeId(id);

  const document = await getKnowledgeDocument(
    cleanId,
  );

  if (!document) {
    throw new Error(
      "Knowledge document not found.",
    );
  }

  if (document.approval_status === "rejected") {
    throw new Error(
      "Rejected knowledge cannot be approved without a separate review workflow.",
    );
  }

  if (
    typeof document.content !== "string" ||
    !document.content.trim()
  ) {
    throw new Error(
      "Knowledge document cannot be approved because it has no usable content.",
    );
  }

  const jurisdiction = normalizeJurisdiction(
    document.jurisdiction,
  );

  if (!jurisdiction) {
    throw new Error(
      "A valid Nigerian state or FCT jurisdiction is required before knowledge approval.",
    );
  }

  const verificationOutcome =
    normalizeVerificationOutcome(
      document.verification_outcome,
    );

  const verificationEvidence = optionalText(
    document.verification_evidence,
  );

  if (
    verificationOutcome !== "unverified" &&
    !verificationEvidence
  ) {
    throw new Error(
      "Verified legitimate and confirmed fraud knowledge require supporting verification evidence before approval.",
    );
  }

  /**
   * Synthetic references and unverified documents
   * remain non-authoritative even when approved.
   *
   * Retrieval must enforce this distinction.
   */

  const { count, error: chunksError } =
    await supabaseServer
      .from(CHUNKS_TABLE)
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("knowledge_document_id", cleanId);

  if (chunksError) {
    throw new Error(
      `Failed to check knowledge chunks: ${chunksError.message}`,
    );
  }

  if (!count || count < 1) {
    throw new Error(
      "Knowledge document has no searchable chunks. Re-ingest the document before approval.",
    );
  }

  /**
   * Save the normalized jurisdiction and approval status.
   *
   * We deliberately preserve the existing embeddings.
   */

  const { data: approvedDocument, error } =
    await supabaseServer
      .from(TABLE_NAME)
      .update({
        jurisdiction,
        approval_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", cleanId)
      .neq("approval_status", "rejected")
      .select()
      .single();

  if (error) {
    console.error(
      "PropertySure AI knowledge approval error:",
      error,
    );

    throw new Error(
      `Failed to approve knowledge document: ${error.message}`,
    );
  }

  return {
    success: true,
    document: approvedDocument,
    chunksCreated: 0,
    existingChunks: count,
  };
}

/**
 * ============================================================
 * REJECT KNOWLEDGE DOCUMENT
 * ============================================================
 */

export async function rejectKnowledgeDocument(
  id: string,
) {
  const cleanId = validateKnowledgeId(id);

  const rejectedDocument =
    await updateKnowledgeApprovalStatus(
      cleanId,
      "rejected",
    );

  await deleteKnowledgeChunks(cleanId);

  return rejectedDocument;
}

/**
 * ============================================================
 * DELETE KNOWLEDGE DOCUMENT
 * ============================================================
 */

export async function deleteKnowledgeDocument(
  id: string,
) {
  const cleanId = validateKnowledgeId(id);

  await deleteKnowledgeChunks(cleanId);

  const { error } = await supabaseServer
    .from(TABLE_NAME)
    .delete()
    .eq("id", cleanId);

  if (error) {
    console.error(
      "PropertySure AI knowledge deletion error:",
      error,
    );

    throw new Error(
      `Failed to delete knowledge document: ${error.message}`,
    );
  }

  return {
    success: true,
    id: cleanId,
  };
}