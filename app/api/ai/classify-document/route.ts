import { NextResponse } from "next/server";

import {
  classifyDocument,
} from "@/app/lib/ai";

/**
 * PropertySure AI
 * Document Classification API
 *
 * This endpoint provides a clean API boundary around the
 * internal PropertySure AI classification engine.
 *
 * It does NOT determine whether a document is genuine.
 * It only identifies the most likely document type.
 */

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const fileName =
      typeof body?.fileName === "string"
        ? body.fileName.trim()
        : "";

    const extractedText =
      typeof body?.extractedText === "string"
        ? body.extractedText
        : undefined;

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "fileName is required.",
        },
        {
          status: 400,
        },
      );
    }

    const classification =
      await classifyDocument({
        fileName,
        extractedText,
      });

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error(
      "PropertySure AI classification error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Document classification failed.",
      },
      {
        status: 500,
      },
    );
  }
}