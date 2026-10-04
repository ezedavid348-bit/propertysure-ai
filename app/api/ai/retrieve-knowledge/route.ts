import { NextResponse } from "next/server";

import {
  searchKnowledge,
  type PropertyDocumentType,
} from "@/app/lib/ai";

/**
 * PropertySure AI
 * Knowledge Retrieval API
 *
 * This endpoint searches the PropertySure AI knowledge layer.
 *
 * At this stage, the retrieval engine is prepared to create
 * embeddings and perform the search. The persistent Supabase
 * vector search will be connected after the AI knowledge
 * database is created.
 */

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

function normalizeDocumentType(
  value: unknown,
): PropertyDocumentType | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  const aliases: Record<
    string,
    PropertyDocumentType
  > = {
    "certificate of occupancy":
      "certificate-of-occupancy",

    "c of o":
      "certificate-of-occupancy",

    "deed of assignment":
      "deed-of-assignment",

    "survey plan":
      "survey-plan",

    "allocation letter":
      "allocation-letter",

    "governor's consent":
      "governors-consent",

    "governors consent":
      "governors-consent",

    "power of attorney":
      "power-of-attorney",

    "receipt":
      "receipt-payment",

    "evidence of payment":
      "receipt-payment",

    "building approval":
      "building-planning",

    "planning document":
      "building-planning",
  };

  const documentType =
    aliases[normalized] ||
    normalized;

  if (
    VALID_DOCUMENT_TYPES.includes(
      documentType as PropertyDocumentType,
    )
  ) {
    return documentType as PropertyDocumentType;
  }

  return undefined;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    const keywords =
      Array.isArray(body?.keywords)
        ? body.keywords.filter(
            (
              keyword: unknown,
            ): keyword is string =>
              typeof keyword ===
              "string" &&
              keyword.trim().length > 0,
          )
        : [];

    const documentType =
      normalizeDocumentType(
        body?.documentType,
      );

    const limit =
      typeof body?.limit === "number"
        ? Math.max(
            1,
            Math.min(
              20,
              Math.round(body.limit),
            ),
          )
        : 5;

    const minimumSimilarity =
      typeof body?.minimumSimilarity ===
      "number"
        ? Math.max(
            0,
            Math.min(
              1,
              body.minimumSimilarity,
            ),
          )
        : 0.7;

    if (!text && keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Search text or keywords are required.",
        },
        {
          status: 400,
        },
      );
    }

    const references =
      await searchKnowledge(
        {
          documentType,
          text,
          keywords,
        },
        {
          limit,
          minimumSimilarity,
        },
      );

    return NextResponse.json({
      success: true,

      query: {
        documentType:
          documentType || null,
        text,
        keywords,
      },

      references,

      count: references.length,
    });
  } catch (error) {
    console.error(
      "PropertySure AI knowledge retrieval error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Knowledge retrieval failed.",
      },
      {
        status: 500,
      },
    );
  }
}