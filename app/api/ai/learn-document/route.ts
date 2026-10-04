import { NextResponse } from "next/server";

import {
  ingestKnowledgeDocument,
} from "@/app/lib/ai/knowledge-ingestion";

import type {
  KnowledgeSourceType,
  PropertyDocumentType,
} from "@/app/lib/ai/types";

/**
 * ============================================================
 * PROPERTYsure AI
 * KNOWLEDGE LEARNING API
 * ============================================================
 *
 * This endpoint receives knowledge that PropertySure AI may
 * learn from.
 *
 * IMPORTANT:
 *
 * Learning does NOT mean automatically trusting the document.
 *
 * Every document enters the knowledge base as:
 *
 *      approval_status = "pending"
 *
 * Only approved knowledge can later be retrieved by the AI
 * analysis engine.
 *
 * FLOW:
 *
 * Request
 *    ↓
 * Validate input
 *    ↓
 * Knowledge ingestion
 *    ↓
 * Save document
 *    ↓
 * Split into chunks
 *    ↓
 * Generate embeddings
 *    ↓
 * Save vectors
 *    ↓
 * Pending approval
 * ============================================================
 */

const VALID_SOURCE_TYPES: KnowledgeSourceType[] = [
  "reference-document",
  "approved-example",
  "fraud-pattern",
  "verification-rule",
  "verified-case",
];

const VALID_DOCUMENT_TYPES: PropertyDocumentType[] = [
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
];

/**
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request,
) {
  try {
    /**
     * --------------------------------------------------------
     * STEP 1
     * Read request body.
     * --------------------------------------------------------
     */

    const body =
      await request.json();

    /**
     * --------------------------------------------------------
     * STEP 2
     * Read and normalize input.
     * --------------------------------------------------------
     */

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const documentType =
      typeof body?.documentType === "string"
        ? body.documentType.trim()
        : "";

    const sourceType =
      typeof body?.sourceType === "string"
        ? body.sourceType.trim()
        : "";

    const content =
      typeof body?.content === "string"
        ? body.content.trim()
        : "";

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : undefined;

    const sourcePath =
      typeof body?.sourcePath === "string"
        ? body.sourcePath.trim()
        : undefined;

    const sourceUrl =
      typeof body?.sourceUrl === "string"
        ? body.sourceUrl.trim()
        : undefined;

    const metadata =
      body?.metadata &&
      typeof body.metadata === "object" &&
      !Array.isArray(body.metadata)
        ? body.metadata
        : undefined;

    const chunkSize =
      typeof body?.chunkSize === "number"
        ? body.chunkSize
        : undefined;

    const chunkOverlap =
      typeof body?.chunkOverlap === "number"
        ? body.chunkOverlap
        : undefined;

    /**
     * --------------------------------------------------------
     * STEP 3
     * Validate title.
     * --------------------------------------------------------
     */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Knowledge document title is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * STEP 4
     * Validate document type.
     * --------------------------------------------------------
     */

    if (
      !VALID_DOCUMENT_TYPES.includes(
        documentType as PropertyDocumentType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid property document type is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * STEP 5
     * Validate knowledge source type.
     * --------------------------------------------------------
     */

    if (
      !VALID_SOURCE_TYPES.includes(
        sourceType as KnowledgeSourceType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid knowledge source type is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * STEP 6
     * Validate content.
     * --------------------------------------------------------
     */

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Knowledge document content is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * STEP 7
     * Validate optional chunk settings.
     * --------------------------------------------------------
     */

    if (
      chunkSize !== undefined &&
      (!Number.isFinite(chunkSize) ||
        chunkSize <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkSize must be a positive number.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      chunkOverlap !== undefined &&
      (!Number.isFinite(chunkOverlap) ||
        chunkOverlap < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkOverlap must be zero or greater.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      chunkSize !== undefined &&
      chunkOverlap !== undefined &&
      chunkOverlap >= chunkSize
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkOverlap must be smaller than chunkSize.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * STEP 8
     * INGEST THE KNOWLEDGE.
     *
     * This is the important connection.
     *
     * The ingestion engine:
     *
     * - creates the knowledge record
     * - sets it to pending
     * - saves it
     * - splits the content
     * - generates embeddings
     * - saves vector chunks
     * --------------------------------------------------------
     */

    const result =
      await ingestKnowledgeDocument({
        title,

        documentType:
          documentType as PropertyDocumentType,

        sourceType:
          sourceType as KnowledgeSourceType,

        content,

        description,

        sourcePath,

        sourceUrl,

        metadata,

        chunkSize,

        chunkOverlap,
      });

    /**
     * --------------------------------------------------------
     * STEP 9
     * Return successful result.
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Knowledge document learned successfully and is awaiting approval.",

        knowledgeDocument:
          result.knowledgeDocument,

        chunkCount:
          result.chunkCount,

        embeddingCount:
          result.embeddingCount,

        approvalStatus:
          result.approvalStatus,

        requiresApproval:
          result.approvalStatus !==
          "approved",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    /**
     * --------------------------------------------------------
     * ERROR HANDLING
     * --------------------------------------------------------
     */

    console.error(
      "PropertySure AI knowledge learning error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Knowledge learning failed.",
      },
      {
        status: 500,
      },
    );
  }
}