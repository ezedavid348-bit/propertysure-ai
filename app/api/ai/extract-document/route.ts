import { NextResponse } from "next/server";

import {
  extractDocumentData,
  type DocumentClassification,
} from "@/app/lib/ai";

/**
 * PropertySure AI
 * Document Extraction API
 *
 * Converts document text into structured property information.
 *
 * This endpoint does not determine whether a document is genuine.
 * It only extracts information that is present in the supplied text.
 */

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const classification =
      body?.classification as
        | DocumentClassification
        | undefined;

    const extractedText =
      typeof body?.extractedText === "string"
        ? body.extractedText
        : "";

    if (!classification) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Document classification is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "extractedText is required.",
        },
        {
          status: 400,
        },
      );
    }

    const extractedData =
      await extractDocumentData(
        classification,
        extractedText,
      );

    return NextResponse.json({
      success: true,
      extractedData,
    });
  } catch (error) {
    console.error(
      "PropertySure AI extraction error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Document extraction failed.",
      },
      {
        status: 500,
      },
    );
  }
}