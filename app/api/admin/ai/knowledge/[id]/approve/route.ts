import { NextResponse } from "next/server";

import {
  approveKnowledgeDocument,
} from "@/app/lib/ai/knowledge-store";

/**
 * ============================================================
 * PROPERTYsure AI
 * ADMIN KNOWLEDGE APPROVAL API
 * ============================================================
 *
 * Approves a knowledge document that is currently pending.
 *
 * FLOW:
 *
 * pending
 *    ↓
 * admin review
 *    ↓
 * approve
 *    ↓
 * approved
 *    ↓
 * available to AI retrieval
 *
 * IMPORTANT:
 *
 * This endpoint is intended for the authorized admin system.
 * ============================================================
 */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * ============================================================
 * POST
 * ============================================================
 */
export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    /**
     * The request body is not required.
     *
     * The knowledge document ID comes from:
     *
     * /api/admin/ai/knowledge/[id]/approve
     */

    const { id } =
      await context.params;

    /**
     * --------------------------------------------------------
     * VALIDATE ID
     * --------------------------------------------------------
     */
    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Knowledge document ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * --------------------------------------------------------
     * APPROVE KNOWLEDGE DOCUMENT
     * --------------------------------------------------------
     */
    const knowledgeDocument =
      await approveKnowledgeDocument(
        id,
      );

    /**
     * --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,

        message:
          "Knowledge document approved successfully.",

        knowledgeDocument,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PropertySure AI knowledge approval error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to approve knowledge document.",
      },
      {
        status: 500,
      },
    );
  }
}