import { supabaseServer } from "./supabase-server";

import {
  deleteKnowledgeChunks,
  saveKnowledgeChunks,
} from "./knowledge-chunks";

import type {
  KnowledgeApprovalStatus,
  KnowledgeDocument,
  KnowledgeSourceType,
  PropertyDocumentType,
} from "./types";

/**
 * ============================================================
 * PROPERTYsure AI
 * KNOWLEDGE STORE
 * ============================================================
 *
 * This module connects the AI knowledge layer to Supabase.
 *
 * IMPORTANT:
 *
 * Customer documents must NOT automatically become trusted
 * knowledge.
 *
 * Knowledge enters the database with an approval status.
 *
 * Only approved knowledge should later be supplied to the
 * AI retrieval and analysis systems.
 *
 * APPROVAL FLOW:
 *
 * pending
 *    ↓
 * administrator approval
 *    ↓
 * create chunks
 *    ↓
 * generate embeddings
 *    ↓
 * save searchable chunks
 *    ↓
 * approved
 * ============================================================
 */

const TABLE_NAME = "ai_knowledge_documents";

/**
 * ============================================================
 * NORMALIZE KNOWLEDGE DOCUMENT ID
 * ============================================================
 *
 * Supabase expects a clean UUID.
 *
 * This function protects the knowledge store from IDs that
 * accidentally arrive with:
 *
 *   "uuid"
 *   'uuid'
 *   \"uuid\"
 *   \uuid\
 *   whitespace
 *
 * The final value must be a clean UUID.
 */
