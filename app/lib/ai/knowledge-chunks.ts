import { supabaseServer } from "./supabase-server";

import {
  generateEmbeddings,
} from "./embeddings";

/**
 * ============================================================
 * PROPERTYsure AI
 * KNOWLEDGE CHUNKS
 * ============================================================
 *
 * This module converts approved knowledge documents into
 * smaller searchable chunks.
 *
 * Each chunk receives an embedding so that PropertySure AI
 * can later perform semantic/vector search using pgvector.
 *
 * IMPORTANT:
 *
 * This module does NOT decide whether a document is trusted.
 *
 * The knowledge document must already have been approved
 * before it is ingested into the searchable knowledge layer.
 * ============================================================
 */

const TABLE_NAME =
  "ai_knowledge_chunks";

/**
 * ============================================================
 * CHUNK SETTINGS
 * ============================================================
 */

const DEFAULT_CHUNK_SIZE = 1200;

const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * ============================================================
 * SPLIT TEXT INTO CHUNKS
 * ============================================================
 *
 * We keep a small overlap between chunks so that information
 * near the boundary of two chunks is not completely separated.
 */
export function splitKnowledgeText(
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

  if (chunkSize <= 0) {
    throw new Error(
      "Chunk size must be greater than zero.",
    );
  }

  if (overlap < 0) {
    throw new Error(
      "Chunk overlap cannot be negative.",
    );
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "Chunk overlap must be smaller than chunk size.",
    );
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanedText.length) {
    let end =
      Math.min(
        start + chunkSize,
        cleanedText.length,
      );

    /*
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

      const spaceBreak =
        cleanedText.lastIndexOf(
          " ",
          end,
        );

      if (
        paragraphBreak >
        start + chunkSize * 0.6
      ) {
        end =
          paragraphBreak + 2;
      } else if (
        sentenceBreak >
        start + chunkSize * 0.6
      ) {
        end =
          sentenceBreak + 2;
      } else if (
        spaceBreak >
        start + chunkSize * 0.6
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
      end >= cleanedText.length
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
 *
 * Generates embeddings for all chunks and stores them in
 * ai_knowledge_chunks.
 */
export async function saveKnowledgeChunks(
  knowledgeDocumentId: string,
  content: string,
  metadata?: Record<string, unknown>,
) {
  if (!knowledgeDocumentId) {
    throw new Error(
      "Knowledge document ID is required.",
    );
  }

  const chunks =
    splitKnowledgeText(content);

  if (chunks.length === 0) {
    throw new Error(
      "Knowledge document contains no usable content.",
    );
  }

  /*
   * Generate all embeddings in one request.
   */
  const embeddings =
    await generateEmbeddings(
      chunks,
    );

  if (
    embeddings.length !==
    chunks.length
  ) {
    throw new Error(
      "Embedding count does not match chunk count.",
    );
  }

  const rows = chunks.map(
    (chunk, index) => ({
      knowledge_document_id:
        knowledgeDocumentId,

      content: chunk,

      chunk_index: index,

      embedding:
        embeddings[index],

      metadata:
        metadata ?? {},
    }),
  );

  const { data, error } =
    await supabaseServer
      .from(TABLE_NAME)
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

  return {
    chunks: data ?? [],
    count: data?.length ?? 0,
  };
}

/**
 * ============================================================
 * DELETE KNOWLEDGE CHUNKS
 * ============================================================
 *
 * Used when a knowledge document is removed or needs to be
 * re-processed.
 */
export async function deleteKnowledgeChunks(
  knowledgeDocumentId: string,
) {
  if (!knowledgeDocumentId) {
    throw new Error(
      "Knowledge document ID is required.",
    );
  }

  const { error } =
    await supabaseServer
      .from(TABLE_NAME)
      .delete()
      .eq(
        "knowledge_document_id",
        knowledgeDocumentId,
      );

  if (error) {
    console.error(
      "PropertySure AI knowledge chunk deletion error:",
      error,
    );

    throw new Error(
      `Failed to delete knowledge chunks: ${error.message}`,
    );
  }

  return {
    success: true,
    knowledgeDocumentId,
  };
}