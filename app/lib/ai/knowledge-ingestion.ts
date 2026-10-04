import { supabaseServer } from "./supabase-server";

import {
  createKnowledgeDocument,
  prepareKnowledgeForStorage,
} from "./knowledge-base";

import {
  generateEmbeddings,
} from "./embeddings";

import type {
  KnowledgeSourceType,
  PropertyDocumentType,
} from "./types";

/**
 * ============================================================
 * PROPERTYsure AI
 * KNOWLEDGE INGESTION ENGINE
 * ============================================================
 *
 * This is the bridge between:
 *
 *      KNOWLEDGE
 *          ↓
 *      KNOWLEDGE DOCUMENT
 *          ↓
 *      TEXT CHUNKS
 *          ↓
 *      EMBEDDINGS
 *          ↓
 *      SUPABASE VECTOR DATABASE
 *          ↓
 *      FUTURE AI RETRIEVAL
 *
 * IMPORTANT:
 *
 * A document being ingested does NOT mean that it is trusted.
 *
 * Every new knowledge document begins as:
 *
 *      approval_status = "pending"
 *
 * Only approved knowledge can later be returned by the
 * retrieval system.
 * ============================================================
 */

const DOCUMENTS_TABLE =
  "ai_knowledge_documents";

const CHUNKS_TABLE =
  "ai_knowledge_chunks";

/**
 * Default knowledge chunk size.
 */
const DEFAULT_CHUNK_SIZE = 1200;

/**
 * Default overlap between adjacent chunks.
 */
const DEFAULT_CHUNK_OVERLAP = 150;

/**
 * ============================================================
 * VALIDATE CHUNK OPTIONS
 * ============================================================
 */

function validateChunkOptions(
  chunkSize: number,
  overlap: number,
) {
  if (
    !Number.isFinite(chunkSize) ||
    chunkSize <= 0
  ) {
    throw new Error(
      "Chunk size must be greater than zero.",
    );
  }

  if (
    !Number.isFinite(overlap) ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error(
      "Chunk overlap must be greater than or equal to zero and smaller than chunk size.",
    );
  }
}

/**
 * ============================================================
 * SPLIT TEXT INTO KNOWLEDGE CHUNKS
 * ============================================================
 *
 * The AI does not need to retrieve an entire document every
 * time.
 *
 * Instead, a document is divided into smaller pieces.
 *
 * Example:
 *
 * Large C of O reference
 *        ↓
 * Chunk 1
 * Chunk 2
 * Chunk 3
 * Chunk 4
 *
 * Each chunk receives its own embedding.
 * ============================================================
 */

export function chunkKnowledgeText(
  text: string,
  options?: {
    chunkSize?: number;
    overlap?: number;
  },
): string[] {
  const cleanedText =
    text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

  if (!cleanedText) {
    return [];
  }

  const chunkSize =
    options?.chunkSize ??
    DEFAULT_CHUNK_SIZE;

  const overlap =
    options?.overlap ??
    DEFAULT_CHUNK_OVERLAP;

  validateChunkOptions(
    chunkSize,
    overlap,
  );

  const chunks: string[] = [];

  let start = 0;

  while (
    start < cleanedText.length
  ) {
    let end =
      Math.min(
        start + chunkSize,
        cleanedText.length,
      );

    /**
     * Try to end the chunk at a natural boundary.
     */
    if (
      end < cleanedText.length
    ) {
      const paragraphBreak =
        cleanedText.lastIndexOf(
          "\n\n",
          end,
        );

      const sentenceBreak =
        cleanedText.lastIndexOf(
          ". ",
          end,
        );

      const newlineBreak =
        cleanedText.lastIndexOf(
          "\n",
          end,
        );

      const spaceBreak =
        cleanedText.lastIndexOf(
          " ",
          end,
        );

      const minimumBoundary =
        start +
        chunkSize * 0.5;

      if (
        paragraphBreak >
        minimumBoundary
      ) {
        end =
          paragraphBreak + 2;
      } else if (
        sentenceBreak >
        minimumBoundary
      ) {
        end =
          sentenceBreak + 2;
      } else if (
        newlineBreak >
        minimumBoundary
      ) {
        end =
          newlineBreak + 1;
      } else if (
        spaceBreak >
        minimumBoundary
      ) {
        end =
          spaceBreak + 1;
      }
    }

    const chunk =
      cleanedText
        .slice(start, end)
        .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (
      end >=
      cleanedText.length
    ) {
      break;
    }

    start =
      Math.max(
        end - overlap,
        start + 1,
      );
  }

  return chunks;
}