function normalizeKnowledgeId(id: string): string {
  let cleanId = String(id ?? "").trim();

  /**
   * Remove surrounding escaped quotation marks and
   * surrounding backslashes.
   *
   * Example:
   *
   * \"3db729ad-053c-4291-b94a-77dd9e33e\"
   *
   * becomes:
   *
   * 3db729ad-053c-4291-b94a-77dd9e33e
   */
  cleanId = cleanId.replace(
    /^[\\"']+|[\\"']+$/g,
    "",
  );

  /**
   * Remove normal surrounding quotation marks.
   */
  cleanId = cleanId.replace(
    /^["']+|["']+$/g,
    "",
  );

  /**
   * Remove any remaining surrounding whitespace.
   */
  cleanId = cleanId.trim();

  return cleanId;
}

/**
 * ============================================================
 * VALIDATE KNOWLEDGE DOCUMENT ID
 * ============================================================
 *
 * This prevents malformed values from reaching Supabase's
 * UUID column.
 */
function validateKnowledgeId(id: string): string {
  const cleanId = normalizeKnowledgeId(id);

  if (!cleanId) {
    throw new Error(
      "Knowledge document ID is required.",
    );
  }

  /**
   * Standard UUID format.
   */
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
 * SAVE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Creates a new knowledge record in Supabase.
 *
 * New knowledge is normally created as "pending".
 */
export async function saveKnowledgeDocument(
  document: KnowledgeDocument,
) {
  const { data, error } =
    await supabaseServer
      .from(TABLE_NAME)
      .insert({
        title: document.title,

        document_type:
          document.documentType,

        source_type:
          document.sourceType,

        approval_status:
          document.approvalStatus,

        description:
          document.description ?? null,

        content:
          document.content ?? null,

        source_path:
          document.sourcePath ?? null,

        source_url:
          document.sourceUrl ?? null,

        metadata:
          document.metadata ?? {},

        created_at:
          document.createdAt ??
          new Date().toISOString(),

        updated_at:
          document.updatedAt ??
          new Date().toISOString(),
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
export async function getKnowledgeDocument(
  id: string,
) {
  const cleanId =
    validateKnowledgeId(id);

  const { data, error } =
    await supabaseServer
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
 * Only approved knowledge is returned.
 *
 * The AI retrieval system should use this function rather
 * than retrieving every knowledge record.
 */
export async function getApprovedKnowledge(
  options?: {
    documentType?: PropertyDocumentType;
    sourceType?: KnowledgeSourceType;
    limit?: number;
  },
) {
  let query = supabaseServer
    .from(TABLE_NAME)
    .select("*")
    .eq(
      "approval_status",
      "approved",
    );

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

  query = query
    .order("created_at", {
      ascending: false,
    })
    .limit(
      options?.limit ?? 20,
    );

  const { data, error } =
    await query;

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
 * Updates the approval state of a knowledge document.
 */
export async function updateKnowledgeApprovalStatus(
  id: string,
  approvalStatus: KnowledgeApprovalStatus,
) {
  const cleanId =
    validateKnowledgeId(id);

  const { data, error } =
    await supabaseServer
      .from(TABLE_NAME)
      .update({
        approval_status:
          approvalStatus,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", cleanId)
      .select()
      .single();

  if (error) {
    console.error(
      "PropertySure AI knowledge approval error:",
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
 * Approval is the point at which a knowledge document becomes
 * eligible to enter the searchable AI knowledge layer.
 *
 * FLOW:
 *
 * pending
 *    ↓
 * administrator approval
 *    ↓
 * delete old chunks
 *    ↓
 * split document into chunks
 *    ↓
 * generate embeddings
 *    ↓
 * save chunks
 *    ↓
 * mark document approved
 *
 * IMPORTANT:
 *
 * This function should only be called by an authorized
 * administrator/approval workflow.
 *
 * Customer documents must NEVER be automatically approved.
 */
export async function approveKnowledgeDocument(
  id: string,
) {
  /**
   * ----------------------------------------------------------
   * NORMALIZE + VALIDATE ID
   * ----------------------------------------------------------
   */

  const cleanId =
    validateKnowledgeId(id);

  /**
   * ----------------------------------------------------------
   * GET THE KNOWLEDGE DOCUMENT
   * ----------------------------------------------------------
   */

  const document =
    await getKnowledgeDocument(
      cleanId,
    );

  if (!document) {
    throw new Error(
      "Knowledge document not found.",
    );
  }

  /**
   * ----------------------------------------------------------
   * REQUIRE CONTENT
   * ----------------------------------------------------------
   */

  if (
    typeof document.content !==
      "string" ||
    !document.content.trim()
  ) {
    throw new Error(
      "Knowledge document cannot be approved because it has no usable content.",
    );
  }

  /**
   * ----------------------------------------------------------
   * REMOVE OLD CHUNKS
   * ----------------------------------------------------------
   *
   * If this document was previously processed, remove its
   * old chunks before creating the new searchable version.
   */

  await deleteKnowledgeChunks(
    cleanId,
  );

  /**
   * ----------------------------------------------------------
   * CREATE CHUNKS + EMBEDDINGS
   * ----------------------------------------------------------
   *
   * The content is divided into smaller pieces.
   *
   * Each piece receives an embedding from the embeddings
   * layer and is stored in ai_knowledge_chunks.
   */

  const chunkResult =
    await saveKnowledgeChunks(
      cleanId,
      document.content,
      {
        documentType:
          document.document_type,

        sourceType:
          document.source_type,

        title:
          document.title,
      },
    );

  /**
   * ----------------------------------------------------------
   * MARK DOCUMENT AS APPROVED
   * ----------------------------------------------------------
   *
   * We only reach this point after chunking and embedding
   * have succeeded.
   */

  const approvedDocument =
    await updateKnowledgeApprovalStatus(
      cleanId,
      "approved",
    );

  return {
    success: true,

    document:
      approvedDocument,

    chunksCreated:
      chunkResult.count,
  };
}

/**
 * ============================================================
 * REJECT KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Rejected knowledge must not remain searchable.
 *
 * If the document had previously been approved and therefore
 * had chunks, those chunks are removed as a safety measure.
 */
export async function rejectKnowledgeDocument(
  id: string,
) {
  const cleanId =
    validateKnowledgeId(id);

  await deleteKnowledgeChunks(
    cleanId,
  );

  return updateKnowledgeApprovalStatus(
    cleanId,
    "rejected",
  );
}

/**
 * ============================================================
 * DELETE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * Deletes the knowledge document and its associated searchable
 * chunks.
 *
 * This should only be called from an authorized server/admin
 * workflow.
 */
export async function deleteKnowledgeDocument(
  id: string,
) {
  const cleanId =
    validateKnowledgeId(id);

  /**
   * Remove searchable chunks first.
   */
  await deleteKnowledgeChunks(
    cleanId,
  );

  /**
   * Then remove the parent knowledge document.
   */
  const { error } =
    await supabaseServer
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