/**
 * ============================================================
 * SAVE KNOWLEDGE CHUNKS
 * ============================================================
 */

async function saveKnowledgeChunks(
  knowledgeDocumentId: string,
  chunks: string[],
  embeddings: number[][],
  metadata?: Record<
    string,
    unknown
  >,
) {
  if (
    chunks.length === 0
  ) {
    return [];
  }

  if (
    embeddings.length !==
    chunks.length
  ) {
    throw new Error(
      `Embedding count mismatch. Expected ${chunks.length} embeddings but received ${embeddings.length}.`,
    );
  }

  /**
   * Make sure every chunk actually has an embedding.
   */
  for (
    let index = 0;
    index < embeddings.length;
    index += 1
  ) {
    if (
      !Array.isArray(
        embeddings[index],
      ) ||
      embeddings[index].length === 0
    ) {
      throw new Error(
        `Invalid embedding generated for knowledge chunk ${index}.`,
      );
    }
  }

  const rows =
    chunks.map(
      (
        content,
        index,
      ) => ({
        knowledge_document_id:
          knowledgeDocumentId,

        content,

        chunk_index:
          index,

        embedding:
          embeddings[index],

        metadata: {
          ...(metadata ?? {}),

          chunkIndex:
            index,

          knowledgeDocumentId,
        },
      }),
    );

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(CHUNKS_TABLE)
      .insert(rows)
      .select();

  if (error) {
    console.error(
      "PropertySure AI knowledge chunk save error:",
      error,
    );

    throw new Error(
      `Failed to save knowledge chunks: ${error.message}`,
    );
  }

  return data ?? [];
}

/**
 * ============================================================
 * DELETE INCOMPLETE KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * If something fails after the parent document has been
 * created, remove it.
 *
 * The foreign-key relationship should remove its chunks as
 * well when ON DELETE CASCADE is configured.
 * ============================================================
 */

async function cleanupKnowledgeDocument(
  id: string,
) {
  const {
    error,
  } =
    await supabaseServer
      .from(DOCUMENTS_TABLE)
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "PropertySure AI knowledge cleanup error:",
      error,
    );
  }
}

/**
 * ============================================================
 * INGEST KNOWLEDGE DOCUMENT
 * ============================================================
 *
 * MAIN PIPELINE:
 *
 * Reference / approved-source document
 *              ↓
 *        create knowledge
 *              ↓
 *           PENDING
 *              ↓
 *       save parent record
 *              ↓
 *        split into chunks
 *              ↓
 *       generate embeddings
 *              ↓
 *       save vector chunks
 *              ↓
 *       await approval
 *
 * IMPORTANT:
 *
 * This function DOES NOT approve the knowledge.
 * ============================================================
 */

export async function ingestKnowledgeDocument(
  input: {
    title: string;

    documentType:
      PropertyDocumentType;

    sourceType:
      KnowledgeSourceType;

    content: string;

    description?: string;

    sourcePath?: string;

    sourceUrl?: string;

    metadata?: Record<
      string,
      unknown
    >;

    chunkSize?: number;

    chunkOverlap?: number;
  },
) {
  /**
   * ----------------------------------------------------------
   * STEP 1
   * Validate basic input.
   * ----------------------------------------------------------
   */

  const title =
    input.title.trim();

  const content =
    input.content.trim();

  if (!title) {
    throw new Error(
      "Knowledge document title is required.",
    );
  }

  if (!content) {
    throw new Error(
      "Knowledge document content is required.",
    );
  }

  /**
   * ----------------------------------------------------------
   * STEP 2
   * Create the knowledge object.
   *
   * createKnowledgeDocument() automatically gives it:
   *
   * approvalStatus = "pending"
   * ----------------------------------------------------------
   */

  const knowledgeDocument =
    createKnowledgeDocument({
      title,

      documentType:
        input.documentType,

      sourceType:
        input.sourceType,

      description:
        input.description,

      content,

      sourcePath:
        input.sourcePath,

      sourceUrl:
        input.sourceUrl,

      metadata:
        input.metadata,
    });

  const preparedKnowledge =
    prepareKnowledgeForStorage(
      knowledgeDocument,
    );

  /**
   * ----------------------------------------------------------
   * STEP 3
   * Save the parent knowledge document.
   * ----------------------------------------------------------
   */

  const {
    data:
      savedDocument,
    error:
      documentError,
  } =
    await supabaseServer
      .from(DOCUMENTS_TABLE)
      .insert({
        title:
          preparedKnowledge.title,

        document_type:
          preparedKnowledge.documentType,

        source_type:
          preparedKnowledge.sourceType,

        approval_status:
          preparedKnowledge.approvalStatus,

        description:
          preparedKnowledge.description ??
          null,

        content:
          preparedKnowledge.content ??
          null,

        source_path:
          preparedKnowledge.sourcePath ??
          null,

        source_url:
          preparedKnowledge.sourceUrl ??
          null,

        metadata:
          preparedKnowledge.metadata ??
          {},

        created_at:
          preparedKnowledge.createdAt ??
          new Date().toISOString(),

        updated_at:
          preparedKnowledge.updatedAt ??
          new Date().toISOString(),
      })
      .select()
      .single();

  if (documentError) {
    console.error(
      "PropertySure AI knowledge document save error:",
      documentError,
    );

    throw new Error(
      `Failed to save knowledge document: ${documentError.message}`,
    );
  }

  if (
    !savedDocument?.id
  ) {
    throw new Error(
      "Knowledge document was saved without an ID.",
    );
  }

  /**
   * ----------------------------------------------------------
   * STEP 4
   * Split the content into chunks.
   * ----------------------------------------------------------
   */

  const chunks =
    chunkKnowledgeText(
      content,
      {
        chunkSize:
          input.chunkSize,

        overlap:
          input.chunkOverlap,
      },
    );

  if (
    chunks.length === 0
  ) {
    await cleanupKnowledgeDocument(
      savedDocument.id,
    );

    throw new Error(
      "No usable knowledge chunks were created.",
    );
  }

  /**
   * ----------------------------------------------------------
   * STEP 5
   * Generate embeddings.
   * ----------------------------------------------------------
   *
   * Every chunk gets a vector representation.
   *
   * Those vectors are what allow PropertySure AI to later
   * search its memory semantically.
   * ----------------------------------------------------------
   */

  let embeddings: number[][];

  try {
    embeddings =
      await generateEmbeddings(
        chunks,
      );
  } catch (error) {
    await cleanupKnowledgeDocument(
      savedDocument.id,
    );

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * STEP 6
   * Save chunks and embeddings.
   * ----------------------------------------------------------
   */

  try {
    const savedChunks =
      await saveKnowledgeChunks(
        savedDocument.id,

        chunks,

        embeddings,

        {
          title:
            preparedKnowledge.title,

          document_type:
            preparedKnowledge.documentType,

          source_type:
            preparedKnowledge.sourceType,

          approval_status:
            preparedKnowledge.approvalStatus,
        },
      );

    /**
     * --------------------------------------------------------
     * STEP 7
     * Return ingestion result.
     * --------------------------------------------------------
     */

    return {
      success: true,

      knowledgeDocument:
        savedDocument,

      chunkCount:
        savedChunks.length,

      embeddingCount:
        embeddings.length,

      approvalStatus:
        savedDocument.approval_status,

      message:
        "Knowledge document ingested successfully and is awaiting approval.",
    };
  } catch (error) {
    await cleanupKnowledgeDocument(
      savedDocument.id,
    );

    throw error;
  }
}